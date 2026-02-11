from pydantic_settings import BaseSettings
from typing import List
import json


def _parse_origins(v: str) -> List[str]:
    """Convierte CORS_ORIGINS a lista: acepta "a,b,c" o JSON ["a","b","c"]."""
    if not v or not str(v).strip():
        return ["http://localhost:4000", "http://localhost:4200"]
    s = str(v).strip()
    if s.startswith("["):
        try:
            return list(json.loads(s))
        except (json.JSONDecodeError, TypeError):
            pass
    return [x.strip() for x in s.split(",") if x.strip()]


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://tortaskeia:tortaskeia_dev_2026@localhost:5432/tortaskeia"
    
    # JWT
    JWT_SECRET: str = "dev-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS: usamos CORS_ORIGINS (string) para evitar que pydantic-settings intente JSON con ALLOWED_ORIGINS
    FRONTEND_URL: str = "http://localhost:4000"
    cors_origins: str = "http://localhost:4000,http://localhost:4200"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Lista de orígenes CORS (parseada desde cors_origins)."""
        return _parse_origins(self.cors_origins)
    
    # Mercado Pago
    MERCADOPAGO_ACCESS_TOKEN: str = ""
    MERCADOPAGO_PUBLIC_KEY: str = ""
    MERCADOPAGO_WEBHOOK_SECRET: str = ""
    MERCADOPAGO_SUCCESS_URL: str = "http://localhost:4000/checkout/success"
    MERCADOPAGO_FAILURE_URL: str = "http://localhost:4000/checkout/failure"
    MERCADOPAGO_PENDING_URL: str = "http://localhost:4000/checkout/pending"
    
    # Storage
    STORAGE_TYPE: str = "local"
    UPLOAD_DIR: str = "uploads"

    # Logging
    LOG_LEVEL: str = "INFO"

    # Email
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""

    # Instagram (opcional: para mostrar últimas publicaciones en el home)
    INSTAGRAM_ACCESS_TOKEN: str = ""
    INSTAGRAM_USER_ID: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
