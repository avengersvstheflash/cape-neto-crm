from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


# ── BASE CONFIG ───────────────────────────────────────
class BaseSchema(BaseModel):
    model_config = {"from_attributes": True}


# ── USER SCHEMAS ──────────────────────────────────────
class UserCreate(BaseSchema):
    email: EmailStr
    password: str
    role: Optional[str] = "sales_rep"

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        allowed = {"admin", "sales_rep", "viewer"}
        if v not in allowed:
            raise ValueError(f"Role must be one of {allowed}")
        return v

class UserResponse(BaseSchema):
    id: int
    email: EmailStr
    role: str
    created_at: datetime


# ── PIPELINE STAGE SCHEMAS ────────────────────────────
class PipelineStageCreate(BaseSchema):
    name: str
    position: int
    auto_tasks: Optional[str] = None

class PipelineStageResponse(BaseSchema):
    id: int
    name: str
    position: int
    auto_tasks: Optional[str] = None
    created_at: datetime


# ── LEAD SCHEMAS ──────────────────────────────────────
class LeadCreate(BaseSchema):
    instagram_handle: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    source: Optional[str] = "instagram"
    status: Optional[str] = "active"
    deal_value: Optional[Decimal] = None
    notes: Optional[str] = None
    stage_id: Optional[int] = None
    assigned_to: Optional[int] = None

class LeadUpdate(BaseSchema):
    instagram_handle: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    source: Optional[str] = None
    status: Optional[str] = None
    deal_value: Optional[Decimal] = None
    notes: Optional[str] = None
    stage_id: Optional[int] = None
    assigned_to: Optional[int] = None

class LeadResponse(BaseSchema):
    id: int
    instagram_handle: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    source: str
    status: str
    deal_value: Optional[Decimal] = None
    notes: Optional[str] = None
    stage_id: Optional[int] = None
    assigned_to: Optional[int] = None
    created_at: datetime
    updated_at: datetime


# ── TASK SCHEMAS ──────────────────────────────────────
class TaskCreate(BaseSchema):
    title: str
    description: Optional[str] = None
    task_type: Optional[str] = "manual"
    due_date: Optional[date] = None
    priority: Optional[str] = "medium"
    status: Optional[str] = "pending"
    is_auto_generated: Optional[bool] = False
    lead_id: int
    assigned_to: Optional[int] = None

class TaskResponse(BaseSchema):
    id: int
    title: str
    description: Optional[str] = None
    task_type: str
    due_date: Optional[date] = None
    priority: str
    status: str
    is_auto_generated: bool
    lead_id: int
    assigned_to: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


# ── ACTIVITY SCHEMAS ──────────────────────────────────
class ActivityCreate(BaseSchema):
    action_type: str
    description: Optional[str] = None
    activity_metadata: Optional[str] = None
    lead_id: int
    user_id: Optional[int] = None

class ActivityResponse(BaseSchema):
    id: int
    action_type: str
    description: Optional[str] = None
    activity_metadata: Optional[str] = None
    lead_id: int
    user_id: Optional[int] = None
    created_at: datetime


# ── DEAL SCHEMAS ──────────────────────────────────────
class DealCreate(BaseSchema):
    title: str
    value: Decimal
    currency: Optional[str] = "ZAR"
    status: Optional[str] = "open"
    close_date: Optional[date] = None
    notes: Optional[str] = None
    lead_id: int

class DealResponse(BaseSchema):
    id: int
    title: str
    value: Decimal
    currency: str
    status: str
    close_date: Optional[date] = None
    notes: Optional[str] = None
    lead_id: int
    created_at: datetime
    updated_at: datetime


# ── CONVERSATION SCHEMAS ──────────────────────────────
class ConversationCreate(BaseSchema):
    platform: Optional[str] = "instagram"
    direction: str
    message_text: Optional[str] = None
    sent_at: datetime
    lead_id: int

class ConversationResponse(BaseSchema):
    id: int
    platform: str
    direction: str
    message_text: Optional[str] = None
    sent_at: datetime
    is_read: bool
    lead_id: int
    created_at: datetime

    # ── CLIENT SCHEMAS ────────────────────────────────────────────────────────────

from datetime import date as DateType
from typing import Optional

class ClientCreate(BaseModel):
    name: str
    slug: str
    owner_email: Optional[str] = None
    plan: str = "starter"          # starter | growth | pro | enterprise
    status: str = "trial"          # trial | active | paused | churned
    joined_at: Optional[DateType] = None
    plan_renews_at: Optional[DateType] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    owner_email: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None
    joined_at: Optional[DateType] = None
    plan_renews_at: Optional[DateType] = None

class ClientOut(BaseModel):
    id: int
    name: str
    slug: str
    owner_email: Optional[str]
    plan: str
    status: str
    joined_at: Optional[DateType]
    plan_renews_at: Optional[DateType]
    created_at: datetime

    class Config:
        from_attributes = True