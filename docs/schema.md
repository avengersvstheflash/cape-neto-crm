# Cape Neto CRM — Database Schema & Relational Model

This document defines the relational database architecture and entity-relationship models for the Cape Neto CRM. Engineered using **SQLAlchemy 2.0** and managed with **Alembic batch-mode migrations**.

---

## 1. Entity-Relationship Diagram

```
┌──────────────┐         1:N         ┌──────────────┐         1:N         ┌──────────────┐
│    users     ├────────────────────►│    leads     ├────────────────────►│    tasks     │
│  (Auth/RBAC) │                     │ (Instagram)  │                     │(Follow-ups)  │
└──────┬───────┘                     └──────┬───────┘                     └──────────────┘
       │                                    │
       │ 1:N                                │ 1:N
       ▼                                    ▼
┌──────────────┐                     ┌──────────────┐
│  activities  │                     │    deals     │
│(Audit Trail) │                     │ (Value/ZAR)  │
└──────────────┘                     └──────────────┘
       ▲                                    │
       │                                    ▼
       │                             ┌──────────────┐
       │ 1:N                         │pipeline_stage│
       └─────────────────────────────┤ (Funnel POS) │
                                     └──────────────┘
       ┌──────────────┐
       │   clients    │
       │ (Retainers)  │
       └──────────────┘
```

---

## 2. Table Specifications

### 1. `users` — Team Members & Role Definitions
Stores credentials and authorization roles for agency personnel.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Autoincrement | Unique user identifier |
| `email` | String(255) | Unique, Not Null, Indexed | Agent login email address |
| `password_hash` | String(255) | Not Null | Salted bcrypt hash string |
| `role` | String(20) | Default: `'sales_rep'` | `admin`, `sales_rep`, or `viewer` |
| `client_id` | Integer | FK &rarr; `clients.id`, Nullable | Linked client account for client portal access |
| `created_at` | DateTime | Default: UTC Now | Account creation timestamp |
| `updated_at` | DateTime | Auto-updating | Timestamp of last profile modification |

---

### 2. `pipeline_stages` — Funnel Configuration
Defines sequential deal stages in the digital marketing sales funnel.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Autoincrement | Unique stage identifier |
| `name` | String(50) | Unique, Not Null | Stage title (e.g. "Proposal Sent") |
| `position` | Integer | Not Null, Indexed | Ascending order position in board/pipeline |
| `auto_tasks` | Text | Nullable | Template string for automated task generation |
| `created_at` | DateTime | Default: UTC Now | Stage creation timestamp |

---

### 3. `leads` — Core Inbound Lead Record
Central entity capturing prospective agency clients, social discovery details, and deal values.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Autoincrement | Unique lead identifier |
| `instagram_handle` | String(100) | Unique, Not Null, Indexed | Sanitized Instagram handle (e.g. `@capecraft`) |
| `full_name` | String(100) | Nullable | Contact person's legal or brand name |
| `phone` | String(30) | Nullable | Primary WhatsApp or phone contact number |
| `email` | String(255) | Nullable | Contact email address |
| `source` | String(50) | Default: `'instagram'` | Channel (`instagram`, `referral`, `meta_ads`) |
| `status` | String(20) | Default: `'active'` | Stage status (`active`, `won`, `lost`, `paused`) |
| `deal_value` | Numeric(10, 2) | Nullable | Estimated agency contract value in ZAR |
| `notes` | Text | Nullable | Contextual details from DM conversations |
| `stage_id` | Integer | FK &rarr; `pipeline_stages.id`, SET NULL | Current funnel milestone |
| `assigned_to` | Integer | FK &rarr; `users.id`, SET NULL | Assigned sales representative |
| `created_at` | DateTime | Default: UTC Now | Date and time lead was ingested |
| `updated_at` | DateTime | Auto-updating | Date and time lead was last modified |

---

### 4. `tasks` — Daily Action Queue & Follow-ups
Actionable to-do items linked directly to leads with priority management and completion timestamps.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Autoincrement | Unique task identifier |
| `title` | String(200) | Not Null | Task description header |
| `description` | Text | Nullable | Extended operational instructions |
| `task_type` | String(20) | Default: `'manual'` | `call`, `follow_up`, `proposal`, `check_in`, `manual` |
| `due_date` | Date | Nullable, Indexed | Scheduled deadline date |
| `priority` | String(10) | Default: `'medium'` | Stratification: `low`, `medium`, `high`, `urgent` |
| `status` | String(20) | Default: `'pending'` | Lifecycle: `pending`, `in_progress`, `done`, `cancelled` |
| `is_auto_generated` | Boolean | Default: `False` | Flag indicating automated trigger creation |
| `completed_at` | DateTime | Nullable | UTC timestamp recorded when marked resolved |
| `lead_id` | Integer | FK &rarr; `leads.id`, CASCADE | Parent lead record |
| `assigned_to` | Integer | FK &rarr; `users.id`, SET NULL | Responsible team member |
| `created_at` | DateTime | Default: UTC Now | Task creation timestamp |

---

### 5. `activities` — Immutable Interaction Audit Trail
Chronological log of customer touchpoints and sales representative actions.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Autoincrement | Unique audit log ID |
| `action_type` | String(50) | Not Null | `message_sent`, `call_logged`, `note_added`, `stage_change` |
| `description` | Text | Nullable | User-entered interaction summary |
| `activity_metadata` | Text | Nullable | JSON string for technical/webhook payloads |
| `lead_id` | Integer | FK &rarr; `leads.id`, CASCADE | Associated lead |
| `user_id` | Integer | FK &rarr; `users.id`, SET NULL | Agent who performed the interaction |
| `created_at` | DateTime | Default: UTC Now, Indexed | Event timestamp |

---

### 6. `deals` — Commercial Value Contracts
Represents formal proposals and commercial agreements tied to a lead.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Autoincrement | Unique commercial deal ID |
| `title` | String(150) | Not Null | Retainer or project title |
| `value` | Numeric(10, 2) | Not Null | Proposed monetary value |
| `currency` | String(3) | Default: `'ZAR'` | ISO currency code |
| `status` | String(20) | Default: `'open'` | `open`, `won`, `lost` |
| `close_date` | Date | Nullable | Target closing date |
| `notes` | Text | Nullable | Contract stipulations |
| `lead_id` | Integer | FK &rarr; `leads.id`, CASCADE | Related lead |
| `created_by` | Integer | FK &rarr; `users.id`, SET NULL | Creating team member |

---

### 7. `clients` — Converted Retainers & Agency Accounts
Accounts converted from won leads, managing subscription plans and renewal milestones.
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | Integer | PK, Autoincrement | Unique client account ID |
| `name` | String(100) | Not Null | Company or trading brand name |
| `slug` | String(100) | Unique, Not Null | URL-safe brand identifier |
| `owner_email` | String(255) | Nullable | Primary client billing email |
| `plan` | String(20) | Default: `'starter'` | `starter`, `growth`, `pro`, `enterprise` |
| `status` | String(20) | Default: `'trial'` | `active`, `paused`, `churned`, `trial` |
| `joined_at` | Date | Nullable | Retainer start date |
| `plan_renews_at` | Date | Nullable | Retainer renewal deadline |
| `created_at` | DateTime | Default: UTC Now | Record creation timestamp |

---

## 3. Migration Architecture (Alembic Batch Mode)

SQLite enforces strict schema immutability, prohibiting `ALTER TABLE DROP COLUMN` or constraint alteration in standard mode. To ensure reliable schema evolution between SQLite and PostgreSQL, `backend/alembic/env.py` enables **batch mode**:

```python
with connectable.connect() as connection:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        render_as_batch=True,  # Enables non-destructive SQLite schema changes
    )
```

This ensures foreign keys, nullability changes, and column additions execute through temporary table copy-swaps safely without risking data truncation.
