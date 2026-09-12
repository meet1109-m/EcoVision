from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ActionBase(BaseModel):
    id: str
    plant_id: Optional[str] = None
    equipment_id: Optional[str] = None
    recommendation_id: Optional[str] = None
    title: str
    priority: str = Field(default="MEDIUM", description="'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'")
    impact: float
    estimatedCost: float
    feasibility: float
    status: str = Field(default="PENDING", description="'PENDING' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'")
    description: str

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ActionCreate(ActionBase):
    assigned_to_user_id: Optional[int] = None


class ActionUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[str] = None
    impact: Optional[float] = None
    estimatedCost: Optional[float] = None
    feasibility: Optional[float] = None
    status: Optional[str] = None
    description: Optional[str] = None
    assigned_to_user_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ActionStatusUpdate(BaseModel):
    status: str = Field(..., description="'PENDING' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'")


class ActionResponse(ActionBase):
    assigned_to_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
