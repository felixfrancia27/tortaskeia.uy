"""Public API for home hero covers (portadas del inicio)."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.models.home_cover import HomeCover
from app.schemas.home_cover import HomeCoverResponse

router = APIRouter()


@router.get("", response_model=List[HomeCoverResponse])
async def list_home_covers(
    db: AsyncSession = Depends(get_db),
):
    """List active home covers for the hero carousel. Public, no auth."""
    result = await db.execute(
        select(HomeCover)
        .where(HomeCover.is_active == True)
        .order_by(HomeCover.sort_order, HomeCover.id)
    )
    return result.scalars().all()
