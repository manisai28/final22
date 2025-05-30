import logging
import requests
from datetime import datetime
from twilio.rest import Client
import sys
import os

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from twilio_config import (
    TWILIO_ACCOUNT_SID, 
    TWILIO_AUTH_TOKEN, 
    TWILIO_WHATSAPP_NUMBER,
    SUBSCRIBER_MILESTONE_TEMPLATE,
    LIKES_MILESTONE_TEMPLATE,
    VIEWS_MILESTONE_TEMPLATE,
    SHARES_MILESTONE_TEMPLATE
)
from youtube_config import YOUTUBE_API_KEY, YOUTUBE_API_BASE_URL

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class YouTubeMonitor:
    """
    Service to monitor YouTube video metrics and send notifications
    when engagement milestones are reached.
    """
    
    def __init__(self, db):
        """Initialize the YouTube monitor with database connection"""
        self.db = db
        
        # Initialize Twilio client for WhatsApp notifications
        try:
            self.twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            logger.info("Twilio client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Twilio client: {e}")
            self.twilio_client = None
    
    def check_video_metrics(self, video_id, user_id):
        """
        Check metrics for a specific video and send notifications
        if milestones are reached
        """
        logger.info(f"Checking metrics for video {video_id} for user {user_id}")
        
        try:
            # Get user notification preferences
            user = self.db.users.find_one({"_id": user_id})
            if not user or not user.get("notification_preferences"):
                logger.warning(f"User {user_id} not found or has no notification preferences")
                return
            
            # Get user's phone number for WhatsApp
            phone_number = user.get("phone_number")
            if not phone_number:
                logger.warning(f"User {user_id} has no phone number for WhatsApp notifications")
                return
            
            # Get notification preferences
            prefs = user.get("notification_preferences", {})
            
            # Get video metrics from YouTube API
            metrics = self._get_video_metrics(video_id)
            if not metrics:
                logger.warning(f"Could not get metrics for video {video_id}")
                return
            
            # Get previous metrics from database
            video_record = self.db.videos.find_one({"youtube_id": video_id})
            if not video_record:
                logger.warning(f"Video {video_id} not found in database")
                # Create a new record if it doesn't exist
                self.db.videos.insert_one({
                    "youtube_id": video_id,
                    "user_id": user_id,
                    "title": metrics.get("title", "Unknown"),
                    "metrics": metrics,
                    "last_checked": datetime.utcnow(),
                    "milestones_reached": {}
                })
                return
            
            # Check for milestones and send notifications
            self._check_milestones(video_record, metrics, prefs, phone_number)
            
            # Update metrics in database
            self.db.videos.update_one(
                {"youtube_id": video_id},
                {
                    "$set": {
                        "metrics": metrics,
                        "last_checked": datetime.utcnow()
                    }
                }
            )
            
            logger.info(f"Successfully checked metrics for video {video_id}")
            
        except Exception as e:
            logger.error(f"Error checking video metrics: {e}")
    
    def _get_video_metrics(self, video_id):
        """Get metrics for a video from YouTube API"""
        try:
            # Get video statistics
            url = f"{YOUTUBE_API_BASE_URL}/videos"
            params = {
                "part": "snippet,statistics",
                "id": video_id,
                "key": YOUTUBE_API_KEY
            }
            
            response = requests.get(url, params=params)
            if response.status_code != 200:
                logger.error(f"YouTube API error: {response.status_code} - {response.text}")
                return None
            
            data = response.json()
            if not data.get("items"):
                logger.warning(f"No data found for video {video_id}")
                return None
            
            video_data = data["items"][0]
            snippet = video_data.get("snippet", {})
            statistics = video_data.get("statistics", {})
            
            # Extract relevant metrics
            metrics = {
                "title": snippet.get("title", "Unknown"),
                "views": int(statistics.get("viewCount", 0)),
                "likes": int(statistics.get("likeCount", 0)),
                "subscribers": 0,  # Need channel stats for this
                "shares": 0  # YouTube API doesn't provide share count directly
            }
            
            # Get channel statistics for subscriber count
            channel_id = snippet.get("channelId")
            if channel_id:
                channel_url = f"{YOUTUBE_API_BASE_URL}/channels"
                channel_params = {
                    "part": "statistics",
                    "id": channel_id,
                    "key": YOUTUBE_API_KEY
                }
                
                channel_response = requests.get(channel_url, params=channel_params)
                if channel_response.status_code == 200:
                    channel_data = channel_response.json()
                    if channel_data.get("items"):
                        channel_stats = channel_data["items"][0].get("statistics", {})
                        metrics["subscribers"] = int(channel_stats.get("subscriberCount", 0))
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting video metrics from YouTube API: {e}")
            return None
    
    def _check_milestones(self, video_record, current_metrics, preferences, phone_number):
        """Check if any milestones have been reached and send notifications"""
        previous_metrics = video_record.get("metrics", {})
        milestones_reached = video_record.get("milestones_reached", {})
        video_title = current_metrics.get("title", "your video")
        
        # Get thresholds from preferences
        thresholds = preferences.get("thresholds", {
            "subscribers": 100,
            "likes": 50,
            "views": 1000,
            "shares": 25
        })
        
        # Check each metric for milestones
        metrics_to_check = ["subscribers", "likes", "views", "shares"]
        for metric in metrics_to_check:
            # Skip if notifications for this metric are disabled
            if not preferences.get(metric, True):
                continue
            
            current_value = current_metrics.get(metric, 0)
            previous_value = previous_metrics.get(metric, 0)
            threshold = thresholds.get(metric, 100)
            
            # Calculate the milestone levels (multiples of threshold)
            current_level = current_value // threshold
            previous_level = previous_value // threshold
            
            # If we've reached a new milestone level
            if current_level > previous_level:
                milestone_value = current_level * threshold
                
                # Check if we've already notified for this milestone
                milestone_key = f"{metric}_{milestone_value}"
                if milestone_key not in milestones_reached:
                    # Send notification
                    self._send_milestone_notification(
                        phone_number, 
                        metric, 
                        milestone_value, 
                        video_title,
                        video_record.get("youtube_id")
                    )
                    
                    # Record that we've reached this milestone
                    milestones_reached[milestone_key] = datetime.utcnow().isoformat()
                    
                    # Update the milestones_reached in the database
                    self.db.videos.update_one(
                        {"youtube_id": video_record.get("youtube_id")},
                        {"$set": {"milestones_reached": milestones_reached}}
                    )
                    
                    # Create a notification record
                    self.db.notifications.insert_one({
                        "user_id": video_record.get("user_id"),
                        "video_id": video_record.get("youtube_id"),
                        "type": metric,
                        "milestone": milestone_value,
                        "message": self._get_milestone_message(metric, milestone_value, video_title),
                        "created_at": datetime.utcnow()
                    })
    
    def _send_milestone_notification(self, phone_number, metric_type, count, video_title, video_id):
        """Send a WhatsApp notification for a milestone"""
        if not self.twilio_client:
            logger.error("Twilio client not initialized, cannot send notification")
            return False
        
        try:
            # Format the message based on the metric type
            message = self._get_milestone_message(metric_type, count, video_title)
            
            # Format phone number for WhatsApp
            # WhatsApp numbers need to be in the format 'whatsapp:+1234567890'
            to_whatsapp = f"whatsapp:{phone_number}"
            from_whatsapp = f"whatsapp:{TWILIO_WHATSAPP_NUMBER}"
            
            # Send the message
            twilio_message = self.twilio_client.messages.create(
                body=message,
                from_=from_whatsapp,
                to=to_whatsapp
            )
            
            logger.info(f"WhatsApp notification sent successfully: {twilio_message.sid}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending WhatsApp notification: {e}")
            return False
    
    def _get_milestone_message(self, metric_type, count, video_title):
        """Get the appropriate message template for a milestone"""
        if metric_type == "subscribers":
            return SUBSCRIBER_MILESTONE_TEMPLATE.format(video_title=video_title, count=count)
        elif metric_type == "likes":
            return LIKES_MILESTONE_TEMPLATE.format(video_title=video_title, count=count)
        elif metric_type == "views":
            return VIEWS_MILESTONE_TEMPLATE.format(video_title=video_title, count=count)
        elif metric_type == "shares":
            return SHARES_MILESTONE_TEMPLATE.format(video_title=video_title, count=count)
        else:
            return f"Congratulations! Your video '{video_title}' has reached a new milestone: {count} {metric_type}!"
