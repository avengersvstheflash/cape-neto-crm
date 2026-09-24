# Cape Neto CRM

**Production CRM built for a high-velocity Instagram-native marketing agency — shipped in a 92-hour engineering sprint.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.14-blue.svg?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red.svg)](https://www.sqlalchemy.org/)
[![Tests](https://img.shields.io/badge/Tests-14%2F14%20Passing-brightgreen.svg)](backend/test_api.py)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Live Demo:** [cape-neto-crm.vercel.app](https://cape-neto-crm.vercel.app/) · **API:** [cape-neto-crm-backend.onrender.com](https://cape-neto-crm-backend.onrender.com) · **OpenAPI Docs:** [Swagger UI](https://cape-neto-crm-backend.onrender.com/docs)

---

## Overview

Cape Neto is a South African creative and performance marketing agency that acquires clients primarily through Instagram DMs, creator collaborations, and social discovery.

Off-the-shelf CRMs (HubSpot, Salesforce) didn't fit the agency's workflow:
- **Social-first, not social-aware.** Generic CRMs treat Instagram handles as text fields, not primary communication channels.
- **Operational drag.** Per-seat pricing, heavy UIs, and steep learning curves slowed down sales reps working at DM speed.
- **Lost follow-ups.** No unified daily action queue connecting social touches to time-critical next steps.

**Cape Neto CRM is the answer:** an Instagram-native workspace combining a high-throughput FastAPI backend, row-level RBAC, an immutable audit trail, and a React 18 + Vite frontend with real-time analytics and a slide-over drawer UX.

### Demo Credentials
*(For reviewers — production systems utilize an invitation onboarding flow)*

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@capeneto.com` | `admin123` |
| **Sales Rep** | `sarah.rep@capeneto.com` | `rep123` |
| **Viewer** | `auditor@capeneto.com` | `viewer123` |

---

## Architecture

| Tier | Technology | Why |
|---|---|---|
| **API Server** | FastAPI (Python 3.10–3.14) | ASGI throughput, native OpenAPI docs, dependency-injected auth. |
| **ORM** | SQLAlchemy 2.0 | Declarative mappings, multi-dialect support (SQLite → PostgreSQL). |
| **Migrations** | Alembic (batch mode) | `render_as_batch=True` for safe SQLite schema alterations without table truncation. |
| **Auth** | Stateless JWT (`python-jose`) + `bcrypt` | Salted hashing, granular row-level data isolation. |
| **Frontend** | React 18 + Vite 6 | Sub-second HMR, ~180 kB gzipped bundles, component architecture. |
| **Styling** | Tailwind CSS + Lucide Icons | Utility-first system with custom animation keyframes. |
| **Charts** | Recharts (SVG) | Declarative pipeline funnels and revenue projections. |
| **Deployment** | Render.com (API) + Vercel Edge (SPA) | Zero-config deploys from Git, environment-based configuration. |

```text
┌──────────────────────────┐             ┌──────────────────────────┐
│ Vercel Edge (React SPA)  │ ──────────▶ │  Render.com (FastAPI)    │
│ - Vite build             │     JWT     │  - SQLAlchemy 2.0        │
│ - Recharts + Tailwind    │ ◀────────── │  - Alembic migrations    │
└──────────────────────────┘             │  - RBAC enforcement      │
                                         └───────────┬──────────────┘
                                                     │
                                         ┌───────────▼──────────────┐
                                         │   SQLite / PostgreSQL    │
                                         │   - Leads, Tasks, Clients│
                                         │   - Activities, Stages   │
                                         │   - Users (RBAC)         │
                                         └──────────────────────────┘
```

---

## Features

### Analytics Dashboard
- **Pipeline progression funnel** — leads tracked across Active, Won, Lost, and Paused.
- **Acquisition channel breakdown** — Instagram Organic, Meta Ads, and Referrals.
- **Revenue pipeline** — stacked bar projecting contract values in ZAR.
- **Task velocity metric** — real-time completion ratio per team.

### Interconnected Lead Drawer
Clicking a lead opens a 300 ms cubic-bezier slide-over without leaving the page. Fetches linked tasks (`GET /tasks/?lead_id={id}`) and full activity history (`GET /activities/?lead_id={id}`) asynchronously. 

In-drawer actions allow sales reps to:
- Complete follow-ups directly
- Update deal values inline
- Schedule next tasks
- Log direct DM touchpoints

### Full CRUD Across All Entities
- **Leads** — edit contact details, status, stage, and deal size; delete with cascade.
- **Tasks** — titles, priority levels (`low`/`medium`/`high`/`urgent`), due dates, and lifecycle states.
- **Clients** — retainer tiers (`starter`/`growth`/`pro`/`enterprise`) and annual renewals.
- **Activities** — interaction summaries and historical records.
- **Pipeline stages** — reorder and configure deal milestones.

---

## Role-Based Access Control

Enforced at **both** the FastAPI endpoint layer and the React UI layer:

| Role | Leads | Tasks | Activities | Clients | Pipeline | Users |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `admin` | Full CRUD | Full CRUD | Full audit | Full CRUD | Full CRUD | Full access |
| `sales_rep` | Create + edit own | Create + complete own | Log + edit own | Read-only | Read-only | Self profile |
| `viewer` | Read-only | Read-only | Read-only | Read-only | Read-only | Self profile |

- **Admin** — only role permitted destructive actions (`DELETE`) or global client contract edits.
- **Sales Rep** — manages and advances their own pipeline; cannot delete records or modify client contracts.
- **Viewer** — auditor role; all write UI elements are hidden/disabled, and API writes are rejected with `403 Forbidden`.

---

## Testing

14 pytest regression tests covering auth, RBAC, and full CRUD lifecycles:

```bash
cd backend && pytest test_api.py -v
```

```text
test_health_check ................................ PASSED
test_root_endpoint ............................... PASSED
test_auth_failure_invalid_credentials ............ PASSED
test_auth_success_admin_login .................... PASSED
test_auth_me_profile ............................. PASSED
test_leads_list_and_rbac ......................... PASSED
test_tasks_list_and_completion ................... PASSED
test_clients_list ................................ PASSED
test_activities_list ............................. PASSED
test_task_general_update ......................... PASSED
test_activity_update_and_delete .................. PASSED
test_client_crud ................................. PASSED
test_pipeline_stages_crud ........................ PASSED
test_lead_delete ................................. PASSED

===================== 14 passed in 4.46s =====================
```

---

## Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Backend Setup

```bash
git clone [https://github.com/avengersvstheflash/cape-neto-crm.git](https://github.com/avengersvstheflash/cape-neto-crm.git)
cd cape-neto-crm/backend

python -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

pip install -r requirements.txt
python -m alembic upgrade head
python seed.py
uvicorn main:app --reload --port 8000
```
*API interactive documentation will be live at `http://127.0.0.1:8000/docs`.*

### Frontend Setup

```bash
# In a new terminal
cd cape-neto-crm/frontend
npm install
npm run dev
```
*Application interface will be running at `http://localhost:5173`.*

---

## Deployment

### Backend → Render.com
Connect the GitHub repository as a Blueprint (Render detects `render.yaml`), or create a Web Service with:
- **Root directory:** `backend`
- **Build command:** `pip install -r requirements.txt && python -m alembic upgrade head && python seed.py`
- **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment variables:**
  - `DATABASE_URL`
  - `JWT_SECRET_KEY`
  - `JWT_ALGORITHM=HS256`
  - `ACCESS_TOKEN_EXPIRE_MINUTES=60`
  - `FRONTEND_URL`

### Frontend → Vercel
Import the repository, set the root directory to `frontend`:
- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variable:** `VITE_API_BASE` → your Render API URL (without a trailing slash)

---

## Documentation

Deeper engineering specifications live in [`docs/`](./docs):
- **System Architecture** — network topology, state management, and deployment model.
- **REST API Spec** — all 7 routers and request/response schemas.
- **Database Schema** — entity relationships and migration tracking.
- **User Workflow** — day-in-the-life sales representative routines.
- **Roadmap** — shipped milestones and enterprise roadmap scope.
- **Product Audit & Strategy** — business and technical audit.

---

## Context

Built solo by [@avengersvstheflash](https://github.com/avengersvstheflash) during a 92-hour production sprint as part of the Cape Neto Solutions technical internship[cite: 5, 13].

The brief was to ship a real CRM under real agency constraints — not a tutorial project[cite: 5]. Key engineering requirements delivered:
- Zero-downtime schema versioning across multiple iterations with Alembic batch migrations[cite: 5].
- Strict relational foreign keys and role-based data isolation enforced at the ORM layer[cite: 5].
- Decoupling a prototype into a modular component architecture with live analytics.

---

## License

MIT — see [LICENSE](./LICENSE).
