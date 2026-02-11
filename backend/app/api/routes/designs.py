"""Public API for cake designs (Crea tu torta gallery)."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.models.cake_design import CakeDesign
from app.schemas.cake_design import CakeDesignResponse

router = APIRouter()


@router.get("", response_model=List[CakeDesignResponse])
async def list_designs(
    db: AsyncSession = Depends(get_db),
):
    """List active cake designs for the Crea tu torta gallery. Public, no auth."""
    result = await db.execute(
        select(CakeDesign)
        .where(CakeDesign.is_active == True)
        .order_by(CakeDesign.sort_order, CakeDesign.name)
    )
    return result.scalars().all()
