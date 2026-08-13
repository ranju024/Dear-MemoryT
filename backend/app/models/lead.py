from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
import enum

class LeadStatus(str, enum.Enum):
    NEW = "New"
    CONTACTED = "Contacted"
    QUOTED = "Quoted"
    BOOKED = "Booked"
    LOST = "Lost"

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    name = Column(String, nullable=False, index=True)
    email = Column(String, index=True)
    phone = Column(String)
    
    event_type = Column(String)  # e.g., "Wedding", "Corporate"
    event_date = Column(DateTime)
    
    source = Column(String)  # Instagram, Referral, Google, etc.
    status = Column(Enum(LeadStatus), default=LeadStatus.NEW)
    
    budget = Column(String)  # e.g., "$5k-8k"
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    contacted_at = Column(DateTime)
    quoted_at = Column(DateTime)
    booked_at = Column(DateTime)

    # Relationships
    user = relationship("User", back_populates="leads")

    def __repr__(self):
        return f"<Lead {self.name}>"


# class Studio(Base):

#     __tablename__ = "studios"

#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
#     name = Column(String, nullable=False, index=True)
#     slug = Column(String, unique=True, index=True, nullable=False)
#     tagline = Column(String)
#     about = Column(Text)
#     logo = Column(String)  # URL
    
#     # Location
#     city = Column(String)
#     country = Column(String)
    
#     # Contact
#     email = Column(String)
#     phone = Column(String)
#     website = Column(String)
#     instagram = Column(String)
    
#     # Stats
#     founded_year = Column(Integer)
#     total_events = Column(Integer, default=0)
#     total_photos = Column(Integer, default=0)
#     rating = Column(String, default="5.0")  # e.g., "4.9"
    
#     # Pricing
#     base_price = Column(String)  # e.g., "from €1800"
    
#     created_at = Column(DateTime, default=datetime.utcnow)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

#     # Relationships
#     user = relationship("User", back_populates="studio")

#     def __repr__(self):
#         return f"<Studio {self.name}>"
    