from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from slugify import slugify
import os
import uuid
import aiofiles

from app.db.session import get_db
from app.models.user import User
from app.models.product import Product, ProductImage
from app.models.category import Category
from app.models.order import Order, OrderStatus
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.api.deps import get_admin_user
from app.core.config import settings

router = APIRouter()


# =====================
# PRODUCTS
# =====================

@router.get("/products", response_model=List[ProductResponse])
async def admin_list_products(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """List all products (including inactive)."""
    query = select(Product).options(selectinload(Product.images)).order_by(Product.sort_order)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/products", response_model=ProductResponse)
async def admin_create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Create a new product."""
    slug = product_data.slug or slugify(product_data.name)
    
    # Check slug unique
    existing = await db.execute(select(Product).where(Product.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{uuid.uuid4().hex[:4]}"
    
    product = Product(
        name=product_data.name,
        slug=slug,
        description=product_data.description,
        short_description=product_data.short_description,
        price=product_data.price,
        compare_price=product_data.compare_price,
        sku=product_data.sku,
        stock=product_data.stock,
        is_active=product_data.is_active,
        is_featured=product_data.is_featured,
        sort_order=product_data.sort_order,
        meta_title=product_data.meta_title,
        meta_description=product_data.meta_description,
        category_id=product_data.category_id,
    )
    db.add(product)
    await db.flush()
    
    # Add images
    if product_data.images:
        for i, url in enumerate(product_data.images):
            img = ProductImage(
                product_id=product.id,
                url=url,
                is_main=(i == 0),
                sort_order=i,
            )
            db.add(img)
    
    await db.commit()
    await db.refresh(product)
    
    result = await db.execute(
        select(Product).where(Product.id == product.id).options(selectinload(Product.images))
    )
    return result.scalar_one()


@router.get("/products/{product_id}", response_model=ProductResponse)
async def admin_get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Get a single product by ID."""
    result = await db.execute(
        select(Product).where(Product.id == product_id).options(selectinload(Product.images))
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product


@router.put("/products/{product_id}", response_model=ProductResponse)
async def admin_update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Update a product."""
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    
    result = await db.execute(
        select(Product).where(Product.id == product.id).options(selectinload(Product.images))
    )
    return result.scalar_one()


@router.delete("/products/{product_id}")
async def admin_delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Delete a product."""
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    await db.delete(product)
    await db.commit()
    return {"status": "deleted"}


# =====================
# CATEGORIES
# =====================

@router.get("/categories", response_model=List[CategoryResponse])
async def admin_list_categories(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """List all categories."""
    query = select(Category).order_by(Category.sort_order)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/categories", response_model=CategoryResponse)
async def admin_create_category(
    category_data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Create a new category."""
    slug = category_data.slug or slugify(category_data.name)
    
    category = Category(
        name=category_data.name,
        slug=slug,
        description=category_data.description,
        image_url=category_data.image_url,
        is_active=category_data.is_active,
        sort_order=category_data.sort_order,
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def admin_update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Update a category."""
    category = await db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    await db.commit()
    await db.refresh(category)
    return category


@router.delete("/categories/{category_id}")
async def admin_delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Delete a category."""
    category = await db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    
    await db.delete(category)
    await db.commit()
    return {"status": "deleted"}


# =====================
# ORDERS
# =====================

@router.get("/orders", response_model=List[OrderResponse])
async def admin_list_orders(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
    status_filter: OrderStatus = None,
):
    """List all orders."""
    query = select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc())
    if status_filter:
        query = query.where(Order.status == status_filter)
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def admin_update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Update order status."""
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    order.status = status_update.status
    if status_update.internal_notes:
        order.internal_notes = status_update.internal_notes
    
    await db.commit()
    await db.refresh(order)
    
    result = await db.execute(
        select(Order).where(Order.id == order.id).options(selectinload(Order.items))
    )
    return result.scalar_one()


# =====================
# UPLOADS
# =====================

@router.post("/upload")
async def admin_upload_file(
    file: UploadFile = File(...),
    admin: User = Depends(get_admin_user),
):
    """Upload a file (image)."""
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Tipo de archivo no permitido. Use: jpg, png, webp, gif",
        )
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    
    filepath = os.path.join(upload_dir, filename)
    
    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    return {"url": f"/uploads/{filename}"}
