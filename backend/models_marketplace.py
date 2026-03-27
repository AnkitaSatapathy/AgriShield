from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ============================================================================
# PYDANTIC MODELS - MARKETPLACE (PRODUCTS, ORDERS, CART)
# ============================================================================

class ProductBase(BaseModel):
    name: str
    category: str
    price: float
    quantity: int
    unit: str
    description: str
    image_url: Optional[str] = None
    location: str

class ProductCreate(ProductBase):
    seller_id: str

class ProductResponse(ProductBase):
    id: str
    seller_id: str
    created_at: datetime

    class Config:
        populate_by_name = True

class ProductUpdate(BaseModel):
    name: Optional[str]        = None
    category: Optional[str]    = None
    price: Optional[float]     = None
    quantity: Optional[int]    = None
    unit: Optional[str]        = None
    description: Optional[str] = None
    image_url: Optional[str]   = None
    location: Optional[str]    = None


# ── OrderBase used for CREATE (all required) ──────────────────────────────────
class OrderCreate(BaseModel):
    product_id: str
    buyer_id: str
    seller_id: str
    quantity: int
    total_amount: float
    address: str
    payment_method: str
    # optional extras CheckoutModal sends
    upi_ref: Optional[str]        = None
    card_auth_code: Optional[str] = None
    bank_ref: Optional[str]       = None
    merchant_upi: Optional[str]   = None


# ── OrderResponse — ALL fields Optional so old/partial DB docs never crash ────
# Any field the DB stored as None will just come back as None instead of 500.
class OrderResponse(BaseModel):
    id: str
    product_id: Optional[str]      = None   # FIX: was str (required) → crashed on None
    buyer_id: Optional[str]        = None
    seller_id: Optional[str]       = None
    quantity: Optional[int]        = None
    total_amount: Optional[float]  = None
    address: Optional[str]         = None   # FIX: was str (required) → crashed on None
    payment_method: Optional[str]  = None
    payment_status: Optional[str]  = None
    order_status: Optional[str]    = None
    created_at: Optional[datetime] = None
    # extra fields CheckoutModal / otp flow may write
    upi_ref: Optional[str]         = None
    card_auth_code: Optional[str]  = None
    bank_ref: Optional[str]        = None
    merchant_upi: Optional[str]    = None

    class Config:
        populate_by_name = True


class OrderStatusUpdate(BaseModel):
    order_status: str


# ── Cart ──────────────────────────────────────────────────────────────────────
class CartItemBase(BaseModel):
    user_id: str
    product_id: str
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: str

    class Config:
        populate_by_name = True


# ── Payment ───────────────────────────────────────────────────────────────────
class PaymentInitiateRequest(BaseModel):
    amount: float
    currency: str  = "INR"
    method: str

class PaymentVerifyRequest(BaseModel):
    payment_id: Optional[str] = None   # FIX: was required → crashed when not sent
    order_id: str
    status: str