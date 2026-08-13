from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from datetime import datetime
from ...database import get_db
from ...models.photo import Photo
from ...models.event import Event
from ...models.user import User
from ...schemas.photo import PhotoCreate, PhotoUpdate, PhotoResponse
from .auth import get_current_user
from ...config import UPLOAD_DIR, ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{event_id}/upload", response_model=PhotoResponse, status_code=201)
async def upload_photo(
    event_id: int,
    file: UploadFile = File(...),
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Upload a photo to an event"""
    user = get_current_user(token, db)
    
    # Verify event exists and user owns it
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )
    
    # Read file and check size
    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size: {MAX_UPLOAD_SIZE / 1024 / 1024}MB"
        )
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        logger.error(f"File upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail="File upload failed")
    
    # Create photo record
    new_photo = Photo(
        event_id=event_id,
        filename=file.filename,
        url=f"/uploads/{unique_filename}",
        thumbnail_url=f"/uploads/{unique_filename}",
        mime_type=file.content_type,
        file_size=len(contents),
        taken_at=datetime.utcnow()
    )
    
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)
    
    logger.info(f"Photo uploaded: {new_photo.filename} to event {event_id}")
    return new_photo

@router.get("/{event_id}", response_model=List[PhotoResponse])
async def get_event_photos(
    event_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all photos for an event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    photos = db.query(Photo).filter(
        Photo.event_id == event_id
    ).offset(skip).limit(limit).all()
    
    return photos

@router.get("/photo/{photo_id}", response_model=PhotoResponse)
async def get_photo(photo_id: int, db: Session = Depends(get_db)):
    """Get photo details"""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    return photo

@router.put("/photo/{photo_id}", response_model=PhotoResponse)
async def update_photo(
    photo_id: int,
    photo_update: PhotoUpdate,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Update photo metadata"""
    user = get_current_user(token, db)
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Verify authorization
    event = db.query(Event).filter(Event.id == photo.event_id).first()
    if event.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update fields
    update_data = photo_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(photo, field, value)
    
    db.commit()
    db.refresh(photo)
    
    return photo

@router.delete("/photo/{photo_id}", status_code=204)
async def delete_photo(
    photo_id: int,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Delete photo"""
    user = get_current_user(token, db)
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Verify authorization
    event = db.query(Event).filter(Event.id == photo.event_id).first()
    if event.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Delete file
    try:
        os.remove(os.path.join(UPLOAD_DIR, photo.url.rsplit("/", 1)[-1]))
    except:
        pass
    
    db.delete(photo)
    db.commit()

@router.post("/photo/{photo_id}/favorite", response_model=PhotoResponse)
async def favorite_photo(photo_id: int, db: Session = Depends(get_db)):
    """Add to favorites (increment counter)"""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    photo.favorites += 1
    db.commit()
    db.refresh(photo)
    
    return photo

@router.post("/photo/{photo_id}/unfavorite")
async def unfavorite_photo(
    photo_id: int,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Remove photo from favorites"""
    user = get_current_user(token, db)
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    # Decrease favorites count (min 0)
    photo.favorites = max(0, photo.favorites - 1)
    
    db.commit()
    db.refresh(photo)
    
    return photo

@router.post("/photo/{photo_id}/download", response_model=PhotoResponse)
async def download_photo(photo_id: int, db: Session = Depends(get_db)):
    """Track download"""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    photo.downloads += 1
    db.commit()
    db.refresh(photo)
    
    return photo