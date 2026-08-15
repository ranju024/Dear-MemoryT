import base64
import hashlib
import hmac
import json
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ...config import (
    ESEWA_FAILURE_URL,
    ESEWA_PAYMENT_URL,
    ESEWA_PRODUCT_CODE,
    ESEWA_SECRET_KEY,
    ESEWA_STATUS_URL,
    ESEWA_SUCCESS_URL,
    FRONTEND_URL,
)
from ...database import get_db
from ...models.payment import PaymentTransaction
from ...models.user import User
from .auth import get_current_user
from ...services.subscription import (
    get_effective_plan,
    PLAN_DETAILS,
    PLAN_LIMITS,
)

router = APIRouter()


VALID_PLANS = {
    "starter",
    "creative",
    "agency",
}

PAID_PLANS = {
    "creative",
    "agency",
}
PLAN_LEVELS = {
    "starter": 0,
    "creative": 1,
    "agency": 2,
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
    plan = get_effective_plan(user)

    return {
        "plan": plan,
        **PLAN_DETAILS[plan],
        "limits": PLAN_LIMITS[plan],
        "started_at": user.plan_started_at,
        "expires_at": user.plan_expires_at,
        "is_lifetime": (
            plan == "agency"
            or plan == "starter"
        ),
    }


def generate_signature(
    fields: dict[str, str],
    signed_field_names: str,
) -> str:
    message = ",".join(
        f"{field}={fields[field]}"
        for field in signed_field_names.split(",")
    )

    digest = hmac.new(
        ESEWA_SECRET_KEY.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).digest()

    return base64.b64encode(digest).decode("utf-8")


def verify_esewa_signature(data: dict) -> bool:
    signed_field_names = data.get("signed_field_names")

    if not signed_field_names:
        return False

    fields = {}

    for field in signed_field_names.split(","):
        if field not in data:
            return False

        fields[field] = str(data[field])

    expected_signature = generate_signature(
        fields,
        signed_field_names,
    )

    received_signature = data.get("signature", "")

    return hmac.compare_digest(
        expected_signature,
        received_signature,
    )


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
    Return the authenticated user's active subscription.
    """

    return plan_response(user)


@router.post("/checkout")
async def create_checkout(
    data: PlanUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create an eSewa sandbox checkout.

    This endpoint DOES NOT activate the plan.

    The plan is activated only after eSewa payment
    verification succeeds.
    """

    requested_plan = data.plan.lower().strip()

    if requested_plan not in VALID_PLANS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid plan. Choose starter, creative, or agency."
            ),
        )

    current_plan = user.plan or "starter"

    current_level = PLAN_LEVELS[current_plan]
    requested_level = PLAN_LEVELS[requested_plan]

    if requested_plan == current_plan:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "PLAN_ALREADY_ACTIVE",
                "message": (
                    f"Your {PLAN_DETAILS[current_plan]['name']} "
                    "plan is already active."
                ),
                "plan": current_plan,
            },
        )

    if requested_level <= current_level:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "PLAN_DOWNGRADE_NOT_ALLOWED",
                "message": (
                    f"You cannot change from "
                    f"{PLAN_DETAILS[current_plan]['name']} "
                    f"to {PLAN_DETAILS[requested_plan]['name']}."
                ),
                "current_plan": current_plan,
                "requested_plan": requested_plan,
            },
        )

    if requested_plan not in PAID_PLANS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This plan does not require payment.",
        )

    amount = Decimal(
        str(PLAN_DETAILS[requested_plan]["price"])
    )

    transaction_uuid = (
        f"DM-{user.id}-{uuid.uuid4().hex[:16]}"
    )

    total_amount = f"{amount:.2f}"

    signed_field_names = (
        "total_amount,transaction_uuid,product_code"
    )

    signature = generate_signature(
        {
            "total_amount": total_amount,
            "transaction_uuid": transaction_uuid,
            "product_code": ESEWA_PRODUCT_CODE,
        },
        signed_field_names,
    )

    payment = PaymentTransaction(
        user_id=user.id,
        provider="esewa",
        transaction_uuid=transaction_uuid,
        plan=requested_plan,
        amount=amount,
        status="PENDING",
    )

    db.add(payment)
    db.commit()

    return {
        "status": "checkout_created",
        "provider": "esewa",
        "payment_url": ESEWA_PAYMENT_URL,
        "fields": {
            "amount": total_amount,
            "tax_amount": "0",
            "total_amount": total_amount,
            "transaction_uuid": transaction_uuid,
            "product_code": ESEWA_PRODUCT_CODE,
            "product_service_charge": "0",
            "product_delivery_charge": "0",
            "success_url": (
                f"{ESEWA_SUCCESS_URL}"
            ),
            "failure_url": (
                f"{ESEWA_FAILURE_URL}"
            ),
            "signed_field_names": signed_field_names,
            "signature": signature,
        },
        "plan": requested_plan,
        "plan_name": PLAN_DETAILS[requested_plan]["name"],
    }


@router.put("/me")
async def update_my_subscription(
    data: PlanUpdate,
    user: User = Depends(get_current_user),
):
    """
    Direct plan changes are forbidden.

    Paid plans must go through eSewa checkout.
    """

    requested_plan = data.plan.lower().strip()

    if requested_plan not in VALID_PLANS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid plan. Choose starter, creative, or agency."
            ),
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=(
            "Plan changes cannot be performed directly. "
            "Use the payment checkout."
        ),
    )


@router.get("/esewa/success")
async def esewa_success(
    data: str,
    db: Session = Depends(get_db),
):
    """
    eSewa redirects the browser here after payment.

    The response is Base64 encoded and signed by eSewa.
    We verify both the signature and transaction status
    before activating the user's plan.
    """

    try:
        decoded = base64.b64decode(data).decode("utf-8")
        payment_data = json.loads(decoded)
    except Exception:
        return RedirectResponse(
            f"{FRONTEND_URL}/pricing?payment=invalid"
        )

    if not verify_esewa_signature(payment_data):
        return RedirectResponse(
            f"{FRONTEND_URL}/pricing?payment=invalid"
        )

    transaction_uuid = payment_data.get(
        "transaction_uuid"
    )

    transaction = (
        db.query(PaymentTransaction)
        .filter(
            PaymentTransaction.transaction_uuid
            == transaction_uuid
        )
        .first()
    )

    if not transaction:
        return RedirectResponse(
            f"{FRONTEND_URL}/pricing?payment=not_found"
        )

    # Never process the same transaction twice.
    if transaction.status == "COMPLETE":
        return RedirectResponse(
            f"{FRONTEND_URL}/pricing?payment=success"
            f"&plan={transaction.plan}"
        )

    try:
        returned_amount = Decimal(
            str(payment_data.get("total_amount"))
        )
    except Exception:
        transaction.status = "FAILED"
        db.commit()

        return RedirectResponse(
            f"{FRONTEND_URL}/pricing?payment=invalid"
        )

    if returned_amount != Decimal(
        str(transaction.amount)
    ):
        transaction.status = "FAILED"
        db.commit()

        return RedirectResponse(
            f"{FRONTEND_URL}/pricing?payment=invalid"
        )

    if payment_data.get("product_code") != ESEWA_PRODUCT_CODE:
        transaction.status = "FAILED"
        db.commit()

        return RedirectResponse(
            f"{FRONTEND_URL}/pricing?payment=invalid"
        )

    # Verify directly against eSewa's transaction status API.
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                ESEWA_STATUS_URL,
                params={
                    "product_code": ESEWA_PRODUCT_CODE,
                    "total_amount": str(transaction.amount),
                    "transaction_uuid": transaction_uuid,
                },
            )

        response.raise_for_status()
        status_data = response.json()

    except Exception:
        transaction.status = "VERIFICATION_FAILED"
        db.commit()

        return RedirectResponse(
            f"{FRONTEND_URL}/pricing?payment=verification_failed"
        )

    esewa_status = status_data.get("status")

    if esewa_status != "COMPLETE":
        transaction.status = esewa_status or "FAILED"
        db.commit()

        return RedirectResponse(
            f"{FRONTEND_URL}/pricing?payment=failed"
        )

    # Payment is now verified.
    transaction.status = "COMPLETE"
    transaction.ref_id = status_data.get("ref_id")
    transaction.completed_at = datetime.utcnow()

    user = (
        db.query(User)
        .filter(User.id == transaction.user_id)
        .first()
    )

    if not user:
        transaction.status = "FAILED"
        db.commit()

        return RedirectResponse(
            f"{FRONTEND_URL}/pricing?payment=user_not_found"
        )

    now = datetime.utcnow()

    user.plan = transaction.plan
    user.plan_started_at = now

    if transaction.plan == "creative":
        user.plan_expires_at = now + timedelta(days=30)

    elif transaction.plan == "agency":
        # Agency is lifetime for now.
        user.plan_expires_at = None

    else:
        # Starter never expires.
        user.plan_expires_at = None

    db.commit()

    return RedirectResponse(
        f"{FRONTEND_URL}/pricing?payment=success"
        f"&plan={transaction.plan}"
    )


@router.get("/esewa/failure")
async def esewa_failure():
    """
    eSewa redirects here when payment fails or is cancelled.
    """

    return RedirectResponse(
        f"{FRONTEND_URL}/pricing?payment=failed"
    )


@router.get("/transactions/{transaction_uuid}")
async def get_transaction(
    transaction_uuid: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return the status of one of the authenticated user's
    payment transactions.
    """

    transaction = (
        db.query(PaymentTransaction)
        .filter(
            PaymentTransaction.transaction_uuid
            == transaction_uuid,
            PaymentTransaction.user_id == user.id,
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Payment transaction not found",
        )

    return {
        "transaction_uuid": transaction.transaction_uuid,
        "plan": transaction.plan,
        "amount": float(transaction.amount),
        "status": transaction.status,
        "ref_id": transaction.ref_id,
        "created_at": transaction.created_at,
        "completed_at": transaction.completed_at,
    }