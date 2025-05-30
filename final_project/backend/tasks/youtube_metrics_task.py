import logging
import time
import threading
import schedule
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.youtube_monitor import YouTubeMonitor
from config.db import get_db

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
monitor = None
stop_thread = False
scheduler_thread = None

def check_all_videos():
    """Check metrics for all videos in the database"""
    global monitor
    
    try:
        logger.info("Starting scheduled check of all videos")
        
        # Get database connection
        db = get_db()
        
        # Initialize monitor if not already done
        if not monitor:
            monitor = YouTubeMonitor(db)
        
        # Get all videos with YouTube IDs
        videos = db.videos.find({"youtube_id": {"$exists": True}})
        
        video_count = 0
        for video in videos:
            # Skip if no YouTube ID or user ID
            if not video.get("youtube_id") or not video.get("user_id"):
                continue
            
            # Check metrics for this video
            monitor.check_video_metrics(video["youtube_id"], video["user_id"])
            video_count += 1
        
        logger.info(f"Completed checking metrics for {video_count} videos")
        
    except Exception as e:
        logger.error(f"Error in scheduled video metrics check: {e}")

def run_scheduler():
    """Run the scheduler in a separate thread"""
    global stop_thread
    
    logger.info("Starting YouTube metrics scheduler")
    
    # Schedule the task to run every hour
    schedule.every(1).hours.do(check_all_videos)
    
    # Run the task immediately on startup
    check_all_videos()
    
    # Keep running the scheduler until stopped
    while not stop_thread:
        schedule.run_pending()
        time.sleep(60)  # Check every minute
    
    logger.info("YouTube metrics scheduler stopped")

def start_scheduler():
    """Start the scheduler in a background thread"""
    global scheduler_thread, stop_thread
    
    # Reset the stop flag
    stop_thread = False
    
    # Create and start the thread
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    
    logger.info("YouTube metrics scheduler thread started")
    return scheduler_thread

def stop_scheduler():
    """Stop the scheduler thread"""
    global scheduler_thread, stop_thread
    
    if scheduler_thread and scheduler_thread.is_alive():
        stop_thread = True
        scheduler_thread.join(timeout=5)
        logger.info("YouTube metrics scheduler thread stopped")
    else:
        logger.warning("No active scheduler thread to stop")

# For testing
if __name__ == "__main__":
    start_scheduler()
    
    # Keep the main thread running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        stop_scheduler()
        print("Scheduler stopped")
