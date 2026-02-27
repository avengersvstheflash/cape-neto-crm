# Database Schema Design — Cape Neto Edition

## Overview
This system is a "Task-Centric" CRM. Leads exist to generate actions (Tasks). We use **SQLite** for development and **SQLAlchemy** as our ORM.

## Core Tables

### 1. users
Team members with login credentials.
- `id`: Integer (Primary Key)
- `email`: String (Unique)
- `password_hash`: String (bcrypt)
- `first_name`: String
- `last_name`: String
- `role`: Enum (admin, sales_rep)

### 2. leads
The source of all potential business.
- `id`: Integer (PK)
- `name`: String (Full Name if known)
- `instagram_username`: String (Required - Primary DM channel)
- `phone`: String
- `whatsapp_available`: Boolean (Yes/No)
- `email`: String (Optional)
- `lead_source`: Enum (Instagram, Referral, In-person, Reactivation)
- `status`: Enum (New Inquiry, Contacted, Qualified, Call Scheduled, Proposal Sent, Negotiation, Won, Lost, Re-engage Later)
- `lost_reason`: Text (Nullable - used if status is 'Lost')
- `notes`: Text
- `assigned_to`: Integer (FK -> users.id)

### 3. tasks (The Central Object)
This table drives the "Daily Action" dashboard.
- `id`: Integer (PK)
- `lead_id`: Integer (FK -> leads.id)
- `title`: String (e.g., "Day 2: Message Follow-up")
- `task_type`: Enum (call, message, email, proposal, followup)
- `due_date`: Date
- `priority`: Enum (low, medium, high)
- `is_completed`: Boolean (Default: False)
- `is_auto_generated`: Boolean (Was this created by a stage trigger?)
- `trigger_stage`: String (The pipeline stage that created this task)

### 4. activities
The "Memory" of the CRM. Manual logs of what happened.
- `id`: Integer (PK)
- `lead_id`: Integer (FK -> leads.id)
- `activity_type`: Enum (call, email, meeting, note)
- `description`: Text
- `logged_at`: Timestamp (Default: Now)
- `logged_by`: Integer (FK -> users.id)

## Relationships
- **1 Lead -> Many Tasks**: A lead can have multiple follow-ups scheduled.
- **1 Lead -> Many Activities**: A full timeline of every conversation had.
