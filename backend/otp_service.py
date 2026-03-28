"""
otp_service.py — Fast2SMS Quick SMS (POST) for AgriShield
==========================================================

CONFIRMED FROM OFFICIAL FAST2SMS DOCS:
  - POST requests  → API key goes in HEADER as 'authorization'
  - GET requests   → API key goes as query param 'authorization'
  - We use POST because it's cleaner and matches the official Python example exactly

NO FALLBACK — one route, one SMS, one credit per OTP request.
The fallback in the old code was silently doubling your credit usage.

.env needed:
  FAST2SMS_API_KEY=your_api_key_here
  OTP_PHONE_NUMBER=9876543210     <-- 10 digits, NO +91
  OTP_EXPIRY_SECS=300             <-- optional, defaults to 300
"""

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

FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2"

# ── In-memory OTP store ─────────────────────────────────────────────────────────
# { txn_ref: { otp, expires_at, attempts, last_sent_at } }
_otp_store: dict = {}


# ── Custom Exceptions ───────────────────────────────────────────────────────────

class OTPException(Exception):
    """
    Base class for all OTP errors.
      ui_message → shown to user in React frontend (friendly, no technical detail)
      log_detail → printed to server console only (technical, for debugging)
    """
    def __init__(self, ui_message: str, log_detail: str = ""):
        self.ui_message = ui_message
        self.log_detail = log_detail or ui_message
        super().__init__(self.log_detail)

class OTPConfigError(OTPException):
    """Required .env variable is missing or invalid."""
    pass

class OTPSendError(OTPException):
    """Fast2SMS rejected the request or a network error occurred."""
    pass

class OTPNotFoundError(OTPException):
    """txn_ref not in store — OTP never sent or already consumed."""
    pass

class OTPExpiredError(OTPException):
    """OTP has passed its expiry window."""
    pass

class OTPTooManyAttemptsError(OTPException):
    """User exceeded MAX_VERIFY_ATTEMPTS wrong guesses."""
    pass

class OTPMismatchError(OTPException):
    """User entered wrong OTP but still has attempts remaining."""
    def __init__(self, attempts: int, max_attempts: int):
        remaining = max_attempts - attempts
        super().__init__(
            ui_message = f"Incorrect OTP. {remaining} attempt(s) remaining.",
            log_detail = f"OTP mismatch — attempt {attempts}/{max_attempts}."
        )
        self.attempts  = attempts
        self.remaining = remaining

class OTPCooldownError(OTPException):
    """Resend requested before cooldown period has elapsed."""
    def __init__(self, wait_secs: int):
        super().__init__(
            ui_message = f"Please wait {wait_secs}s before requesting a new OTP.",
            log_detail = f"Cooldown active — {wait_secs}s remaining."
        )
        self.wait_secs = wait_secs


# ── Helpers ─────────────────────────────────────────────────────────────────────

def _error_response(ui_message: str, **extra) -> dict:
    """
    Returns { success: false, error: "..." } — the exact shape
    the React frontend already reads in handleCardPay / handleVerify / handleResend.
    """
    return {"success": False, "error": ui_message, **extra}


def _validate_env():
    """Raises OTPConfigError immediately if any .env value is wrong."""
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
            ui_message = "OTP service has an invalid configuration. Please contact support.",
            log_detail = (
                f"OTP_PHONE_NUMBER must be exactly 10 digits, no country code "
                f"(e.g. 9876543210). Got: '{OTP_PHONE_NUMBER}'"
            )
        )


def _generate_otp() -> str:
    """Cryptographically secure 6-digit OTP (secrets, not random)."""
    return str(secrets.randbelow(900000) + 100000)


def _send_sms_fast2sms(phone: str, otp: str) -> None:
    """
    Sends OTP via Fast2SMS Quick SMS using POST (official Python example).

    From official docs:
      POST https://www.fast2sms.com/dev/bulkV2
      Headers: { authorization: API_KEY, Content-Type: application/x-www-form-urlencoded }
      Body:    message=...&language=english&route=q&numbers=...

    No fallback — if this fails, OTPSendError is raised and NO credit is spent
    on a second attempt. One call = one SMS = one credit, always.
    """
    print(f"[Fast2SMS] Attempting to send OTP to ******{phone[-4:]}")

    headers = {
        "authorization": FAST2SMS_API_KEY,           # API key in HEADER for POST
        "Content-Type":  "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
    }
    # Form-encoded body — matches the official Fast2SMS Python example exactly
    payload = (
        f"message=Your+AgriShield+payment+OTP+is+{otp}.+"
        f"Valid+for+5+minutes.+Do+NOT+share+with+anyone."
        f"&language=english"
        f"&route=q"
        f"&numbers={phone}"
        f"&flash=0"
    )

    try:
        resp = requests.post(
            FAST2SMS_URL,
            data    = payload,
            headers = headers,
            timeout = 10,
        )

        print(f"[Fast2SMS] Status: {resp.status_code} | Body: {resp.text}")

        # ── Specific HTTP error codes ────────────────────────────────────────
        if resp.status_code == 401:
            raise OTPSendError(
                ui_message = "OTP service authentication failed. Please contact support.",
                log_detail = (
                    f"Fast2SMS 401 Unauthorized — API key is wrong or account suspended. "
                    f"Key starts with: {FAST2SMS_API_KEY[:8]}..."
                )
            )
        if resp.status_code == 402:
            raise OTPSendError(
                ui_message = "OTP service wallet is empty. Please contact support.",
                log_detail = "Fast2SMS 402 — insufficient wallet balance. Recharge at fast2sms.com"
            )
        if resp.status_code == 400:
            raise OTPSendError(
                ui_message = "Something went wrong while sending OTP. Please try again.",
                log_detail = f"Fast2SMS 400 Bad Request — response: {resp.text}"
            )

        resp.raise_for_status()  # handle any other unexpected 4xx/5xx

        data = resp.json()

        if data.get("return") is True:
            print(f"[Fast2SMS] ✅ OTP sent. Request ID: {data.get('request_id')}")
            return  # success — no return value needed

        # HTTP 200 but return=false — Fast2SMS rejected with a reason
        reason = " | ".join(data.get("message", ["Unknown Fast2SMS error"]))
        raise OTPSendError(
            ui_message = "Failed to send OTP. Please try again.",
            log_detail = f"Fast2SMS return=false: {reason}"
        )

    except OTPSendError:
        raise  # re-raise unchanged — do NOT wrap in another OTPSendError

    except requests.exceptions.Timeout:
        raise OTPSendError(
            ui_message = "OTP service timed out. Please check your connection and try again.",
            log_detail = "Fast2SMS POST timed out after 10s"
        )
    except requests.exceptions.ConnectionError:
        raise OTPSendError(
            ui_message = "Could not reach OTP service. Please check your internet connection.",
            log_detail = "ConnectionError — could not reach fast2sms.com"
        )
    except requests.exceptions.HTTPError as e:
        raise OTPSendError(
            ui_message = "Something went wrong while sending OTP. Please try again.",
            log_detail = f"Fast2SMS HTTPError: {e}"
        )
    except Exception as e:
        raise OTPSendError(
            ui_message = "An unexpected error occurred. Please try again.",
            log_detail = f"Unexpected error in _send_sms_fast2sms: {str(e)}"
        )


def _check_cooldown(txn_ref: str):
    """Raises OTPCooldownError if same txn_ref was sent within cooldown window."""
    existing = _otp_store.get(txn_ref)
    if existing:
        elapsed = time.time() - existing.get("last_sent_at", 0)
        if elapsed < RESEND_COOLDOWN_SECS:
            raise OTPCooldownError(wait_secs=int(RESEND_COOLDOWN_SECS - elapsed))


def _get_record(txn_ref: str) -> dict:
    """Returns the OTP record or raises OTPNotFoundError."""
    record = _otp_store.get(txn_ref)
    if not record:
        raise OTPNotFoundError(
            ui_message = "OTP session not found or already used. Please request a new OTP.",
        )
    return record


def _check_expiry(txn_ref: str, record: dict):
    """Raises OTPExpiredError and removes store entry if OTP has expired."""
    if time.time() > record["expires_at"]:
        _otp_store.pop(txn_ref, None)
        raise OTPExpiredError(
            ui_message = "OTP has expired (5 min limit). Please go back and request a new one.",
        )


# ── Pydantic Models ─────────────────────────────────────────────────────────────

class SendOTPRequest(BaseModel):
    txn_ref: str
    amount:  float

class VerifyOTPRequest(BaseModel):
    txn_ref:     str
    entered_otp: str


# ── Routes ──────────────────────────────────────────────────────────────────────

@router.post("/send")
def send_otp(req: SendOTPRequest):
    """
    Step 1 — frontend calls this when user clicks Pay on the debit card form.
    Flow: validate env → check cooldown → generate OTP → send SMS → store record.
    OTP is only stored AFTER confirmed SMS delivery to prevent phantom records.
    All errors return { success: false, error: "friendly message" }.
    """
    try:
        _validate_env()
        _check_cooldown(req.txn_ref)

        otp = _generate_otp()
        _send_sms_fast2sms(OTP_PHONE_NUMBER, otp)  # raises OTPSendError on failure

        # Write to store only after successful delivery
        _otp_store[req.txn_ref] = {
            "otp":          otp,
            "expires_at":   time.time() + OTP_EXPIRY_SECS,
            "attempts":     0,
            "last_sent_at": time.time(),
        }

        masked = f"****{OTP_PHONE_NUMBER[-4:]}"
        return {"success": True, "masked_phone": masked}

    except OTPCooldownError as e:
        print(f"[OTP /send] {e.log_detail}")
        return _error_response(e.ui_message)
    except OTPConfigError as e:
        print(f"[OTP /send] {e.log_detail}")
        return _error_response(e.ui_message)
    except OTPSendError as e:
        print(f"[OTP /send] {e.log_detail}")
        return _error_response(e.ui_message)
    except Exception as e:
        print(f"[OTP /send] Unexpected: {e}")
        return _error_response("Something went wrong. Please try again.")


@router.post("/verify")
def verify_otp(req: VerifyOTPRequest):
    """
    Step 2 — frontend calls this when user submits the OTP.
    OTP is consumed immediately on first correct match (one-time use).
    All errors return { success: false, error: "friendly message" }.
    """
    try:
        record = _get_record(req.txn_ref)
        _check_expiry(req.txn_ref, record)

        record["attempts"] += 1

        if record["attempts"] > MAX_VERIFY_ATTEMPTS:
            _otp_store.pop(req.txn_ref, None)
            raise OTPTooManyAttemptsError(
                ui_message = "Too many incorrect attempts. Payment blocked for security. Please start over.",
            )

        if req.entered_otp.strip() != record["otp"]:
            raise OTPMismatchError(
                attempts     = record["attempts"],
                max_attempts = MAX_VERIFY_ATTEMPTS,
            )

        # ✅ Correct OTP — consume immediately, cannot be reused
        _otp_store.pop(req.txn_ref, None)
        return {"success": True}

    except OTPNotFoundError as e:
        print(f"[OTP /verify] {e.log_detail}")
        return _error_response(e.ui_message)
    except OTPExpiredError as e:
        print(f"[OTP /verify] {e.log_detail}")
        return _error_response(e.ui_message)
    except OTPTooManyAttemptsError as e:
        print(f"[OTP /verify] {e.log_detail}")
        return _error_response(e.ui_message)
    except OTPMismatchError as e:
        print(f"[OTP /verify] {e.log_detail}")
        return _error_response(e.ui_message, attempts=e.attempts)
    except Exception as e:
        print(f"[OTP /verify] Unexpected: {e}")
        return _error_response("Something went wrong during verification. Please try again.")


@router.post("/resend")
def resend_otp(req: SendOTPRequest):
    """
    Invalidates the current OTP and issues a fresh one.
    Cooldown is checked BEFORE wiping the old record —
    prevents bypassing cooldown by hitting /resend instead of /send.
    """
    try:
        existing     = _otp_store.get(req.txn_ref)
        last_sent_at = existing.get("last_sent_at", 0) if existing else 0
        elapsed      = time.time() - last_sent_at

        if elapsed < RESEND_COOLDOWN_SECS:
            raise OTPCooldownError(wait_secs=int(RESEND_COOLDOWN_SECS - elapsed))

        _otp_store.pop(req.txn_ref, None)
        return send_otp(req)

    except OTPCooldownError as e:
        print(f"[OTP /resend] {e.log_detail}")
        return _error_response(e.ui_message)
    except Exception as e:
        print(f"[OTP /resend] Unexpected: {e}")
        return _error_response("Something went wrong. Please try again.")