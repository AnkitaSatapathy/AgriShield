from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection settings
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "agrishield_db")

client = None
db = None

def get_database():
    """
    Returns the MongoDB database instance.
    Initializes the connection if it hasn't been established yet.
    """
    global client, db
    if client is None:
        try:
            client = MongoClient(MONGO_URI)
            db = client[MONGO_DB_NAME]
            print(f"✅ Connected to MongoDB at {MONGO_URI} (Database: {MONGO_DB_NAME})")
        except Exception as e:
            print(f"⚠️ Error connecting to MongoDB: {e}")
            db = None
    return db

def get_products_collection():
    db = get_database()
    return db["products"] if db is not None else None

def get_orders_collection():
    db = get_database()
    return db["orders"] if db is not None else None

def get_cart_collection():
    db = get_database()
def get_users_collection():
    db = get_database()
    return db["users"] if db is not None else None
