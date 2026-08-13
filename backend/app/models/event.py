from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Enum, func
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
import enum

class EventType(str, enum.Enum):
    WEDDING = "Wedding"
    GRADUATION = "Graduation"
    CONCERT = "Concert"
    CORPORATE = "Corporate"
    BIRTHDAY = "Birthday"
    SPORTS = "Sports"

class EventStatus(str, enum.Enum):
    DRAFT = "Draft"
    SCHEDULED = "Scheduled"
    LIVE = "Live"
    ARCHIVED = "Archived"

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False, index=True)
    subtitle = Column(String)
    description = Column(Text)
    type = Column(Enum(EventType), nullable=False)
    date = Column(DateTime, nullable=False)
    cover_image = Column(String)  # URL or path
    
    # Stats
    views = Column(Integer, default=0)
    visitors = Column(Integer, default=0)
    
    # Status & settings
    status = Column(Enum(EventStatus), default=EventStatus.DRAFT)
    template = Column(String, default="Modern Elegance")
    password_protected = Column(String, nullable=True)  # Optional password

    # FlowCV-style page design: JSON string of {sections: [{id, type, visible, order}], style: {...}}
    design_config = Column(Text, nullable=True)
    
    # Ownership
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="events")
    photos = relationship("Photo", back_populates="event", cascade="all, delete-orphan")
    albums = relationship("Album", back_populates="event", cascade="all, delete-orphan")


    @property
    def photo_count(self):
        """Get count of photos in this event"""
        from sqlalchemy.orm import object_session
        db = object_session(self)
        if db:
            from .photo import Photo
            return db.query(func.count(Photo.id)).filter(Photo.event_id == self.id).scalar() or 0
        return 0
    
    def __repr__(self):
        return f"<Event {self.slug}>"