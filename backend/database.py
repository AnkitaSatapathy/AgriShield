"""
database.py — MongoDB Atlas connection for AgriShield.

Set these in your .env file:
    MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
    MONGO_DB_NAME=agrishield_db
"""

from pymongo import MongoClient, ASCENDING
from pymongo.collection import Collection
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI     = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "agrishield_db")

_client = None
_db     = None


# ─── Connection ───────────────────────────────────────────────────────────────

def get_database():
    """
    Return the MongoDB database instance.
    Initialises the MongoClient on the first call and caches it for reuse.
    Raises RuntimeError if the connection cannot be established.
    """
    global _client, _db

    if _db is not None:
        return _db

    try:
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Ping to confirm the connection is live before accepting traffic.
        _client.admin.command("ping")
        _db = _client[MONGO_DB_NAME]
        print(f"✅ Connected to MongoDB Atlas  →  database: '{MONGO_DB_NAME}'")
        _ensure_indexes(_db)
        return _db
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        print(f"❌ MongoDB connection failed: {exc}")
        print("   Check MONGO_URI in your .env file and that Atlas network access allows your IP.")
        raise RuntimeError(f"Could not connect to MongoDB: {exc}") from exc


def _ensure_indexes(db) -> None:
    """Create indexes that make auth queries fast and enforce uniqueness."""
    try:
        # Unique phone index — prevents duplicate accounts at the DB level.
        db["users"].create_index([("phone", ASCENDING)], unique=True, name="unique_phone")
        # Speed up farm-detail look-ups by user_id.
        db["farm_details"].create_index([("user_id", ASCENDING)], name="farm_user_id")
        print("✅ MongoDB indexes verified")
    except Exception as exc:
        # Non-fatal — indexes may already exist.
        print(f"⚠️  Index creation warning: {exc}")


# ─── Collection helpers ───────────────────────────────────────────────────────

def get_collection(name: str) -> Collection:
    """
    Return a MongoDB Collection object.
    Raises RuntimeError (propagated from get_database) if DB is unreachable.
    """
    return get_database()[name]


def get_users_collection()      -> Collection: return get_collection("users")
def get_products_collection()   -> Collection: return get_collection("products")
def get_orders_collection()     -> Collection: return get_collection("orders")
def get_cart_collection()       -> Collection: return get_collection("cart")
def get_farm_details_collection() -> Collection: return get_collection("farm_details")