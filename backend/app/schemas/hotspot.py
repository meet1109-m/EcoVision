from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class HotspotBase(BaseModel):
    id: str
    plant_id: str
    equipment_id: str
    equipment: str
    riskScore: float
    status: str = Field(default="NORMAL", description="'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL'")
    probability: float
    emission: float
    probableCause: str
    detectedSignals: List[str] = Field(default_factory=list)
    recommendedAction: str
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class HotspotCreate(HotspotBase):
    pass


class HotspotUpdate(BaseModel):
    riskScore: Optional[float] = None
    status: Optional[str] = None
    probability: Optional[float] = None
    emission: Optional[float] = None
    probableCause: Optional[str] = None
    detectedSignals: Optional[List[str]] = None
    recommendedAction: Optional[str] = None
    is_active: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class HotspotResponse(HotspotBase):
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
