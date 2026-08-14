from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.user import User
from .auth import get_current_user


router = APIRouter()


VALID_PLANS = {
    "starter",
    "creative",
    "agency",
}


PLAN_DETAILS = {
    "starter": {
        "name": "Starter",
        "price": 0,
        "description": "Free plan with watermarked downloads.",
        "features": [
            "1 active event",
            "Up to 250 photos",
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


class PlanUpdate(BaseModel):
    plan: str


def plan_response(user: User):
    plan = user.plan or "starter"

    return {
        "plan": plan,
        **PLAN_DETAILS[plan],
    }


@router.get("/plans")
async def get_plans():
    """
    Public list of available subscription plans.
    """
    return {
        "plans": [
            {
                "id": plan_id,
                **details,
            }
            for plan_id, details in PLAN_DETAILS.items()
        ]
    }


@router.get("/me")
async def get_my_subscription(
    user: User = Depends(get_current_user),
):
    """
    Return the authenticated user's current subscription.
    """
    return plan_response(user)


@router.put("/me")
async def update_my_subscription(
    data: PlanUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Change the current user's plan.

    This is currently for local testing.
    Payment verification will be added later.
    """

    requested_plan = data.plan.lower().strip()

    if requested_plan not in VALID_PLANS:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid plan. Choose one of: "
                "starter, creative, agency"
            ),
        )

    user.plan = requested_plan

    db.commit()
    db.refresh(user)

    return plan_response(user)