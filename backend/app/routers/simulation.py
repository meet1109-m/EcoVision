from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.simulation import (
    SimulationInput,
    SimulationResult,
    SimulationSaveRequest,
    SimulationRecordResponse,
)
from app.services.simulation_service import (
    compute_simulation,
    save_simulation_record,
    get_simulations,
)
from app.services.auth_service import get_current_user

router = APIRouter(tags=["Simulation"])


@router.post("/simulation", response_model=SimulationResult)
@router.post("/api/v1/simulation", response_model=SimulationResult)
@router.post("/simulation/run", response_model=SimulationResult)
@router.post("/api/v1/simulation/run", response_model=SimulationResult)
def run_simulation(input_data: SimulationInput):
    """
    Run What-If scenario simulation on process variables, energy mix, and material recovery.
    Calculates CO2 reduction, risk impact, and annual economic savings.
    """
    return compute_simulation(input_data)


@router.post("/simulation/save", response_model=SimulationRecordResponse, status_code=status.HTTP_201_CREATED)
@router.post("/api/v1/simulation/save", response_model=SimulationRecordResponse, status_code=status.HTTP_201_CREATED)
def save_scenario(
    save_in: SimulationSaveRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save a simulation configuration and result metrics to PostgreSQL."""
    user_id = current_user.id if current_user else None
    return save_simulation_record(db, save_in, user_id=user_id)


@router.get("/simulation/history", response_model=List[SimulationRecordResponse])
@router.get("/api/v1/simulation/history", response_model=List[SimulationRecordResponse])
def list_simulation_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve history of saved simulation runs from PostgreSQL."""
    return get_simulations(db, skip=skip, limit=limit)
