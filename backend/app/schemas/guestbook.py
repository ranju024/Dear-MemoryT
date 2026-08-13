from pydantic import BaseModel, Field
from datetime import datetime


class GuestbookEntryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    message: str = Field(..., min_length=1, max_length=1000)


class GuestbookEntryResponse(BaseModel):
    id: int
    event_id: int
    name: str
    message: str
    approved: bool
    created_at: datetime

    class Config:
        from_attributes = True