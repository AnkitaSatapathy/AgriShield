from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from models_marketplace import (
    ProductCreate, ProductResponse, ProductUpdate,
    OrderCreate, OrderResponse, OrderStatusUpdate,
    CartItemCreate, CartItemResponse,
    PaymentInitiateRequest, PaymentVerifyRequest
)
from database import get_products_collection, get_orders_collection, get_cart_collection

router = APIRouter(prefix="/api/marketplace", tags=["Marketplace"])

def objectid_to_str(obj: dict) -> dict:
    """Convert MongoDB ObjectId to string for JSON serialization"""
    if obj and "_id" in obj:
        obj["id"] = str(obj["_id"])
        del obj["_id"]
    return obj

# ============================================================================
# PRODUCT APIs
# ============================================================================

@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate):
    """Create a new product listing by the seller"""
    products_db = get_products_collection()
    if products_db is None:
        raise HTTPException(status_code=503, detail="Database connection not available")

    new_product = product.model_dump()
    new_product["created_at"] = datetime.utcnow()
    
    result = products_db.insert_one(new_product)
    created_product = products_db.find_one({"_id": result.inserted_id})
    return objectid_to_str(created_product)

@router.get("/products", response_model=List[ProductResponse])
async def get_all_products(category: Optional[str] = None, search: Optional[str] = None):
    """Retrieve all available products with optional search and category filters"""
    products_db = get_products_collection()
    if products_db is None:
        return []

    query = {}
    if category:
        query["category"] = category
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
        
    products = list(products_db.find(query))
    return [objectid_to_str(p) for p in products]

@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Fetch complete details of a single product"""
    try:
        obj_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Product ID format")

    products_db = get_products_collection()
    if products_db is None:
        raise HTTPException(status_code=503, detail="Database connection not available")

    product = products_db.find_one({"_id": obj_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return objectid_to_str(product)

@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, update_data: ProductUpdate):
    """Update product details"""
    try:
        obj_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Product ID format")

    products_db = get_products_collection()
    if products_db is None:
        raise HTTPException(status_code=503, detail="Database connection not available")

    # Only include fields that were set
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if update_dict:
        products_db.update_one({"_id": obj_id}, {"$set": update_dict})
        
    updated_product = products_db.find_one({"_id": obj_id})
    if not updated_product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return objectid_to_str(updated_product)

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    """Delete a product listing"""
    try:
        obj_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Product ID format")

    products_db = get_products_collection()
    if products_db is None:
        raise HTTPException(status_code=503, detail="Database connection not available")

    result = products_db.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"status": "Successfully deleted"}

# ============================================================================
# ORDER APIs
# ============================================================================

@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate):
    """Create a new order"""
    orders_db = get_orders_collection()
    if orders_db is None:
        raise HTTPException(status_code=503, detail="Database connection not available")

    new_order = order.model_dump()
    new_order["created_at"] = datetime.utcnow()
    new_order["payment_status"] = "Pending"
    new_order["order_status"] = "Pending"
    
    result = orders_db.insert_one(new_order)
    created_order = orders_db.find_one({"_id": result.inserted_id})
    return objectid_to_str(created_order)

@router.get("/orders/buyer/{buyer_id}", response_model=List[OrderResponse])
async def get_buyer_orders(buyer_id: str):
    """Retrieve all orders placed by a specific buyer"""
    orders_db = get_orders_collection()
    if orders_db is None:
        return []

    orders = list(orders_db.find({"buyer_id": buyer_id}).sort("created_at", -1))
    return [objectid_to_str(o) for o in orders]

@router.get("/orders/seller/{seller_id}", response_model=List[OrderResponse])
async def get_seller_orders(seller_id: str):
    """Retrieve all orders received by a specific seller"""
    orders_db = get_orders_collection()
    if orders_db is None:
        return []

    orders = list(orders_db.find({"seller_id": seller_id}).sort("created_at", -1))
    return [objectid_to_str(o) for o in orders]

@router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(order_id: str, status_update: OrderStatusUpdate):
    """Update the status of an order (Accepted, Delivered, or Rejected)"""
    try:
        obj_id = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Order ID format")

    orders_db = get_orders_collection()
    if orders_db is None:
        raise HTTPException(status_code=503, detail="Database connection not available")

    valid_statuses = ["Pending", "Accepted", "Delivered", "Rejected"]
    if status_update.order_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    result = orders_db.update_one(
        {"_id": obj_id}, 
        {"$set": {"order_status": status_update.order_status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
        
    updated_order = orders_db.find_one({"_id": obj_id})
    return objectid_to_str(updated_order)

# ============================================================================
# CART APIs
# ============================================================================

@router.post("/cart", response_model=CartItemResponse)
async def add_to_cart(cart_item: CartItemCreate):
    """Add a selected product to user's cart or update quantity if already added"""
    cart_db = get_cart_collection()
    if cart_db is None:
        raise HTTPException(status_code=503, detail="Database connection not available")

    # Check if item already exists in cart for this user
    existing_item = cart_db.find_one({
        "user_id": cart_item.user_id,
        "product_id": cart_item.product_id
    })

    if existing_item:
        # Update quantity
        new_quantity = existing_item["quantity"] + cart_item.quantity
        cart_db.update_one(
            {"_id": existing_item["_id"]},
            {"$set": {"quantity": new_quantity}}
        )
        updated_item = cart_db.find_one({"_id": existing_item["_id"]})
        return objectid_to_str(updated_item)
    else:
        # Insert new item
        new_item = cart_item.model_dump()
        result = cart_db.insert_one(new_item)
        created_item = cart_db.find_one({"_id": result.inserted_id})
        return objectid_to_str(created_item)

@router.get("/cart/{user_id}", response_model=List[CartItemResponse])
async def get_cart(user_id: str):
    """Retrieve all items currently added to a user's cart"""
    cart_db = get_cart_collection()
    if cart_db is None:
        return []

    items = list(cart_db.find({"user_id": user_id}))
    return [objectid_to_str(i) for i in items]

@router.delete("/cart/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(item_id: str):
    """Remove a specific item from the cart"""
    try:
        obj_id = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Cart Item ID format")

    cart_db = get_cart_collection()
    if cart_db is None:
        raise HTTPException(status_code=503, detail="Database connection not available")

    result = cart_db.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    return {"status": "Successfully removed"}

# ============================================================================
# PAYMENT APIs (Mock)
# ============================================================================

@router.post("/payments/initiate")
async def initiate_payment(request: PaymentInitiateRequest):
    """Initiate online payment by creating a payment order"""
    import uuid
    # Mocking payment initiation
    mock_transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
    
    return {
        "success": True,
        "payment_order_id": mock_transaction_id,
        "amount": request.amount,
        "currency": request.currency,
        "method": request.method,
        "message": "Payment initiation simulated successfully"
    }

@router.post("/payments/verify")
async def verify_payment(request: PaymentVerifyRequest):
    """Verify payment response and update DB"""
    try:
        obj_id = ObjectId(request.order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Order ID format")

    orders_db = get_orders_collection()
    if orders_db is None:
        raise HTTPException(status_code=503, detail="Database connection not available")

    if request.status.upper() == "SUCCESS":
        new_status = "Completed"
    else:
        new_status = "Failed"

    result = orders_db.update_one(
        {"_id": obj_id}, 
        {"$set": {"payment_status": new_status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found to update payment status")
        
    return {
        "success": True,
        "order_id": request.order_id,
        "payment_status": new_status,
        "message": f"Payment successfully verified and noted as {new_status}"
    }
