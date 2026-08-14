import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.portfolio_section import PortfolioSection
from ...models.studio import Studio
from ...schemas.portfolio import (
    PortfolioResponse,
    PortfolioUpdate,
    PortfolioSectionResponse,
)
from .auth import get_current_user


router = APIRouter()


DEFAULT_SECTIONS = [
    ("hero", "Hero banner"),
    ("about", "About"),
    ("story", "Our story"),
    ("team", "Meet the team"),
    ("showcase", "Portfolio showcase"),
    ("featured_events", "Featured events"),
    ("packages", "Packages"),
    ("reviews", "Reviews"),
    ("awards", "Awards"),
    ("contact", "Contact"),
]


def get_user_studio(token, db):
    user = get_current_user(token, db)

    studio = (
        db.query(Studio)
        .filter(Studio.user_id == user.id)
        .first()
    )

    if not studio:
        raise HTTPException(
            status_code=404,
            detail="Studio profile not found",
        )

    return studio


def section_to_response(section: PortfolioSection):
    try:
        content = json.loads(section.content or "{}")
    except (json.JSONDecodeError, TypeError):
        content = {}

    return PortfolioSectionResponse(
        id=section.id,
        section_type=section.section_type,
        title=section.title,
        content=content,
        position=section.position,
        visible=section.visible,
    )

@router.get("/slug/{slug}", response_model=PortfolioResponse)
async def get_public_portfolio(
    slug: str,
    db: Session = Depends(get_db),
):
    """
    Get the public portfolio for a studio by slug.
    No authentication required.
    """

    studio = (
        db.query(Studio)
        .filter(Studio.slug == slug)
        .first()
    )

    if not studio:
        raise HTTPException(
            status_code=404,
            detail="Studio not found",
        )

    sections = (
        db.query(PortfolioSection)
        .filter(
            PortfolioSection.studio_id == studio.id,
            PortfolioSection.visible == True,
        )
        .order_by(PortfolioSection.position.asc())
        .all()
    )

    return {
        "sections": [
            section_to_response(section)
            for section in sections
        ]
    }

@router.get("/me", response_model=PortfolioResponse)
async def get_my_portfolio(
    token: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Get the current user's portfolio sections.

    If the studio has no portfolio yet, create the default
    sections automatically.
    """

    studio = get_user_studio(token, db)

    sections = (
        db.query(PortfolioSection)
        .filter(PortfolioSection.studio_id == studio.id)
        .order_by(PortfolioSection.position.asc())
        .all()
    )

    # First-time portfolio setup
    if not sections:
        sections = []

        for position, (section_type, title) in enumerate(DEFAULT_SECTIONS):
            section = PortfolioSection(
                studio_id=studio.id,
                section_type=section_type,
                title=title,
                content="{}",
                position=position,
                visible=True,
            )

            db.add(section)
            sections.append(section)

        db.commit()

        for section in sections:
            db.refresh(section)

    return {
        "sections": [
            section_to_response(section)
            for section in sections
        ]
    }


@router.put("/me", response_model=PortfolioResponse)
async def update_my_portfolio(
    portfolio: PortfolioUpdate,
    token: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Replace the current user's portfolio sections.

    This is intentionally a single save operation so the
    Portfolio editor can save the entire page at once.
    """

    studio = get_user_studio(token, db)

    # Remove the existing sections.
    db.query(PortfolioSection).filter(
        PortfolioSection.studio_id == studio.id
    ).delete(
        synchronize_session=False
    )

    new_sections = []

    for position, section_data in enumerate(portfolio.sections):
        section = PortfolioSection(
            studio_id=studio.id,
            section_type=section_data.section_type,
            title=section_data.title,
            content=json.dumps(
                section_data.content,
                ensure_ascii=False,
            ),
            position=position,
            visible=section_data.visible,
        )

        db.add(section)
        new_sections.append(section)

    db.commit()

    for section in new_sections:
        db.refresh(section)

    return {
        "sections": [
            section_to_response(section)
            for section in new_sections
        ]
    }


@router.delete("/me/{section_id}")
async def delete_my_portfolio_section(
    section_id: int,
    token: str | None = None,
    db: Session = Depends(get_db),
):
    """
    Delete one portfolio section belonging to the current studio.
    """

    studio = get_user_studio(token, db)

    section = (
        db.query(PortfolioSection)
        .filter(
            PortfolioSection.id == section_id,
            PortfolioSection.studio_id == studio.id,
        )
        .first()
    )

    if not section:
        raise HTTPException(
            status_code=404,
            detail="Portfolio section not found",
        )

    db.delete(section)
    db.commit()

    return {
        "message": "Portfolio section deleted"
    }