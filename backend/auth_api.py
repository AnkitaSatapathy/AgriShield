from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import bcrypt

from database import get_users_collection
from models_user import UserSignup, UserLogin

router = APIRouter()

def verify_password(plain_password, hashed_password):
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password):
    salt = bcrypt.gensalt()
    pwd_bytes = password.encode('utf-8')
    # Use max 72 bytes as required by bcrypt
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserSignup):
    users_collection = get_users_collection()
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection error")
        
    # Check if user already exists
    existing_user = users_collection.find_one({"phone": user.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
        
    # Hash password
    hashed_password = get_password_hash(user.password)
    
    # Store user mapped to models_user fields conceptually, saving password securely
    user_dict = {
        "name": user.fullName,
        "phone": user.phone,
        "password": hashed_password,
        "userType": user.userType,
        "state": "",
        "district": "",
        "landArea": "0",
        "mainCrop": "",
        "farmingType": "Conventional",
        "profilePicture": None
    }
    
    result = users_collection.insert_one(user_dict)
    
    return {
        "message": "User created successfully", 
        "user_id": str(result.inserted_id),
        "userType": user.userType
    }

@router.post("/login")
async def login(credentials: UserLogin):
    users_collection = get_users_collection()
    if users_collection is None:
        raise HTTPException(status_code=500, detail="Database connection error")
        
    # Find user by phone
    user = users_collection.find_one({"phone": credentials.phone})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
        
    # Verify password
    if 'password' not in user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
        
    return {
        "message": "Login successful", 
        "user_id": str(user['_id']),
        "userType": user.get('userType', 'buyer')
    }
