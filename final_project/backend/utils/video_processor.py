import os
try:
    import speech_recognition as sr
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    print("SpeechRecognition package not installed. Text extraction will use mock data.")
    SPEECH_RECOGNITION_AVAILABLE = False

try:
    from moviepy.editor import VideoFileClip
    MOVIEPY_AVAILABLE = True
except ImportError:
    print("MoviePy package not installed. Video processing will use mock data.")
    MOVIEPY_AVAILABLE = False

from utils.keyword_extractor import extract_keywords
try:
    from googleapiclient.discovery import build
    GOOGLE_API_AVAILABLE = True
except ImportError:
    print("Google API client not installed. Keyword rankings will use mock data.")
    GOOGLE_API_AVAILABLE = False

from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

def extract_audio_from_video(video_path, output_path):
    """
    Extract audio from video file, optimized for longer videos up to 15 minutes
    
    Args:
        video_path (str): Path to video file
        output_path (str): Path to save audio file
        
    Returns:
        str: Path to audio file
    """
    try:
        if not MOVIEPY_AVAILABLE:
            print("MoviePy package not installed. Using mock data for audio extraction.")
            return output_path
        
        # Load video and extract audio with optimized settings
        video = VideoFileClip(video_path)
        
        # Check video duration
        duration = video.duration
        print(f"Video duration: {duration} seconds")
        
        if duration > 900:  # 15 minutes
            print("Video is longer than 15 minutes, will process first 15 minutes")
            video = video.subclip(0, 900)
        
        # Extract audio with optimized settings
        audio = video.audio
        audio.write_audiofile(
            output_path,
            buffersize=2048,
            fps=16000,  # Lower sample rate for speech
            nbytes=2,   # 16-bit audio
            codec='pcm_s16le',  # Use PCM codec for better compatibility
            ffmpeg_params=["-ac", "1"],  # Convert to mono
            verbose=False,
            logger=None
        )
        
        # Close video to free up memory
        video.close()
        return output_path
    except Exception as e:
        print(f"Error extracting audio from video: {e}")
        return None

def transcribe_audio(audio_path):
    """
    Transcribe audio file to text, optimized for longer videos up to 15 minutes
    
    Args:
        audio_path (str): Path to audio file
        
    Returns:
        str: Transcribed text
    """
    try:
        if not SPEECH_RECOGNITION_AVAILABLE:
            print("SpeechRecognition package not installed. Using mock data for transcription.")
            return "Mock transcription text"
        
        recognizer = sr.Recognizer()
        
        # Optimize recognition settings for longer audio
        recognizer.operation_timeout = 600  # 10 minutes timeout
        recognizer.phrase_threshold = 0.3   # Lower threshold for better phrase detection
        recognizer.dynamic_energy_threshold = True
        recognizer.energy_threshold = 300  # Adjust based on your audio quality
        
        # Process audio in chunks
        full_text = []
        
        with sr.AudioFile(audio_path) as source:
            # Get audio duration
            duration = source.DURATION
            chunk_size = 30  # Process 30 seconds at a time
            
            for i in range(0, int(duration), chunk_size):
                # Process audio in 30-second chunks
                end = min(i + chunk_size, duration)
                audio = recognizer.record(source, offset=i, duration=chunk_size)
                
                try:
                    # Try using Google's speech recognition
                    chunk_text = recognizer.recognize_google(audio)
                    full_text.append(chunk_text)
                    print(f"Processed chunk {i//chunk_size + 1}/{(int(duration)//chunk_size) + 1}")
                except sr.UnknownValueError:
                    print(f"Could not understand audio in chunk {i//chunk_size + 1}")
                    continue
                except sr.RequestError as e:
                    print(f"Error with speech recognition service in chunk {i//chunk_size + 1}: {e}")
                    continue
        
        return " ".join(full_text)
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return None

def extract_text_from_video(video_path):
    """
    Extract text from video file
    
    Args:
        video_path (str): Path to video file
        
    Returns:
        str: Extracted text
    """
    try:
        # Create temp directory if it doesn't exist
        temp_dir = os.path.join(os.path.dirname(video_path), "temp")
        os.makedirs(temp_dir, exist_ok=True)
        
        # Generate temp audio file path
        audio_path = os.path.join(temp_dir, "temp_audio.wav")
        
        # Extract audio from video
        audio_path = extract_audio_from_video(video_path, audio_path)
        if not audio_path:
            return None
            
        # Transcribe audio to text
        text = transcribe_audio(audio_path)
        
        # Clean up temp files
        try:
            os.remove(audio_path)
        except:
            pass
            
        return text
    except Exception as e:
        print(f"Error extracting text from video: {e}")
        return None

def generate_keywords(text, num_keywords=10):
    """
    Generate keywords from extracted text using a simple keyword extraction algorithm.
    
    Args:
        text (str): The extracted text from the video
        num_keywords (int): Number of keywords to generate
        
    Returns:
        list: List of keywords
    """
    try:
        # Check if text contains an error message
        if text.startswith("Error"):
            print(f"Cannot generate keywords from error text: {text}")
            return ["video", "content", "marketing", "strategy", "audience"][:num_keywords]
            
        # Use our custom keyword extractor
        print(f"Generating keywords from text: {text[:100]}...")
        
        # For mock or placeholder text, extract meaningful keywords from it
        if "placeholder" in text.lower() or "mock" in text.lower():
            print("Detected placeholder or mock text, extracting meaningful keywords")
            # Extract what we can from the placeholder text and add some relevant SEO terms
            keywords = extract_keywords(text, top_n=num_keywords)
            return keywords
            
        # Normal keyword extraction for regular text
        keywords = extract_keywords(text, top_n=num_keywords)
        
        # Ensure we have valid keywords
        if not keywords or len(keywords) == 0 or "error" in keywords[0]:
            print("Warning: Failed to extract meaningful keywords, using relevant SEO keywords")
            # Generate relevant SEO keywords
            default_keywords = ["content", "video", "marketing", "strategy", "audience", 
                              "engagement", "optimization", "analytics", "performance", "reach"]
            return default_keywords[:num_keywords]
            
        print(f"Successfully generated keywords: {keywords}")
        return keywords
    except Exception as e:
        print(f"Error generating keywords: {str(e)}")
        return ["content", "video", "marketing", "strategy", "audience"][:num_keywords]

def get_keyword_rankings(keywords):
    """
    Get rankings for keywords using YouTube API
    
    Args:
        keywords (list): List of keywords
        
    Returns:
        list: List of dictionaries with keyword rankings
    """
    try:
        youtube_api_key = os.getenv("YOUTUBE_API_KEY")
        if not youtube_api_key:
            print("YouTube API key not found in environment variables")
            # Return mock data instead of empty list
            return [
                {
                    "keyword": keyword,
                    "rank": 5,  # Medium rank
                    "search_volume": 1000,
                    "competition": 0.5
                } for keyword in keywords
            ]
        
        if not GOOGLE_API_AVAILABLE:
            print("Google API client not installed. Using mock data for keyword rankings.")
            return [
                {
                    "keyword": keyword,
                    "rank": 5,  # Medium rank
                    "search_volume": 1000,
                    "competition": 0.5
                } for keyword in keywords
            ]
        
        youtube = build("youtube", "v3", developerKey=youtube_api_key)
        
        rankings = []
        for keyword in keywords:
            try:
                print(f"Getting ranking for keyword: {keyword}")
                # Search for videos with the keyword
                search_response = youtube.search().list(
                    q=keyword,
                    part="id,snippet",
                    maxResults=10
                ).execute()
                
                # Calculate a simple ranking score (1-10, where 1 is best)
                # This is a simplified version - in a real app, you'd use more metrics
                items = search_response.get("items", [])
                rank = 10 - (len(items) / 2) if items else 10
                
                # Mock data for search volume and competition
                search_volume = len(items) * 100 if items else 100
                competition = len(items) / 20 if items else 0.5
                
                rankings.append({
                    "keyword": keyword,
                    "rank": rank,
                    "search_volume": search_volume,
                    "competition": competition
                })
                print(f"Ranking for '{keyword}': {rank}")
            except Exception as e:
                print(f"Error getting ranking for keyword '{keyword}': {e}")
                rankings.append({
                    "keyword": keyword,
                    "rank": 10,
                    "search_volume": 100,
                    "competition": 0.5
                })
        
        return rankings
    except Exception as e:
        print(f"Error getting keyword rankings: {e}")
        # Return mock data instead of empty list
        return [
            {
                "keyword": keyword,
                "rank": 5,  # Medium rank
                "search_volume": 1000,
                "competition": 0.5
            } for keyword in keywords
        ]
