from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class VideoModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    user_id: str = Field(...)
    title: str = Field(...)
    filename: str = Field(...)
    file_path: str = Field(...)
    duration: Optional[float] = None
    file_size: Optional[int] = None
    processed: bool = False
    extracted_text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "user_id": "60d5ec9af3c8e28b5c786a12",
                "title": "My Video",
                "filename": "video.mp4",
                "file_path": "/uploads/video.mp4",
                "duration": 120.5,
                "file_size": 1024000,
                "processed": False,
                "extracted_text": None
            }
        }

class KeywordModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    video_id: str = Field(...)
    user_id: str = Field(...)
    keywords: List[str] = Field(...)
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "video_id": "60d5ec9af3c8e28b5c786a12",
                "user_id": "60d5ec9af3c8e28b5c786a12",
                "keywords": ["keyword1", "keyword2", "keyword3"]
            }
        }

class RankingModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    keyword_id: str = Field(...)
    video_id: str = Field(...)
    user_id: str = Field(...)
    keyword: str = Field(...)
    rank: int = Field(...)
    search_volume: Optional[int] = None
    competition: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "keyword_id": "60d5ec9af3c8e28b5c786a12",
                "video_id": "60d5ec9af3c8e28b5c786a12",
                "user_id": "60d5ec9af3c8e28b5c786a12",
                "keyword": "keyword1",
                "rank": 10,
                "search_volume": 1000,
                "competition": 0.5
            }
        }

class VideoUploadResponse(BaseModel):
    id: str
    title: str
    filename: str
    message: str = "Video uploaded successfully"
    
    class Config:
        schema_extra = {
            "example": {
                "id": "60d5ec9af3c8e28b5c786a12",
                "title": "My Video",
                "filename": "video.mp4",
                "message": "Video uploaded successfully"
            }
        }
