from fastapi import APIRouter, Depends, HTTPException, status, Request
from bson.objectid import ObjectId
from datetime import datetime
import logging
from user_app import get_db
from utils.auth_simple import get_current_user

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

user_router = APIRouter(tags=["user"])

@user_router.get("/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile information"""
    try:
        logger.info(f"Getting profile for user: {current_user.get('email', 'unknown')}")
        
        # Return user info without sensitive data
        user_data = {
            "id": str(current_user["_id"]),
            "name": current_user.get("name", ""),
            "email": current_user.get("email", ""),
            "phone_number": current_user.get("phone_number", ""),
            "notification_preferences": current_user.get("notification_preferences", {
                "whatsapp": True,
                "milestones": {
                    "subscribers": True,
                    "likes": True,
                    "views": True,
                    "shares": True
                }
            }),
            "youtube_connected": current_user.get("youtube_connected", False)
        }
        
        return user_data
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}"
        )

@user_router.post("/profile")
async def update_user_profile(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile information"""
    try:
        body = await request.json()
        logger.info(f"Updating profile for user: {current_user.get('email', 'unknown')}, data: {body}")
        
        # Fields that can be updated
        allowed_fields = ["name", "phone_number", "email", "social_links", "current_password", "new_password"]
        
        # Create update document
        update_data = {}
        for field in allowed_fields:
            if field in body:
                update_data[field] = body[field]
        
        # Add updated_at timestamp
        update_data["updated_at"] = datetime.now()
        
        # Update user in database
        db = get_db()
        result = db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            logger.info("No changes made to profile")
            return {"success": False, "message": "No changes made"}
        
        logger.info("Profile updated successfully")
        return {"success": True, "message": "Profile updated successfully"}
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@user_router.put("/profile")
async def update_user_profile_put(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile information (PUT method)"""
    try:
        body = await request.json()
        logger.info(f"Updating profile for user: {current_user.get('email', 'unknown')}, data: {body}")
        
        # Fields that can be updated
        allowed_fields = ["name", "phone_number", "email", "social_links", "current_password", "new_password"]
        
        # Create update document
        update_data = {}
        for field in allowed_fields:
            if field in body:
                update_data[field] = body[field]
        
        # Add updated_at timestamp
        update_data["updated_at"] = datetime.now()
        
        # Update user in database
        db = get_db()
        result = db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            logger.info("No changes made to profile")
            return {"success": False, "message": "No changes made"}
        
        logger.info("Profile updated successfully")
        return {"success": True, "message": "Profile updated successfully"}
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@user_router.post("/notification-preferences")
async def update_notification_preferences(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Update user notification preferences"""
    try:
        body = await request.json()
        logger.info(f"Updating notification preferences for user: {current_user.get('email', 'unknown')}, data: {body}")
        
        # Extract preferences from request body
        whatsapp_enabled = body.get("whatsapp_enabled", True)
        milestone_preferences = body.get("milestone_preferences", {
            "subscribers": True,
            "likes": True,
            "views": True,
            "shares": True
        })
        
        # Create notification preferences object
        notification_preferences = {
            "whatsapp": whatsapp_enabled,
            "milestones": milestone_preferences
        }
        
        # Update user in database
        db = get_db()
        result = db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "notification_preferences": notification_preferences,
                "updated_at": datetime.now()
            }}
        )
        
        if result.modified_count == 0:
            logger.info("No changes made to notification preferences")
            return {"success": False, "message": "No changes made"}
        
        logger.info("Notification preferences updated successfully")
        return {"success": True, "message": "Notification preferences updated successfully"}
    except Exception as e:
        logger.error(f"Error updating notification preferences: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update notification preferences: {str(e)}"
        )

@user_router.put("/notification-preferences")
async def update_notification_preferences_put(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Update user notification preferences (PUT method)"""
    try:
        body = await request.json()
        logger.info(f"Updating notification preferences for user: {current_user.get('email', 'unknown')}, data: {body}")
        
        # Extract preferences from request body
        whatsapp_enabled = body.get("whatsapp_enabled", True)
        milestone_preferences = body.get("milestone_preferences", {
            "subscribers": True,
            "likes": True,
            "views": True,
            "shares": True
        })
        
        # Create notification preferences object
        notification_preferences = {
            "whatsapp": whatsapp_enabled,
            "milestones": milestone_preferences
        }
        
        # Update user in database
        db = get_db()
        result = db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "notification_preferences": notification_preferences,
                "updated_at": datetime.now()
            }}
        )
        
        if result.modified_count == 0:
            logger.info("No changes made to notification preferences")
            return {"success": False, "message": "No changes made"}
        
        logger.info("Notification preferences updated successfully")
        return {"success": True, "message": "Notification preferences updated successfully"}
    except Exception as e:
        logger.error(f"Error updating notification preferences: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update notification preferences: {str(e)}"
        )

@user_router.get("/notifications")
async def get_user_notifications(
    current_user: dict = Depends(get_current_user),
    limit: int = 10,
    skip: int = 0
):
    """Get user notifications history"""
    try:
        logger.info(f"Getting notifications for user: {current_user.get('email', 'unknown')}")
        
        db = get_db()
        
        # Get notifications for this user
        notifications_cursor = db.notifications.find(
            {"user_id": current_user["_id"]}
        ).sort("sent_at", -1).skip(skip).limit(limit)
        
        notifications = []
        for notification in notifications_cursor:
            # Get video info
            video = db.videos.find_one({"_id": notification["video_id"]})
            
            notifications.append({
                "id": str(notification["_id"]),
                "video_id": str(notification["video_id"]),
                "video_title": video["title"] if video else "Unknown Video",
                "metric_type": notification["metric_type"],
                "milestone": notification["milestone"],
                "sent_at": notification["sent_at"].isoformat()
            })
        
        # Get total count
        total_count = db.notifications.count_documents({"user_id": current_user["_id"]})
        
        logger.info(f"Notifications retrieved successfully for user: {current_user.get('email', 'unknown')}")
        return {
            "notifications": notifications,
            "total": total_count
        }
    except Exception as e:
        logger.error(f"Error getting notifications: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get notifications: {str(e)}"
        )
