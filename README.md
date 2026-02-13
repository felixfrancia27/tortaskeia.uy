# Tortaskeia.uy - Frontend

E-commerce de repostería artesanal para Uruguay. Este repo es **solo el frontend** (Angular 19 + SSR).  
**Backend API:** [tortaskeia.uy-backend](https://github.com/felixfrancia27/tortaskeia.uy-backend) (FastAPI, deploy en Railway).

## Estructura

```
tortaskeia.uy/
├── src/              # app, styles, index.html, main.ts
├── angular.json
├── package.json
├── vercel.json       # Output: dist/tortaskeia/browser
├── railway.json
└── README.md
```

## Desarrollo local

```bash
npm install
npm start             # ng serve
# o con SSR
npm run dev:ssr
```

La app espera la API en `http://localhost:8000/api` (configurable en `src/environments/environment.ts`). Necesitás el [backend](https://github.com/felixfrancia27/tortaskeia.uy-backend) corriendo en local o una URL de API de staging.

## Build

```bash
npm run build         # dist/tortaskeia/browser
npm run build:ssr     # con server
```

## Deploy en Vercel

1. Conectar este repo a [Vercel](https://vercel.com).
2. **Root Directory:** dejar vacío (el proyecto está en la raíz).
3. Vercel usa `vercel.json`: `buildCommand`, `outputDirectory: dist/tortaskeia/browser`, `installCommand: npm ci`.
4. En producción, configurá la URL del backend (Railway) en `src/environments/environment.prod.ts` o con variables de entorno en Vercel.

## Deploy en Railway

- Build: `npm run build`
- Start: `npm run serve:static` (sirve `dist/tortaskeia/browser`).

## Design tokens

En `src/styles/tokens.scss`: `--brand`, `--brand-dark`, `--surface`, `--ink`, `--whatsapp`.

## Rutas

`/` · `/tienda` · `/tortas/:slug` · `/carrito` · `/checkout` · `/checkout/success` · `/contacto` · `/login` · `/registro` · `/mis-pedidos` · `/admin/*`

## Licencia

Privado - Tortaskeia.uy © 2026
