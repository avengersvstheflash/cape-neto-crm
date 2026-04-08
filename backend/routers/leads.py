# routers/leads.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from auth import get_current_user
from models import Lead, User
from schemas import LeadCreate, LeadResponse, LeadUpdate

router = APIRouter(prefix="/leads", tags=["Leads"])


# ── LIST LEADS ────────────────────────────────────────
@router.get("/", response_model=List[LeadResponse])
def list_leads(
    stage_id: Optional[int] = Query(None),
    assigned_to: Optional[int] = Query(None),
    source: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Lead)

    # RBAC: sales_rep only sees their own leads
    if current_user.role == "sales_rep":
        query = query.filter(Lead.assigned_to == current_user.id)

    if stage_id is not None:
        query = query.filter(Lead.stage_id == stage_id)
    if assigned_to is not None and current_user.role == "admin":
        query = query.filter(Lead.assigned_to == assigned_to)
    if source is not None:
        query = query.filter(Lead.source == source)
    if search:
        query = query.filter(Lead.instagram_handle.ilike(f"%{search}%"))

    return query.offset(skip).limit(limit).all()


# ── CREATE LEAD ───────────────────────────────────────
@router.post("/", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    normalized_handle = lead_in.instagram_handle.lstrip('@').lower()

    existing = db.query(Lead).filter(
        Lead.instagram_handle == normalized_handle
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Lead with Instagram @{normalized_handle} already exists"
        )

    db_lead = Lead(
        instagram_handle=normalized_handle,
        full_name=lead_in.full_name,
        phone=lead_in.phone,
        email=lead_in.email,
        source=lead_in.source,
        status=lead_in.status,
        deal_value=lead_in.deal_value,
        notes=lead_in.notes,
        stage_id=lead_in.stage_id,
        assigned_to=current_user.id
    )

    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead


# ── GET LEAD ──────────────────────────────────────────
@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if current_user.role == "sales_rep" and lead.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this lead")

    return lead


# ── UPDATE LEAD ───────────────────────────────────────
@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if current_user.role == "sales_rep" and lead.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this lead")

    update_data = lead_in.model_dump(exclude_unset=True)

    if "instagram_handle" in update_data:
        update_data["instagram_handle"] = update_data["instagram_handle"].lstrip('@').lower()

    for field, value in update_data.items():
        setattr(lead, field, value)

    db.commit()
    db.refresh(lead)
    return lead