"""Cart items: product_id nullable + custom fields for torta personalizada

Revision ID: 002
Revises: 001
Create Date: 2026-02-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "cart_items",
        "product_id",
        existing_type=sa.Integer(),
        nullable=True,
    )
    op.add_column("cart_items", sa.Column("custom_name", sa.String(200), nullable=True))
    op.add_column("cart_items", sa.Column("custom_price", sa.Numeric(10, 2), nullable=True))
    op.add_column("cart_items", sa.Column("custom_image", sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column("cart_items", "custom_image")
    op.drop_column("cart_items", "custom_price")
    op.drop_column("cart_items", "custom_name")
    op.alter_column(
        "cart_items",
        "product_id",
        existing_type=sa.Integer(),
        nullable=False,
    )
