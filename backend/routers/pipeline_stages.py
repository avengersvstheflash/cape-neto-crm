# routers/pipeline_stages.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
from models import PipelineStage, User
from schemas import PipelineStageCreate, PipelineStageResponse, PipelineStageUpdate

router = APIRouter(prefix="/pipeline-stages", tags=["Pipeline Stages"])

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required for pipeline configuration"
        )
    return current_user


# ── LIST PIPELINE STAGES ──────────────────────────────
@router.get("/", response_model=List[PipelineStageResponse])
def list_pipeline_stages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(PipelineStage).order_by(PipelineStage.position.asc()).all()


# ── CREATE PIPELINE STAGE ─────────────────────────────
@router.post("/", response_model=PipelineStageResponse, status_code=status.HTTP_201_CREATED)
def create_pipeline_stage(
    stage_in: PipelineStageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing = db.query(PipelineStage).filter(PipelineStage.name == stage_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Pipeline stage name already exists")

    stage = PipelineStage(
        name=stage_in.name,
        position=stage_in.position,
        auto_tasks=stage_in.auto_tasks
    )
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return stage


# ── UPDATE PIPELINE STAGE ─────────────────────────────
@router.put("/{stage_id}", response_model=PipelineStageResponse)
def update_pipeline_stage(
    stage_id: int,
    stage_in: PipelineStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    stage = db.query(PipelineStage).filter(PipelineStage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Pipeline stage not found")

    update_data = stage_in.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != stage.name:
        existing = db.query(PipelineStage).filter(PipelineStage.name == update_data["name"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="Pipeline stage name already exists")

    for field, value in update_data.items():
        setattr(stage, field, value)

    db.commit()
    db.refresh(stage)
    return stage


# ── DELETE PIPELINE STAGE ─────────────────────────────
@router.delete("/{stage_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pipeline_stage(
    stage_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    stage = db.query(PipelineStage).filter(PipelineStage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Pipeline stage not found")

    db.delete(stage)
    db.commit()
    return None

