from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
import os
import logging

from app.core.config import settings
from app.api import router as api_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Tortaskeia API...")
    yield
    # Shutdown
    print("Shutting down Tortaskeia API...")


app = FastAPI(
    title="Tortaskeia API",
    description="E-commerce de repostería artesanal - Uruguay",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS: orígenes permitidos (incluir puertos habituales del frontend)
_cors_origins = list(settings.allowed_origins_list) if settings.allowed_origins_list else []
for origin in ("http://localhost:4200", "http://localhost:4000", "http://localhost:4300"):
    if origin not in _cors_origins:
        _cors_origins.append(origin)


def _cors_headers_for_request(request: Request) -> dict:
    """Cabeceras CORS según el Origin de la petición."""
    origin = request.headers.get("origin")
    if origin and origin in _cors_origins:
        allow_origin = origin
    else:
        # Aceptar cualquier localhost para desarrollo
        if origin and "localhost" in origin:
            allow_origin = origin
        else:
            allow_origin = _cors_origins[0] if _cors_origins else "http://localhost:4200"
    return {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": "*",
    }


@app.middleware("http")
async def force_cors_on_all_responses(request: Request, call_next):
    """
    Añade CORS a TODAS las respuestas. Para OPTIONS (preflight) responde 200
    de inmediato con cabeceras CORS para evitar 400 por dependencias del route.
    """
    # Preflight: responder 200 con CORS sin ejecutar la ruta (evita 400 por falta de session/token)
    if request.method == "OPTIONS":
        return Response(
            status_code=200,
            headers=dict(_cors_headers_for_request(request)),
        )
    try:
        response = await call_next(request)
    except Exception as exc:
        logger.exception("Unhandled exception: %s", exc)
        response = JSONResponse(
            status_code=500,
            content={"detail": "Error interno del servidor"},
        )
    for key, value in _cors_headers_for_request(request).items():
        response.headers[key] = value
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Respuesta HTTPException con CORS."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=_cors_headers_for_request(request),
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Respuesta 500 con CORS."""
    logger.exception("Exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor"},
        headers=_cors_headers_for_request(request),
    )

# Static files for uploads
uploads_dir = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# API Routes
app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "tortaskeia-api"}
