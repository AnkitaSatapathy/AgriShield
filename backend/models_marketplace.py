from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# ============================================================================
# PYDANTIC MODELS - MARKETPLACE (PRODUCTS, ORDERS, CART)
# ============================================================================

class ProductBase(BaseModel):
    name: str = Field(..., description="Product name")
    category: str = Field(..., description="Product category (e.g., Seeds, Fertilizer, Pesticide)")
    price: float = Field(..., description="Price of the product per unit")
    quantity: int = Field(..., description="Available quantity in stock")
    unit: str = Field(..., description="Unit of measurement (e.g., kg, L, bag)")
    description: str = Field(..., description="Detailed description of the product")
    image_url: Optional[str] = Field(None, description="URL of the product image")
    location: str = Field(..., description="Location of the seller/product")

class ProductCreate(ProductBase):
    seller_id: str = Field(..., description="ID of the seller creating the product")

class ProductResponse(ProductBase):
    id: str = Field(..., description="Product ID (MongoDB ObjectId as string)")
    seller_id: str = Field(..., description="ID of the seller")
    created_at: datetime = Field(..., description="Creation timestamp")

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    location: Optional[str] = None


class OrderBase(BaseModel):
    product_id: str = Field(..., description="ID of the ordered product")
    buyer_id: str = Field(..., description="ID of the buyer")
    seller_id: str = Field(..., description="ID of the seller")
    quantity: int = Field(..., description="Quantity ordered")
    total_amount: float = Field(..., description="Total cost of the order")
    address: str = Field(..., description="Delivery address")
    payment_method: str = Field(..., description="Method of payment (e.g., UPI, Card, COD)")

class OrderCreate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: str = Field(..., description="Order ID (MongoDB ObjectId as string)")
    payment_status: str = Field(..., description="Payment status (e.g., Pending, Completed)")
    order_status: str = Field(..., description="Order status (e.g., Pending, Accepted, Delivered, Rejected)")
    created_at: datetime = Field(..., description="Creation timestamp")

class OrderStatusUpdate(BaseModel):
    order_status: str = Field(..., description="New order status (e.g., Accepted, Delivered, Rejected)")


class CartItemBase(BaseModel):
    user_id: str = Field(..., description="ID of the user")
    product_id: str = Field(..., description="ID of the product being added to cart")
    quantity: int = Field(..., description="Quantity to add")

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: str = Field(..., description="Cart Item ID (MongoDB ObjectId as string)")

class PaymentInitiateRequest(BaseModel):
    amount: float = Field(..., description="Amount to be paid")
    currency: str = Field("INR", description="Currency of payment")
    method: str = Field(..., description="Payment method (UPI/Card)")

class PaymentVerifyRequest(BaseModel):
    payment_id: str = Field(..., description="Gateway Payment ID")
    order_id: str = Field(..., description="Order ID to update")
    status: str = Field(..., description="Verification status (e.g., SUCCESS, FAILURE)")
