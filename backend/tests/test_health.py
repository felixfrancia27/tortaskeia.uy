import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health check endpoint."""
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_root_redirect(client: AsyncClient):
    """Test root endpoint redirects or returns info."""
    response = await client.get("/", follow_redirects=False)
    # Should either redirect or return some response
    assert response.status_code in [200, 307, 308]
