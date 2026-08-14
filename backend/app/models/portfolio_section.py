from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from ..database import Base


class PortfolioSection(Base):
    __tablename__ = "portfolio_sections"

    id = Column(Integer, primary_key=True, index=True)

    studio_id = Column(
        Integer,
        ForeignKey("studios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    section_type = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False, default="{}")

    position = Column(Integer, nullable=False, default=0)
    visible = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    studio = relationship("Studio", back_populates="portfolio_sections")

    def __repr__(self):
        return (
            f"<PortfolioSection "
            f"studio_id={self.studio_id} "
            f"type={self.section_type}>"
        )