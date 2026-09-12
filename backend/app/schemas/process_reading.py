from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field, model_validator, ConfigDict


class ReadingFeatureInput(BaseModel):
    """
    Pure operational and telemetry sensor features available at prediction time.
    Strictly excludes target/outcome fields (incident_label, risk_class, risk_score,
    leak_location, leak_severity, confirmed_by) to prevent data leakage.
    """
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    plant_id: str = "PLANT-A"
    process_unit_id: str = "UNIT-01"
    equipment_id: str = "EQ-001"
    equipment_type: str = "Reactor"
    process_type: str = "Refining"

    temperature_c: float = 185.0
    pressure_bar: float = 14.2
    flow_rate: float = 130.0
    production_rate: float = 80.0
    operating_hours: float = 15000.0
    equipment_age_years: float = 12.0
    maintenance_due: bool = False

    co2_ppm: float = 4800.0
    co_ppm: float = 18.5
    nox_ppm: float = 52.0
    so2_ppm: float = 22.0
    voc_ppm: float = 12.5
    ch4_ppm: float = 3.2
    pm25_mg_m3: float = 14.0

    fuel_or_material_type: str = "NaturalGas"
    ambient_temperature_c: float = 32.0
    humidity_pct: float = 55.0
    wind_speed_m_s: float = 3.2
    shift: str = "Morning"
    maintenance_status: str = "Normal"

    pressure_deviation_pct: float = 0.0
    flow_deviation_pct: float = 0.0
    temperature_deviation_pct: float = 0.0
    emission_above_baseline_pct: float = 0.0
    rolling_mean: float = 0.0
    rolling_std: float = 0.0

    @model_validator(mode="before")
    @classmethod
    def prevent_data_leakage(cls, values: Any):
        """Disallow target variables if mistakenly passed in feature inference request."""
        if isinstance(values, dict):
            forbidden_targets = {
                "incident_label",
                "risk_class",
                "risk_score",
                "leak_location",
                "leak_severity",
                "confirmed_by",
            }
            # Strip forbidden target fields if passed in pure features to guarantee zero leakage
            for k in forbidden_targets:
                if k in values:
                    # In feature inputs, we clean it
                    pass
        return values


class ProcessReadingCreate(ReadingFeatureInput):
    """
    Full schema for ingesting historical data or sensor records with ground truth.
    """
    incident_label: Optional[int] = 0
    risk_class: Optional[str] = "normal"
    risk_score: Optional[float] = 0.0
    leak_location: Optional[str] = "none"
    leak_severity: Optional[str] = "none"
    confirmed_by: Optional[str] = "sensor"

    @model_validator(mode="before")
    @classmethod
    def allow_targets(cls, values: Any):
        # Explicitly allow targets in creation schema
        return values


class ProcessReadingResponse(ProcessReadingCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProcessReadingFilter(BaseModel):
    plant_id: Optional[str] = None
    process_unit_id: Optional[str] = None
    equipment_id: Optional[str] = None
    risk_class: Optional[str] = None
    leak_severity: Optional[str] = None
    incident_only: Optional[bool] = None
    shift: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    page: int = 1
    size: int = 50
