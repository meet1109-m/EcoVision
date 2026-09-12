from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PlantBase(BaseModel):
    id: str
    name: str
    location: Optional[str] = None
    industry_type: str = "Petrochemical & Refining"
    production_capacity: Optional[str] = None
    is_active: bool = True


class PlantCreate(PlantBase):
    pass


class PlantUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    industry_type: Optional[str] = None
    production_capacity: Optional[str] = None
    is_active: Optional[bool] = None


class PlantResponse(PlantBase):
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlantSummaryResponse(BaseModel):
    plant_id: str
    name: str
    total_equipment: int
    active_hotspots: int
    open_incidents: int
    avg_risk_score: float
    avg_co2_ppm: float
    total_actions_pending: int
