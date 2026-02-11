import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product


@pytest.mark.asyncio
async def test_get_empty_cart(client: AsyncClient):
    """Test getting an empty cart."""
    response = await client.get(
        "/api/cart",
        headers={"X-Session-ID": "test-session-123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_add_item_to_cart(client: AsyncClient, test_session: AsyncSession, test_product_data):
    """Test adding an item to cart."""
    # Create product first
    product = Product(**test_product_data)
    test_session.add(product)
    await test_session.commit()
    await test_session.refresh(product)
    
    # Add to cart
    response = await client.post(
        "/api/cart/items",
        json={"product_id": product.id, "quantity": 2},
        headers={"X-Session-ID": "test-session-456"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 2
    assert data["total"] == test_product_data["price"] * 2


@pytest.mark.asyncio
async def test_add_invalid_product_to_cart(client: AsyncClient):
    """Test adding a non-existent product to cart."""
    response = await client.post(
        "/api/cart/items",
        json={"product_id": 99999, "quantity": 1},
        headers={"X-Session-ID": "test-session-789"}
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_cart_item_quantity(client: AsyncClient, test_session: AsyncSession, test_product_data):
    """Test updating cart item quantity."""
    # Create product
    product = Product(**test_product_data)
    test_session.add(product)
    await test_session.commit()
    await test_session.refresh(product)
    
    session_id = "test-session-update"
    
    # Add to cart
    await client.post(
        "/api/cart/items",
        json={"product_id": product.id, "quantity": 1},
        headers={"X-Session-ID": session_id}
    )
    
    # Get cart to find item ID
    cart_response = await client.get(
        "/api/cart",
        headers={"X-Session-ID": session_id}
    )
    item_id = cart_response.json()["items"][0]["id"]
    
    # Update quantity
    response = await client.put(
        f"/api/cart/items/{item_id}",
        json={"quantity": 5},
        headers={"X-Session-ID": session_id}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["items"][0]["quantity"] == 5


@pytest.mark.asyncio
async def test_remove_cart_item(client: AsyncClient, test_session: AsyncSession, test_product_data):
    """Test removing an item from cart."""
    # Create product
    product = Product(**test_product_data)
    test_session.add(product)
    await test_session.commit()
    await test_session.refresh(product)
    
    session_id = "test-session-remove"
    
    # Add to cart
    await client.post(
        "/api/cart/items",
        json={"product_id": product.id, "quantity": 1},
        headers={"X-Session-ID": session_id}
    )
    
    # Get cart to find item ID
    cart_response = await client.get(
        "/api/cart",
        headers={"X-Session-ID": session_id}
    )
    item_id = cart_response.json()["items"][0]["id"]
    
    # Remove item
    response = await client.delete(
        f"/api/cart/items/{item_id}",
        headers={"X-Session-ID": session_id}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 0


@pytest.mark.asyncio
async def test_clear_cart(client: AsyncClient, test_session: AsyncSession, test_product_data):
    """Test clearing the entire cart."""
    # Create product
    product = Product(**test_product_data)
    test_session.add(product)
    await test_session.commit()
    await test_session.refresh(product)
    
    session_id = "test-session-clear"
    
    # Add items to cart
    await client.post(
        "/api/cart/items",
        json={"product_id": product.id, "quantity": 3},
        headers={"X-Session-ID": session_id}
    )
    
    # Clear cart
    response = await client.delete(
        "/api/cart",
        headers={"X-Session-ID": session_id}
    )
    assert response.status_code == 200
    
    # Verify cart is empty
    cart_response = await client.get(
        "/api/cart",
        headers={"X-Session-ID": session_id}
    )
    assert cart_response.json()["items"] == []
