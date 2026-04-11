from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserOut, UserUpdate
from auth import get_current_user
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])


# ── GET /users/me ─────────────────────────────────────────────────────────────
# Any logged-in user can see their own profile
@router.get("/me", response_model=UserOut)
def get_my_profile(current_user=Depends(get_current_user)):
    return current_user


# ── GET /users/ ───────────────────────────────────────────────────────────────
# Admin only — see everyone in the system
@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return db.query(User).all()


# ── PATCH /users/{id} ─────────────────────────────────────────────────────────
# Admin only — update a user's role or assign them to a client
@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user