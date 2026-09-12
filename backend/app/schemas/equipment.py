from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class EquipmentBase(BaseModel):
    id: str
    process_unit_id: str
    plant_id: str
    equipment_type: str
    process_type: str
    equipment_age_years: float = 0.0
    maintenance_status: str = "ok"


class EquipmentCreate(EquipmentBase):
    installation_date: Optional[datetime] = None


class EquipmentUpdate(BaseModel):
    equipment_type: Optional[str] = None
    process_type: Optional[str] = None
    equipment_age_years: Optional[float] = None
    maintenance_status: Optional[str] = None
    installation_date: Optional[datetime] = None


class EquipmentResponse(EquipmentBase):
    installation_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
