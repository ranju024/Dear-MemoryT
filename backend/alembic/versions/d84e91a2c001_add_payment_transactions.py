"""add payment transactions

Revision ID: d84e91a2c001
Revises: c31d7f9a8b2c
Create Date: 2026-08-14
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d84e91a2c001"

down_revision: Union[str, None] = "c31d7f9a8b2c"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "payment_transactions",

        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "provider",
            sa.String(),
            nullable=False,
        ),

        sa.Column(
            "transaction_uuid",
            sa.String(),
            nullable=False,
        ),

        sa.Column(
            "plan",
            sa.String(),
            nullable=False,
        ),

        sa.Column(
            "amount",
            sa.Numeric(10, 2),
            nullable=False,
        ),

        sa.Column(
            "status",
            sa.String(),
            nullable=False,
        ),

        sa.Column(
            "ref_id",
            sa.String(),
            nullable=True,
        ),

        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
        ),

        sa.Column(
            "completed_at",
            sa.DateTime(),
            nullable=True,
        ),

        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),

        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_payment_transactions_id",
        "payment_transactions",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_payment_transactions_user_id",
        "payment_transactions",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        "ix_payment_transactions_transaction_uuid",
        "payment_transactions",
        ["transaction_uuid"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_payment_transactions_transaction_uuid",
        table_name="payment_transactions",
    )

    op.drop_index(
        "ix_payment_transactions_user_id",
        table_name="payment_transactions",
    )

    op.drop_index(
        "ix_payment_transactions_id",
        table_name="payment_transactions",
    )

    op.drop_table("payment_transactions")