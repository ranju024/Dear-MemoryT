from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import uuid
import re
from ...database import get_db
from ...models.studio import Studio
from ...models.user import User
from ...schemas.lead_studio import StudioCreate, StudioUpdate, StudioResponse
from .auth import get_current_user
from ...config import UPLOAD_DIR, ALLOWED_IMAGE_TYPES, MAX_UPLOAD_SIZE
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=StudioResponse, status_code=201)
async def create_studio(
    studio_data: StudioCreate,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Create a studio profile"""
    user = get_current_user(token, db)

    # Auto-generate slug if not provided
    base_slug = studio_data.slug or re.sub(r"[^a-z0-9]+", "-", studio_data.name.lower()).strip("-")
    base_slug = base_slug or f"studio-{user.id}"
    slug = base_slug
    suffix = 2
    while db.query(Studio).filter(Studio.slug == slug, Studio.user_id != user.id).first():
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    studio = Studio(
        name=studio_data.name,
        tagline=studio_data.tagline or "",
        about=studio_data.about,
        slug=slug,
        user_id=user.id,
    )

    db.add(studio)
    db.commit()
    db.refresh(studio)

    logger.info(f"Studio created: {studio.name}")
    return studio


@router.get("/me", response_model=StudioResponse)
async def get_my_studio(
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Get current user's studio profile"""
    user = get_current_user(token, db)
    studio = db.query(Studio).filter(Studio.user_id == user.id).first()

    if not studio:
        raise HTTPException(status_code=404, detail="Studio profile not found")

    return studio


@router.put("/me", response_model=StudioResponse)
async def update_my_studio(
    studio_update: StudioUpdate,
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Update current user's studio profile, including brand kit settings"""
    user = get_current_user(token, db)
    studio = db.query(Studio).filter(Studio.user_id == user.id).first()

    if not studio:
        raise HTTPException(status_code=404, detail="Studio profile not found")

    update_data = studio_update.dict(exclude_unset=True)
    if "slug" in update_data and update_data["slug"]:
        requested = re.sub(r"[^a-z0-9]+", "-", update_data["slug"].lower()).strip("-")
        conflict = db.query(Studio).filter(
            Studio.slug == requested,
            Studio.id != studio.id,
        ).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Studio slug already exists")
        update_data["slug"] = requested
    for field, value in update_data.items():
        setattr(studio, field, value)

    db.commit()
    db.refresh(studio)

    logger.info(f"Studio updated: {studio.name}")
    return studio


@router.post("/me/logo", response_model=StudioResponse)
async def upload_studio_logo(
    token: str | None = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload/replace the studio's brand logo. Saves the file to disk and persists
    the resulting URL onto studio.logo — this is the actual missing piece the
    Brand Kit page's 'Replace logo' button needs to call."""
    user = get_current_user(token, db)
    studio = db.query(Studio).filter(Studio.user_id == user.id).first()
    if not studio:
        raise HTTPException(status_code=404, detail="Studio profile not found")

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size: {MAX_UPLOAD_SIZE / 1024 / 1024}MB",
        )

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"logo_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        logger.error(f"Logo upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Logo upload failed")

    studio.logo = f"/uploads/{unique_filename}"
    db.commit()
    db.refresh(studio)

    logger.info(f"Studio logo updated: {studio.name}")
    return studio




@router.get("/slug/{slug}/events")
async def get_public_studio_events(slug: str, db: Session = Depends(get_db)):
    """Public portfolio data: published/live events owned by this studio."""
    from ...models.event import Event, EventStatus
    studio = db.query(Studio).filter(Studio.slug == slug).first()
    if not studio:
        raise HTTPException(status_code=404, detail="Studio not found")

    events = (
        db.query(Event)
        .filter(Event.owner_id == studio.user_id, Event.status == EventStatus.LIVE)
        .order_by(Event.date.desc())
        .all()
    )
    return [
        {
            "id": e.id,
            "slug": e.slug,
            "title": e.title,
            "subtitle": e.subtitle,
            "description": e.description,
            "type": e.type,
            "date": e.date,
            "cover_image": e.cover_image,
            "views": e.views or 0,
            "visitors": e.visitors or 0,
            "owner_id": e.owner_id,
            "status": e.status,
            "template": e.template,
            "photo_count": len(e.photos),
            "created_at": e.created_at,
            "updated_at": e.updated_at,
        }
        for e in events
    ]

@router.get("/slug/{slug}", response_model=StudioResponse)
async def get_studio_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get studio profile by slug (public)"""
    studio = db.query(Studio).filter(Studio.slug == slug).first()

    if not studio:
        raise HTTPException(status_code=404, detail="Studio not found")

    return studio


@router.get("/{user_id}", response_model=StudioResponse)
async def get_user_studio(user_id: int, db: Session = Depends(get_db)):
    """Get studio profile for a user (public)"""
    studio = db.query(Studio).filter(Studio.user_id == user_id).first()

    if not studio:
        raise HTTPException(status_code=404, detail="Studio not found")

    return studio


@router.post("/me/stats/update", response_model=StudioResponse)
async def update_studio_stats(
    token: str | None = None,
    db: Session = Depends(get_db)
):
    """Recalculate studio stats from events and photos"""
    from sqlalchemy import func
    from app.models.event import Event
    from app.models.photo import Photo

    user = get_current_user(token, db)
    studio = db.query(Studio).filter(Studio.user_id == user.id).first()

    if not studio:
        raise HTTPException(status_code=404, detail="Studio profile not found")

    total_events = db.query(func.count(Event.id)).filter(Event.owner_id == user.id).scalar() or 0
    total_photos = db.query(func.count(Photo.id)).join(Event).filter(
        Event.owner_id == user.id
    ).scalar() or 0

    studio.total_events = total_events
    studio.total_photos = total_photos

    db.commit()
    db.refresh(studio)

    logger.info(f"Studio stats updated: {studio.name}")
    return studio