"""Normalizar valores de ENUM orderstatus a MAYÚSCULAS

Revision ID: 005
Revises: 004
Create Date: 2026-02-11

Esta migración ajusta el tipo PostgreSQL ENUM `orderstatus` para que sus
valores coincidan con lo que espera SQLAlchemy cuando usamos Enum(OrderStatus),
que por defecto usa los nombres del Enum (CREADA, PAGANDO, etc.).
"""
from typing import Sequence, Union

from alembic import op


revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Renombrar valores del ENUM de minúsculas (creada, ...) a MAYÚSCULAS (CREADA, ...)
    # Esto hace que coincidan con los nombres del Enum OrderStatus en Python.
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'creada' TO 'CREADA'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'pagando' TO 'PAGANDO'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'pagada' TO 'PAGADA'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'fallida' TO 'FALLIDA'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'en_preparacion' TO 'EN_PREPARACION'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'lista' TO 'LISTA'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'entregada' TO 'ENTREGADA'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'cancelada' TO 'CANCELADA'")


def downgrade() -> None:
    # Volver a minúsculas si se revierte esta migración
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'CREADA' TO 'creada'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'PAGANDO' TO 'pagando'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'PAGADA' TO 'pagada'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'FALLIDA' TO 'fallida'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'EN_PREPARACION' TO 'en_preparacion'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'LISTA' TO 'lista'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'ENTREGADA' TO 'entregada'")
    op.execute("ALTER TYPE orderstatus RENAME VALUE 'CANCELADA' TO 'cancelada'")

