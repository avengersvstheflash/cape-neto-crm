from sqlalchemy import (
    Column, Integer, String, Boolean, Text, Date,
    DateTime, ForeignKey, DECIMAL, CheckConstraint, Index, UniqueConstraint
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

    leads = relationship("Lead", back_populates="assigned_user")
    tasks = relationship("Task", back_populates="assigned_user")
    activities = relationship("Activity", back_populates="user")
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)
    client = relationship("Client", back_populates="users")


# ── PIPELINE STAGE ────────────────────────────────────
class PipelineStage(Base):
    __tablename__ = "pipeline_stages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    position = Column(Integer, nullable=False)
    auto_tasks = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    leads = relationship("Lead", back_populates="stage")


# ── LEAD ──────────────────────────────────────────────
class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, autoincrement=True)
    instagram_handle = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(200))
    phone = Column(String(30))
    email = Column(String(255))
    source = Column(String(50), default="instagram")
    status = Column(String(30), default="active")
    deal_value = Column(DECIMAL(12, 2))
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    stage_id = Column(Integer, ForeignKey("pipeline_stages.id", ondelete="SET NULL"), nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        CheckConstraint("status IN ('active', 'won', 'lost', 'paused')", name="check_lead_status"),
        Index("idx_leads_stage_status", "stage_id", "status"),
    )

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
    task_type = Column(String(50), default="manual")
    due_date = Column(Date)
    priority = Column(String(20), default="medium")
    status = Column(String(20), default="pending")
    is_auto_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)

    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        CheckConstraint("priority IN ('low', 'medium', 'high', 'urgent')", name="check_task_priority"),
        CheckConstraint("status IN ('pending', 'in_progress', 'done', 'cancelled')", name="check_task_status"),
        CheckConstraint("task_type IN ('manual', 'call', 'follow_up', 'proposal', 'check_in')", name="check_task_type"),
        Index("idx_tasks_due_status", "due_date", "status"),
    )

    lead = relationship("Lead", back_populates="tasks")
    assigned_user = relationship("User", back_populates="tasks")


# ── ACTIVITY ──────────────────────────────────────────
class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    action_type = Column(String(50), nullable=False)
    description = Column(Text)
    activity_metadata = Column("metadata", Text)  # ← RENAMED from metadata_
    created_at = Column(DateTime, server_default=func.now())

    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        CheckConstraint(
            "action_type IN ('stage_change', 'task_created', 'task_completed', "
            "'note_added', 'deal_created', 'message_sent', 'status_change', 'webhook_received')",
            name="check_activity_action_type"
        ),
        Index("idx_activities_lead_created", "lead_id", "created_at"),
    )

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

    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        CheckConstraint("value >= 0", name="check_deal_value_positive"),
        CheckConstraint("status IN ('open', 'won', 'lost')", name="check_deal_status"),
    )

    lead = relationship("Lead", back_populates="deals")
    creator = relationship("User", foreign_keys=[created_by])


# ── CONVERSATION ──────────────────────────────────────
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    platform = Column(String(30), default="instagram")
    direction = Column(String(10), nullable=False)
    message_text = Column(Text)
    sent_at = Column(DateTime, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        CheckConstraint("direction IN ('inbound', 'outbound')", name="check_conversation_direction"),
        Index("idx_conversations_lead_sent", "lead_id", "sent_at"),
    )

    lead = relationship("Lead", back_populates="conversations")


# ── WEBHOOK LOG ───────────────────────────────────────
class WebhookLog(Base):
    __tablename__ = "webhook_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    webhook_id = Column(String(255), unique=True, nullable=False)
    source = Column(String(50), nullable=False)
    event_type = Column(String(100), nullable=False)
    payload = Column(Text)
    processed = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)
    received_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        CheckConstraint("source IN ('instagram', 'whatsapp', 'manual')", name="check_webhook_source"),
        Index("idx_webhook_logs_received", "received_at"),
    )


# ── CLIENT ────────────────────────────────────────────
class Client(Base):
    __tablename__ = "clients"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    name       = Column(String(200), nullable=False)
    slug       = Column(String(100), unique=True, nullable=False, index=True)
    owner_email = Column(String(255), nullable=True)

    # Plan tier — what service level this client is on
    plan       = Column(String(30), default="starter", nullable=False)

    # Status — is the client currently active with the agency?
    status     = Column(String(30), default="active", nullable=False)

    # Optional: when did they join and when does their plan renew
    joined_at  = Column(Date, nullable=True)
    plan_renews_at = Column(Date, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint(
            "plan IN ('starter', 'growth', 'pro', 'enterprise')",
            name="check_client_plan"
        ),
        CheckConstraint(
            "status IN ('active', 'paused', 'churned', 'trial')",
            name="check_client_status"
        ),
    )

    # Relationships (will connect to User + Lead next)
    users = relationship("User", back_populates="client")