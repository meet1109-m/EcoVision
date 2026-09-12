from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class RecommendationBase(BaseModel):
    id: str
    plant_id: Optional[str] = None
    equipment_id: Optional[str] = None
    title: str
    description: str
    co2Reduction: float
    costReduction: float
    environmental: float
    economic: float
    circularity: float
    feasibility: float
    isAIRecommended: bool = False
    status: str = "active"

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class RecommendationCreate(RecommendationBase):
    pass


class RecommendationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    co2Reduction: Optional[float] = None
    costReduction: Optional[float] = None
    environmental: Optional[float] = None
    economic: Optional[float] = None
    circularity: Optional[float] = None
    feasibility: Optional[float] = None
    status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class RecommendationResponse(RecommendationBase):
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
