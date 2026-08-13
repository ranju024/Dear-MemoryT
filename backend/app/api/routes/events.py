from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ...database import get_db
from ...models.event import Event, EventStatus
from ...models.photo import Photo
from ...models.user import User
from ...models.event_view import EventView
import uuid
from ...schemas.event import EventCreate, EventUpdate, EventResponse, EventDetailResponse
from .auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def _record_public_view(event: Event, request: Request, response: Response, db: Session) -> None:
    visitor_id = request.cookies.get("dm_visitor")
    is_new_visitor = not visitor_id
    if not visitor_id:
        visitor_id = uuid.uuid4().hex
        response.set_cookie("dm_visitor", visitor_id, max_age=60 * 60 * 24 * 365, httponly=True, samesite="lax")

    event.views = (event.views or 0) + 1
    if is_new_visitor:
        event.visitors = (event.visitors or 0) + 1
    db.add(EventView(event_id=event.id, visitor_id=visitor_id))
    db.commit()

@router.post("/", response_model=EventResponse, status_code=201)
async def create_event(
    event: EventCreate,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Create a new event"""
    user = get_current_user(token, db)
    
    # Check if slug is unique
    existing = db.query(Event).filter(Event.slug == event.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Event slug already exists")
    
    new_event = Event(
        **event.dict(),
        owner_id=user.id
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    logger.info(f"Event created: {new_event.slug} by {user.username}")
    return new_event

@router.get("/", response_model=List[EventResponse])
async def list_events(
    token: str | None = None,
    status_filter: str = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """List user's events"""
    user = get_current_user(token, db)
    
    query = db.query(Event).filter(Event.owner_id == user.id)
    
    if status_filter:
        query = query.filter(Event.status == status_filter)
    
    events = query.offset(skip).limit(limit).all()

    # Convert to dicts and add photo count
    result = []
    for event in events:
        event_dict = {
            "id": event.id,
            "slug": event.slug,
            "title": event.title,
            "subtitle": event.subtitle,
            "description": event.description,
            "type": event.type,
            "date": event.date,
            "cover_image": event.cover_image,
            "views": event.views,
            "visitors": event.visitors,
            "status": event.status,
            "owner_id": event.owner_id,
            "created_at": event.created_at,
            "updated_at": event.updated_at,
            "photo_count": db.query(func.count(Photo.id)).filter(Photo.event_id == event.id).scalar() or 0,
        }
        result.append(event_dict)
    return result

@router.get("/{event_id}", response_model=EventDetailResponse)
async def get_event(event_id: int, request: Request, response: Response, db: Session = Depends(get_db)):
    """Get event details (public)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    _record_public_view(event, request, response, db)
    return event

@router.get("/slug/{slug}", response_model=EventDetailResponse)
async def get_event_by_slug(slug: str, request: Request, response: Response, db: Session = Depends(get_db)):
    """Get event by slug (public)"""
    event = db.query(Event).filter(Event.slug == slug).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    _record_public_view(event, request, response, db)
    return event

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_update: EventUpdate,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Update event"""
    user = get_current_user(token, db)
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update fields
    update_data = event_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    
    logger.info(f"Event updated: {event.slug}")
    return event

@router.delete("/{event_id}", status_code=204)
async def delete_event(
    event_id: int,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Delete event"""
    user = get_current_user(token, db)
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(event)
    db.commit()
    
    logger.info(f"Event deleted: {event.slug}")

@router.post("/{event_id}/publish", response_model=EventResponse)
async def publish_event(
    event_id: int,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Publish event (change status to Live)"""
    user = get_current_user(token, db)
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    event.status = EventStatus.LIVE
    db.commit()
    db.refresh(event)
    
    logger.info(f"Event published: {event.slug}")
    return event