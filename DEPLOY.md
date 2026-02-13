# Deploy: Front (Vercel) + Back (Railway)

Este repo contiene **solo el frontend**. El backend está en [tortaskeia.uy-backend](https://github.com/felixfrancia27/tortaskeia.uy-backend).

## Cómo quedaron los repos

| Repo | Contenido | Hosting |
|------|-----------|--------|
| [felixfrancia27/tortaskeia.uy](https://github.com/felixfrancia27/tortaskeia.uy) | Solo `frontend/` (Angular) | Vercel |
| [felixfrancia27/tortaskeia.uy-backend](https://github.com/felixfrancia27/tortaskeia.uy-backend) | API FastAPI + Alembic | Railway |

## Si todavía tenés backend/infra en tu copia local

Para subir el backend al repo separado **una sola vez**:

1. Entrá a la carpeta del backend (sigue en tu disco como `backend/` dentro de este proyecto).
2. Inicializá git y conectalo al repo del backend:

   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend - Tortaskeia API"
   git branch -M main
   git remote add origin https://github.com/felixfrancia27/tortaskeia.uy-backend.git
   git push -u origin main
   ```

3. Volvé al repo principal (tortaskeia.uy) y confirmá que `backend/` e `infra/` estén en `.gitignore` y que ya no estén en el índice de git. Si aún aparecen en `git status`, ejecutá:

   ```bash
   git rm -r --cached backend infra
   git commit -m "Separar frontend: quitar backend e infra del repo"
   git push
   ```

Después de eso, en **tortaskeia.uy** solo se trackea el frontend y en **tortaskeia.uy-backend** solo el backend.

## Vercel (frontend)

- Root: `frontend`
- Build: `npm run build` (o `npm run build:ssr` según cómo quieras servir)
- En producción, que la API apunte a la URL de Railway (ej. en `frontend/src/environments/environment.prod.ts`: `apiUrl: 'https://tu-app.up.railway.app/api'`).

## Railway (backend)

- Conectar repo **tortaskeia.uy-backend**.
- Añadir PostgreSQL y configurar variables (ver README del backend).
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
