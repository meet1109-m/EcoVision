from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class IncidentBase(BaseModel):
    plant_id: str
    equipment_id: str
    reading_id: Optional[int] = None
    incident_label: int
    risk_class: str
    risk_score: float
    leak_severity: str
    leak_location: str
    confirmed_by: str = "sensor"
    status: str = "OPEN"
    description: Optional[str] = None


class IncidentCreate(IncidentBase):
    detected_at: Optional[datetime] = None


class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None
    resolved_at: Optional[datetime] = None


class IncidentResponse(IncidentBase):
    id: int
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
