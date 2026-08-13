from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
import logging

from ...database import get_db
from ...models.event import Event
from ...models.guestbook import GuestbookEntry
from ...schemas.guestbook import GuestbookEntryCreate, GuestbookEntryResponse
from .auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()


def _guestbook_requires_approval(event: Event) -> bool:
    """Read the event's design_config to see if the studio turned on comment approval."""
    if not event.design_config:
        return False
    try:
        parsed = json.loads(event.design_config)
        return bool(parsed.get("guestbook", {}).get("requireApproval", False))
    except (json.JSONDecodeError, AttributeError):
        return False


@router.post("/{event_id}", response_model=GuestbookEntryResponse, status_code=201)
async def sign_guestbook(
    event_id: int,
    entry: GuestbookEntryCreate,
    db: Session = Depends(get_db),
):
    """Public: anyone viewing an event's page can leave a guestbook note. No login required."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    requires_approval = _guestbook_requires_approval(event)

    new_entry = GuestbookEntry(
        event_id=event_id,
        name=entry.name,
        message=entry.message,
        approved=not requires_approval,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    logger.info(f"Guestbook entry added for event {event_id} (approved={new_entry.approved})")
    return new_entry


@router.get("/{event_id}", response_model=List[GuestbookEntryResponse])
async def list_guestbook_entries(event_id: int, db: Session = Depends(get_db)):
    """Public: list approved guestbook entries for an event's page."""
    entries = (
        db.query(GuestbookEntry)
        .filter(GuestbookEntry.event_id == event_id, GuestbookEntry.approved == True)  # noqa: E712
        .order_by(GuestbookEntry.created_at.desc())
        .all()
    )
    return entries


@router.get("/{event_id}/pending", response_model=List[GuestbookEntryResponse])
async def list_pending_entries(event_id: int, token: str | None = None, db: Session = Depends(get_db)):
    """Studio owner only: list entries awaiting approval for one of their events."""
    user = get_current_user(token, db)
    event = db.query(Event).filter(Event.id == event_id, Event.owner_id == user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    entries = (
        db.query(GuestbookEntry)
        .filter(GuestbookEntry.event_id == event_id, GuestbookEntry.approved == False)  # noqa: E712
        .order_by(GuestbookEntry.created_at.desc())
        .all()
    )
    return entries


@router.post("/{event_id}/{entry_id}/approve", response_model=GuestbookEntryResponse)
async def approve_entry(event_id: int, entry_id: int, token: str | None = None, db: Session = Depends(get_db)):
    """Studio owner only: approve a pending guestbook entry so it shows publicly."""
    user = get_current_user(token, db)
    event = db.query(Event).filter(Event.id == event_id, Event.owner_id == user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    entry = db.query(GuestbookEntry).filter(
        GuestbookEntry.id == entry_id, GuestbookEntry.event_id == event_id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Guestbook entry not found")

    entry.approved = True
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{event_id}/{entry_id}")
async def delete_entry(event_id: int, entry_id: int, token: str | None = None, db: Session = Depends(get_db)):
    """Studio owner only: remove a guestbook entry (spam, inappropriate, etc.)."""
    user = get_current_user(token, db)
    event = db.query(Event).filter(Event.id == event_id, Event.owner_id == user.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    entry = db.query(GuestbookEntry).filter(
        GuestbookEntry.id == entry_id, GuestbookEntry.event_id == event_id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Guestbook entry not found")

    db.delete(entry)
    db.commit()
    return {"detail": "Entry deleted"}