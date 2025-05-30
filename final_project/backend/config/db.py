import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "video_seo_db")

# Global client variable
client = None
db = None

def initialize_db():
    """Initialize the database connection"""
    global client, db
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        
        # Create collections if they don't exist
        if "users" not in db.list_collection_names():
            db.create_collection("users")
        
        if "videos" not in db.list_collection_names():
            db.create_collection("videos")
        
        if "keywords" not in db.list_collection_names():
            db.create_collection("keywords")
        
        if "rankings" not in db.list_collection_names():
            db.create_collection("rankings")
        
        print(f"Connected to MongoDB: {DB_NAME}")
        return db
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

def get_db():
    """Get the database instance"""
    global db
    if db is None:
        db = initialize_db()
    return db
