# Cape Neto CRM — Production Engineering Case Study & Live Platform

> **Production-grade, Instagram-native Customer Relationship Management (CRM) system** engineered for **Cape Neto** — a high-velocity digital marketing agency based in Cape Town, South Africa. Built during an intensive **92-hour engineering sprint**, structured around NACE career competencies: Critical Thinking, Technology Application, and Software Professionalism.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.14-blue.svg?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red.svg)](https://www.sqlalchemy.org/)
[![Alembic](https://img.shields.io/badge/Alembic-Batch_Migrations-orange.svg)](https://alembic.sqlalchemy.org/)
[![Render](https://img.shields.io/badge/Deploy-Render.com-46E3B7.svg?logo=render&logoColor=white)](https://render.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000.svg?logo=vercel&logoColor=white)](https://vercel.com)
[![Test Suite](https://img.shields.io/badge/Tests-14%2F14%20Passing-brightgreen.svg)](backend/test_api.py)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🚀 Live Demonstrations

| Component | Platform | Live URL |
|---|---|---|
| **Frontend Workspace (SPA)** | Vercel Edge Network | `https://cape-neto-crm.vercel.app` *(Configure with your Vercel URL)* |
| **Backend REST API** | Render.com Web Service | `https://cape-neto-crm-backend.onrender.com` *(Configure with your Render URL)* |
| **Interactive OpenAPI Docs** | Swagger UI | `https://cape-neto-crm-backend.onrender.com/docs` |

---

## 📌 Executive Summary

Cape Neto is a South African creative and performance digital marketing agency acquiring clients primarily through Instagram direct messages, creator collaborations, and social discovery. 

Traditional enterprise CRMs (HubSpot, Salesforce) failed to meet agency operational requirements:
1. **Disconnection from Instagram Workflows**: Generic CRMs treat social handles as afterthought text fields rather than primary communication channels.
2. **Excessive Complexity & Cost**: Bloated enterprise tiers with per-seat billing, sluggish load times, and steep learning curves that slowed down sales representatives.
3. **Forgotten DM Inquiries**: Absence of a unified "Daily Action Queue" connecting social touches to time-critical follow-ups.

**Cape Neto CRM solves this:** An Instagram-native CRM combining a high-throughput **FastAPI** backend with row-level **Role-Based Access Control (RBAC)**, an immutable **audit trail**, and a responsive **React 18 + Vite** workspace equipped with **Recharts analytics** and an **interconnected slide-over drawer**.

---

## 🖥️ Workspace Layout & Design

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  CN │ Cape Neto CRM                                           admin@capeneto.com [Sign Out] │
├──────────┬──────────────────────────────────────────────────────────────────────────────────┤
│          │  ┌───────────────┬───────────────┬───────────────┬───────────────┬─────────────┐ │
│ 📊 Dash  │  │ Total Leads:6 │ Active: 3     │ Tasks Due: 4  │ Clients: 3    │ Value: R185k│ │
│ 🎯 Leads │  └───────────────┴───────────────┴───────────────┴───────────────┴─────────────┘ │
│ 📋 Tasks │                                                                                  │
│ 👥 Clients│  ┌─ Analytics Dashboard ───────────────────────┐ ┌─ Lead Slide-Over Drawer ────┐ │
│ 📈 Audit │  │  [Lead Pipeline Funnel] [Lead Sources Donut]│ │ @cape_craft_spirits [Edit]   │ │
│          │  │  [Revenue by Stage]     [Task Completion]   │ │ Status: Active | Value: R35k │ │
│          │  │                                             │ │ ──────────────────────────── │ │
│          │  │  ── Recent Activity Feed ──                 │ │ Tasks (2 linked)             │ │
│          │  │  • @cape_craft → Proposal Sent  (10m ago)   │ │  ☑ Send brochure (Due Today) │ │
│          │  │  • @atlantic_sea → Deal Closed  (1h ago)    │ │ Activity History (3 logs)    │ │
│          │  │  • @table_mtn → Retainer Renewed(2h ago)    │ │  • DM Sent: Proposal deck    │ │
│          │  └─────────────────────────────────────────────┘ └──────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Capabilities Shipped

### 1. Analytics & Pipeline Intelligence (Recharts)
- **Pipeline Progression Funnel**: Bar visualization categorizing leads across `Active`, `Won`, `Lost`, and `Paused`.
- **Acquisition Channel Distribution**: Donut breakdown revealing social discovery sources (Instagram Organic, Meta Ads, Referrals).
- **Revenue Pipeline**: Horizontal stacked bar projecting prospective contract values in South African Rand (ZAR).
- **Task Velocity Metric**: Real-time completion ratio tracking team operational efficiency.

### 2. Interconnected Lead Slide-Over Drawer
- Clicking any lead in the application opens a sleek **300ms cubic-bezier slide-over drawer** without navigating away.
- **Relational Data Scoping**: Asynchronously fetches linked tasks (`GET /tasks/?lead_id={id}`) and complete interaction histories (`GET /activities/?lead_id={id}`).
- **In-Drawer Actions**: Complete follow-ups, update lead deal values, schedule new tasks, and record DM touchpoints right inside the drawer.

### 3. Complete CRUD & Asynchronous Persistence
Every core business entity is fully editable and modifiable with direct asynchronous persistence to the local SQLite/PostgreSQL database:
- **Leads**: Edit contact details, status, stage, and deal size; delete with cascade guarantees.
- **Task Queue**: Edit titles, priority levels (`low`, `medium`, `high`, `urgent`), due dates, and lifecycle states.
- **Client Accounts**: Register client accounts, modify retainer tiers (`starter`, `growth`, `pro`, `enterprise`), and track annual renewals.
- **Activity Timeline**: Edit interaction summaries and remove outdated records.
- **Pipeline Stages**: Configure and reorder sequential deal milestones.

---

## 🏗️ System Architecture

| Tier | Technology | Rationale |
|---|---|---|
| **API Server** | FastAPI (Python 3.10–3.14) | High throughput ASGI runtime, native OpenAPI self-documentation, declarative dependency injection. |
| **Persistence & ORM** | SQLAlchemy 2.0 | Declarative relational mappings, query performance, and multi-dialect compatibility. |
| **Migrations** | Alembic (Batch Mode) | `render_as_batch=True` enabled to perform safe schema alterations on SQLite without table truncation. |
| **Authentication & RBAC** | Stateless JWT (`python-jose`) + `bcrypt` | Secure salted password hashing and granular row-level data isolation. |
| **Frontend Framework** | React 18 + Vite 6 | Sub-second Hot Module Replacement, lean build bundles (~180 kB gzipped), and component-based UI. |
| **Design System** | Tailwind CSS + Lucide Icons | Utility-first styling with custom animation keyframes and responsive layout cards. |
| **Data Visualization** | Recharts (SVG) | Declarative charting engine for pipeline funnels and revenue projection. |

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

Access control is enforced at the dependency injection level in FastAPI, ensuring strict row-level data isolation:

| Role | Leads | Task Queue | Activity Log | Client Accounts | Pipeline Stages | User Management |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `admin` | Full CRUD (All) | Full CRUD (All) | Full Audit Access | Full CRUD | Full CRUD | Full Access |
| `sales_rep` | Scoped to Own Leads | Scoped to Own Tasks | Scoped to Own Leads | Read-Only | Read-Only | Self Profile Only |
| `viewer` | Read-Only | Read-Only | Read-Only | Read-Only | Read-Only | Self Profile Only |

---

## ⚡ 2-Minute Local Quickstart

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node v24)
- Git

### Step 1: Start Backend API
```bash
# Clone the repository
git clone https://github.com/avengersvstheflash/cape-neto-crm.git
cd cape-neto-crm/backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations and seed demo data
python -m alembic upgrade head
python seed.py

# Launch FastAPI development server
uvicorn main:app --reload --port 8000
```
Interactive API documentation will be available at **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**.

### Step 2: Launch Frontend Workspace
```bash
# In a new terminal window
cd cape-neto-crm/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. Use the **Quick Demo Access** buttons to log in instantly:
- **Admin**: `admin@capeneto.com` / `admin123`
- **Sales Rep**: `sarah.rep@capeneto.com` / `rep123`
- **Viewer**: `auditor@capeneto.com` / `viewer123`

---

## 🚢 Production Deployment Guide

### Deploy Backend to Render.com
1. Create an account on **[Render.com](https://render.com)**.
2. Click **New +** &rarr; **Blueprint** and connect your GitHub repository (Render will automatically detect `render.yaml`).
   *Alternatively, create a **Web Service** with the following manual settings:*
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python -m alembic upgrade head && python seed.py`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Configure Environment Variables in Render:
   - `DATABASE_URL`: `sqlite:///./crm.db` (or connect a managed Render PostgreSQL database: `postgresql://...`)
   - `JWT_SECRET_KEY`: `<generate-a-random-32-char-secret>`
   - `JWT_ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `60`
   - `FRONTEND_URL`: `https://your-frontend.vercel.app` (or `*`)
4. Click **Deploy**. Your API will be live at `https://<app-name>.onrender.com`.

---

### Deploy Frontend to Vercel
1. Create an account on **[Vercel.com](https://vercel.com)**.
2. Click **Add New...** &rarr; **Project** and import your `cape-neto-crm` repository.
3. Configure Project Settings:
   - **Root Directory**: Click edit and select `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE`: `https://<your-backend-app>.onrender.com` *(your live Render API URL, without trailing slash)*
5. Click **Deploy**. Vercel will build and serve your SPA at `https://<project-name>.vercel.app`.

---

## 🧪 Automated Testing Suite (14/14 Passing)

All endpoints, RBAC constraints, and CRUD lifecycle rules are verified with automated pytest regression tests:

```bash
cd backend
pytest test_api.py -v
```

```text
test_api.py::test_health_check PASSED                    [  7%]
test_api.py::test_root_endpoint PASSED                   [ 14%]
test_api.py::test_auth_failure_invalid_credentials PASSED[ 21%]
test_api.py::test_auth_success_admin_login PASSED        [ 28%]
test_api.py::test_auth_me_profile PASSED                 [ 35%]
test_api.py::test_leads_list_and_rbac PASSED             [ 42%]
test_api.py::test_tasks_list_and_completion PASSED       [ 50%]
test_api.py::test_clients_list PASSED                    [ 57%]
test_api.py::test_activities_list PASSED                 [ 64%]
test_api.py::test_task_general_update PASSED             [ 71%]
test_api.py::test_activity_update_and_delete PASSED      [ 78%]
test_api.py::test_client_crud PASSED                     [ 85%]
test_api.py::test_pipeline_stages_crud PASSED            [ 92%]
test_api.py::test_lead_delete PASSED                     [100%]
======================= 14 passed in 4.46s =======================
```

---

## 📚 Technical Documentation Index

Detailed specifications and architectural deep dives are cataloged in [`docs/`](docs/):
- **[System Architecture](docs/architecture.md)**: Network topology, state management, and deployment model.
- **[REST API Specification](docs/api.md)**: Exhaustive request and response documentation for all 7 routers.
- **[Database Schema](docs/schema.md)**: Relational entity diagrams, field definitions, and migration strategies.
- **[User Workflow Guide](docs/workflow.md)**: Day-in-the-life operational routines and slide-over user journeys.
- **[Development Roadmap](docs/roadmap.md)**: Completed milestones and future enterprise roadmap.
- **[Comprehensive Product Audit & Strategy](docs/audit_and_product_strategy.md)**: Full business and technical audit with expansion roadmap.

---

## 92-Hour Internship Delivery Context

Developed by **[@avengersvstheflash](https://github.com/avengersvstheflash)** as part of the Cape Neto Solutions technical internship.

The project demonstrates high-velocity full-stack engineering under real-world agency constraints:
- Built zero-downtime database schema versioning across multiple iterations with Alembic.
- Enforced strict relational foreign keys and role-based data isolation at the ORM layer.
- Refactored initial single-file prototypes into a scalable, decoupled component architecture with Recharts data visualization.

---

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for full details.
