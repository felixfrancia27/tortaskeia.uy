# Tortaskeia.uy - E-commerce de Repostería

E-commerce completo de repostería artesanal para Uruguay, construido con Angular SSR y FastAPI.

## 🏗️ Arquitectura

```
tortaskeia.uy/
├── frontend/          # Angular 19 + SSR
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Servicios, guards, interceptors
│   │   │   ├── shared/      # Componentes compartidos
│   │   │   └── pages/       # Páginas/rutas
│   │   └── styles/          # Design tokens, global styles
│   └── server.ts            # Express SSR server
├── backend/           # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/             # Endpoints
│   │   ├── core/            # Config, security
│   │   ├── db/              # Database session
│   │   ├── models/          # SQLAlchemy models
│   │   └── schemas/         # Pydantic schemas
│   ├── alembic/             # Migraciones
│   └── tests/               # Pytest tests
├── infra/             # Docker, scripts, configs
│   ├── docker-compose.yml
│   └── .env.example
└── README.md
```

## 🚀 Quick Start

### Requisitos
- Docker & Docker Compose
- Node.js 20+ (para desarrollo local frontend)
- Python 3.11+ (para desarrollo local backend)

### Levantar con Docker (Recomendado)

```bash
# Copiar variables de entorno
cp infra/.env.example infra/.env

# Levantar todos los servicios
docker-compose -f infra/docker-compose.yml up --build

# Frontend SSR: http://localhost:4000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Desarrollo Local

#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Migraciones
alembic upgrade head

# Seed data (categorías, productos, admin)
python -m app.seed

# Ejecutar servidor
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install

# Desarrollo con SSR (recomendado)
npm run dev:ssr

# Desarrollo sin SSR (más rápido para UI)
npm start

# Build producción
npm run build
```

## 📦 Tecnologías

### Frontend
- **Angular 19** con SSR (Server-Side Rendering)
- **Tailwind CSS** + CSS Variables (Design Tokens)
- **Signals** para estado reactivo
- **Lazy Loading** para rutas
- **Guards** (Auth, Admin, Guest)
- **HTTP Interceptors** para tokens

### Backend
- **FastAPI** (async)
- **SQLAlchemy 2.0** + Alembic (migraciones)
- **PostgreSQL**
- **JWT Authentication** (access + refresh tokens)
- **Mercado Pago SDK**
- **Pydantic** para validación

## 🎨 Design Tokens

Los tokens de diseño están en `frontend/src/styles/tokens.scss`:

```css
:root {
  --brand: #F7570C;        /* Naranja principal */
  --brand-dark: #D94D0A;   /* Naranja hover */
  --surface: #F9F2E7;      /* Fondo crema */
  --ink: #5D351D;          /* Marrón textos */
  --ink-light: #7A5C4A;    /* Textos secundarios */
  --whatsapp: #25D366;     /* Verde WhatsApp */
}
```

## 🔐 Variables de Entorno

Ver `infra/.env.example` para todas las variables necesarias.

### Principales
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql+asyncpg://user:pass@db/tortaskeia` |
| `JWT_SECRET` | Secreto para tokens JWT | `your-super-secret-key-min-32-chars` |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de Mercado Pago | `TEST-xxx` o `APP_USR-xxx` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:4000` |

## 📚 API Endpoints

### Auth
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login, retorna tokens |
| POST | `/api/auth/refresh` | Refrescar access token |
| GET | `/api/auth/me` | Perfil del usuario actual |
| POST | `/api/auth/forgot-password` | Recuperar contraseña |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar (con paginación, filtros) |
| GET | `/api/products/featured` | Productos destacados |
| GET | `/api/products/{slug}` | Detalle por slug |
| GET | `/api/categories` | Listar categorías |

### Carrito
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/cart` | Ver carrito actual |
| POST | `/api/cart/items` | Agregar item |
| PUT | `/api/cart/items/{id}` | Actualizar cantidad |
| DELETE | `/api/cart/items/{id}` | Eliminar item |
| DELETE | `/api/cart` | Vaciar carrito |

### Órdenes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/orders` | Crear orden |
| GET | `/api/orders` | Mis órdenes |
| GET | `/api/orders/{order_number}` | Detalle de orden |

### Pagos (Mercado Pago)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/payments/preference/{order}` | Crear preferencia de pago |
| GET | `/api/payments/status/{order}` | Estado del pago |
| POST | `/api/payments/webhook` | Webhook de MP |

### SEO
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/sitemap.xml` | Sitemap dinámico |
| GET | `/api/robots.txt` | Robots.txt |

### Admin (protegido)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/products` | Listar todos |
| POST | `/api/admin/products` | Crear producto |
| PUT | `/api/admin/products/{id}` | Actualizar |
| DELETE | `/api/admin/products/{id}` | Eliminar |
| CRUD | `/api/admin/categories` | Categorías |
| GET | `/api/admin/orders` | Todas las órdenes |
| PUT | `/api/admin/orders/{id}/status` | Cambiar estado |

## 🔍 SEO

### Features implementados
- ✅ Server-Side Rendering (SSR)
- ✅ Meta tags dinámicos (title, description)
- ✅ OpenGraph y Twitter Cards
- ✅ JSON-LD Schema.org:
  - Organization
  - LocalBusiness (Bakery)
  - Product (por producto)
  - BreadcrumbList
  - FAQPage
  - WebSite (con SearchAction)
- ✅ Sitemap.xml dinámico
- ✅ Robots.txt
- ✅ Canonical URLs
- ✅ Web App Manifest (PWA-ready)
- ✅ Preconnect/DNS-prefetch
- ✅ Critical CSS inline

### Rutas SEO-friendly
```
/                           # Home
/tienda                     # Catálogo
/tienda?categoria=tortas    # Filtro por categoría
/tortas/torta-chocolate     # Producto (slug)
/contacto                   # Contacto
```

## 💳 Mercado Pago

### Flujo de pago
1. Usuario completa checkout → Orden creada (estado: `CREADA`)
2. Click "Pagar con Mercado Pago" → Se crea preferencia
3. Redirección a checkout de MP
4. Usuario paga
5. Retorno a `/checkout/success`, `/checkout/failure`, o `/checkout/pending`
6. Webhook actualiza estado de orden automáticamente

### Estados de orden
| Estado | Descripción |
|--------|-------------|
| `creada` | Orden registrada |
| `pagando` | Procesando pago |
| `pagada` | Pago aprobado |
| `fallida` | Pago rechazado |
| `en_preparacion` | En preparación |
| `lista` | Lista para entregar |
| `entregada` | Entregada |
| `cancelada` | Cancelada |

### Configuración sandbox
```env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxx
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret
```

### Tarjetas de prueba
- Visa: `4509 9535 6623 3704` (approved)
- Mastercard: `5031 7557 3453 0604` (approved)
- CVV: `123`, Fecha: cualquier futura

## 🧪 Tests

### Backend (pytest)
```bash
cd backend
pip install -r requirements.txt

# Ejecutar todos los tests
pytest

# Con coverage
pytest --cov=app --cov-report=html

# Tests específicos
pytest tests/test_auth.py -v
pytest tests/test_products.py -v
pytest tests/test_cart.py -v
```

### Frontend (Jasmine/Karma)
```bash
cd frontend
npm install

# Ejecutar tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 👤 Usuarios de prueba

### Admin
- Email: `admin@tortaskeia.uy`
- Password: `admin123`

## 🛠️ Comandos útiles

```bash
# Docker
docker-compose -f infra/docker-compose.yml up -d      # Levantar en background
docker-compose -f infra/docker-compose.yml logs -f    # Ver logs
docker-compose -f infra/docker-compose.yml down       # Detener

# Backend
alembic revision --autogenerate -m "descripción"      # Nueva migración
alembic upgrade head                                   # Aplicar migraciones
alembic downgrade -1                                   # Revertir última

# Frontend
ng generate component pages/nueva-pagina              # Nuevo componente
npm run build                                          # Build producción
npm run build:ssr                                      # Build SSR
```

## 📁 Estructura de páginas

```
/                     → HomeComponent
/tienda               → ShopComponent
/tortas/:slug         → ProductComponent
/carrito              → CartComponent
/checkout             → CheckoutComponent (3 pasos)
/checkout/success     → SuccessComponent
/checkout/failure     → PaymentFailureComponent
/checkout/pending     → PaymentPendingComponent
/contacto             → ContactComponent
/login                → LoginComponent
/registro             → RegisterComponent
/recuperar-password   → ForgotPasswordComponent
/mis-pedidos          → MyOrdersComponent (auth)
/admin/*              → Admin panel (admin only)
```

## 🚀 Deploy

### Producción
1. Configurar variables de entorno de producción
2. Usar tokens de MP de producción (no TEST-)
3. Configurar HTTPS
4. Configurar dominio en `FRONTEND_URL` y URLs de MP
5. Build y deploy con Docker o plataforma preferida

```bash
# Build producción
docker-compose -f infra/docker-compose.prod.yml up --build -d
```

## 📄 Licencia

Privado - Tortaskeia.uy © 2026
