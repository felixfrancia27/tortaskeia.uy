"""Orders status: use PostgreSQL ENUM orderstatus

Revision ID: 004
Revises: 003
Create Date: 2026-02-11

Resuelve: type "orderstatus" does not exist.
La migración 001 creó orders.status como VARCHAR; el modelo usa Enum(OrderStatus).
"""
from typing import Sequence, Union

from alembic import op


revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ORDERSTATUS_ENUM_NAME = "orderstatus"
ORDERSTATUS_VALUES = (
    "creada",
    "pagando",
    "pagada",
    "fallida",
    "en_preparacion",
    "lista",
    "entregada",
    "cancelada",
)


def upgrade() -> None:
    # Crear el tipo ENUM en PostgreSQL
    op.execute(
        f"CREATE TYPE {ORDERSTATUS_ENUM_NAME} AS ENUM ({', '.join(repr(v) for v in ORDERSTATUS_VALUES)})"
    )
    # Cambiar la columna de VARCHAR a orderstatus (los valores ya son compatibles)
    op.execute(
        f"ALTER TABLE orders ALTER COLUMN status TYPE {ORDERSTATUS_ENUM_NAME} USING status::{ORDERSTATUS_ENUM_NAME}"
    )


def downgrade() -> None:
    # Volver a VARCHAR(20)
    op.execute("ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(20) USING status::text")
    op.execute(f"DROP TYPE {ORDERSTATUS_ENUM_NAME}")
