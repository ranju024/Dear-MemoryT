import os

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from ..models.event import Event, EventStatus
from ..models.photo import Photo
from ..models.user import User


VALID_PLANS = {
    "starter",
    "creative",
    "agency",
}

PLAN_LEVELS = {
    "starter": 0,
    "creative": 1,
    "agency": 2,
}

PLAN_LIMITS = {
    "starter": {
        "max_active_events": 1,
        "max_photos_per_event": 250,
        "original_downloads": False,
    },
    "creative": {
        "max_active_events": None,
        "max_photos_per_event": 10_000,
        "original_downloads": True,
    },
    "agency": {
        "max_active_events": None,
        "max_photos_per_event": None,
        "original_downloads": True,
    },
}


PLAN_DETAILS = {
    "starter": {
        "name": "Starter",
        "price": 0,
        "description": "Free plan with watermarked downloads.",
        "features": [
            "1 active event",
            "Up to 250 photos per event",
            "Watermarked downloads",
        ],
    },
    "creative": {
        "name": "Creative",
        "price": 29,
        "description": "For photographers who need more room.",
        "features": [
            "Unlimited events",
            "Up to 10,000 photos per event",
            "Original downloads",
        ],
    },
    "agency": {
        "name": "Agency",
        "price": 89,
        "description": "For professional studios and agencies.",
        "features": [
            "Unlimited events",
            "Unlimited photos",
            "Original downloads",
        ],
    },
}


def normalize_plan(plan: str | None) -> str:
    plan = (plan or "starter").strip().lower()

    if plan not in VALID_PLANS:
        return "starter"

    return plan

def get_effective_plan(user: User) -> str:
    """
    Return the plan the user is actually entitled to right now.

    Starter:
        Never expires.

    Creative:
        Expires after 30 days.

    Agency:
        Lifetime.
    """

    plan = normalize_plan(user.plan)

    if plan == "creative":
        if (
            user.plan_expires_at is not None
            and datetime.utcnow() >= user.plan_expires_at
        ):
            return "starter"

    return plan

def get_plan_limits(plan: str | None) -> dict:
    return PLAN_LIMITS[normalize_plan(plan)]


def is_paid_plan(plan: str | None) -> bool:
    return get_plan_limits(plan)["original_downloads"]


def get_active_event_count(
    user_id: int,
    db: Session,
) -> int:
    """
    Events that are not archived count against the plan.
    """

    return (
        db.query(func.count(Event.id))
        .filter(
            Event.owner_id == user_id,
            Event.status != EventStatus.ARCHIVED,
        )
        .scalar()
        or 0
    )


def get_photo_count(
    event_id: int,
    db: Session,
) -> int:
    return (
        db.query(func.count(Photo.id))
        .filter(Photo.event_id == event_id)
        .scalar()
        or 0
    )


def enforce_event_limit(
    user: User,
    db: Session,
) -> None:
    """
    Prevent a user from creating an event beyond their plan.
    """

    plan = get_effective_plan(user)
    max_events = PLAN_LIMITS[plan]["max_active_events"]

    if max_events is None:
        return

    current_events = get_active_event_count(
        user.id,
        db,
    )

    if current_events >= max_events:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "EVENT_LIMIT_REACHED",
                "message": (
                    f"Your {PLAN_DETAILS[plan]['name']} plan "
                    f"allows {max_events} active event."
                ),
                "plan": plan,
                "limit": max_events,
                "current": current_events,
            },
        )


def enforce_photo_limit(
    user: User,
    event_id: int,
    db: Session,
) -> None:
    """
    Prevent uploads beyond the plan's per-event photo limit.
    """

    plan = get_effective_plan(user)
    max_photos = PLAN_LIMITS[plan]["max_photos_per_event"]

    if max_photos is None:
        return

    current_photos = get_photo_count(
        event_id,
        db,
    )

    if current_photos >= max_photos:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "PHOTO_LIMIT_REACHED",
                "message": (
                    f"Your {PLAN_DETAILS[plan]['name']} plan "
                    f"allows {max_photos:,} photos per event."
                ),
                "plan": plan,
                "limit": max_photos,
                "current": current_photos,
            },
        )


def can_change_plan_in_test_mode() -> bool:
    """
    Plan changes are intentionally disabled by default.

    Enable locally with:

        SUBSCRIPTIONS_ALLOW_TEST_CHANGES=true

    In production this should remain false.

    Later Stripe/webhook logic will update User.plan after
    successful payment verification.
    """

    return (
        os.getenv(
            "SUBSCRIPTIONS_ALLOW_TEST_CHANGES",
            "false",
        ).strip().lower()
        == "true"
    )


def validate_plan_change(
    user: User,
    requested_plan: str,
    db: Session,
) -> None:
    requested_plan = normalize_plan(requested_plan)

    current_plan = normalize_plan(user.plan)

    if requested_plan == current_plan:
        return

    if not can_change_plan_in_test_mode():
        raise HTTPException(
            status_code=501,
            detail={
                "code": "BILLING_NOT_CONFIGURED",
                "message": (
                    "Subscription changes are handled "
                    "through billing and are not available "
                    "until payment processing is configured."
                ),
            },
        )

    # Do not allow a test downgrade that would immediately
    # violate the destination plan's limits.
    limits = PLAN_LIMITS[requested_plan]

    max_events = limits["max_active_events"]

    if max_events is not None:
        active_events = get_active_event_count(
            user.id,
            db,
        )

        if active_events > max_events:
            raise HTTPException(
                status_code=409,
                detail={
                    "code": "PLAN_DOWNGRADE_BLOCKED",
                    "message": (
                        f"You currently have {active_events} "
                        f"active events, but the "
                        f"{PLAN_DETAILS[requested_plan]['name']} "
                        f"plan allows only {max_events}."
                    ),
                },
            )

    max_photos = limits["max_photos_per_event"]

    if max_photos is not None:
        oversized_event = (
            db.query(Event)
            .filter(
                Event.owner_id == user.id,
                Event.status != EventStatus.ARCHIVED,
            )
            .join(Photo, Photo.event_id == Event.id, isouter=True)
            .group_by(Event.id)
            .having(func.count(Photo.id) > max_photos)
            .first()
        )

        if oversized_event:
            raise HTTPException(
                status_code=409,
                detail={
                    "code": "PLAN_DOWNGRADE_BLOCKED",
                    "message": (
                        "At least one of your events exceeds "
                        "the photo limit of the selected plan."
                    ),
                },
            )


def subscription_response(user: User) -> dict:
    plan = normalize_plan(user.plan)

    return {
        "plan": plan,
        **PLAN_DETAILS[plan],
        "limits": PLAN_LIMITS[plan],
    }