"""
auth_api.py — Signup and Login routes for AgriShield.

Mounted at /api/auth in main.py:
    app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])

Routes
------
POST /api/auth/signup   — create a new user account
POST /api/auth/login    — authenticate and receive a JWT token
"""

from fastapi import APIRouter, HTTPException, status
from pymongo.errors import DuplicateKeyError
import bcrypt
import jwt
import os
from datetime import datetime, timedelta

from database import get_users_collection
from models_user import UserSignup, UserLogin

router = APIRouter()

JWT_SECRET      = os.getenv("JWT_SECRET", "agrishield-secret-key-change-in-production")
JWT_ALGORITHM   = "HS256"
JWT_EXPIRE_HOURS = 24 * 7   # 7 days


# ─── Password helpers ─────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Return a bcrypt hash of *password* (UTF-8, max 72 bytes)."""
    pwd_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """
    Return True if *plain* matches the bcrypt *hashed* value.
    Logs the error and returns False if the hash is malformed — this should
    never happen in production but guards against corrupted DB entries.
    """
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception as exc:
        print(f"[auth] bcrypt verify error: {exc!r}")
        return False


# ─── JWT helper ───────────────────────────────────────────────────────────────

def create_access_token(user_id: str, user_type: str) -> str:
    """Encode a signed JWT that expires after JWT_EXPIRE_HOURS."""
    now = datetime.utcnow()
    payload = {
        "sub":      user_id,
        "userType": user_type,
        "iat":      now,
        "exp":      now + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserSignup):
    """
    Register a new user.

    - Hashes the password with bcrypt before storing.
    - Rejects duplicate phone numbers (enforced by a unique DB index).
    """
    try:
        users_col = get_users_collection()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    # Duplicate-phone guard (fast path before the DB write)
    if users_col.find_one({"phone": user.phone}, {"_id": 1}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number is already registered. Please log in instead.",
        )

    user_doc = {
        "name":       user.fullName.strip(),
        "phone":      user.phone.strip(),
        "password":   hash_password(user.password),
        "userType":   user.userType,
        "state":      "",
        "district":   "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    try:
        result   = users_col.insert_one(user_doc)
        user_id  = str(result.inserted_id)
    except DuplicateKeyError:
        # Race-condition safety net — unique index catches concurrent signups.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number is already registered.",
        )
    except Exception as exc:
        print(f"[signup] insert error: {exc!r}")
        raise HTTPException(status_code=500, detail="Could not create account. Please try again.")

    return {
        "message":  "Account created successfully",
        "user_id":  user_id,
        "userType": user.userType,
    }


@router.post("/login")
async def login(credentials: UserLogin):
    """
    Authenticate a user and return a signed JWT token.

    Returns 401 for both "user not found" and "wrong password" so that
    callers cannot enumerate registered phone numbers.
    """
    try:
        users_col = get_users_collection()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    # 1. Look up the user by phone number.
    user = users_col.find_one({"phone": credentials.phone.strip()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password.",
        )

    # 2. Confirm the account has a stored password hash.
    stored_hash = user.get("password", "")
    if not stored_hash:
        print(f"[login] user {user.get('_id')} has no password field — data integrity issue")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password.",
        )

    # 3. Verify the supplied password against the bcrypt hash.
    if not verify_password(credentials.password, stored_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid phone number or password.",
        )

    # 4. Issue a JWT token.
    user_id   = str(user["_id"])
    user_type = user.get("userType", "buyer")
    token     = create_access_token(user_id, user_type)

    return {
        "message":  "Login successful",
        "user_id":  user_id,
        "userType": user_type,
        "token":    token,
    }