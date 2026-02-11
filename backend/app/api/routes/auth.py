from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, ChangePassword, RefreshRequest
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    decode_token,
)
from app.api.deps import get_current_user_required

router = APIRouter()


@router.post("/register", response_model=Token)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user."""
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado",
        )
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone,
        hashed_password=get_password_hash(user_data.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Generate tokens
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """Login and get tokens."""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo",
        )
    
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using refresh_token in body."""
    payload = decode_token(body.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo",
        )
    
    new_access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)
    
    return Token(access_token=new_access_token, refresh_token=new_refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_me(
    user: User = Depends(get_current_user_required),
):
    """Get current user profile."""
    return user


@router.post("/change-password")
async def change_password(
    data: ChangePassword,
    user: User = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db),
):
    """Change password for the current user. Clears force_password_change if set."""
    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta",
        )
    user.hashed_password = get_password_hash(data.new_password)
    user.force_password_change = False
    await db.commit()
    return {"message": "Contraseña actualizada correctamente"}


@router.post("/forgot-password")
async def forgot_password(
    email_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Request password reset email."""
    email = email_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email requerido")
    
    # Find user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    # Always return success to prevent email enumeration
    if user:
        # TODO: Generate reset token and send email
        # For now, just log
        import secrets
        reset_token = secrets.token_urlsafe(32)
        # user.reset_token = reset_token
        # user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        # await db.commit()
        print(f"Password reset requested for {email}. Token: {reset_token}")
    
    return {"message": "Si el email existe, recibirás instrucciones para restablecer tu contraseña."}
