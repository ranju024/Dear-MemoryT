from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...database import get_db
from ...models.album import Album
from ...models.event import Event
from ...models.photo import Photo
from ...schemas.photo_album import AlbumCreate, AlbumUpdate, AlbumResponse, AlbumDetailResponse
from .auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/{event_id}", response_model=AlbumResponse, status_code=201)
async def create_album(
    event_id: int,
    album: AlbumCreate,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Create a new album in an event"""
    user = get_current_user(token, db)
    
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_album = Album(
        event_id=event_id,
        **album.dict()
    )
    db.add(new_album)
    db.commit()
    db.refresh(new_album)
    
    logger.info(f"Album created: {new_album.name} in event {event_id}")
    return new_album

@router.get("/{event_id}", response_model=List[AlbumResponse])
async def list_event_albums(
    event_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """List albums in an event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    albums = db.query(Album).filter(
        Album.event_id == event_id
    ).offset(skip).limit(limit).all()
    
    return albums

@router.get("/album/{album_id}", response_model=AlbumDetailResponse)
async def get_album(album_id: int, db: Session = Depends(get_db)):
    """Get album with photos"""
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    return album

@router.put("/album/{album_id}", response_model=AlbumResponse)
async def update_album(
    album_id: int,
    album_update: AlbumUpdate,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Update album"""
    user = get_current_user(token, db)
    album = db.query(Album).filter(Album.id == album_id).first()
    
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    event = db.query(Event).filter(Event.id == album.event_id).first()
    if event.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = album_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(album, field, value)
    
    db.commit()
    db.refresh(album)
    
    return album

@router.delete("/album/{album_id}", status_code=204)
async def delete_album(
    album_id: int,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Delete album"""
    user = get_current_user(token, db)
    album = db.query(Album).filter(Album.id == album_id).first()
    
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    event = db.query(Event).filter(Event.id == album.event_id).first()
    if event.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(album)
    db.commit()

@router.post("/album/{album_id}/photos/{photo_id}", status_code=201)
async def add_photo_to_album(
    album_id: int,
    photo_id: int,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Add photo to album"""
    user = get_current_user(token, db)
    
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    event = db.query(Event).filter(Event.id == album.event_id).first()
    if event.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if photo not in album.photos:
        album.photos.append(photo)
        db.commit()
    
    return {"message": "Photo added to album"}

@router.delete("/album/{album_id}/photos/{photo_id}", status_code=204)
async def remove_photo_from_album(
    album_id: int,
    photo_id: int,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Remove photo from album"""
    user = get_current_user(token, db)
    
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album:
        raise HTTPException(status_code=404, detail="Album not found")
    
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    event = db.query(Event).filter(Event.id == album.event_id).first()
    if event.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if photo in album.photos:
        album.photos.remove(photo)
        db.commit()