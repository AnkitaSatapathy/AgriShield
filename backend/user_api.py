"""
user_api.py — User profile and farm-detail routes for AgriShield.

All routes are prefixed with /api/users (declared on the router below).
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
import jwt
import os

from models_user import UserProfileUpdate
from database import get_users_collection, get_database

JWT_SECRET    = os.getenv("JWT_SECRET", "agrishield-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"

router   = APIRouter(prefix="/api/users", tags=["Users"])
security = HTTPBearer(auto_error=False)

# Optional ML/district imports
try:
    from predict import crop_list, state_list, district_list, district_info
except ImportError:
    crop_list = state_list = district_list = []
    district_info = {}

try:
    from indian_districts import STATE_DISTRICTS
except ImportError:
    STATE_DISTRICTS = {}


# ─── Pydantic models ──────────────────────────────────────────────────────────

class FarmDetails(BaseModel):
    total_land:   Optional[str] = None
    main_crop:    Optional[str] = None
    farming_type: Optional[str] = "Conventional"


# ─── Utility helpers ──────────────────────────────────────────────────────────

def objectid_to_str(obj: dict) -> dict:
    """Replace the MongoDB '_id' field with a plain-string 'id' field."""
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj


def get_query_by_id(user_id: str) -> dict:
    """
    Build a MongoDB filter that matches a document by its _id.
    Accepts both 24-hex ObjectId strings and arbitrary string IDs.
    """
    try:
        return {"_id": ObjectId(user_id)}
    except Exception:
        # user_id is not a valid ObjectId hex — try matching as a plain string _id.
        return {"_id": user_id}


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Optional[str]:
    """
    Decode the Bearer JWT and return the user_id ('sub' claim).
    Returns None when no Authorization header is present.
    Raises 401 for expired or invalid tokens.
    """
    if not credentials:
        return None
    try:
        payload = jwt.decode(
            credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM]
        )
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token.")


# ─── Avatar helpers (server-side — mirrors the frontend logic) ────────────────

_GRADIENTS = [
    ("#10b981", "#065f46"),
    ("#3b82f6", "#1e40af"),
    ("#f59e0b", "#92400e"),
    ("#ec4899", "#9d174d"),
    ("#8b5cf6", "#5b21b6"),
    ("#14b8a6", "#115e59"),
    ("#f97316", "#9a3412"),
]

def _avatar_colors(name: str) -> dict:
    h = 0
    for ch in (name or ""):
        h = ord(ch) + ((h << 5) - h)
    from_c, to_c = _GRADIENTS[abs(h) % len(_GRADIENTS)]
    return {"from": from_c, "to": to_c}

def _initials(name: str) -> str:
    parts = [p for p in (name or "").strip().split() if p]
    if not parts:      return "?"
    if len(parts) == 1: return parts[0][:2].upper()
    return (parts[0][0] + parts[-1][0]).upper()

def _attach_avatar(user: dict) -> dict:
    name = user.get("name") or ""
    user["avatar"] = {"initials": _initials(name), "colors": _avatar_colors(name)}
    return user


# ─── Options endpoint ─────────────────────────────────────────────────────────

@router.get("/options/all")
async def get_all_options():
    """Return all crops, states, and districts for profile-page dropdowns."""
    state_to_districts: dict = dict(STATE_DISTRICTS)

    if district_info:
        for key in district_info.keys():
            if ", " in key:
                dist, st = key.split(", ", 1)
                state_to_districts.setdefault(st, []).append(dist)

    if not state_to_districts:
        state_to_districts = {"All States": list(district_list)}

    for k in state_to_districts:
        state_to_districts[k] = sorted(set(state_to_districts[k]))

    return {
        "crops":           sorted(crop_list),
        "states":          sorted(state_to_districts.keys()),
        "state_districts": state_to_districts,
    }


# ─── User profile endpoints ───────────────────────────────────────────────────

@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    """
    GET /api/users/{user_id}

    Returns the user's profile with the password field removed.
    A computed `avatar` block (initials + gradient colours) is included so
    the frontend can render the default avatar without extra logic.
    """
    try:
        users_col = get_users_collection()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    user = users_col.find_one(get_query_by_id(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.pop("password", None)
    user = objectid_to_str(user)
    return _attach_avatar(user)


@router.put("/{user_id}")
async def update_user_profile(user_id: str, update_data: UserProfileUpdate):
    """
    PUT /api/users/{user_id}

    Partially update a user's profile. Only non-null fields in the request
    body are written. Returns the updated profile.
    """
    try:
        users_col = get_users_collection()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    fields = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(status_code=400, detail="No fields provided for update.")

    fields["updated_at"] = datetime.utcnow()
    query = get_query_by_id(user_id)

    result = users_col.update_one(
        query,
        {
            "$set": fields,
            "$setOnInsert": {"created_at": datetime.utcnow()},
        },
        upsert=True,
    )

    if result.matched_count == 0 and result.upserted_id is None:
        raise HTTPException(status_code=404, detail="User not found.")

    updated = users_col.find_one(query)
    updated.pop("password", None)
    updated = objectid_to_str(updated)
    return _attach_avatar(updated)


# ─── Farm detail endpoints ────────────────────────────────────────────────────

@router.get("/{user_id}/farm")
async def get_farm_details(user_id: str):
    """GET /api/users/{user_id}/farm — retrieve this user's farm details."""
    try:
        db = get_database()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    farm = db["farm_details"].find_one({"user_id": user_id})
    if not farm:
        raise HTTPException(status_code=404, detail="Farm details not found.")

    return objectid_to_str(farm)


@router.post("/{user_id}/farm")
async def create_or_update_farm(user_id: str, farm: FarmDetails):
    """
    POST /api/users/{user_id}/farm

    Create or update (upsert) farm details for a user.
    """
    try:
        db = get_database()
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))

    farm_dict = {k: v for k, v in farm.model_dump().items() if v is not None}
    farm_dict["updated_at"] = datetime.utcnow()

    db["farm_details"].update_one(
        {"user_id": user_id},
        {
            "$set": farm_dict,
            "$setOnInsert": {"user_id": user_id, "created_at": datetime.utcnow()},
        },
        upsert=True,
    )

    saved = db["farm_details"].find_one({"user_id": user_id})
    return objectid_to_str(saved)