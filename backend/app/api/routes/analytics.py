from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models.event import Event
from app.models.photo import Photo
from app.models.lead import Lead, LeadStatus
from app.models.user import User
from app.models.event_view import EventView
from app.api.routes.auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/dashboard/{user_id}")
async def get_dashboard_stats(
    user_id: int,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    user = get_current_user(token, db)
    
    if user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Events stats
    total_events = db.query(func.count(Event.id)).filter(Event.owner_id == user.id).scalar()
    live_events = db.query(func.count(Event.id)).filter(
        Event.owner_id == user.id,
        Event.status == "Live"
    ).scalar()
    
    # Photos stats
    total_photos = db.query(func.count(Photo.id)).join(Event).filter(
        Event.owner_id == user.id
    ).scalar()
    
    # Leads stats
    total_leads = db.query(func.count(Lead.id)).filter(Lead.user_id == user.id).scalar()
    booked_leads = db.query(func.count(Lead.id)).filter(
        Lead.user_id == user.id,
        Lead.status == LeadStatus.BOOKED
    ).scalar()
    
    # Views & visitors
    total_views = db.query(func.sum(Event.views)).filter(Event.owner_id == user.id).scalar() or 0
    total_visitors = db.query(func.sum(Event.visitors)).filter(Event.owner_id == user.id).scalar() or 0
    
    return {
        "total_events": total_events or 0,
        "live_events": live_events or 0,
        "total_photos": total_photos or 0,
        "total_leads": total_leads or 0,
        "booked_leads": booked_leads or 0,
        "total_views": int(total_views) if total_views else 0,
        "total_visitors": int(total_visitors) if total_visitors else 0,
    }

@router.get("/events/{user_id}/traffic")
async def get_event_traffic(
    user_id: int,
    token: str | None = None,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Return real public-gallery traffic aggregated from recorded page views."""
    user = get_current_user(token, db)
    if user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    days = max(1, min(days, 90))
    start = datetime.utcnow() - timedelta(days=days - 1)
    rows = (
        db.query(
            func.date(EventView.created_at).label("day"),
            func.count(EventView.id).label("views"),
            func.count(func.distinct(EventView.visitor_id)).label("visitors"),
        )
        .join(Event, Event.id == EventView.event_id)
        .filter(Event.owner_id == user.id, EventView.created_at >= start)
        .group_by(func.date(EventView.created_at))
        .order_by(func.date(EventView.created_at))
        .all()
    )
    breakdown = [
        {"day": str(row.day), "views": int(row.views), "visitors": int(row.visitors)}
        for row in rows
    ]
    return {
        "period": f"Last {days} days",
        "total_views": sum(x["views"] for x in breakdown),
        "total_visitors": sum(x["visitors"] for x in breakdown),
        "daily_breakdown": breakdown,
    }

@router.get("/event/{event_id}/performance")
async def get_event_performance(
    event_id: int,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Get performance metrics for specific event"""
    user = get_current_user(token, db)
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get photos stats
    total_photos = db.query(func.count(Photo.id)).filter(Photo.event_id == event_id).scalar() or 0
    total_favorites = db.query(func.sum(Photo.favorites)).filter(Photo.event_id == event_id).scalar() or 0
    total_downloads = db.query(func.sum(Photo.downloads)).filter(Photo.event_id == event_id).scalar() or 0
    
    return {
        "event_id": event_id,
        "event_title": event.title,
        "views": event.views,
        "visitors": event.visitors,
        "total_photos": total_photos,
        "total_favorites": int(total_favorites) if total_favorites else 0,
        "total_downloads": int(total_downloads) if total_downloads else 0,
        "status": event.status,
        "created_at": event.created_at,
    }

@router.get("/leads/{user_id}/funnel")
async def get_leads_funnel(
    user_id: int,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Get sales funnel breakdown"""
    user = get_current_user(token, db)
    
    if user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Count leads by status
    statuses = [
        LeadStatus.NEW,
        LeadStatus.CONTACTED,
        LeadStatus.QUOTED,
        LeadStatus.BOOKED,
        LeadStatus.LOST
    ]
    
    funnel = {}
    for status in statuses:
        count = db.query(func.count(Lead.id)).filter(
            Lead.user_id == user.id,
            Lead.status == status
        ).scalar() or 0
        funnel[status.value] = count
    
    return funnel

@router.get("/top-photos/{user_id}")
async def get_top_photos(
    user_id: int,
    token: str | None = None,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get most favorited/downloaded photos"""
    user = get_current_user(token, db)
    
    if user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    top_photos = db.query(Photo).join(Event).filter(
        Event.owner_id == user.id
    ).order_by(Photo.favorites.desc()).limit(limit).all()
    
    return [
        {
            "id": p.id,
            "filename": p.filename,
            "url": p.url,
            "favorites": p.favorites,
            "downloads": p.downloads,
            "event_title": p.event.title
        }
        for p in top_photos
    ]