from flask import Flask, jsonify
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import the routes with error handling
try:
    from api.routes import auth_router, video_router, seo_router, history_router
    from api.youtube_routes import youtube_router
    from config.db import initialize_db
    routes_imported = True
except ImportError as e:
    logger.error(f"Error importing main routes: {e}")
    routes_imported = False

# Try to import the user_router and start_scheduler
# If there are import errors, we'll handle them gracefully
try:
    from api.user_routes import user_router
    from tasks.youtube_metrics_task import start_scheduler
    has_user_routes = True
except ImportError as e:
    logger.warning(f"Could not import user routes or scheduler: {e}")
    has_user_routes = False

# Initialize Flask app
app = Flask(__name__)

# Initialize FastAPI app
fastapi_app = FastAPI(
    title="Video SEO Analysis API",
    description="API for analyzing video content and generating SEO keywords",
    version="1.0.0"
)

# Configure CORS
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,  # 10 minutes
)

if routes_imported:
    # Include routers
    fastapi_app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
    fastapi_app.include_router(video_router, prefix="/upload", tags=["Video Upload"])
    fastapi_app.include_router(seo_router, prefix="", tags=["SEO Analysis"])
    fastapi_app.include_router(history_router, prefix="/history", tags=["History"])
    fastapi_app.include_router(youtube_router, prefix="/youtube", tags=["YouTube Integration"])

    # Include user router if available
    if has_user_routes:
        fastapi_app.include_router(user_router, prefix="/user", tags=["User Management"])
        # Start the YouTube metrics scheduler
        try:
            start_scheduler()
            logger.info("YouTube metrics scheduler started")
        except Exception as e:
            logger.error(f"Failed to start YouTube metrics scheduler: {e}")

    # Initialize database connection
    try:
        initialize_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
else:
    logger.error("Main routes could not be imported. API will not function correctly.")

@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to Video SEO Analysis API",
        "version": "1.0.0",
        "status": "running"
    })

if __name__ == "__main__":
    # Run FastAPI with uvicorn
    uvicorn.run("app:fastapi_app", host="0.0.0.0", port=8000, reload=True)
