from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
import enum

class Studio(Base):
    __tablename__ = "studios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    name = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    tagline = Column(String)
    about = Column(Text)
    logo = Column(String)  # URL
    
    # Location
    city = Column(String)
    country = Column(String)
    
    # Contact
    email = Column(String)
    phone = Column(String)
    website = Column(String)
    instagram = Column(String)
    
    # Stats
    founded_year = Column(Integer)
    total_events = Column(Integer, default=0)
    total_photos = Column(Integer, default=0)
    rating = Column(String, default="5.0")
    
    # Pricing
    base_price = Column(String)
    
    # Brand Kit
    primary_color = Column(String, default="#4a7c6a")
    background_color = Column(String, default="#EEEAFE")
    accent_color = Column(String, default="#e1f0f7")
    text_color = Column(String, default="#2d2a29")
    heading_font = Column(String, default="plus-jakarta")
    body_font = Column(String, default="plus-jakarta")
    watermark_text = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="studio")

    portfolio_sections = relationship(
        "PortfolioSection",
        back_populates="studio",
        cascade="all, delete-orphan",
        order_by="PortfolioSection.position",
    )
    def __repr__(self):
        return f"<Studio {self.name}>"