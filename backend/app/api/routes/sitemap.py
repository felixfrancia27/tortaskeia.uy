from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import xml.etree.ElementTree as ET

from app.db.session import get_db
from app.models.product import Product
from app.models.category import Category
from app.core.config import settings

router = APIRouter()

# Base URL for the site
BASE_URL = "https://tortaskeia.uy"


def create_url_element(urlset: ET.Element, loc: str, lastmod: str = None, changefreq: str = "weekly", priority: str = "0.5"):
    """Create a <url> element for the sitemap."""
    url = ET.SubElement(urlset, "url")
    ET.SubElement(url, "loc").text = loc
    if lastmod:
        ET.SubElement(url, "lastmod").text = lastmod
    ET.SubElement(url, "changefreq").text = changefreq
    ET.SubElement(url, "priority").text = priority


@router.get("/sitemap.xml")
async def sitemap(db: AsyncSession = Depends(get_db)):
    """Generate dynamic XML sitemap."""
    
    # Create root element with proper namespace
    urlset = ET.Element("urlset")
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")
    urlset.set("xmlns:image", "http://www.google.com/schemas/sitemap-image/1.1")
    
    today = datetime.now().strftime("%Y-%m-%d")
    
    # Static pages
    static_pages = [
        {"loc": f"{BASE_URL}/", "priority": "1.0", "changefreq": "daily"},
        {"loc": f"{BASE_URL}/tienda", "priority": "0.9", "changefreq": "daily"},
        {"loc": f"{BASE_URL}/contacto", "priority": "0.7", "changefreq": "monthly"},
        {"loc": f"{BASE_URL}/login", "priority": "0.3", "changefreq": "yearly"},
        {"loc": f"{BASE_URL}/registro", "priority": "0.3", "changefreq": "yearly"},
    ]
    
    for page in static_pages:
        create_url_element(
            urlset,
            loc=page["loc"],
            lastmod=today,
            changefreq=page["changefreq"],
            priority=page["priority"]
        )
    
    # Categories
    categories_result = await db.execute(
        select(Category).where(Category.is_active == True)
    )
    categories = categories_result.scalars().all()
    
    for category in categories:
        create_url_element(
            urlset,
            loc=f"{BASE_URL}/tienda?categoria={category.slug}",
            lastmod=today,
            changefreq="weekly",
            priority="0.8"
        )
    
    # Products
    products_result = await db.execute(
        select(Product).where(Product.is_active == True)
    )
    products = products_result.scalars().all()
    
    for product in products:
        # Create product URL with image sitemap extension
        url = ET.SubElement(urlset, "url")
        ET.SubElement(url, "loc").text = f"{BASE_URL}/tortas/{product.slug}"
        
        if product.updated_at:
            ET.SubElement(url, "lastmod").text = product.updated_at.strftime("%Y-%m-%d")
        else:
            ET.SubElement(url, "lastmod").text = today
            
        ET.SubElement(url, "changefreq").text = "weekly"
        ET.SubElement(url, "priority").text = "0.8" if product.is_featured else "0.6"
        
        # Add image if available
        if product.main_image:
            image = ET.SubElement(url, "{http://www.google.com/schemas/sitemap-image/1.1}image")
            ET.SubElement(image, "{http://www.google.com/schemas/sitemap-image/1.1}loc").text = product.main_image
            ET.SubElement(image, "{http://www.google.com/schemas/sitemap-image/1.1}title").text = product.name
    
    # Generate XML string
    xml_declaration = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content = ET.tostring(urlset, encoding="unicode")
    
    return Response(
        content=xml_declaration + xml_content,
        media_type="application/xml"
    )


@router.get("/robots.txt")
async def robots_txt():
    """Serve robots.txt file."""
    content = f"""User-agent: *
Allow: /

# Disallow admin and checkout paths
Disallow: /admin/
Disallow: /checkout/
Disallow: /carrito
Disallow: /mis-pedidos
Disallow: /api/

# Sitemap location
Sitemap: {BASE_URL}/sitemap.xml

# Crawl-delay for polite bots
Crawl-delay: 1
"""
    return Response(content=content, media_type="text/plain")
