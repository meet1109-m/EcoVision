import datetime
import re
from typing import Optional
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def authenticate_user(db: Session, identifier: str, password: str) -> Optional[User]:
    identifier_clean = identifier.strip()
    
    # 1. Look up by email (case-insensitive)
    user = db.query(User).filter(User.email.ilike(identifier_clean)).first()
    
    # 2. Look up by Customer / Plant ID
    if not user:
        user = db.query(User).filter(User.plant_id.ilike(identifier_clean)).first()

    # 3. Look up by Full Name / Username
    if not user:
        user = db.query(User).filter(User.full_name.ilike(identifier_clean)).first()

    # 4. Look up by numeric User ID
    if not user and identifier_clean.isdigit():
        user = db.query(User).filter(User.id == int(identifier_clean)).first()

    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def register_user(db: Session, user_in: UserRegister) -> User:
    # Validate password complexity
    pwd = user_in.password or ""
    if len(pwd) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )
    if not re.search(r"\d", pwd):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 1 number."
        )
    if not re.search(r"[^a-zA-Z0-9]", pwd):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 1 special character."
        )

    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    plant_id = user_in.plant_id.strip() if user_in.plant_id and user_in.plant_id.strip() else None
    if plant_id:
        from app.models.plant import Plant
        plant = db.query(Plant).filter(Plant.id == plant_id).first()
        if not plant:
            plant = Plant(
                id=plant_id,
                name=f"Plant {plant_id}",
                location="Industrial Facility",
                industry_type="Petrochemical & Refining",
                is_active=True,
            )
            db.add(plant)
            db.flush()

    hashed_pwd = hash_password(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role or "operator",
        plant_id=plant_id,
        is_active=True,
    )
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register user: {str(e)}"
        )


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
        token_data = TokenData(user_id=int(user_id), email=payload.get("email"), role=payload.get("role"))
    except Exception:
        return None
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None or not user.is_active:
        return None
    return user


def require_current_user(
    user: Optional[User] = Depends(get_current_user)
) -> User:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or user inactive.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
