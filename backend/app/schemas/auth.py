from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class UserBase(BaseModel):
    email: str = Field(..., description="Email address or customer ID")
    full_name: Optional[str] = None
    role: str = Field(default="operator", description="Role: admin, engineer, or operator")
    plant_id: Optional[str] = None


class UserRegister(UserBase):
    password: str = Field(min_length=6, description="Plaintext user password")


class UserLogin(BaseModel):
    email: str = Field(..., description="Email address, username, or Customer ID")
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None
