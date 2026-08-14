from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from ..database import Base


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    provider = Column(
        String,
        nullable=False,
        default="esewa",
    )

    transaction_uuid = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    plan = Column(
        String,
        nullable=False,
    )

    amount = Column(
        Numeric(10, 2),
        nullable=False,
    )

    status = Column(
        String,
        nullable=False,
        default="PENDING",
    )

    ref_id = Column(
        String,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )

    user = relationship("User")

    def __repr__(self):
        return (
            f"<PaymentTransaction "
            f"{self.transaction_uuid} {self.status}>"
        )