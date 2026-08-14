from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager

from .database import engine, Base
from .models.event_view import EventView  # register model metadata
from .api.routes import (
    auth,
    events,
    photos,
    albums,
    leads,
    analytics,
    studio,
    guestbook,
    portfolio,
)

import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    yield

    logger.info("Shutting down...")


app = FastAPI(
    title="DearMemory API",
    description="Photo gallery platform for event photography",
    version="1.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

def get_cors_origins() -> list[str]:
    configured = os.getenv("CORS_ORIGINS", "")

    if configured.strip():
        return [
            origin.strip().rstrip("/")
            for origin in configured.split(",")
            if origin.strip()
        ]

    # Local development defaults
    return [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Authentication token middleware
# ---------------------------------------------------------

@app.middleware("http")
async def capture_bearer_token(request, call_next):
    """
    Expose the Authorization header to the existing route helpers.
    """

    authorization = request.headers.get("Authorization")

    token = (
        authorization
        if authorization
        and authorization.lower().startswith("bearer ")
        else None
    )

    auth.set_request_token(token)

    try:
        response = await call_next(request)

        # Uploaded filenames use UUIDs, so they are effectively immutable.
        # Cache them aggressively for much faster public galleries.
        if request.url.path.startswith("/uploads/"):
            response.headers[
                "Cache-Control"
            ] = "public, max-age=31536000, immutable"

        return response

    finally:
        auth.set_request_token(None)


# ---------------------------------------------------------
# Uploads
# ---------------------------------------------------------

# IMPORTANT:
# Use the SAME UPLOAD_DIR that photos.py and studio.py use.
#
# This fixes the production bug where files were saved in one
# directory but FastAPI served a different directory.

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")

os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads",
)


# ---------------------------------------------------------
# API routers
# ---------------------------------------------------------

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["auth"],
)

app.include_router(
    events.router,
    prefix="/api/events",
    tags=["events"],
)

app.include_router(
    photos.router,
    prefix="/api/photos",
    tags=["photos"],
)

app.include_router(
    albums.router,
    prefix="/api/albums",
    tags=["albums"],
)

app.include_router(
    leads.router,
    prefix="/api/leads",
    tags=["leads"],
)

app.include_router(
    analytics.router,
    prefix="/api/analytics",
    tags=["analytics"],
)

app.include_router(
    studio.router,
    prefix="/api/studio",
    tags=["studio"],
)

app.include_router(
    guestbook.router,
    prefix="/api/guestbook",
    tags=["guestbook"],
)

app.include_router(
    portfolio.router,
    prefix="/api/portfolio",
    tags=["portfolio"],
)


# ---------------------------------------------------------
# Health / root
# ---------------------------------------------------------

@app.get("/")
async def root():
    return {
        "message": "DearMemory API is running",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )