"""
YouTube API configuration settings.
This file contains the credentials and settings for the YouTube API integration.
"""

from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# YouTube API credentials
YOUTUBE_CLIENT_ID = os.getenv('YOUTUBE_CLIENT_ID')
YOUTUBE_CLIENT_SECRET = os.getenv('YOUTUBE_CLIENT_SECRET')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# OAuth2 settings
YOUTUBE_REDIRECT_URI = "http://localhost:8000/youtube/callback"
YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly"
]

# API endpoints
YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3"
YOUTUBE_OAUTH_URL = "https://accounts.google.com/o/oauth2/auth"
YOUTUBE_TOKEN_URL = "https://oauth2.googleapis.com/token"

# Default upload settings
DEFAULT_PRIVACY_STATUS = "private"  # Options: "public", "private", "unlisted"
DEFAULT_CATEGORY_ID = "22"  # Category ID for "People & Blogs"
MAX_TAGS_COUNT = 30  # Maximum number of tags allowed by YouTube