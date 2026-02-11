# Migraciones de base de datos (Alembic)

## Aplicar migraciones

Con Docker (recomendado; ya se ejecuta al iniciar el backend):

```bash
# Desde la raíz del monorepo
cd infra
docker compose up -d backend
# El backend ejecuta: alembic upgrade head && python -m app.seed && uvicorn ...
```

Aplicar migraciones manualmente dentro del contenedor:

```bash
docker compose exec backend alembic upgrade head
```

En local (con PostgreSQL y variables de entorno configuradas):

```bash
cd backend
alembic upgrade head
```

## Migraciones disponibles

- **001**: Tablas iniciales (users, categories, products, product_images, carts, cart_items, orders, order_items). `orders.status` como VARCHAR.
- **002**: Cart items con `product_id` nullable y campos custom (tortas personalizadas).
- **003**: Columna `users.force_password_change`.
- **004**: Tipo PostgreSQL ENUM `orderstatus` y columna `orders.status` como ENUM.

Si ves errores como `type "orderstatus" does not exist` o `column users.force_password_change does not exist`, aplica las migraciones con `alembic upgrade head`.
