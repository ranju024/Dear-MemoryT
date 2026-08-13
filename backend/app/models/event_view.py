from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, Index
from datetime import datetime
from ..database import Base

class EventView(Base):
    __tablename__ = "event_views"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    visitor_id = Column(String(64), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (
        Index("ix_event_views_event_visitor", "event_id", "visitor_id"),
    )
