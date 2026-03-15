"""
models_user.py — Pydantic request/response models for user auth and profiles.
"""

from pydantic import BaseModel, field_validator
from typing import Optional


class UserSignup(BaseModel):
    fullName: str
    phone:    str
    password: str
    userType: str = "buyer"   # "buyer" | "seller" | "both"

    @field_validator("fullName")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name must not be blank.")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def phone_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Phone number must not be blank.")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters.")
        return v

    @field_validator("userType")
    @classmethod
    def user_type_valid(cls, v: str) -> str:
        allowed = {"buyer", "seller", "both"}
        if v not in allowed:
            raise ValueError(f"userType must be one of: {', '.join(allowed)}")
        return v


class UserLogin(BaseModel):
    phone:    str
    password: str


class UserProfileUpdate(BaseModel):
    name:     Optional[str] = None
    phone:    Optional[str] = None
    state:    Optional[str] = None
    district: Optional[str] = None


class UserProfileResponse(BaseModel):
    id:       Optional[str] = None
    name:     Optional[str] = None
    phone:    Optional[str] = None
    userType: Optional[str] = None
    state:    Optional[str] = None
    district: Optional[str] = None

    class Config:
        from_attributes = True


class UserProfileCreate(BaseModel):
    name:     str
    phone:    str
    userType: str            = "buyer"
    state:    Optional[str]  = None
    district: Optional[str]  = None