# routers/activities.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from auth import get_current_user
from models import Activity, Lead, User
from schemas import ActivityCreate, ActivityResponse

router = APIRouter(prefix="/activities", tags=["Activities"])


# ── CREATE ACTIVITY ───────────────────────────────────
@router.post("/", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity_in: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify lead exists
    lead = db.query(Lead).filter(Lead.id == activity_in.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # RBAC: sales_rep can only log activity on their own leads
    if current_user.role == "sales_rep" and lead.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to log activity for this lead")

    db_activity = Activity(
        action_type=activity_in.action_type,
        description=activity_in.description,
        activity_metadata=activity_in.activity_metadata,
        lead_id=activity_in.lead_id,
        user_id=current_user.id,
    )

    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


# ── ACTIVITY TIMELINE ─────────────────────────────────
@router.get("/", response_model=List[ActivityResponse])
def list_activities(
    lead_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Activity)

    if lead_id is not None:
        # Verify lead exists
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        # RBAC: sales_rep can only see activities on their own leads
        if current_user.role == "sales_rep" and lead.assigned_to != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this lead's activities")

        query = query.filter(Activity.lead_id == lead_id)

    elif current_user.role == "sales_rep":
        # No lead_id filter — sales_rep only sees activities on their own leads
        query = query.join(Lead).filter(Lead.assigned_to == current_user.id)

    query = query.order_by(Activity.created_at.desc())
    return query.offset(skip).limit(limit).all()