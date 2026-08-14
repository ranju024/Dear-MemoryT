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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables on startup
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
    lifespan=lifespan
)

# CORS configuration for frontend
# allowed_origins = {
#     origin.strip()
#     for origin in os.getenv(
#         "CORS_ORIGINS",
#         f"http://localhost:5173,http://localhost:3000,{os.getenv('FRONTEND_URL', 'http://localhost:5173')}",
#     ).split(",")
#     if origin.strip()
# }

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=list(allowed_origins),
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def capture_bearer_token(request, call_next):
    """Expose the Authorization header to the existing route helpers."""
    authorization = request.headers.get("Authorization")
    token = authorization if authorization and authorization.lower().startswith("bearer ") else None
    auth.set_request_token(token)
    try:
        return await call_next(request)
    finally:
        auth.set_request_token(None)

# Mount uploads folder
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(photos.router, prefix="/api/photos", tags=["photos"])
app.include_router(albums.router, prefix="/api/albums", tags=["albums"])
app.include_router(leads.router, prefix="/api/leads", tags=["leads"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(studio.router, prefix="/api/studio", tags=["studio"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["portfolio"])
app.include_router(guestbook.router, prefix="/api/guestbook", tags=["guestbook"])

@app.get("/")
async def root():
    return {"message": "DearMemory API is running", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)