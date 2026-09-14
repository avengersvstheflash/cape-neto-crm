# Cape Neto CRM — Engineering Case Study

> **Production-grade, Instagram-native Customer Relationship Management (CRM) system** engineered for **Cape Neto** (Cape Town, South Africa). Built during a high-velocity **92-hour engineering internship sprint**, designed around NACE career competencies: Critical Thinking, Technology Application, and Professionalism.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.14-blue.svg?logo=python&logoColor=white)](https://python.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red.svg)](https://www.sqlalchemy.org/)
[![Alembic](https://img.shields.io/badge/Alembic-Migrations-orange.svg)](https://alembic.sqlalchemy.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Test Suite](https://img.shields.io/badge/Tests-9%2F9%20Passing-brightgreen.svg)](backend/test_api.py)

---

## Executive Summary

Cape Neto is a South African creative and digital marketing agency acquiring clients primarily through Instagram direct messages and social discovery. Off-the-shelf enterprise CRMs (Salesforce, HubSpot) proved excessively complex, costly, and disconnected from Instagram direct messaging workflows.

This project delivers an **Instagram-native CRM**: a secure, high-throughput REST API with row-level Role-Based Access Control (RBAC), automatic Instagram handle normalization, follow-up task orchestration, client account tracking, and a lightweight operational single-page application.

---

## System Architecture

```
                                 ┌────────────────────────┐
                                 │   Operational Client   │
                                 │ (Vite + React / SPA)   │
                                 └───────────┬────────────┘
                                             │ HTTP / JWT Bearer
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FASTAPI APPLICATION LAYER                             │
│                                                                                 │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐    │
│   │  /auth (JWT)  │  │ /leads (CRUD) │  │ /tasks (Queue)│  │ /clients (Mgt)│    │
│   └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘    │
│           │                  │                  │                  │            │
│   ┌───────▼──────────────────▼──────────────────▼──────────────────▼────────┐   │
│   │              Row-Level RBAC Policy Engine (admin/rep/viewer)            │   │
│   └──────────────────────────────────┬──────────────────────────────────────┘   │
│                                      │                                          │
│   ┌──────────────────────────────────▼──────────────────────────────────────┐   │
│   │                        SQLAlchemy 2.0 ORM Engine                        │   │
│   └──────────────────────────────────┬──────────────────────────────────────┘   │
└──────────────────────────────────────┼──────────────────────────────────────────┘
                                       │
                                       ▼
                     ┌──────────────────────────────────┐
                     │    Relational Persistence DB     │
                     │  SQLite (Dev) / Postgres (Prod)  │
                     │  Alembic Batch-mode Migrations   │
                     └──────────────────────────────────┘
```

### Core Technology Stack

| Layer | Technology | Engineering Rationale |
|---|---|---|
| **API Framework** | FastAPI (Python 3.10–3.14) | High throughput ASGI performance, native OpenAPI/Swagger self-documentation, and declarative dependency injection. |
| **Data Validation** | Pydantic V2 & `pydantic-settings` | Strict request parsing, zero-overhead serialisation, and environment configuration management. |
| **Persistence & ORM** | SQLAlchemy 2.0 | Declarative relational mappings, explicit query execution, and database dialect portability. |
| **Schema Migrations** | Alembic (Batch Mode) | Version-controlled DDL tracking; enabled `render_as_batch=True` to execute constraint updates safely on SQLite without data truncation. |
| **Authentication & RBAC** | Stateless JWT (`python-jose`) + `bcrypt` | Secure password hashing with salt generation, token-based session verification, and granular role enforcement. |
| **Frontend UI** | React + Vite + Tailwind CSS | Zero-bloat, single-page operational workspace communicating via standard `fetch()` API calls. |

---

## Role-Based Access Control (RBAC) Matrix

Access control is enforced at the dependency injection level in FastAPI, ensuring row-level data isolation across sales agents:

| Role | Leads | Task Queue | Activity Log | Client Accounts | User Management |
|---|:---:|:---:|:---:|:---:|:---:|
| `admin` | Full CRUD (All) | Full CRUD (All) | Full Audit Access | Full Access | Full Access |
| `sales_rep` | Scoped to Assigned Leads | Own Tasks Only | Scoped to Assigned Leads | Read-Only | Self Profile Only |
| `viewer` | Read-Only | Read-Only | Read-Only | Read-Only | Self Profile Only |

---

## Shipped Core Capabilities

### 1. Instagram-Native Lead Engine
- **Normalization**: Automatic sanitization and `@` prefixing of handles (e.g. `raw_handle` &rarr; `@raw_handle`).
- **Status Progression Lifecycle**: `active` &rarr; `won` &rarr; `lost` &rarr; `paused`.
- **Relational Integrity**: Foreign-key bindings to pipeline stages and assigned account executives with cascade guarantees.

### 2. Task & Follow-up Orchestration
- **Action Types**: `call`, `follow_up`, `proposal`, `check_in`, and `manual`.
- **Due Date Scheduling**: Overdue task filtering with automatic priority stratification (`low`, `medium`, `high`, `urgent`).
- **Auto-assignment**: Tasks automatically bound to the creating representative or explicitly delegated by an administrator.
- **Idempotent Completion**: State toggle (`PUT /tasks/{id}/complete`) recording server-side completion timestamps.

### 3. Comprehensive Audit Trail (Activities)
- Immutable timeline records capturing interaction history: `stage_change`, `task_created`, `task_completed`, `note_added`, `deal_created`, and `message_sent`.

### 4. Client & Account Directory
- Dedicated `Client` model tracking agency client plans (`starter`, `growth`, `pro`, `enterprise`), subscription statuses (`active`, `paused`, `churned`, `trial`), and renewal milestones.

---

## Architectural Specifications & Future Extensions

The data schema is forward-compatible and intentionally designed for horizontal integration:

- **Instagram DM Webhook Pipeline**: The `WebhookLog` entity (`webhook_id`, `source`, `event_type`, `payload`, `processed`) is primed to ingest Meta Graph API webhook events with replay resilience and deduplication.
- **Automated Pipeline Worker**: The `PipelineStage.auto_tasks` specification provides schema backing for event-driven task automation upon lead stage transitions.

---

## ⚡ 2-Minute Quickstart

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (for frontend dashboard)
- Git

### 1. Clone & Setup Backend
```bash
# Clone the repository
git clone https://github.com/avengersvstheflash/cape-neto-crm.git
cd cape-neto-crm/backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python -m alembic upgrade head

# Seed realistic demo data
python seed.py

# Start API server
uvicorn main:app --reload --port 8000
```

Interactive API documentation will be immediately accessible at **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**.

### 2. Seeded Test Credentials
| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@capeneto.com` | `admin123` | Global system control |
| **Sales Rep** | `sarah.rep@capeneto.com` | `rep123` | Scoped to assigned leads & tasks |
| **Viewer** | `auditor@capeneto.com` | `viewer123` | Read-only access |

### 3. Run Automated Tests
```bash
pytest test_api.py -v
```

### 4. Launch Operational Frontend Dashboard
```bash
cd ../frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser to interact with the operational UI. Click the **👤 Admin User** or **💼 Sales Rep** quick-login buttons to test live data immediately.

---

## API Reference Summary

### Authentication (`/auth`)
- `POST /auth/register` — Register agency team member
- `POST /auth/login` — Authenticate and receive signed JWT Bearer token
- `GET /auth/me` — Retrieve active session profile and verified role

### Leads Management (`/leads`)
- `GET /leads/` — Filterable lead index (RBAC scoped, status/stage filters, pagination)
- `POST /leads/` — Ingest lead with Instagram handle normalization
- `GET /leads/{id}` — Lead detail with relational activity history
- `PUT /leads/{id}` — Modify lead attributes, assignment, or status

### Tasks Queue (`/tasks`)
- `GET /tasks/` — List active tasks with overdue and priority filters
- `POST /tasks/` — Create scheduled task linked to lead
- `PUT /tasks/{id}/complete` — Mark task resolved with audit timestamp
- `DELETE /tasks/{id}` — Remove task (admin or task owner)

### Client Accounts (`/clients`)
- `GET /clients/` — Agency client directory
- `POST /clients/` — Register converted client account
- `GET /clients/{id}` — Client subscription detail

### Activity Timeline (`/activities`)
- `GET /activities/` — Chronological lead interaction stream
- `POST /activities/` — Record manual call log, DM note, or status update

---

## 92-Hour Internship Delivery Context

Developed by **[@avengersvstheflash](https://github.com/avengersvstheflash)** as part of the Cape Neto Solutions technical internship. 

The engagement focused on rapid delivery under real-world agency constraints:
- Delivered zero-regression database schema versioning across multiple iterations using Alembic.
- Enforced strict relational constraints and check guards at the database tier.
- Balanced lean architectural footprint with enterprise-standard security practices.

---

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for full details.
