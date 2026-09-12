from typing import Generic, TypeVar, List, Optional, Any, Dict
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int


class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    database: str
    ml_model: str
    version: str = "1.0.0"
    environment: str = "development"
    dialect: Optional[str] = None
    database_detail: Optional[Dict[str, Any]] = None
