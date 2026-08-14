from typing import Any, Dict, List

from pydantic import BaseModel, Field


class PortfolioSectionBase(BaseModel):
    section_type: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    content: Dict[str, Any] = Field(default_factory=dict)
    position: int = 0
    visible: bool = True


class PortfolioSectionResponse(PortfolioSectionBase):
    id: int

    class Config:
        orm_mode = True


class PortfolioResponse(BaseModel):
    sections: List[PortfolioSectionResponse]


class PortfolioUpdate(BaseModel):
    sections: List[PortfolioSectionBase]
      