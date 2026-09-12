from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.action import Action
from app.schemas.action import ActionCreate, ActionUpdate


def get_actions(
    db: Session,
    plant_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Action]:
    query = db.query(Action)
    if plant_id:
        query = query.filter(Action.plant_id == plant_id)
    if status:
        query = query.filter(Action.status == status)
    if priority:
        query = query.filter(Action.priority == priority)
    return query.order_by(Action.created_at.desc()).offset(skip).limit(limit).all()


def get_action(db: Session, action_id: str) -> Optional[Action]:
    return db.query(Action).filter(Action.id == action_id).first()


def create_action(db: Session, action_in: ActionCreate) -> Action:
    action = Action(
        id=action_in.id,
        plant_id=action_in.plant_id,
        equipment_id=action_in.equipment_id,
        recommendation_id=action_in.recommendation_id,
        assigned_to_user_id=action_in.assigned_to_user_id,
        title=action_in.title,
        priority=action_in.priority,
        impact=action_in.impact,
        estimated_cost=action_in.estimatedCost,
        feasibility=action_in.feasibility,
        status=action_in.status,
        description=action_in.description,
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action


def update_action(db: Session, action_id: str, action_in: ActionUpdate) -> Optional[Action]:
    action = get_action(db, action_id)
    if not action:
        return None
    data = action_in.model_dump(exclude_unset=True)
    if "title" in data:
        action.title = data["title"]
    if "priority" in data:
        action.priority = data["priority"]
    if "impact" in data:
        action.impact = data["impact"]
    if "estimatedCost" in data:
        action.estimated_cost = data["estimatedCost"]
    elif "estimated_cost" in data:
        action.estimated_cost = data["estimated_cost"]
    if "feasibility" in data:
        action.feasibility = data["feasibility"]
    if "status" in data:
        action.status = data["status"]
        if data["status"] == "COMPLETED":
            action.completed_at = datetime.now(timezone.utc)
    if "description" in data:
        action.description = data["description"]
    if "assigned_to_user_id" in data:
        action.assigned_to_user_id = data["assigned_to_user_id"]
    db.commit()
    db.refresh(action)
    return action


def update_action_status(db: Session, action_id: str, status: str) -> Optional[Action]:
    action = get_action(db, action_id)
    if not action:
        return None
    action.status = status
    if status == "COMPLETED":
        action.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(action)
    return action


def delete_action(db: Session, action_id: str) -> bool:
    action = get_action(db, action_id)
    if not action:
        return False
    db.delete(action)
    db.commit()
    return True
