from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from app.services.auth_service import (
    register_user,
    authenticate_user,
    create_access_token,
    require_current_user,
)
from app.config import settings

router = APIRouter(tags=["Authentication"])


@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@router.post("/api/v1/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new user (admin, engineer, or operator)."""
    return register_user(db, user_in)


@router.post("/auth/login", response_model=Token)
@router.post("/api/v1/auth/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user credentials and generate JWT bearer token."""
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user,
    )


@router.get("/auth/me", response_model=UserResponse)
@router.get("/api/v1/auth/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(require_current_user)):
    """Get authenticated user's profile."""
    return user
