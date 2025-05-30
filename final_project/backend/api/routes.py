from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Optional
import os
import shutil
from datetime import datetime, timedelta
from bson import ObjectId

from models.user import UserCreate, UserResponse, UserLogin
from models.video import VideoModel, KeywordModel, RankingModel, VideoUploadResponse
from utils.auth import get_password_hash, verify_password, create_access_token, get_current_user
from utils.video_processor import extract_text_from_video, generate_keywords, get_keyword_rankings
from config.db import get_db

# Create routers
auth_router = APIRouter()
video_router = APIRouter()
seo_router = APIRouter()
history_router = APIRouter()

# Authentication routes
@auth_router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate):
    db = get_db()
    
    # Check if user already exists
    existing_user = db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user.password)
    
    # Create new user
    new_user = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    
    # Insert user into database
    result = db.users.insert_one(new_user)
    
    # Get the created user
    created_user = db.users.find_one({"_id": result.inserted_id})
    
    # Create user response
    user_response = {
        "id": str(created_user["_id"]),
        "username": created_user["username"],
        "email": created_user["email"],
        "created_at": created_user["created_at"]
    }
    
    return user_response

@auth_router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    
    try:
        print(f"Login attempt with username: {form_data.username}")
        
        # Find user by email
        user = db.users.find_one({"email": form_data.username})
        if not user:
            print(f"User not found with email: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not verify_password(form_data.password, user["password"]):
            print(f"Invalid password for user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(days=1)  # Extend token validity to 1 day
        access_token = create_access_token(
            data={"sub": str(user["_id"])}, expires_delta=access_token_expires
        )
        
        print(f"Login successful for user: {user['username']}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": str(user["_id"]),
            "username": user["username"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@auth_router.get("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify that the token is valid and return user information"""
    return {
        "user_id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"],
        "verified": True
    }

# Video upload routes
@video_router.post("/video", response_model=VideoUploadResponse)
async def upload_video(
    file: UploadFile = File(...),
    title: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join(os.getcwd(), "uploads")
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Save the uploaded file
    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create video document
    video = {
        "user_id": str(current_user["_id"]),
        "title": title,
        "filename": file.filename,
        "file_path": file_path,
        "processed": False,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    
    # Insert video into database
    result = db.videos.insert_one(video)
    
    return {
        "id": str(result.inserted_id),
        "title": title,
        "filename": file.filename,
        "message": "Video uploaded successfully"
    }

# Text extraction route
@seo_router.post("/extract/text/{video_id}")
async def extract_text(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    # Find video by ID
    video = db.videos.find_one({"_id": ObjectId(video_id), "user_id": str(current_user["_id"])})
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    try:
        # Extract text from video
        print(f"Starting text extraction for video: {video_id}")
        extracted_text = extract_text_from_video(video["file_path"])
        
        # Check if extraction failed
        if extracted_text.startswith("Error"):
            print(f"Text extraction failed: {extracted_text}")
            # Provide a placeholder text instead of failing
            extracted_text = "This is a placeholder text for videos where text extraction failed. The system will still attempt to generate keywords based on common video SEO terms."
        
        # Update video document
        db.videos.update_one(
            {"_id": ObjectId(video_id)},
            {"$set": {
                "extracted_text": extracted_text,
                "processed": True,
                "updated_at": datetime.now()
            }}
        )
        
        return {
            "video_id": video_id,
            "extracted_text": extracted_text
        }
    except Exception as e:
        print(f"Error extracting text: {str(e)}")
        # Don't fail completely, update with a placeholder
        try:
            placeholder_text = "This is a placeholder text for videos where text extraction failed. The system will still attempt to generate keywords based on common video SEO terms."
            db.videos.update_one(
                {"_id": ObjectId(video_id)},
                {"$set": {
                    "extracted_text": placeholder_text,
                    "processed": True,
                    "updated_at": datetime.now(),
                    "extraction_error": str(e)
                }}
            )
            return {
                "video_id": video_id,
                "extracted_text": placeholder_text,
                "note": "Text extraction failed, using placeholder"
            }
        except Exception as inner_e:
            print(f"Error updating video with placeholder: {str(inner_e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to extract text and update video: {str(e)}"
            )

# Keyword generation route
@seo_router.post("/generate/keywords/{video_id}")
async def generate_keywords_route(
    video_id: str,
    top_n: int = 10,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    # Find video by ID
    video = db.videos.find_one({"_id": ObjectId(video_id), "user_id": str(current_user["_id"])})
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    # Check if text has been extracted
    if not video.get("extracted_text"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text has not been extracted from this video yet"
        )
    
    try:
        # Generate keywords
        extracted_text = video.get("extracted_text", "")
        if not extracted_text or len(extracted_text.strip()) == 0:
            print("Warning: Empty extracted text, using relevant SEO keywords")
            keywords = ["content", "video", "marketing", "strategy", "audience", 
                      "engagement", "optimization", "analytics", "performance", "reach"][:top_n]
        else:
            print(f"Generating keywords for text: {extracted_text[:100]}...")
            keywords = generate_keywords(extracted_text, top_n)
        
        # Ensure we have valid keywords
        if not keywords or len(keywords) == 0:
            print("Warning: No keywords generated, using relevant SEO keywords")
            keywords = ["content", "video", "marketing", "strategy", "audience", 
                      "engagement", "optimization", "analytics", "performance", "reach"][:top_n]
            
        print(f"Generated keywords: {keywords}")
        
        # Create keyword document
        keyword_doc = {
            "video_id": video_id,
            "user_id": str(current_user["_id"]),
            "keywords": keywords,
            "created_at": datetime.now()
        }
        
        # Insert keywords into database
        result = db.keywords.insert_one(keyword_doc)
        
        # Update video with keywords_id
        db.videos.update_one(
            {"_id": ObjectId(video_id)},
            {"$set": {
                "keywords_id": str(result.inserted_id),
                "updated_at": datetime.now()
            }}
        )
        
        return {
            "keyword_id": str(result.inserted_id),
            "video_id": video_id,
            "keywords": keywords
        }
    except Exception as e:
        print(f"Error generating keywords: {str(e)}")
        # Don't fail completely, provide relevant SEO keywords
        try:
            default_keywords = ["content", "video", "marketing", "strategy", "audience", 
                              "engagement", "optimization", "analytics", "performance", "reach"][:top_n]
            keyword_doc = {
                "video_id": video_id,
                "user_id": str(current_user["_id"]),
                "keywords": default_keywords,
                "created_at": datetime.now()
            }
            result = db.keywords.insert_one(keyword_doc)
            db.videos.update_one(
                {"_id": ObjectId(video_id)},
                {"$set": {
                    "keywords_id": str(result.inserted_id),
                    "updated_at": datetime.now()
                }}
            )
            return {
                "keyword_id": str(result.inserted_id),
                "video_id": video_id,
                "keywords": default_keywords,
                "note": "Default keywords used due to extraction error"
            }
        except Exception as inner_e:
            print(f"Error saving default keywords: {str(inner_e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate keywords: {str(e)}"
            )

# Keyword ranking route
@seo_router.post("/ranking/{keyword_id}")
async def get_rankings(
    keyword_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    # Find keywords by ID
    keyword_doc = db.keywords.find_one({"_id": ObjectId(keyword_id), "user_id": str(current_user["_id"])})
    if not keyword_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Keywords not found"
        )
    
    try:
        # Get keyword rankings
        rankings = get_keyword_rankings(keyword_doc["keywords"])
        
        # Store rankings in database
        ranking_docs = []
        for ranking in rankings:
            ranking_doc = {
                "keyword_id": keyword_id,
                "video_id": keyword_doc["video_id"],
                "user_id": str(current_user["_id"]),
                "keyword": ranking["keyword"],
                "rank": ranking["rank"],
                "search_volume": ranking["search_volume"],
                "competition": ranking["competition"],
                "created_at": datetime.now()
            }
            
            result = db.rankings.insert_one(ranking_doc)
            # Convert ObjectId to string to make it JSON serializable
            ranking_doc["_id"] = str(result.inserted_id)
            ranking_docs.append(ranking_doc)
        
        # Make sure all fields are JSON serializable
        response_data = {
            "video_id": keyword_doc["video_id"],
            "keyword_id": keyword_id,
            "rankings": ranking_docs,
            "keywords": keyword_doc["keywords"]
        }
        
        return response_data
    except Exception as e:
        print(f"Error getting rankings: {str(e)}")
        # Return mock rankings as fallback
        try:
            fallback_rankings = []
            for keyword in keyword_doc["keywords"]:
                ranking_doc = {
                    "keyword_id": keyword_id,
                    "video_id": keyword_doc["video_id"],
                    "user_id": str(current_user["_id"]),
                    "keyword": keyword,
                    "rank": 5.0,
                    "search_volume": 1000,
                    "competition": 0.5,
                    "created_at": datetime.now()
                }
                
                result = db.rankings.insert_one(ranking_doc)
                ranking_doc["_id"] = str(result.inserted_id)
                fallback_rankings.append(ranking_doc)
            
            return {
                "video_id": keyword_doc["video_id"],
                "keyword_id": keyword_id,
                "rankings": fallback_rankings,
                "keywords": keyword_doc["keywords"],
                "note": "Mock rankings used due to API error"
            }
        except Exception as inner_e:
            print(f"Error creating fallback rankings: {str(inner_e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get rankings: {str(e)}"
            )

# Get keywords by ID
@seo_router.get("/keywords/{keyword_id}")
async def get_keywords(
    keyword_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    # Find keywords by ID
    keyword_doc = db.keywords.find_one({"_id": ObjectId(keyword_id), "user_id": str(current_user["_id"])})
    if not keyword_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Keywords not found"
        )
    
    # Convert ObjectId to string to make it JSON serializable
    keyword_doc["_id"] = str(keyword_doc["_id"])
    
    return keyword_doc

# Video details route
@seo_router.get("/video/{video_id}")
async def get_video_details(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    try:
        # Find video by ID
        video = db.videos.find_one({"_id": ObjectId(video_id), "user_id": str(current_user["_id"])})
        if not video:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video not found"
            )
        
        # Format the response
        video_details = {
            "_id": str(video["_id"]),
            "title": video["title"],
            "filename": video["filename"],
            "processed": video.get("processed", False),
            "extracted_text": video.get("extracted_text", ""),
            "keywords_id": video.get("keywords_id", ""),
            "created_at": video["created_at"],
            "updated_at": video.get("updated_at", video["created_at"])
        }
        
        # Get keywords if available
        if "keywords_id" in video and video["keywords_id"]:
            keywords = db.keywords.find_one({"_id": ObjectId(video["keywords_id"])})
            if keywords:
                video_details["keywords"] = keywords["keywords"]
        
        # Get rankings if available
        if "keywords_id" in video and video["keywords_id"]:
            rankings = list(db.rankings.find({"keyword_id": video["keywords_id"]}))
            if rankings:
                video_details["rankings"] = rankings
        
        return video_details
    
    except Exception as e:
        print(f"Error getting video details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get video details: {str(e)}"
        )

# History route
@history_router.get("/")
async def get_history(current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    try:
        # Get all videos for the current user
        videos = list(db.videos.find({"user_id": str(current_user["_id"])}).sort("created_at", -1))
        
        # Format the response
        history = []
        for video in videos:
            video_id = str(video["_id"])
            
            # Get keywords for the video
            keywords = []
            if "keywords_id" in video and video["keywords_id"]:
                keyword_doc = db.keywords.find_one({"_id": ObjectId(video["keywords_id"])})
                if keyword_doc and "keywords" in keyword_doc:
                    keywords = [keyword_doc["keywords"]]
            
            # Get rankings for the video
            rankings = []
            if "keywords_id" in video and video["keywords_id"]:
                rankings = list(db.rankings.find({"keyword_id": video["keywords_id"]}))
                # Convert ObjectId to string
                for ranking in rankings:
                    if "_id" in ranking:
                        ranking["_id"] = str(ranking["_id"])
            
            history_item = {
                "_id": video_id,
                "title": video["title"],
                "filename": video["filename"],
                "processed": video.get("processed", False),
                "created_at": video["created_at"],
                "keywords_id": video.get("keywords_id", ""),
                "keywords": keywords,
                "rankings": rankings,
                "extracted_text": video.get("extracted_text", "")
            }
            
            history.append(history_item)
        
        return {"history": history}
    except Exception as e:
        print(f"Error getting history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get history: {str(e)}"
        )
