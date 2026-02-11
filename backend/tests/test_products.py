import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.models.category import Category


@pytest.mark.asyncio
async def test_get_products_empty(client: AsyncClient):
    """Test getting products when none exist."""
    response = await client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_get_products_with_data(client: AsyncClient, test_session: AsyncSession, test_product_data):
    """Test getting products with data."""
    # Create product directly in database
    product = Product(**test_product_data)
    test_session.add(product)
    await test_session.commit()
    
    response = await client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == test_product_data["name"]


@pytest.mark.asyncio
async def test_get_product_by_slug(client: AsyncClient, test_session: AsyncSession, test_product_data):
    """Test getting a single product by slug."""
    # Create product
    product = Product(**test_product_data)
    test_session.add(product)
    await test_session.commit()
    
    response = await client.get(f"/api/products/{test_product_data['slug']}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == test_product_data["name"]
    assert data["slug"] == test_product_data["slug"]


@pytest.mark.asyncio
async def test_get_product_not_found(client: AsyncClient):
    """Test getting a product that doesn't exist."""
    response = await client.get("/api/products/nonexistent-product")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_featured_products(client: AsyncClient, test_session: AsyncSession, test_product_data):
    """Test getting featured products."""
    # Create featured product
    featured_product = Product(**{**test_product_data, "is_featured": True})
    test_session.add(featured_product)
    
    # Create non-featured product
    normal_product = Product(**{
        **test_product_data,
        "name": "Normal Product",
        "slug": "normal-product",
        "is_featured": False
    })
    test_session.add(normal_product)
    await test_session.commit()
    
    response = await client.get("/api/products/featured")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["is_featured"] is True


@pytest.mark.asyncio
async def test_search_products(client: AsyncClient, test_session: AsyncSession, test_product_data):
    """Test searching products."""
    # Create product
    product = Product(**test_product_data)
    test_session.add(product)
    await test_session.commit()
    
    # Search with matching term
    response = await client.get("/api/products?search=torta")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    
    # Search with non-matching term
    response = await client.get("/api/products?search=xyz123")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_filter_products_by_category(client: AsyncClient, test_session: AsyncSession, test_product_data, test_category_data):
    """Test filtering products by category."""
    # Create category
    category = Category(**test_category_data)
    test_session.add(category)
    await test_session.commit()
    await test_session.refresh(category)
    
    # Create product with category
    product = Product(**{**test_product_data, "category_id": category.id})
    test_session.add(product)
    await test_session.commit()
    
    # Filter by category
    response = await client.get(f"/api/products?category={test_category_data['slug']}")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
