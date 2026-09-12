import logging
from typing import List, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.prediction import (
    PredictRequest,
    PredictResponse,
    PredictionRecordResponse,
    FeatureImportanceItem,
    MLPredictionResult,
    RuleEngineResult,
)
from app.ml.feature_pipeline import validate_features_no_leakage, extract_feature_vector
from app.ml.inference import predictor
from app.ml.rule_engine import rule_engine
from app.services.equipment_service import ensure_equipment_hierarchy
from app.models.prediction import Prediction
from app.models.process_reading import ProcessReading

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Prediction"])


def handle_prediction(request: PredictRequest, db: Session) -> PredictResponse:
    """Core prediction handler with ML inference, Rule Engine evaluation, and DB storage."""
    reading_dict = request.reading.model_dump()

    # 1. Anti-Data-Leakage Validation
    is_clean, leaks = validate_features_no_leakage(reading_dict)
    if not is_clean:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Data leakage prevented: inference input cannot contain ground-truth target labels {leaks}",
        )

    # 2. Extract strictly valid model input features
    features = extract_feature_vector(reading_dict)

    # 3. Apply trained Machine Learning Pipeline
    ml_output = predictor.predict(features)

    # 4. Evaluate independent Rule Engine for process abnormalities
    rule_output = rule_engine.evaluate(reading_dict)

    # 5. Build structured feature importance items
    feature_importance_items = [
        FeatureImportanceItem(feature=item["feature"], importance=item["importance"])
        for item in ml_output.get("feature_importance", [])
    ]

    # 6. Optional Persistence in PostgreSQL with Hierarchy Guarantee
    persisted_reading_id = None
    prediction_id = None

    if request.save_reading or request.save_prediction:
        try:
            # Ensure referenced plant, process_unit, and equipment exist
            ensure_equipment_hierarchy(
                db=db,
                plant_id=request.reading.plant_id,
                process_unit_id=request.reading.process_unit_id,
                equipment_id=request.reading.equipment_id,
                equipment_type=request.reading.equipment_type,
                process_type=request.reading.process_type,
                equipment_age_years=request.reading.equipment_age_years,
            )

            if request.save_reading:
                db_reading = ProcessReading(
                    timestamp=request.reading.timestamp,
                    plant_id=request.reading.plant_id,
                    process_unit_id=request.reading.process_unit_id,
                    equipment_id=request.reading.equipment_id,
                    equipment_type=request.reading.equipment_type,
                    process_type=request.reading.process_type,
                    temperature_c=request.reading.temperature_c,
                    pressure_bar=request.reading.pressure_bar,
                    flow_rate=request.reading.flow_rate,
                    production_rate=request.reading.production_rate,
                    operating_hours=request.reading.operating_hours,
                    equipment_age_years=request.reading.equipment_age_years,
                    maintenance_due=request.reading.maintenance_due,
                    co2_ppm=request.reading.co2_ppm,
                    co_ppm=request.reading.co_ppm,
                    nox_ppm=request.reading.nox_ppm,
                    so2_ppm=request.reading.so2_ppm,
                    voc_ppm=request.reading.voc_ppm,
                    ch4_ppm=request.reading.ch4_ppm,
                    pm25_mg_m3=request.reading.pm25_mg_m3,
                    fuel_or_material_type=request.reading.fuel_or_material_type,
                    ambient_temperature_c=request.reading.ambient_temperature_c,
                    humidity_pct=request.reading.humidity_pct,
                    wind_speed_m_s=request.reading.wind_speed_m_s,
                    shift=request.reading.shift,
                    maintenance_status=request.reading.maintenance_status,
                    pressure_deviation_pct=request.reading.pressure_deviation_pct,
                    flow_deviation_pct=request.reading.flow_deviation_pct,
                    temperature_deviation_pct=request.reading.temperature_deviation_pct,
                    emission_above_baseline_pct=request.reading.emission_above_baseline_pct,
                    rolling_mean=request.reading.rolling_mean,
                    rolling_std=request.reading.rolling_std,
                    risk_class=ml_output["predicted_risk_class"],
                    risk_score=ml_output["predicted_risk_score"],
                    leak_severity=ml_output["predicted_leak_severity"],
                    confirmed_by="ml_model",
                )
                db.add(db_reading)
                db.flush()
                persisted_reading_id = db_reading.id

            if request.save_prediction:
                db_pred = Prediction(
                    reading_id=persisted_reading_id,
                    plant_id=request.reading.plant_id,
                    equipment_id=request.reading.equipment_id,
                    predicted_risk_score=ml_output["predicted_risk_score"],
                    predicted_risk_class=ml_output["predicted_risk_class"],
                    predicted_leak_severity=ml_output["predicted_leak_severity"],
                    predicted_leak_location=f"{request.reading.equipment_type}_sensor",
                    confidence=ml_output["confidence"],
                    rule_signals=rule_output["rule_signals"],
                    feature_importance=[item.model_dump() for item in feature_importance_items],
                    model_version=ml_output["model_version"],
                )
                db.add(db_pred)
                db.flush()
                prediction_id = db_pred.id

            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to persist prediction / reading to database: {e}", exc_info=True)

    ml_result_obj = MLPredictionResult(
        predicted_incident_label=ml_output["predicted_incident_label"],
        is_incident=ml_output["is_incident"],
        incident_probability=ml_output["incident_probability"],
        class_probabilities=ml_output["class_probabilities"],
        confidence=ml_output["confidence"],
        predicted_risk_class=ml_output["predicted_risk_class"],
        predicted_leak_severity=ml_output["predicted_leak_severity"],
        predicted_risk_score=ml_output["predicted_risk_score"],
        model_version=ml_output["model_version"],
    )

    rule_result_obj = RuleEngineResult(
        abnormality_detected=rule_output["abnormality_detected"],
        rule_severity=rule_output["rule_severity"],
        rule_count=rule_output["rule_count"],
        rule_signals=rule_output["rule_signals"],
        violations=rule_output["violations"],
    )

    return PredictResponse(
        status="success",
        plant_id=request.reading.plant_id,
        equipment_id=request.reading.equipment_id,
        incident_prediction=ml_output["predicted_incident_label"],
        incident_probability=ml_output["incident_probability"],
        is_incident=ml_output["is_incident"],
        predicted_risk_score=ml_output["predicted_risk_score"],
        predicted_risk_class=ml_output["predicted_risk_class"],
        predicted_leak_severity=ml_output["predicted_leak_severity"],
        predicted_leak_location=f"{request.reading.equipment_type}_sensor",
        confidence=ml_output["confidence"],
        ml_result=ml_result_obj,
        rule_engine_result=rule_result_obj,
        rule_signals=rule_output["rule_signals"],
        feature_importance=feature_importance_items,
        model_version=ml_output["model_version"],
        prediction_id=prediction_id,
        created_at=datetime.now(timezone.utc),
    )


@router.post("/predict", response_model=PredictResponse)
def predict_emission_risk(request: PredictRequest, db: Session = Depends(get_db)):
    """Run ML model and Rule Engine inference and store prediction in database."""
    return handle_prediction(request, db)


@router.post("/api/v1/predict", response_model=PredictResponse)
def api_v1_predict(request: PredictRequest, db: Session = Depends(get_db)):
    """API v1 Endpoint: Validate input, run trained ML model and rule engine, and store in PostgreSQL."""
    return handle_prediction(request, db)


@router.get("/predictions/history", response_model=List[PredictionRecordResponse])
@router.get("/api/v1/predictions/history", response_model=List[PredictionRecordResponse])
def get_prediction_history(
    plant_id: Optional[str] = Query(None),
    equipment_id: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    """Retrieve historical prediction records from the database."""
    query = db.query(Prediction)
    if plant_id:
        query = query.filter(Prediction.plant_id == plant_id)
    if equipment_id:
        query = query.filter(Prediction.equipment_id == equipment_id)
    return query.order_by(Prediction.created_at.desc()).limit(limit).all()
