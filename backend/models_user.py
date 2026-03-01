from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# ============================================================================
# PYDANTIC MODELS - USER PROFILE
# ============================================================================

class UserProfileBase(BaseModel):
    name: str = Field(..., description="Full Name of the user")
    phone: str = Field(..., description="Phone Number")
    state: str = Field(..., description="State of residence")
    district: str = Field(..., description="District of residence")
    landArea: Optional[str] = Field("0", description="Total Land Area (in Acres)")
    mainCrop: Optional[str] = Field("", description="Main Crop grown")
    farmingType: Optional[str] = Field("Conventional", description="Type of Farming (Organic/Conventional)")
    profilePicture: Optional[str] = Field(None, description="Base64 encoded profile picture")

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: str = Field(..., description="User ID (MongoDB ObjectId as string) or predefined string ID")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    landArea: Optional[str] = None
    mainCrop: Optional[str] = None
    farmingType: Optional[str] = None
    profilePicture: Optional[str] = None

# ============================================================================
# PYDANTIC MODELS - AUTHENTICATION
# ============================================================================

class UserSignup(BaseModel):
    fullName: str = Field(..., description="Full Name of the user")
    phone: str = Field(..., description="Phone Number")
    password: str = Field(..., description="Plain text password")
    userType: str = Field("buyer", description="User type: buyer, seller, or both")

class UserLogin(BaseModel):
    phone: str = Field(..., description="Phone Number")
    password: str = Field(..., description="Plain text password")
