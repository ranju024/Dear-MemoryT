from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from enum import Enum

class LeadStatusEnum(str, Enum):
    NEW = "New"
    CONTACTED = "Contacted"
    QUOTED = "Quoted"
    BOOKED = "Booked"
    LOST = "Lost"

# Lead schemas
class LeadBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[datetime] = None
    source: Optional[str] = None
    budget: Optional[str] = None
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[datetime] = None
    source: Optional[str] = None
    status: Optional[LeadStatusEnum] = None
    budget: Optional[str] = None
    notes: Optional[str] = None

class LeadResponse(LeadBase):
    id: int
    status: LeadStatusEnum
    created_at: datetime
    updated_at: datetime
    contacted_at: Optional[datetime]
    quoted_at: Optional[datetime]
    booked_at: Optional[datetime]

    class Config:
        from_attributes = True

# Studio schemas
class StudioBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    tagline: Optional[str] = None
    about: Optional[str] = None

class StudioCreate(StudioBase):
    slug: Optional[str] = Field(None, min_length=1, max_length=200)

class StudioUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    about: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    founded_year: Optional[int] = None
    base_price: Optional[str] = None
    # Brand Kit — added
    primary_color: Optional[str] = None
    background_color: Optional[str] = None
    accent_color: Optional[str] = None
    text_color: Optional[str] = None
    heading_font: Optional[str] = None
    body_font: Optional[str] = None
    watermark_text: Optional[str] = None

class StudioResponse(StudioBase):
    id: int
    slug: str
    logo: Optional[str]
    city: Optional[str]
    country: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    website: Optional[str]
    instagram: Optional[str]
    founded_year: Optional[int]
    total_events: int
    total_photos: int
    rating: str
    base_price: Optional[str]
    # Brand Kit — added
    primary_color: str
    background_color: str
    accent_color: str
    text_color: str
    heading_font: str
    body_font: str
    watermark_text: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True