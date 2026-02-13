# Deploy: Front (Vercel) + Back (Railway)

Este repo contiene **solo el frontend** (Angular en la raíz). El backend está en [tortaskeia.uy-backend](https://github.com/felixfrancia27/tortaskeia.uy-backend).

## Repos

| Repo | Contenido | Hosting |
|------|-----------|--------|
| [felixfrancia27/tortaskeia.uy](https://github.com/felixfrancia27/tortaskeia.uy) | Angular en la raíz (`src/`, `angular.json`, …) | Vercel / Railway |
| [felixfrancia27/tortaskeia.uy-backend](https://github.com/felixfrancia27/tortaskeia.uy-backend) | API FastAPI + Alembic | Railway |

## Vercel (frontend)

- **Root:** raíz del repo (no usar subcarpeta).
- **Build:** definido en `vercel.json`: `npm run build`, output `dist/tortaskeia/browser`.
- En producción, configurá la URL del backend en `src/environments/environment.prod.ts` (ej. `apiUrl: 'https://tu-app.up.railway.app/api'`).

## Railway (frontend, si lo usás)

- Build: `npm run build`
- Start: `npm run serve:static`

## Railway (backend)

- Conectar repo **tortaskeia.uy-backend**.
- Añadir PostgreSQL y variables (ver README del backend).
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
