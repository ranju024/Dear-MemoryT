"""add user subscription plan

Revision ID: c31d7f9a8b2c
Revises: b725bf9dbfdc
Create Date: 2026-08-14
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c31d7f9a8b2c"
down_revision: Union[str, None] = "b725bf9dbfdc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "plan",
            sa.String(),
            nullable=False,
            server_default="starter",
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "plan")