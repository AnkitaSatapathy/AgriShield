from fastapi import APIRouter, HTTPException, status
from typing import Optional
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from models_user import UserProfileCreate, UserProfileResponse, UserProfileUpdate
from database import get_users_collection

# Import the ML lists from predict module safely
try:
    from predict import crop_list, state_list, district_list, district_info
except ImportError:
    crop_list, state_list, district_list, district_info = [], [], [], {}

from indian_districts import STATE_DISTRICTS

router = APIRouter(prefix="/api/users", tags=["Users"])

def objectid_to_str(obj: dict) -> dict:
    """Convert MongoDB ObjectId to string for JSON serialization"""
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

# ============================================================================
# USER PROFILE APIs
# ============================================================================

@router.get("/options/all")
async def get_all_options():
    """Return all available crops, states, and districts for profile dropdowns"""
    state_to_districts = STATE_DISTRICTS.copy() if STATE_DISTRICTS else {}
    
    # Fallback to ML model mapping if state is missing
    if district_info:
        for key in district_info.keys():
            if ", " in key:
                dist, st = key.split(", ", 1)
                if st not in state_to_districts:
                    state_to_districts.setdefault(st, []).append(dist)
    
    if not state_to_districts and not district_info:
        state_to_districts = {"All States": list(district_list) if district_list else []}
        
    for k in state_to_districts:
        state_to_districts[k] = sorted(list(set(state_to_districts[k])))
        
    return {
        "crops": sorted(list(crop_list)) if crop_list else [],
        "states": sorted(list(state_to_districts.keys())),
        "state_districts": state_to_districts
    }


@router.get("/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(user_id: str):
    """Fetch a user's profile details"""
    users_db = get_users_collection()
    if users_db is None:
        raise HTTPException(status_code=503, detail="Database connection not available")

    # In a real app we might use ObjectIds for user_ids, but here we can just query by a string ID field 
    # if we are using custom simulated IDs like 'user_1234'
    query = {}
    try:
        query = {"_id": ObjectId(user_id)}
    except Exception:
        query = {"id": user_id}

    user = users_db.find_one(query)
    
    if not user:
        # If user doesn't exist, we can return a 404
        raise HTTPException(status_code=404, detail="User profile not found")
        
    return objectid_to_str(user)

@router.put("/{user_id}", response_model=UserProfileResponse)
async def update_user_profile(user_id: str, update_data: UserProfileUpdate):
    """Update user profile details or create if not exists (Upsert)"""
    users_db = get_users_collection()
    if users_db is None:
        raise HTTPException(status_code=503, detail="Database connection not available")

    query = {}
    try:
        query = {"_id": ObjectId(user_id)}
    except Exception:
        query = {"id": user_id}

    # Only include fields that were set
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
         raise HTTPException(status_code=400, detail="No fields to update")
         
    update_dict["updated_at"] = datetime.utcnow()

    # We use an upsert so that if the user doesn't exist yet in the DB 
    # (because we don't have an auth registration flow), it gets created.
    
    set_on_insert = {"created_at": datetime.utcnow()}
    if "id" in query:
        set_on_insert["id"] = user_id

    result = users_db.update_one(
        query, 
        {
            "$set": update_dict,
            "$setOnInsert": set_on_insert
        },
        upsert=True
    )
        
    updated_user = users_db.find_one(query)
    return objectid_to_str(updated_user)
