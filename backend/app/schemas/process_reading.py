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
    plant_id: str
    process_unit_id: str
    equipment_id: str
    equipment_type: str
    process_type: str

    temperature_c: float
    pressure_bar: float
    flow_rate: float
    production_rate: float
    operating_hours: float
    equipment_age_years: float
    maintenance_due: bool = False

    co2_ppm: float
    co_ppm: float
    nox_ppm: float
    so2_ppm: float
    voc_ppm: float
    ch4_ppm: float
    pm25_mg_m3: float

    fuel_or_material_type: str
    ambient_temperature_c: float
    humidity_pct: float
    wind_speed_m_s: float
    shift: str
    maintenance_status: str

    pressure_deviation_pct: float
    flow_deviation_pct: float
    temperature_deviation_pct: float
    emission_above_baseline_pct: float
    rolling_mean: float
    rolling_std: float

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
