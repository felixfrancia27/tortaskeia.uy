import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_sitemap_xml(client: AsyncClient):
    """Test sitemap.xml generation."""
    response = await client.get("/api/sitemap.xml")
    assert response.status_code == 200
    assert "application/xml" in response.headers["content-type"]
    
    content = response.text
    assert '<?xml version="1.0"' in content
    assert '<urlset' in content
    assert 'tortaskeia.uy' in content


@pytest.mark.asyncio
async def test_robots_txt(client: AsyncClient):
    """Test robots.txt generation."""
    response = await client.get("/api/robots.txt")
    assert response.status_code == 200
    assert "text/plain" in response.headers["content-type"]
    
    content = response.text
    assert "User-agent:" in content
    assert "Sitemap:" in content
    assert "Disallow: /admin/" in content
