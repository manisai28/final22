# Video SEO Analysis Backend

This is the backend for the Video SEO Analysis system. It provides APIs for user authentication, video upload, text extraction, keyword generation, and SEO ranking.

## Features

- User authentication with JWT
- Video upload and processing
- Text extraction from videos
- Keyword generation using KeyBERT
- SEO ranking using YouTube API
- History tracking

## Prerequisites

- Python 3.8+
- MongoDB
- YouTube API Key

## Installation

1. Clone the repository
2. Install the dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file based on the `.env.example` file:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

```
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/
DB_NAME=video_seo_db

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hour

# YouTube API Configuration
YOUTUBE_API_KEY=your_youtube_api_key

# Application Configuration
DEBUG=True
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=50000000  # 50MB
```

## Running the Application

```bash
python app.py
```

The API will be available at `http://localhost:8000`.

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Video Upload

- `POST /upload/video` - Upload a video file

### SEO Analysis

- `POST /seo/extract/text/{video_id}` - Extract text from a video
- `POST /seo/generate/keywords/{video_id}` - Generate keywords from extracted text
- `POST /seo/ranking/{keyword_id}` - Get SEO rankings for keywords

### History

- `GET /history` - Get user's video processing history
