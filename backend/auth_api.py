from fastapi import APIRouter, HTTPException, status
import bcrypt
import jwt
import os
from datetime import datetime, timedelta

from database import get_users_collection
from models_user import UserSignup, UserLogin

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "agrishield-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24 * 7   # 7 days


# ─── Helpers ─────────────────────────────────────────────────────────────────

def create_access_token(user_id: str, user_type: str) -> str:
    payload = {
        "sub": user_id,
        "userType": user_type,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]   # bcrypt max 72 bytes
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserSignup):
    """
    Register a new user.
    Route: POST /api/auth/signup
    """
    try:
        users_col = get_users_collection()
        if users_col is None:
            raise HTTPException(
                status_code=500,
                detail="Database connection failed. Please check your database configuration."
            )

        # Check if phone already exists
        if isinstance(users_col, list):
            # Mock database - check in list
            if any(u.get("phone") == user.phone for u in users_col):
                raise HTTPException(status_code=400, detail="Phone number already registered")
        else:
            # MongoDB collection
            if users_col.find_one({"phone": user.phone}):
                raise HTTPException(status_code=400, detail="Phone number already registered")

        user_doc = {
            "name": user.fullName,
            "phone": user.phone,
            "password": hash_password(user.password),
            "userType": user.userType,
            "state": "",
            "district": "",
            "created_at": datetime.utcnow(),
        }

        if isinstance(users_col, list):
            # Mock database - append to list
            import uuid
            user_doc["_id"] = str(uuid.uuid4())
            users_col.append(user_doc)
            user_id = user_doc["_id"]
        else:
            # MongoDB collection
            result = users_col.insert_one(user_doc)
            user_id = str(result.inserted_id)

        return {
            "message": "User created successfully",
            "user_id": user_id,
            "userType": user.userType,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {e}")  # For debugging
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/login")
async def login(credentials: UserLogin):
    """
    Authenticate user and return JWT token.
    Route: POST /api/auth/login
    """
    try:
        users_col = get_users_collection()
        if users_col is None:
            raise HTTPException(
                status_code=500,
                detail="Database connection failed. Please check your MongoDB configuration."
            )

        user = None
        if isinstance(users_col, list):
            # Mock database - find in list
            user = next((u for u in users_col if u.get("phone") == credentials.phone), None)
        else:
            # MongoDB collection
            user = users_col.find_one({"phone": credentials.phone})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid phone number or password")

        if "password" not in user or not verify_password(credentials.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid phone number or password")

        user_id = str(user["_id"])
        user_type = user.get("userType", "buyer")
        token = create_access_token(user_id, user_type)

        return {
            "message": "Login successful",
            "user_id": user_id,
            "userType": user_type,
            "token": token,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")  # For debugging
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )