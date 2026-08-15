from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List

import io
import logging
import os
import re
import uuid
from datetime import datetime
from urllib.parse import quote

from PIL import Image, ImageDraw, ImageFont, ImageOps

from ...database import get_db
from ...models.photo import Photo
from ...models.event import Event
from ...models.user import User
from ...models.studio import Studio
from ...schemas.photo import (
    PhotoCreate,
    PhotoUpdate,
    PhotoResponse,
)
from ...services.subscription import (
    enforce_photo_limit,
    get_effective_plan,
)
from .auth import get_current_user
from ...config import (
    UPLOAD_DIR,
    ALLOWED_IMAGE_TYPES,
    MAX_UPLOAD_SIZE,
)

logger = logging.getLogger(__name__)

router = APIRouter()

os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

PAID_PLANS = {
    "creative",
    "agency",
}


def is_paid_plan(plan: str | None) -> bool:
    return (plan or "starter").strip().lower() in PAID_PLANS


def get_original_file_path(photo: Photo) -> str:
    filename = photo.url.rsplit("/", 1)[-1]

    # Prevent path traversal.
    filename = os.path.basename(filename)

    return os.path.join(UPLOAD_DIR, filename)


def parse_hex_color(value: str | None, fallback=(255, 255, 255)):
    if not value:
        return fallback

    value = value.strip().lstrip("#")

    if len(value) == 3:
        value = "".join(char * 2 for char in value)

    if len(value) != 6:
        return fallback

    try:
        return tuple(
            int(value[index:index + 2], 16)
            for index in (0, 2, 4)
        )
    except ValueError:
        return fallback


def get_watermark_font(size: int):
    candidates = [
        # Linux / deployment
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans.ttf",

        # Windows localhost
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
    ]

    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size=size)
            except Exception:
                pass

    return ImageFont.load_default()


def create_watermarked_image(
    source_path: str,
    watermark_text: str,
) -> tuple[io.BytesIO, str, str]:
    """
    Returns:
        buffer
        output_format
        content_type
    """

    with Image.open(source_path) as source:
        image = ImageOps.exif_transpose(source).copy()

    original_format = (image.format or "JPEG").upper()

    if original_format not in {"JPEG", "PNG", "WEBP"}:
        original_format = "JPEG"

    # Work in RGBA so the watermark can have transparency.
    if image.mode != "RGBA":
        image = image.convert("RGBA")

    width, height = image.size

    # Scale watermark according to image size.
    font_size = max(18, min(72, int(min(width, height) * 0.045)))
    font = get_watermark_font(font_size)

    text = watermark_text.strip() or "DearMemory"

    overlay = Image.new(
        "RGBA",
        image.size,
        (0, 0, 0, 0),
    )

    draw = ImageDraw.Draw(overlay)

    # Measure text.
    bbox = draw.textbbox(
        (0, 0),
        text,
        font=font,
    )

    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    margin = max(20, int(min(width, height) * 0.035))

    x = width - text_width - margin
    y = height - text_height - margin

    # Use the studio brand watermark color when possible.
    # White remains readable over most photographs.
    fill = (255, 255, 255, 190)
    shadow = (0, 0, 0, 110)

    # Shadow for readability.
    draw.text(
        (x + 2, y + 2),
        text,
        font=font,
        fill=shadow,
    )

    draw.text(
        (x, y),
        text,
        font=font,
        fill=fill,
    )

    image = Image.alpha_composite(image, overlay)

    output = io.BytesIO()

    if original_format == "PNG":
        image.save(
            output,
            format="PNG",
            optimize=True,
        )
        content_type = "image/png"
        output_format = "PNG"

    elif original_format == "WEBP":
        image.save(
            output,
            format="WEBP",
            quality=92,
        )
        content_type = "image/webp"
        output_format = "WEBP"

    else:
        # JPEG does not support RGBA.
        image = image.convert("RGB")
        image.save(
            output,
            format="JPEG",
            quality=94,
            optimize=True,
        )
        content_type = "image/jpeg"
        output_format = "JPEG"

    output.seek(0)

    return output, output_format, content_type


def safe_download_filename(
    original_filename: str | None,
    watermarked: bool,
) -> str:
    original = original_filename or "photo.jpg"

    # Remove path components.
    original = os.path.basename(original)

    # Keep a simple safe filename.
    original = re.sub(
        r"[^A-Za-z0-9._-]",
        "_",
        original,
    )

    if watermarked:
        name, extension = os.path.splitext(original)

        if not extension:
            extension = ".jpg"

        return f"{name}-watermarked{extension}"

    return original


# ---------------------------------------------------------
# Upload
# ---------------------------------------------------------

@router.post(
    "/{event_id}/upload",
    response_model=PhotoResponse,
    status_code=201,
)
async def upload_photo(
    event_id: int,
    file: UploadFile = File(...),
    token: str | None = None,
    db: Session = Depends(get_db),
):
    """Upload a photo to an event."""

    user = get_current_user(token, db)

    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    if event.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized",
        )
    enforce_photo_limit(
        user,
        event_id,
        db,
    )
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "File type not allowed. "
                f"Allowed: {', '.join(ALLOWED_IMAGE_TYPES)}"
            ),
        )

    contents = await file.read()

    if len(contents) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=(
                "File too large. "
                f"Max size: {MAX_UPLOAD_SIZE / 1024 / 1024}MB"
            ),
        )

    file_extension = (
        file.filename.split(".")[-1]
        if file.filename and "." in file.filename
        else "jpg"
    )

    unique_filename = (
        f"{uuid.uuid4()}.{file_extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        unique_filename,
    )

    try:
        with open(file_path, "wb") as f:
            f.write(contents)

    except Exception as e:
        logger.error(
            f"File upload failed: {str(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail="File upload failed",
        )

    new_photo = Photo(
        event_id=event_id,
        filename=file.filename,
        url=f"/uploads/{unique_filename}",
        thumbnail_url=f"/uploads/{unique_filename}",
        mime_type=file.content_type,
        file_size=len(contents),
        taken_at=datetime.utcnow(),
    )

    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)

    logger.info(
        f"Photo uploaded: {new_photo.filename} "
        f"to event {event_id}"
    )

    return new_photo


# ---------------------------------------------------------
# List
# ---------------------------------------------------------

@router.get(
    "/{event_id}",
    response_model=List[PhotoResponse],
)
async def get_event_photos(
    event_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Get all photos for an event."""

    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    photos = (
        db.query(Photo)
        .filter(Photo.event_id == event_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return photos


# ---------------------------------------------------------
# Get one
# ---------------------------------------------------------

@router.get(
    "/photo/{photo_id}",
    response_model=PhotoResponse,
)
async def get_photo(
    photo_id: int,
    db: Session = Depends(get_db),
):
    """Get photo details."""

    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id)
        .first()
    )

    if not photo:
        raise HTTPException(
            status_code=404,
            detail="Photo not found",
        )

    return photo


# ---------------------------------------------------------
# Update
# ---------------------------------------------------------

@router.put(
    "/photo/{photo_id}",
    response_model=PhotoResponse,
)
async def update_photo(
    photo_id: int,
    photo_update: PhotoUpdate,
    token: str | None = None,
    db: Session = Depends(get_db),
):
    """Update photo metadata."""

    user = get_current_user(token, db)

    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id)
        .first()
    )

    if not photo:
        raise HTTPException(
            status_code=404,
            detail="Photo not found",
        )

    event = (
        db.query(Event)
        .filter(Event.id == photo.event_id)
        .first()
    )

    if event.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized",
        )

    update_data = photo_update.dict(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(photo, field, value)

    db.commit()
    db.refresh(photo)

    return photo


# ---------------------------------------------------------
# Delete
# ---------------------------------------------------------

@router.delete(
    "/photo/{photo_id}",
    status_code=204,
)
async def delete_photo(
    photo_id: int,
    token: str | None = None,
    db: Session = Depends(get_db),
):
    """Delete photo."""

    user = get_current_user(token, db)

    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id)
        .first()
    )

    if not photo:
        raise HTTPException(
            status_code=404,
            detail="Photo not found",
        )

    event = (
        db.query(Event)
        .filter(Event.id == photo.event_id)
        .first()
    )

    if event.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized",
        )

    try:
        os.remove(
            get_original_file_path(photo)
        )
    except Exception:
        pass

    db.delete(photo)
    db.commit()


# ---------------------------------------------------------
# Favorite
# ---------------------------------------------------------

@router.post(
    "/photo/{photo_id}/favorite",
    response_model=PhotoResponse,
)
async def favorite_photo(
    photo_id: int,
    db: Session = Depends(get_db),
):
    """Add to favorites."""

    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id)
        .first()
    )

    if not photo:
        raise HTTPException(
            status_code=404,
            detail="Photo not found",
        )

    photo.favorites += 1

    db.commit()
    db.refresh(photo)

    return photo


# ---------------------------------------------------------
# Unfavorite
# ---------------------------------------------------------

@router.post(
    "/photo/{photo_id}/unfavorite"
)
async def unfavorite_photo(
    photo_id: int,
    token: str | None = None,
    db: Session = Depends(get_db),
):
    """Remove photo from favorites."""

    user = get_current_user(token, db)

    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id)
        .first()
    )

    if not photo:
        raise HTTPException(
            status_code=404,
            detail="Photo not found",
        )

    photo.favorites = max(
        0,
        photo.favorites - 1,
    )

    db.commit()
    db.refresh(photo)

    return photo


# ---------------------------------------------------------
# DOWNLOAD
# ---------------------------------------------------------

@router.post(
    "/photo/{photo_id}/download"
)
async def download_photo(
    photo_id: int,
    db: Session = Depends(get_db),
):
    """
    Download a photo.

    Starter/free users:
        receive a watermarked copy.

    Creative/Agency users:
        receive the original.
    """

    photo = (
        db.query(Photo)
        .filter(Photo.id == photo_id)
        .first()
    )

    if not photo:
        raise HTTPException(
            status_code=404,
            detail="Photo not found",
        )

    event = (
        db.query(Event)
        .filter(Event.id == photo.event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    owner = (
        db.query(User)
        .filter(User.id == event.owner_id)
        .first()
    )

    if not owner:
        raise HTTPException(
            status_code=404,
            detail="Studio owner not found",
        )

    studio = (
        db.query(Studio)
        .filter(Studio.user_id == owner.id)
        .first()
    )

    file_path = get_original_file_path(photo)

    if not os.path.isfile(file_path):
        raise HTTPException(
            status_code=404,
            detail="Image file not found",
        )

    # Track download.
    photo.downloads += 1
    db.commit()

    paid = get_effective_plan(owner) in {
        "creative",
        "agency",
    }

    # -----------------------------------------------------
    # PAID: original
    # -----------------------------------------------------

    if paid:
        content_type = (
            photo.mime_type
            or "application/octet-stream"
        )

        filename = safe_download_filename(
            photo.filename,
            watermarked=False,
        )

        encoded_filename = quote(
            filename,
            safe="",
        )

        def original_stream():
            with open(file_path, "rb") as file:
                while True:
                    chunk = file.read(1024 * 1024)

                    if not chunk:
                        break

                    yield chunk

        return StreamingResponse(
            original_stream(),
            media_type=content_type,
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{filename}"; '
                    f"filename*=UTF-8''{encoded_filename}"
                ),
            },
        )

    # -----------------------------------------------------
    # FREE: watermarked copy
    # -----------------------------------------------------

    watermark_text = (
        studio.watermark_text
        if studio and studio.watermark_text
        else (
            studio.name
            if studio
            else "DearMemory"
        )
    )

    try:
        buffer, output_format, content_type = (
            create_watermarked_image(
                file_path,
                watermark_text,
            )
        )

    except Exception as e:
        logger.exception(
            "Watermark generation failed"
        )

        raise HTTPException(
            status_code=500,
            detail="Could not create watermarked image",
        ) from e

    extension = {
        "JPEG": ".jpg",
        "PNG": ".png",
        "WEBP": ".webp",
    }.get(output_format, ".jpg")

    filename = safe_download_filename(
        photo.filename,
        watermarked=True,
    )

    # Make extension match generated format.
    filename = os.path.splitext(filename)[0] + extension

    encoded_filename = quote(
        filename,
        safe="",
    )

    return StreamingResponse(
        buffer,
        media_type=content_type,
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"; '
                f"filename*=UTF-8''{encoded_filename}"
            ),
            "Cache-Control": "no-store",
        },
    )