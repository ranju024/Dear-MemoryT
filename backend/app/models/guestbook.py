from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class GuestbookEntry(Base):
    __tablename__ = "guestbook_entries"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    approved = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    event = relationship("Event", backref="guestbook_entries")

    def __repr__(self):
        return f"<GuestbookEntry {self.name} on event {self.event_id}>"