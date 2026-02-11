"""Add home_covers table for hero slides on homepage

Revision ID: 007
Revises: 006
Create Date: 2026-02-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "home_covers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("alt_text", sa.String(200), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_home_covers_id", "home_covers", ["id"])


def downgrade() -> None:
    op.drop_index("ix_home_covers_id", table_name="home_covers")
    op.drop_table("home_covers")
