from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Client
from schemas import ClientCreate, ClientUpdate, ClientOut
from auth import get_current_user
from typing import List

router = APIRouter(prefix="/clients", tags=["Clients"])


# ── Helper: admin only guard ──────────────────────────────────────────────────
def require_admin(current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ── POST /clients/ ────────────────────────────────────────────────────────────
@router.post("/", response_model=ClientOut, status_code=201)
def create_client(
    payload: ClientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    # Check slug is unique
    existing = db.query(Client).filter(Client.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already in use")

    client = Client(**payload.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


# ── GET /clients/ ─────────────────────────────────────────────────────────────
@router.get("/", response_model=List[ClientOut])
def list_clients(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    return db.query(Client).all()


# ── GET /clients/{id} ─────────────────────────────────────────────────────────
@router.get("/{client_id}", response_model=ClientOut)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


# ── PATCH /clients/{id} ───────────────────────────────────────────────────────
@router.patch("/{client_id}", response_model=ClientOut)
def update_client(
    client_id: int,
    payload: ClientUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Only update fields that were actually sent
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(client, field, value)

    db.commit()
    db.refresh(client)
    return client