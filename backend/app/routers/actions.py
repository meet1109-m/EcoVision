from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.action import (
    ActionCreate,
    ActionUpdate,
    ActionStatusUpdate,
    ActionResponse,
)
from app.services.action_service import (
    get_actions,
    get_action,
    create_action,
    update_action,
    update_action_status,
    delete_action,
)

router = APIRouter(tags=["Actions"])


@router.get("/actions", response_model=List[ActionResponse])
@router.get("/api/v1/actions", response_model=List[ActionResponse])
def list_actions(
    plant_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None, description="'PENDING' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'"),
    priority: Optional[str] = Query(None, description="'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """List operational tasks and corrective mitigation actions from PostgreSQL."""
    return get_actions(
        db, plant_id=plant_id, status=status, priority=priority, skip=skip, limit=limit
    )


@router.post("/actions", response_model=ActionResponse, status_code=status.HTTP_201_CREATED)
@router.post("/api/v1/actions", response_model=ActionResponse, status_code=status.HTTP_201_CREATED)
def add_action(action_in: ActionCreate, db: Session = Depends(get_db)):
    """Create a new corrective action item in PostgreSQL."""
    existing = get_action(db, action_in.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Action with ID '{action_in.id}' already exists."
        )
    return create_action(db, action_in)


@router.get("/actions/{action_id}", response_model=ActionResponse)
@router.get("/api/v1/actions/{action_id}", response_model=ActionResponse)
def get_action_detail(action_id: str, db: Session = Depends(get_db)):
    """Get single action item detail."""
    action = get_action(db, action_id)
    if not action:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")
    return action


@router.patch("/actions/{action_id}", response_model=ActionResponse)
@router.patch("/api/v1/actions/{action_id}", response_model=ActionResponse)
def modify_action(action_id: str, action_in: ActionUpdate, db: Session = Depends(get_db)):
    """Modify action details, status, impact, cost, or assignment."""
    action = update_action(db, action_id, action_in)
    if not action:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")
    return action


@router.patch("/actions/{action_id}/status", response_model=ActionResponse)
@router.patch("/api/v1/actions/{action_id}/status", response_model=ActionResponse)
def set_action_status(
    action_id: str, status_in: ActionStatusUpdate, db: Session = Depends(get_db)
):
    """Update workflow status of an action (PENDING -> PLANNED -> IN_PROGRESS -> COMPLETED)."""
    action = update_action_status(db, action_id, status_in.status)
    if not action:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")
    return action


@router.delete("/actions/{action_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/api/v1/actions/{action_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_action(action_id: str, db: Session = Depends(get_db)):
    """Delete an action item from PostgreSQL."""
    success = delete_action(db, action_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")
    return None
