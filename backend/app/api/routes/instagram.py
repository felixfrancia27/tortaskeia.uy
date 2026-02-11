"""
Feed de Instagram para la sección Creaciones del home.
Opcional: si INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_USER_ID están configurados,
se obtienen perfil y últimas publicaciones desde la Instagram Graph API.
"""
from fastapi import APIRouter
from pydantic import BaseModel
import httpx
from app.core.config import settings

router = APIRouter()


class InstagramMediaItem(BaseModel):
    id: str
    media_url: str
    permalink: str
    caption: str | None = None
    thumbnail_url: str | None = None


class InstagramProfile(BaseModel):
    username: str
    profile_picture_url: str | None = None
    followers_count: int | None = None
    media_count: int | None = None


class InstagramFeedResponse(BaseModel):
    data: list[InstagramMediaItem]
    profile: InstagramProfile | None = None


@router.get("/instagram/feed", response_model=InstagramFeedResponse)
async def get_instagram_feed():
    """
    Devuelve perfil (seguidores, etc.) y últimas publicaciones de la cuenta de Instagram.
    Si no hay token configurado, devuelve lista vacía (el frontend usa imágenes estáticas).
    """
    token = (settings.INSTAGRAM_ACCESS_TOKEN or "").strip()
    user_id = (settings.INSTAGRAM_USER_ID or "").strip()
    if not token or not user_id:
        return InstagramFeedResponse(data=[], profile=None)

    profile: InstagramProfile | None = None
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Perfil (username, seguidores, publicaciones)
        try:
            profile_r = await client.get(
                f"https://graph.instagram.com/{user_id}",
                params={
                    "fields": "username,profile_picture_url,followers_count,media_count",
                    "access_token": token,
                },
            )
            if profile_r.is_success:
                p = profile_r.json()
                profile = InstagramProfile(
                    username=p.get("username", ""),
                    profile_picture_url=p.get("profile_picture_url"),
                    followers_count=p.get("followers_count"),
                    media_count=p.get("media_count"),
                )
        except Exception:
            pass

        # Media (últimas publicaciones)
        try:
            media_r = await client.get(
                f"https://graph.instagram.com/{user_id}/media",
                params={
                    "fields": "id,media_url,permalink,caption,thumbnail_url,media_type",
                    "access_token": token,
                    "limit": 12,
                },
            )
            media_r.raise_for_status()
            body = media_r.json()
        except (httpx.HTTPError, Exception):
            return InstagramFeedResponse(data=[], profile=profile)

    data = body.get("data") or []
    items: list[InstagramMediaItem] = []
    for node in data:
        media_type = node.get("media_type", "IMAGE")
        media_url = node.get("media_url")
        thumbnail_url = node.get("thumbnail_url") if media_type == "VIDEO" else None
        items.append(
            InstagramMediaItem(
                id=node.get("id", ""),
                media_url=media_url or "",
                permalink=node.get("permalink", ""),
                caption=(node.get("caption") or "")[:200] or None,
                thumbnail_url=thumbnail_url,
            )
        )
    return InstagramFeedResponse(data=items, profile=profile)
