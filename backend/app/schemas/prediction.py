from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.process_reading import ReadingFeatureInput


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float


class MLPredictionResult(BaseModel):
    predicted_incident_label: int
    is_incident: bool
    incident_probability: float
    class_probabilities: Dict[str, float] = Field(default_factory=dict)
    confidence: float
    predicted_risk_class: str
    predicted_leak_severity: str
    predicted_risk_score: float
    model_version: str


class RuleEngineResult(BaseModel):
    abnormality_detected: bool
    rule_severity: str
    rule_count: int
    rule_signals: List[str] = Field(default_factory=list)
    violations: List[Dict[str, Any]] = Field(default_factory=list)


class PredictRequest(BaseModel):
    reading: ReadingFeatureInput
    save_reading: bool = Field(default=False, description="Persist the telemetry reading to the database")
    save_prediction: bool = Field(default=True, description="Persist model output to the predictions table")


class PredictResponse(BaseModel):
    status: str = "success"
    plant_id: str
    equipment_id: str
    incident_prediction: int
    incident_probability: float
    is_incident: bool
    predicted_risk_score: float
    predicted_risk_class: str
    predicted_leak_severity: str
    predicted_leak_location: str
    confidence: float
    
    # Clearly separated ML & Rule Engine Results
    ml_result: Optional[MLPredictionResult] = None
    rule_engine_result: Optional[RuleEngineResult] = None

    rule_signals: List[str] = Field(default_factory=list)
    feature_importance: List[FeatureImportanceItem] = Field(default_factory=list)
    model_version: str = "xgb-incident-v1.0"
    prediction_id: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PredictionRecordResponse(BaseModel):
    id: int
    reading_id: Optional[int] = None
    plant_id: str
    equipment_id: str
    predicted_risk_score: float
    predicted_risk_class: str
    predicted_leak_severity: str
    predicted_leak_location: str
    confidence: float
    feature_importance: Optional[List[Dict[str, Any]]] = None
    rule_signals: Optional[List[str]] = None
    model_version: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
