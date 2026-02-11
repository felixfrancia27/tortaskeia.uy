from fastapi import APIRouter

from .routes import auth, products, categories, cart, orders, admin, payments, health, sitemap, instagram

router = APIRouter()

router.include_router(health.router, tags=["Health"])
router.include_router(instagram.router, tags=["Instagram"])
router.include_router(auth.router, prefix="/auth", tags=["Auth"])
router.include_router(products.router, prefix="/products", tags=["Products"])
router.include_router(categories.router, prefix="/categories", tags=["Categories"])
router.include_router(cart.router, prefix="/cart", tags=["Cart"])
router.include_router(orders.router, prefix="/orders", tags=["Orders"])
router.include_router(payments.router, prefix="/payments", tags=["Payments"])
router.include_router(admin.router, prefix="/admin", tags=["Admin"])
router.include_router(sitemap.router, tags=["SEO"])
