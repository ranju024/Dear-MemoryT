from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class EventTypeEnum(str, Enum):
    WEDDING = "Wedding"
    GRADUATION = "Graduation"
    CONCERT = "Concert"
    CORPORATE = "Corporate"
    BIRTHDAY = "Birthday"
    SPORTS = "Sports"

class EventStatusEnum(str, Enum):
    DRAFT = "Draft"
    SCHEDULED = "Scheduled"
    LIVE = "Live"
    ARCHIVED = "Archived"

# Event schemas
class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    subtitle: Optional[str] = None
    description: Optional[str] = None
    type: EventTypeEnum
    date: datetime
    template: str = "Modern Elegance"
    status: EventStatusEnum = EventStatusEnum.DRAFT

class EventCreate(EventBase):
    slug: str = Field(..., min_length=1, max_length=200)

class EventUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    type: Optional[EventTypeEnum] = None
    date: Optional[datetime] = None
    template: Optional[str] = None
    status: Optional[EventStatusEnum] = None
    cover_image: Optional[str] = None
    design_config: Optional[str] = None

class EventResponse(EventBase):
    id: int
    slug: str
    cover_image: Optional[str]
    views: int
    visitors: int
    owner_id: int
    photo_count: int
    design_config: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EventDetailResponse(EventResponse):
    photos: List['PhotoResponse'] = []
    albums: List['AlbumResponse'] = []

from .photo import PhotoResponse
from .album import AlbumResponse

EventDetailResponse.model_rebuild()