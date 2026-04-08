# routers/tasks.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date, datetime
from database import get_db
from auth import get_current_user
from models import Task, Lead, User
from schemas import TaskCreate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["Tasks"])


# ── LIST TASKS ────────────────────────────────────────
@router.get("/", response_model=List[TaskResponse])
def list_tasks(
    assigned_to: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    lead_id: Optional[int] = Query(None),
    overdue: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task)

    # RBAC: sales_rep only sees their own tasks
    if current_user.role == "sales_rep":
        query = query.filter(Task.assigned_to == current_user.id)

    if assigned_to is not None and current_user.role == "admin":
        query = query.filter(Task.assigned_to == assigned_to)
    if status is not None:
        query = query.filter(Task.status == status)
    if lead_id is not None:
        query = query.filter(Task.lead_id == lead_id)
    if overdue:
        query = query.filter(
            Task.due_date < date.today(),
            Task.status.notin_(["done", "cancelled"])
        )

    return query.offset(skip).limit(limit).all()


# ── CREATE TASK ───────────────────────────────────────
@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify the lead exists
    lead = db.query(Lead).filter(Lead.id == task_in.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # RBAC: sales_rep can only create tasks on their own leads
    if current_user.role == "sales_rep" and lead.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create tasks for this lead")

    db_task = Task(
        title=task_in.title,
        description=task_in.description,
        task_type=task_in.task_type,
        due_date=task_in.due_date,
        priority=task_in.priority,
        status=task_in.status,
        is_auto_generated=task_in.is_auto_generated,
        lead_id=task_in.lead_id,
        assigned_to=task_in.assigned_to or current_user.id,
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


# ── COMPLETE TASK ─────────────────────────────────────
@router.put("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # RBAC: sales_rep can only complete their own tasks
    if current_user.role == "sales_rep" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to complete this task")

    if task.status == "done":
        raise HTTPException(status_code=400, detail="Task is already completed")

    task.status = "done"
    task.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(task)
    return task


# ── DELETE TASK ───────────────────────────────────────
@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # RBAC: sales_rep can only delete their own tasks
    if current_user.role == "sales_rep" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")

    db.delete(task)
    db.commit()
    return None