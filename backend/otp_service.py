import os
import time
import secrets
import requests
from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ── Router ─────────────────────────────────────────────────────────────────────
router = APIRouter(prefix="/api/otp", tags=["OTP"])

# ── Config ─────────────────────────────────────────────────────────────────────
FAST2SMS_API_KEY     = os.getenv("FAST2SMS_API_KEY", "").strip()
OTP_PHONE_NUMBER     = os.getenv("OTP_PHONE_NUMBER", "").strip()
OTP_EXPIRY_SECS      = int(os.getenv("OTP_EXPIRY_SECS", "300"))
RESEND_COOLDOWN_SECS = 30
MAX_VERIFY_ATTEMPTS  = 5

# ── Fast2SMS endpoint — OTP route (DLT-free, no template needed) ───────────────
FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2"

# ── In-memory OTP store ────────────────────────────────────────────────────────
_otp_store: dict = {}


# ── Custom Exceptions ──────────────────────────────────────────────────────────
class OTPException(Exception):
    def __init__(self, ui_message: str, log_detail: str = ""):
        self.ui_message = ui_message
        self.log_detail = log_detail or ui_message
        super().__init__(self.log_detail)

class OTPConfigError(OTPException):      pass
class OTPSendError(OTPException):        pass
class OTPNotFoundError(OTPException):    pass
class OTPExpiredError(OTPException):     pass
class OTPTooManyAttemptsError(OTPException): pass

class OTPMismatchError(OTPException):
    def __init__(self, attempts: int, max_attempts: int):
        remaining = max_attempts - attempts
        super().__init__(
            ui_message = f"Incorrect OTP. {remaining} attempt(s) remaining.",
            log_detail = f"OTP mismatch. Attempt {attempts}/{max_attempts}."
        )
        self.attempts  = attempts
        self.remaining = remaining

class OTPCooldownError(OTPException):
    def __init__(self, wait_secs: int):
        super().__init__(
            ui_message = f"Please wait {wait_secs}s before requesting a new OTP.",
            log_detail = f"Cooldown active. {wait_secs}s remaining."
        )
        self.wait_secs = wait_secs


# ── Helpers ────────────────────────────────────────────────────────────────────
def _error_response(ui_message: str, **extra) -> dict:
    payload = {"success": False, "error": ui_message}
    payload.update(extra)
    return payload


def _validate_env():
    missing = []
    if not FAST2SMS_API_KEY:
        missing.append("FAST2SMS_API_KEY")
    if not OTP_PHONE_NUMBER:
        missing.append("OTP_PHONE_NUMBER")
    if missing:
        raise OTPConfigError(
            ui_message = "OTP service is not configured. Please contact support.",
            log_detail = f"Missing .env variables: {', '.join(missing)}"
        )
    if not OTP_PHONE_NUMBER.isdigit() or len(OTP_PHONE_NUMBER) != 10:
        raise OTPConfigError(
            ui_message = "OTP service has an invalid phone configuration.",
            log_detail = f"OTP_PHONE_NUMBER must be 10 digits, no country code. Got: '{OTP_PHONE_NUMBER}'"
        )


def _generate_otp() -> str:
    return str(secrets.randbelow(900000) + 100000)


def _send_sms_fast2sms(phone: str, otp: str) -> None:
    """
    FIX: Fast2SMS requires the API key as a QUERY PARAMETER named 'authorization',
    NOT as an HTTP header. Sending it as a header causes 401 on most account tiers.
    Also added 'sender_id' and 'message' fallback for accounts without DLT OTP route.
    """
    print(f"[Fast2SMS] Sending OTP to {phone}, key starts with: {FAST2SMS_API_KEY[:6]}***")

    # ── PRIMARY: OTP route (works for accounts with DLT OTP template approved) ──
    params = {
        "authorization":    FAST2SMS_API_KEY,   # KEY FIX: goes as query param, not header
        "variables_values": otp,
        "route":            "otp",
        "numbers":          phone,
    }

    try:
        resp = requests.get(
            FAST2SMS_URL,
            params  = params,        # ALL params including auth go here as query string
            timeout = 10,
        )

        print(f"[Fast2SMS] Status: {resp.status_code}, Body: {resp.text}")

        # ── If OTP route gives 401/400, fall back to quick SMS route ────────────
        if resp.status_code in (400, 401) or (resp.ok and resp.json().get("return") is False):
            print("[Fast2SMS] OTP route failed, trying quick SMS route as fallback...")
            _send_sms_quick_route(phone, otp)
            return

        if resp.status_code == 402:
            raise OTPSendError(
                ui_message = "OTP service wallet is empty. Please contact support.",
                log_detail = "Fast2SMS 402 — recharge wallet at fast2sms.com"
            )

        resp.raise_for_status()
        data = resp.json()

        if data.get("return") is True:
            print(f"[Fast2SMS] OTP sent successfully. Request ID: {data.get('request_id')}")
            return

        reason = " | ".join(data.get("message", ["Unknown error"]))
        raise OTPSendError(
            ui_message = "Failed to send OTP. Please try again.",
            log_detail = f"Fast2SMS rejected: {reason}"
        )

    except OTPSendError:
        raise
    except requests.exceptions.Timeout:
        raise OTPSendError(
            ui_message = "OTP service timed out. Please try again.",
            log_detail = "Fast2SMS timed out after 10s"
        )
    except requests.exceptions.ConnectionError:
        raise OTPSendError(
            ui_message = "Could not reach OTP service. Check your internet connection.",
            log_detail = "ConnectionError reaching fast2sms.com"
        )
    except Exception as e:
        raise OTPSendError(
            ui_message = "An unexpected error occurred. Please try again.",
            log_detail = f"Unexpected error: {str(e)}"
        )


def _send_sms_quick_route(phone: str, otp: str) -> None:
    """
    Fallback: Fast2SMS 'q' (quick) route — works for all accounts, no DLT needed.
    Sends a plain text SMS instead of the pre-approved OTP template.
    """
    params = {
        "authorization": FAST2SMS_API_KEY,
        "message":       f"Your AgriShield payment OTP is {otp}. Valid for 5 minutes. Do not share with anyone.",
        "language":      "english",
        "route":         "q",
        "numbers":       phone,
    }

    resp = requests.get(FAST2SMS_URL, params=params, timeout=10)
    print(f"[Fast2SMS Quick] Status: {resp.status_code}, Body: {resp.text}")

    if resp.status_code == 401:
        raise OTPSendError(
            ui_message = "OTP service authentication failed. Please check your Fast2SMS API key in .env",
            log_detail = f"Fast2SMS 401 on both routes — API key is wrong or account is blocked. Key: {FAST2SMS_API_KEY[:8]}***"
        )
    if resp.status_code == 402:
        raise OTPSendError(
            ui_message = "OTP service wallet is empty. Please recharge at fast2sms.com",
            log_detail = "Fast2SMS 402 — insufficient balance"
        )

    resp.raise_for_status()
    data = resp.json()

    if data.get("return") is not True:
        reason = " | ".join(data.get("message", ["Unknown"]))
        raise OTPSendError(
            ui_message = "Failed to send OTP via fallback route. Please try again.",
            log_detail = f"Fast2SMS quick route rejected: {reason}"
        )

    print(f"[Fast2SMS Quick] OTP sent successfully via fallback. Request ID: {data.get('request_id')}")


def _check_cooldown(txn_ref: str):
    existing = _otp_store.get(txn_ref)
    if existing:
        elapsed = time.time() - existing.get("last_sent_at", 0)
        if elapsed < RESEND_COOLDOWN_SECS:
            raise OTPCooldownError(wait_secs=int(RESEND_COOLDOWN_SECS - elapsed))


def _get_record(txn_ref: str) -> dict:
    record = _otp_store.get(txn_ref)
    if not record:
        raise OTPNotFoundError(ui_message="OTP session not found. Please request a new OTP.")
    return record


def _check_expiry(txn_ref: str, record: dict):
    if time.time() > record["expires_at"]:
        _otp_store.pop(txn_ref, None)
        raise OTPExpiredError(ui_message="OTP expired (5 min limit). Please request a new one.")


# ── Pydantic Models ────────────────────────────────────────────────────────────
class SendOTPRequest(BaseModel):
    txn_ref: str
    amount:  float

class VerifyOTPRequest(BaseModel):
    txn_ref:     str
    entered_otp: str


# ── Routes ─────────────────────────────────────────────────────────────────────
@router.post("/send")
def send_otp(req: SendOTPRequest):
    try:
        _validate_env()
        _check_cooldown(req.txn_ref)

        otp = _generate_otp()
        _send_sms_fast2sms(OTP_PHONE_NUMBER, otp)

        _otp_store[req.txn_ref] = {
            "otp":          otp,
            "expires_at":   time.time() + OTP_EXPIRY_SECS,
            "attempts":     0,
            "last_sent_at": time.time(),
        }

        masked = f"****{OTP_PHONE_NUMBER[-4:]}"
        return {"success": True, "masked_phone": masked}

    except OTPCooldownError as e:
        print(f"[OTP /send] Cooldown: {e.log_detail}")
        return _error_response(e.ui_message)
    except OTPConfigError as e:
        print(f"[OTP /send] Config error: {e.log_detail}")
        return _error_response(e.ui_message)
    except OTPSendError as e:
        print(f"[OTP /send] Send error: {e.log_detail}")
        return _error_response(e.ui_message)
    except Exception as e:
        print(f"[OTP /send] Unexpected: {e}")
        return _error_response("Something went wrong. Please try again.")


@router.post("/verify")
def verify_otp(req: VerifyOTPRequest):
    try:
        record = _get_record(req.txn_ref)
        _check_expiry(req.txn_ref, record)

        record["attempts"] += 1

        if record["attempts"] > MAX_VERIFY_ATTEMPTS:
            _otp_store.pop(req.txn_ref, None)
            raise OTPTooManyAttemptsError(
                ui_message="Too many incorrect attempts. Please start over.",
            )

        if req.entered_otp.strip() != record["otp"]:
            raise OTPMismatchError(
                attempts=record["attempts"],
                max_attempts=MAX_VERIFY_ATTEMPTS,
            )

        _otp_store.pop(req.txn_ref, None)
        return {"success": True}

    except OTPNotFoundError as e:
        print(f"[OTP /verify] Not found: {e.log_detail}")
        return _error_response(e.ui_message)
    except OTPExpiredError as e:
        print(f"[OTP /verify] Expired: {e.log_detail}")
        return _error_response(e.ui_message)
    except OTPTooManyAttemptsError as e:
        print(f"[OTP /verify] Too many: {e.log_detail}")
        return _error_response(e.ui_message)
    except OTPMismatchError as e:
        print(f"[OTP /verify] Mismatch: {e.log_detail}")
        return _error_response(e.ui_message, attempts=e.attempts)
    except Exception as e:
        print(f"[OTP /verify] Unexpected: {e}")
        return _error_response("Something went wrong. Please try again.")


@router.post("/resend")
def resend_otp(req: SendOTPRequest):
    try:
        existing     = _otp_store.get(req.txn_ref)
        last_sent_at = existing.get("last_sent_at", 0) if existing else 0
        elapsed      = time.time() - last_sent_at

        if elapsed < RESEND_COOLDOWN_SECS:
            raise OTPCooldownError(wait_secs=int(RESEND_COOLDOWN_SECS - elapsed))

        _otp_store.pop(req.txn_ref, None)
        return send_otp(req)

    except OTPCooldownError as e:
        print(f"[OTP /resend] Cooldown: {e.log_detail}")
        return _error_response(e.ui_message)
    except Exception as e:
        print(f"[OTP /resend] Unexpected: {e}")
        return _error_response("Something went wrong. Please try again.")