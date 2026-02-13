# Tortaskeia.uy - Frontend

E-commerce de repostería artesanal para Uruguay. Este repo es **solo el frontend** (Angular 19 + SSR).  
**Backend API:** [tortaskeia.uy-backend](https://github.com/felixfrancia27/tortaskeia.uy-backend) (FastAPI, deploy en Railway).

## 🏗️ Estructura

```
tortaskeia.uy/
├── frontend/           # Angular 19 + SSR
│   ├── src/
│   │   ├── app/       # core, shared, pages
│   │   └── styles/    # Design tokens, global
│   └── server.ts      # Express SSR
├── README.md
└── .gitignore
```

## 🚀 Desarrollo local

```bash
cd frontend
npm install

# Con SSR (recomendado)
npm run dev:ssr

# Sin SSR
npm start
```

La app espera la API en `http://localhost:8000/api` (configurable en `frontend/src/environments/environment.ts`). Necesitás el [backend](https://github.com/felixfrancia27/tortaskeia.uy-backend) corriendo en local o una URL de API de staging.

## 📦 Build

```bash
cd frontend
npm run build        # Build cliente
npm run build:ssr    # Build SSR
```

## 🌐 Deploy en Vercel

1. Conectar este repo a [Vercel](https://vercel.com).
2. **Root Directory:** `frontend`.
3. **Build Command:** `npm run build` (o `npm run build:ssr` si usás SSR en Vercel).
4. **Output Directory:** `dist/tortaskeia/browser` (cliente) o el que indique tu `angular.json`.
5. Variables de entorno (opcional, para reemplazar la API en build):
   - `NG_APP_API_URL` o la que uses en `environment.prod.ts` para la URL del backend (Railway).

En producción la app usa por defecto `https://api.tortaskeia.uy/api`. Para apuntar a tu backend en Railway, editá `frontend/src/environments/environment.prod.ts` y poné la URL de tu API (ej. `https://tu-app.up.railway.app/api`), o configurá la variable en Vercel y usala en el build.

## 🎨 Design Tokens

En `frontend/src/styles/tokens.scss`:

- `--brand`, `--brand-dark`, `--surface`, `--ink`, `--ink-light`, `--whatsapp`

## 📁 Rutas

- `/` Home · `/tienda` Catálogo · `/tortas/:slug` Producto · `/carrito` · `/checkout` · `/checkout/success` · `/contacto` · `/login` · `/registro` · `/mis-pedidos` · `/admin/*`

## 📄 Licencia

Privado - Tortaskeia.uy © 2026
