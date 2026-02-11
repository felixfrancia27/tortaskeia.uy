from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List
from slugify import slugify
from decimal import Decimal
import os
import uuid
import aiofiles

from app.db.session import get_db
from app.models.user import User
from app.models.product import Product, ProductImage
from app.models.category import Category
from app.models.order import Order, OrderStatus
from app.models.cake_design import CakeDesign
from app.models.home_cover import HomeCover
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.schemas.user import UserResponse, UserUpdateAdmin
from app.schemas.cake_design import CakeDesignCreate, CakeDesignUpdate, CakeDesignResponse
from app.schemas.home_cover import HomeCoverCreate, HomeCoverUpdate, HomeCoverResponse
from app.api.deps import get_admin_user
from app.core.config import settings

router = APIRouter()


# =====================
# DASHBOARD STATS
# =====================

@router.get("/stats")
async def admin_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Stats for admin dashboard: products, orders, pending, revenue, users, low stock."""
    products_count = await db.scalar(select(func.count(Product.id)))
    orders_count = await db.scalar(select(func.count(Order.id)))
    users_count = await db.scalar(select(func.count(User.id)))
    pending = await db.scalar(
        select(func.count(Order.id)).where(
            Order.status.in_([
                OrderStatus.CREADA,
                OrderStatus.PAGANDO,
                OrderStatus.PAGADA,
                OrderStatus.EN_PREPARACION,
                OrderStatus.LISTA,
            ])
        )
    )
    revenue_result = await db.execute(
        select(func.coalesce(func.sum(Order.total), 0)).where(
            Order.status.in_([OrderStatus.PAGADA, OrderStatus.ENTREGADA])
        )
    )
    revenue = revenue_result.scalar() or Decimal("0")
    low_stock = await db.scalar(select(func.count(Product.id)).where(Product.stock <= 3))
    return {
        "total_products": products_count or 0,
        "total_orders": orders_count or 0,
        "pending_orders": pending or 0,
        "total_revenue": float(revenue),
        "total_users": users_count or 0,
        "low_stock_products": low_stock or 0,
    }


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
    limit: int | None = None,
):
    """List all orders. Optional limit for dashboard."""
    query = select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc())
    if status_filter:
        query = query.where(Order.status == status_filter)
    if limit:
        query = query.limit(limit)
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
# USERS
# =====================

@router.get("/users", response_model=List[UserResponse])
async def admin_list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """List all users (admin only)."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.patch("/users/{user_id}", response_model=UserResponse)
async def admin_update_user(
    user_id: int,
    data: UserUpdateAdmin,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Update user is_active and/or is_admin (admin only). Cannot demote yourself."""
    if user_id == admin.id and data.is_admin is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No podés quitarte el rol de administrador",
        )
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.is_admin is not None:
        user.is_admin = data.is_admin
    await db.commit()
    await db.refresh(user)
    return user


# =====================
# CAKE DESIGNS (Crea tu torta)
# =====================

@router.get("/designs", response_model=List[CakeDesignResponse])
async def admin_list_designs(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """List all cake designs (admin)."""
    result = await db.execute(
        select(CakeDesign).order_by(CakeDesign.sort_order, CakeDesign.name)
    )
    return result.scalars().all()


@router.post("/designs", response_model=CakeDesignResponse)
async def admin_create_design(
    data: CakeDesignCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Create a cake design."""
    slug = data.slug or slugify(data.name)
    existing = await db.execute(select(CakeDesign).where(CakeDesign.slug == slug))
    if existing.scalar_one_or_none():
        slug = f"{slug}-{uuid.uuid4().hex[:4]}"
    design = CakeDesign(
        name=data.name,
        slug=slug,
        image_url=data.image_url,
        description=data.description,
        sort_order=data.sort_order,
        is_active=data.is_active,
    )
    db.add(design)
    await db.commit()
    await db.refresh(design)
    return design


@router.get("/designs/{design_id}", response_model=CakeDesignResponse)
async def admin_get_design(
    design_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Get one design."""
    design = await db.get(CakeDesign, design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Diseño no encontrado")
    return design


@router.put("/designs/{design_id}", response_model=CakeDesignResponse)
async def admin_update_design(
    design_id: int,
    data: CakeDesignUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Update a cake design."""
    design = await db.get(CakeDesign, design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Diseño no encontrado")
    if data.name is not None:
        design.name = data.name
    if data.slug is not None:
        design.slug = data.slug
    if data.image_url is not None:
        design.image_url = data.image_url
    if data.description is not None:
        design.description = data.description
    if data.sort_order is not None:
        design.sort_order = data.sort_order
    if data.is_active is not None:
        design.is_active = data.is_active
    await db.commit()
    await db.refresh(design)
    return design


@router.delete("/designs/{design_id}")
async def admin_delete_design(
    design_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Delete a cake design."""
    design = await db.get(CakeDesign, design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Diseño no encontrado")
    await db.delete(design)
    await db.commit()
    return {"status": "deleted"}


# =====================
# HOME COVERS (Portadas del inicio)
# =====================

@router.get("/home-covers", response_model=List[HomeCoverResponse])
async def admin_list_home_covers(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """List all home hero covers (admin)."""
    result = await db.execute(
        select(HomeCover).order_by(HomeCover.sort_order, HomeCover.id)
    )
    return result.scalars().all()


@router.post("/home-covers", response_model=HomeCoverResponse)
async def admin_create_home_cover(
    data: HomeCoverCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Create a home cover."""
    cover = HomeCover(
        image_url=data.image_url,
        alt_text=data.alt_text,
        sort_order=data.sort_order,
        is_active=data.is_active,
    )
    db.add(cover)
    await db.commit()
    await db.refresh(cover)
    return cover


@router.get("/home-covers/{cover_id}", response_model=HomeCoverResponse)
async def admin_get_home_cover(
    cover_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Get one home cover."""
    cover = await db.get(HomeCover, cover_id)
    if not cover:
        raise HTTPException(status_code=404, detail="Portada no encontrada")
    return cover


@router.put("/home-covers/{cover_id}", response_model=HomeCoverResponse)
async def admin_update_home_cover(
    cover_id: int,
    data: HomeCoverUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Update a home cover."""
    cover = await db.get(HomeCover, cover_id)
    if not cover:
        raise HTTPException(status_code=404, detail="Portada no encontrada")
    if data.image_url is not None:
        cover.image_url = data.image_url
    if data.alt_text is not None:
        cover.alt_text = data.alt_text
    if data.sort_order is not None:
        cover.sort_order = data.sort_order
    if data.is_active is not None:
        cover.is_active = data.is_active
    await db.commit()
    await db.refresh(cover)
    return cover


@router.delete("/home-covers/{cover_id}")
async def admin_delete_home_cover(
    cover_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Delete a home cover."""
    cover = await db.get(HomeCover, cover_id)
    if not cover:
        raise HTTPException(status_code=404, detail="Portada no encontrada")
    await db.delete(cover)
    await db.commit()
    return {"status": "deleted"}


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
