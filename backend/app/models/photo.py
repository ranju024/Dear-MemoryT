from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Table, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

# Association table for many-to-many between Photo and Album
# photo_album_association = Table(
#     'photo_album',
#     Base.metadata,
#     Column('photo_id', Integer, ForeignKey('photos.id')),
#     Column('album_id', Integer, ForeignKey('albums.id'))
# )

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    
    filename = Column(String, nullable=False)
    url = Column(String, nullable=False)  # S3 or local URL
    thumbnail_url = Column(String)
    
    title = Column(String)
    description = Column(Text)
    
    # Photo metadata
    width = Column(Integer)
    height = Column(Integer)
    file_size = Column(Integer)  # in bytes
    mime_type = Column(String)
    
    # Engagement
    favorites = Column(Integer, default=0)
    downloads = Column(Integer, default=0)
    
    # Sorting
    order = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    taken_at = Column(DateTime)  # When photo was taken (EXIF data)

    # Relationships
    event = relationship("Event", back_populates="photos")
    albums = relationship("Album", secondary="photo_album", back_populates="photos")

    def __repr__(self):
        return f"<Photo {self.filename}>"


# class Album(Base):
#     __tablename__ = "albums"

#     id = Column(Integer, primary_key=True, index=True)
#     event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    
#     name = Column(String, nullable=False)
#     slug = Column(String, index=True)
#     description = Column(Text)
    
#     cover_photo_id = Column(Integer, ForeignKey("photos.id"), nullable=True)
    
#     # Visibility
#     is_public = Column(Boolean, default=True)
    
#     # Sorting
#     order = Column(Integer, default=0)
    
#     # Timestamps
#     created_at = Column(DateTime, default=datetime.utcnow)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

#     # Relationships
#     event = relationship("Event", back_populates="albums")
#     photos = relationship("Photo", secondary=photo_album_association, back_populates="albums")

#     def __repr__(self):
#         return f"<Album {self.name}>"
    