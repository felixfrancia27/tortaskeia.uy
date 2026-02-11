"""Add cake_designs table for Crea tu torta gallery

Revision ID: 006
Revises: 005
Create Date: 2026-02-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "cake_designs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(200), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_cake_designs_slug", "cake_designs", ["slug"], unique=True)
    op.create_index("ix_cake_designs_id", "cake_designs", ["id"])


def downgrade() -> None:
    op.drop_index("ix_cake_designs_id", table_name="cake_designs")
    op.drop_index("ix_cake_designs_slug", table_name="cake_designs")
    op.drop_table("cake_designs")
