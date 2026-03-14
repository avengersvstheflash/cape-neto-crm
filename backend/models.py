from sqlalchemy import (
    Column, Integer, String, Boolean, Text, Date,
    DateTime, ForeignKey, DECIMAL, CheckConstraint, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


# ── USER ──────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="sales_rep", nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        CheckConstraint("role IN ('admin', 'sales_rep', 'viewer')", name="check_user_role"),
    )

    # Relationships
    leads = relationship("Lead", back_populates="assigned_user")
    tasks = relationship("Task", back_populates="assigned_user")
    activities = relationship("Activity", back_populates="user")

# ── PIPELINE STAGE ────────────────────────────────────
class PipelineStage(Base):
    __tablename__ = "pipeline_stages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    position = Column(Integer, nullable=False)
    auto_tasks = Column(Text)  # JSON string — task templates for this stage
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    leads = relationship("Lead", back_populates="stage")

# ── LEAD ──────────────────────────────────────────────
class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, autoincrement=True)
    instagram_handle = Column(String(100), nullable=False, index=True)
    full_name = Column(String(200))
    phone = Column(String(30))
    email = Column(String(255))
    source = Column(String(50), default="instagram")
    status = Column(String(30), default="active")
    deal_value = Column(DECIMAL(12, 2))
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Foreign Keys
    stage_id = Column(Integer, ForeignKey("pipeline_stages.id", ondelete="SET NULL"), nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        CheckConstraint("status IN ('active', 'won', 'lost', 'paused')", name="check_lead_status"),
        Index("idx_leads_stage_status", "stage_id", "status"),
    )

    # Relationships
    stage = relationship("PipelineStage", back_populates="leads")
    assigned_user = relationship("User", back_populates="leads")
    tasks = relationship("Task", back_populates="lead", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="lead", cascade="all, delete-orphan")
    deals = relationship("Deal", back_populates="lead", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="lead", cascade="all, delete-orphan")


# ── TASK ──────────────────────────────────────────────
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    due_date = Column(Date)
    priority = Column(String(20), default="medium")
    status = Column(String(20), default="pending")
    is_auto_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)

    # Foreign Keys
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        CheckConstraint("priority IN ('low', 'medium', 'high', 'urgent')", name="check_task_priority"),
        CheckConstraint("status IN ('pending', 'in_progress', 'done', 'cancelled')", name="check_task_status"),
        Index("idx_tasks_due_status", "due_date", "status"),
    )

    # Relationships
    lead = relationship("Lead", back_populates="tasks")
    assigned_user = relationship("User", back_populates="tasks")

# ── ACTIVITY ──────────────────────────────────────────
class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    action_type = Column(String(50), nullable=False)
    description = Column(Text)
    metadata_ = Column("metadata", Text)  # JSON string — extra context
    created_at = Column(DateTime, server_default=func.now())

    # Foreign Keys
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "action_type IN ('stage_change', 'task_created', 'task_completed', "
            "'note_added', 'deal_created', 'message_sent', 'status_change')",
            name="check_activity_action_type"
        ),
        Index("idx_activities_lead_created", "lead_id", "created_at"),
    )

    # Relationships
    lead = relationship("Lead", back_populates="activities")
    user = relationship("User", back_populates="activities")

# ── DEAL ──────────────────────────────────────────────
class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    value = Column(DECIMAL(12, 2), nullable=False)
    currency = Column(String(10), default="ZAR")
    status = Column(String(30), default="open")
    close_date = Column(Date, nullable=True)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Foreign Keys
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        CheckConstraint("value >= 0", name="check_deal_value_positive"),
        CheckConstraint("status IN ('open', 'won', 'lost')", name="check_deal_status"),
    )

    # Relationships
    lead = relationship("Lead", back_populates="deals")

# ── CONVERSATION ──────────────────────────────────────
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    platform = Column(String(30), default="instagram")
    direction = Column(String(10), nullable=False)  # 'inbound' or 'outbound'
    message_text = Column(Text)
    sent_at = Column(DateTime, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    # Foreign Keys
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        CheckConstraint("direction IN ('inbound', 'outbound')", name="check_conversation_direction"),
        Index("idx_conversations_lead_sent", "lead_id", "sent_at"),
    )

    # Relationships
    lead = relationship("Lead", back_populates="conversations")
