from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional, List

from app.db.session import get_db
from app.models.product import Product, ProductImage
from app.models.category import Category
from app.schemas.product import ProductResponse, ProductListResponse

router = APIRouter()


@router.get("", response_model=ProductListResponse)
async def list_products(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    category_slug: Optional[str] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    sort_by: str = Query("sort_order", pattern="^(sort_order|price|name|created_at)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
):
    """List products with pagination and filters."""
    query = select(Product).where(Product.is_active == True).options(
        selectinload(Product.images),
        selectinload(Product.category),
    )
    
    # Filters
    if category_slug:
        query = query.join(Category).where(Category.slug == category_slug)
    
    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))
    
    if featured is not None:
        query = query.where(Product.is_featured == featured)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Sorting
    sort_column = getattr(Product, sort_by)
    if sort_order == "desc":
        sort_column = sort_column.desc()
    query = query.order_by(sort_column)
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    return ProductListResponse(
        items=[ProductResponse.model_validate(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/featured", response_model=List[ProductResponse])
async def list_featured_products(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(6, ge=1, le=20),
):
    """Get featured products."""
    query = (
        select(Product)
        .where(Product.is_active == True, Product.is_featured == True)
        .options(selectinload(Product.images))
        .order_by(Product.sort_order)
        .limit(limit)
    )
    result = await db.execute(query)
    products = result.scalars().all()
    return products


@router.get("/{slug}", response_model=ProductResponse)
async def get_product(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get product by slug."""
    query = (
        select(Product)
        .where(Product.slug == slug, Product.is_active == True)
        .options(selectinload(Product.images), selectinload(Product.category))
    )
    result = await db.execute(query)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )
    
    return product
