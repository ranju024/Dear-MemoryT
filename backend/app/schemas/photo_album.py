from pydantic import BaseModel, Field, computed_field
from datetime import datetime
from typing import Optional, List

# Photo schemas
class PhotoBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class PhotoCreate(PhotoBase):
    pass

class PhotoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None

class PhotoResponse(PhotoBase):
    id: int
    event_id: int
    filename: str
    url: str
    thumbnail_url: Optional[str]
    width: Optional[int]
    height: Optional[int]
    favorites: int
    downloads: int
    created_at: datetime
    taken_at: Optional[datetime]

    class Config:
        from_attributes = True

# Album schemas
class AlbumBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    slug: Optional[str] = None
    description: Optional[str] = None

class AlbumCreate(AlbumBase):
    pass

class AlbumUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    order: Optional[int] = None

class AlbumResponse(AlbumBase):
    id: int
    event_id: int
    is_public: bool
    order: int
    created_at: datetime
    updated_at: datetime
    # photo_count: Optional[int] = 0

    class Config:
        from_attributes = True

class AlbumDetailResponse(AlbumResponse):
    photos: List[PhotoResponse] = []
    
    @computed_field
    @property
    def photo_count(self) -> int:
        """Calculate from photos list"""
        return len(self.photos)