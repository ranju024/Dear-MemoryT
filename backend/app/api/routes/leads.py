from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...database import get_db
from ...models.lead import Lead, LeadStatus
from ...models.user import User
from ...models.event import Event
from ...schemas.lead_studio import LeadCreate, LeadUpdate, LeadResponse
from .auth import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/public/{event_slug}", response_model=LeadResponse, status_code=201)
async def create_public_lead(
    event_slug: str,
    lead: LeadCreate,
    db: Session = Depends(get_db)
):
    """
    Public: a visitor on an event's page (e.g. the Contact / book us section)
    submits an inquiry with no login required. It lands in the studio owner's
    leads CRM tied to whichever event they contacted from.
    """
    event = db.query(Event).filter(Event.slug == event_slug).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    new_lead = Lead(
        user_id=event.owner_id,
        source=lead.source or "Event page inquiry",
        **lead.dict(exclude={"source"}),
    )
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)

    logger.info(f"Public lead created via event '{event_slug}': {new_lead.name}")
    return new_lead

@router.post("/", response_model=LeadResponse, status_code=201)
async def create_lead(
    lead: LeadCreate,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Create a new lead"""
    user = get_current_user(token, db)
    
    new_lead = Lead(
        user_id=user.id,
        **lead.dict()
    )
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    
    logger.info(f"Lead created: {new_lead.name} for {user.username}")
    return new_lead

@router.get("/", response_model=List[LeadResponse])
async def list_leads(
    token: str | None = None,
    status_filter: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List user's leads"""
    user = get_current_user(token, db)
    
    query = db.query(Lead).filter(Lead.user_id == user.id)
    
    if status_filter:
        query = query.filter(Lead.status == status_filter)
    
    leads = query.offset(skip).limit(limit).all()
    return leads

@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: int,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Get lead details"""
    user = get_current_user(token, db)
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if lead.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return lead

@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: int,
    lead_update: LeadUpdate,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Update lead"""
    user = get_current_user(token, db)
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if lead.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = lead_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)
    
    db.commit()
    db.refresh(lead)
    
    logger.info(f"Lead updated: {lead.name}")
    return lead

@router.delete("/{lead_id}", status_code=204)
async def delete_lead(
    lead_id: int,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Delete lead"""
    user = get_current_user(token, db)
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if lead.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(lead)
    db.commit()

@router.post("/{lead_id}/status/{status}", response_model=LeadResponse)
async def update_lead_status(
    lead_id: int,
    status: str,  # Change from LeadStatus to str
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Update lead status in pipeline"""
    from datetime import datetime
    
    user = get_current_user(token, db)
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if lead.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Convert string to enum
    try:
        lead_status = LeadStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be: New, Contacted, Quoted, Booked, or Lost")
    
    lead.status = lead_status
    
    # Set timestamp based on status
    if lead_status == LeadStatus.CONTACTED:
        lead.contacted_at = datetime.utcnow()
    elif lead_status == LeadStatus.QUOTED:
        lead.quoted_at = datetime.utcnow()
    elif lead_status == LeadStatus.BOOKED:
        lead.booked_at = datetime.utcnow()
    
    db.commit()
    db.refresh(lead)
    
    logger.info(f"Lead status updated: {lead.name} -> {lead_status}")
    return lead