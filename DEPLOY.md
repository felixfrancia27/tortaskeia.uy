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

### Endpoint de subida de imágenes (admin/productos)

El frontend espera un endpoint para subir imágenes de productos y que queden hosteadas en el sitio por HTTPS:

- **Método:** `POST /api/admin/upload`
- **Content-Type:** `multipart/form-data`
- **Campo:** `file` (archivo imagen: JPG, PNG, etc.)
- **Respuesta esperada:** `{ "url": "/uploads/productos/abc123.jpg" }` o URL absoluta `https://api.tortaskeia.uy/uploads/...`

El backend debe guardar el archivo en disco (o en storage) y servir las imágenes por HTTPS (ej. `/uploads/` estático o CDN). La URL devuelta se guarda en el producto como `main_image` / `images`.
