from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection settings
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "video_seo_db")

# Global variables
client = None
db = None

def initialize_db():
    """Initialize the database connection"""
    global client, db
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        logger.info(f"Connected to MongoDB: {MONGO_URI}, Database: {DB_NAME}")
        return db
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

def get_db():
    """Get the database instance"""
    global db
    if db is None:
        db = initialize_db()
    return db

# Import user routes
from api.user_routes_simple import user_router, set_db

# Initialize FastAPI app
app = FastAPI(
    title="Video SEO Analysis API - User Service",
    description="API for user management and WhatsApp notifications",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,  # 10 minutes
)

# Include user router
app.include_router(user_router, prefix="/user", tags=["User Management"])

# Initialize database connection
db = initialize_db()
set_db(db)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Video SEO Analysis API - User Service",
        "version": "1.0.0",
        "status": "running"
    }

if __name__ == "__main__":
    # Run FastAPI with uvicorn
    uvicorn.run("user_app:app", host="0.0.0.0", port=8000, reload=True)
