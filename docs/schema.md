# Database Schema Design

## Overview
This project uses **SQLite** for development and **PostgreSQL** for production. We use **SQLAlchemy ORM** to manage data.

## Core Tables

### 1. users
Stores team members and authentication credentials.
- `id`: Integer (Primary Key)
- `email`: String (Unique, Not Null)
- `password_hash`: String (Hashed with bcrypt)
- `first_name`: String
- `last_name`: String
- `role`: Enum (admin, sales_rep, viewer)
- `is_active`: Boolean

### 2. leads
Potential clients in the sales pipeline.
- `id`: Integer (PK)
- `name`: String (Required)
- `company_name`: String
- `email`: String
- `status`: String (Default: 'new')
- `estimated_value`: Decimal
- `assigned_to`: Integer (FK -> users.id)
- `last_contact_date`: Timestamp

### 3. clients
Converted leads (closed deals).
- `id`: Integer (PK)
- `name`: String
- `contract_value`: Decimal
- `status`: Enum (active, on_hold, completed)
- `original_lead_id`: Integer (FK -> leads.id)

### 4. activities
Logged interactions (calls, emails, meetings).
- `id`: Integer (PK)
- `activity_type`: Enum (call, email, meeting, note)
- `related_to_id`: Integer (ID of lead or client)
- `description`: Text
- `logged_by`: Integer (FK -> users.id)

### 5. tasks
To-do items for the team.
- `id`: Integer (PK)
- `title`: String
- `due_date`: Date
- `priority`: Enum (low, medium, high)
- `status`: Enum (pending, completed)

## Relationships
- **1 User -> Many Leads**: One sales rep can manage many potential deals.
- **1 Lead -> Many Activities**: One lead can have a history of many calls/emails.
- **1 Lead -> 1 Client**: A lead becomes exactly one client when the deal is won.
