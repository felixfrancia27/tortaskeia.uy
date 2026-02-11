"""
Seed data for Tortaskeia
Run with: python -m app.seed
"""
import asyncio
from datetime import datetime
from decimal import Decimal

from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.core.security import get_password_hash


# Seed data - Tortas y productos uruguayos (precios en UYU)
CATEGORIES = [
    {
        "name": "Tortas Clásicas",
        "slug": "tortas-clasicas",
        "description": "Nuestras tortas tradicionales, perfectas para cualquier ocasión.",
        "sort_order": 1,
    },
    {
        "name": "Tortas Personalizadas",
        "slug": "tortas-personalizadas",
        "description": "Diseñamos la torta de tus sueños con decoraciones únicas.",
        "sort_order": 2,
    },
    {
        "name": "Boxes y Combos",
        "slug": "boxes-combos",
        "description": "Cajas con variedad de dulces y postres.",
        "sort_order": 3,
    },
    {
        "name": "Cupcakes",
        "slug": "cupcakes",
        "description": "Cupcakes decorados para eventos y celebraciones.",
        "sort_order": 4,
    },
]

PRODUCTS = [
    # Tortas Clásicas
    {
        "name": "Torta de Chocolate",
        "slug": "torta-chocolate",
        "short_description": "Deliciosa torta de chocolate con ganache",
        "description": "Nuestra clásica torta de chocolate, elaborada con cacao premium y cubierta con una suave ganache de chocolate negro. Ideal para los amantes del chocolate.",
        "price": Decimal("1200.00"),
        "stock": 10,
        "is_featured": True,
        "category_slug": "tortas-clasicas",
        "images": [
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
        ],
        "sort_order": 1,
    },
    {
        "name": "Torta de Vainilla con Frutos Rojos",
        "slug": "torta-vainilla-frutos-rojos",
        "short_description": "Suave vainilla con crema y frutos rojos frescos",
        "description": "Bizcochuelo de vainilla esponjoso, relleno de crema diplomática y coronado con fresas, arándanos y frambuesas frescas.",
        "price": Decimal("1350.00"),
        "stock": 8,
        "is_featured": True,
        "category_slug": "tortas-clasicas",
        "images": [
            "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600",
        ],
        "sort_order": 2,
    },
    {
        "name": "Torta Red Velvet",
        "slug": "torta-red-velvet",
        "short_description": "Clásica red velvet con frosting de queso crema",
        "description": "La famosa torta roja aterciopelada con el tradicional frosting de queso crema. Un sabor único y elegante.",
        "price": Decimal("1400.00"),
        "stock": 6,
        "is_featured": True,
        "category_slug": "tortas-clasicas",
        "images": [
            "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600",
        ],
        "sort_order": 3,
    },
    {
        "name": "Torta de Dulce de Leche",
        "slug": "torta-dulce-leche",
        "short_description": "Irresistible dulce de leche uruguayo",
        "description": "Bizcochuelo de vainilla empapado en tres leches, relleno y cubierto con dulce de leche artesanal uruguayo.",
        "price": Decimal("1300.00"),
        "stock": 10,
        "is_featured": True,
        "category_slug": "tortas-clasicas",
        "images": [
            "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600",
        ],
        "sort_order": 4,
    },
    # Tortas Personalizadas
    {
        "name": "Torta Personalizada - Diseño Floral",
        "slug": "torta-personalizada-floral",
        "short_description": "Decoración con flores de buttercream",
        "description": "Torta decorada a mano con hermosas flores de buttercream en los colores que elijas. Incluye mensaje personalizado.",
        "price": Decimal("1800.00"),
        "compare_price": Decimal("2000.00"),
        "stock": 5,
        "is_featured": False,
        "category_slug": "tortas-personalizadas",
        "images": [
            "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600",
        ],
        "sort_order": 1,
    },
    {
        "name": "Torta Personalizada - Temática",
        "slug": "torta-personalizada-tematica",
        "short_description": "Diseño según tu tema favorito",
        "description": "Creamos la torta perfecta para cumpleaños infantiles, eventos especiales o cualquier celebración con el tema que desees. Incluye consulta de diseño.",
        "price": Decimal("2200.00"),
        "stock": 3,
        "is_featured": False,
        "category_slug": "tortas-personalizadas",
        "images": [
            "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600",
        ],
        "sort_order": 2,
    },
    # Boxes
    {
        "name": "Box Dulce Sorpresa",
        "slug": "box-dulce-sorpresa",
        "short_description": "Caja con variedad de mini postres",
        "description": "Caja con 6 mini cupcakes, 4 alfajores de maicena, 4 trufas de chocolate y 2 brownies. Perfecta para regalar o compartir.",
        "price": Decimal("950.00"),
        "stock": 15,
        "is_featured": True,
        "category_slug": "boxes-combos",
        "images": [
            "https://images.unsplash.com/photo-1558326567-98ae2405596b?w=600",
        ],
        "sort_order": 1,
    },
    {
        "name": "Box Desayuno Especial",
        "slug": "box-desayuno-especial",
        "short_description": "Desayuno completo para sorprender",
        "description": "Incluye: medialunas, mini torta, jugo natural, café o té, mermelada casera, frutas frescas y una tarjeta personalizada.",
        "price": Decimal("1500.00"),
        "stock": 8,
        "is_featured": False,
        "category_slug": "boxes-combos",
        "images": [
            "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=600",
        ],
        "sort_order": 2,
    },
    # Cupcakes
    {
        "name": "Cupcakes Surtidos (x6)",
        "slug": "cupcakes-surtidos-6",
        "short_description": "6 cupcakes con sabores variados",
        "description": "Caja de 6 cupcakes: 2 de chocolate, 2 de vainilla y 2 de red velvet. Todos con frosting de buttercream.",
        "price": Decimal("650.00"),
        "stock": 20,
        "is_featured": False,
        "category_slug": "cupcakes",
        "images": [
            "https://images.unsplash.com/photo-1519869325930-281384f4e617?w=600",
        ],
        "sort_order": 1,
    },
    {
        "name": "Cupcakes Personalizados (x12)",
        "slug": "cupcakes-personalizados-12",
        "short_description": "12 cupcakes con diseño a elección",
        "description": "Docena de cupcakes decorados según la temática de tu evento. Incluye toppers personalizados.",
        "price": Decimal("1100.00"),
        "stock": 10,
        "is_featured": False,
        "category_slug": "cupcakes",
        "images": [
            "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600",
        ],
        "sort_order": 2,
    },
]

ADMIN_USER = {
    "email": "admin@tortaskeia.uy",
    "password": "admin123",  # Change in production!
    "full_name": "Admin Tortaskeia",
    "is_admin": True,
    "is_active": True,
    "is_verified": True,
}


async def seed_database():
    """Seed the database with initial data."""
    async with AsyncSessionLocal() as db:
        print("Starting database seed...")
        
        # Check if already seeded
        result = await db.execute(select(Category).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded, skipping...")
            return
        
        # Create admin user
        print("Creating admin user...")
        admin = User(
            email=ADMIN_USER["email"],
            hashed_password=get_password_hash(ADMIN_USER["password"]),
            full_name=ADMIN_USER["full_name"],
            is_admin=ADMIN_USER["is_admin"],
            is_active=ADMIN_USER["is_active"],
            is_verified=ADMIN_USER["is_verified"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(admin)
        
        # Create categories
        print("Creating categories...")
        category_map = {}
        for cat_data in CATEGORIES:
            category = Category(
                **cat_data,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(category)
            await db.flush()
            category_map[cat_data["slug"]] = category.id
        
        # Create products
        print("Creating products...")
        for prod_data in PRODUCTS:
            images = prod_data.pop("images", [])
            category_slug = prod_data.pop("category_slug")
            
            product = Product(
                **prod_data,
                category_id=category_map.get(category_slug),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(product)
            await db.flush()
            
            # Add images
            for i, url in enumerate(images):
                image = ProductImage(
                    product_id=product.id,
                    url=url,
                    is_main=(i == 0),
                    sort_order=i,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                db.add(image)
        
        await db.commit()
        print("Database seeded successfully!")
        print(f"   - Admin: {ADMIN_USER['email']} / {ADMIN_USER['password']}")
        print(f"   - Categories: {len(CATEGORIES)}")
        print(f"   - Products: {len(PRODUCTS)}")


if __name__ == "__main__":
    asyncio.run(seed_database())
