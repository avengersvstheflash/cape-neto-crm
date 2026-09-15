# Cape Neto CRM — Technical Architecture Specification

This document details the architectural design, system topology, security boundaries, and production deployment models for the **Cape Neto Customer Relationship Management (CRM)** platform.

---

## 1. System Topology Overview

The platform uses a decoupled client-server architecture designed for high availability, zero latency micro-interactions, and horizontal scalability:

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 CLIENT APPLICATION TIER                │
                  │             Vercel Edge Network / CDN (SPA)            │
                  │   React 18 • Vite 6 • Tailwind CSS • Recharts Engine   │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                                              │ HTTPS / JSON REST / JWT Bearer
                                              │ (VITE_API_BASE)
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                APPLICATION SERVER TIER                                 │
│                               Render.com Cloud Platform                                │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        FastAPI High-Throughput ASGI Core                       │   │
│   │                                                                                │   │
│   │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐    │   │
│   │  │  /auth (JWT)  │  │ /leads (CRUD) │  │ /tasks (Queue)│  │ /clients (Mgt)│    │   │
│   │  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘    │   │
│   │          │                  │                  │                  │            │   │
│   │  ┌───────▼──────────────────▼──────────────────▼──────────────────▼────────┐   │   │
│   │  │            Dependency Injection & RBAC Guard (`get_current_user`)        │   │   │
│   │  └───────────────────────────────────┬─────────────────────────────────────┘   │   │
│   │                                      │                                         │   │
│   │  ┌───────────────────────────────────▼─────────────────────────────────────┐   │   │
│   │  │              SQLAlchemy 2.0 Declarative ORM & Session Pool              │   │   │
│   │  └───────────────────────────────────┬─────────────────────────────────────┘   │   │
│   └──────────────────────────────────────┼─────────────────────────────────────────┘   │
└──────────────────────────────────────────┼─────────────────────────────────────────────┘
                                           │
                                           │ DB-API (psycopg2 / sqlite3)
                                           ▼
                         ┌──────────────────────────────────┐
                         │      DATA PERSISTENCE TIER       │
                         │ SQLite (Local) / Postgres (Prod) │
                         │  Alembic Batch-Mode Migrations   │
                         └──────────────────────────────────┘
```

---

## 2. Component Layer Breakdown

### A. Frontend Client Tier (React + Vite)
- **Framework**: React 18 with functional components, hooks (`useMemo`, `useCallback`, `useRef`), and zero external state managers (clean prop-drilling suitable for high speed and minimal bundle footprint).
- **Styling**: Tailwind CSS utility design system with customized cubic-bezier animations (`animate-view-enter`, `animate-modal-enter`, `toast-progress`).
- **Data Visualization**: Recharts SVG engine providing responsive analytics cards (Pipeline Funnel, Source Distribution, Revenue Forecast in ZAR, and Work Completion Rate).
- **Interconnected Slide-Over Panel**: Right-side drawer (`LeadDetailPanel.jsx`) that fetches relational entity children (`GET /tasks/?lead_id={id}` and `GET /activities/?lead_id={id}`) asynchronously, enabling complete lead workflow management without full page reloads.

### B. Application Server Tier (FastAPI)
- **ASGI Framework**: FastAPI running atop Uvicorn / Gunicorn for asynchronous request handling.
- **Dependency Injection**: Reusable dependencies (`get_db`, `get_current_user`, `require_admin`) injected directly into route signatures for row-level security and connection safety.
- **Data Validation & Serialization**: Pydantic V2 schemas enforcing strict input sanitization, type safety, and automatic OpenAPI schema generation.
- **CORS Architecture**: Configurable cross-origin middleware supporting dynamic origins (`FRONTEND_URL` for production Vercel domains, with local development fallbacks).

### C. Data Persistence Tier (SQLAlchemy 2.0 & Alembic)
- **ORM**: SQLAlchemy 2.0 declarative mappings with explicit relationship declarations, lazy loading options, and cascade deletes.
- **Migrations Engine**: Version-controlled Alembic migrations configured with `render_as_batch=True` in `backend/alembic/env.py`. This is critical for SQLite compatibility, enabling non-destructive table alteration and foreign key updates without table recreation issues.
- **Database Dialect Portability**: Automatic connection string adaptation converting legacy `postgres://` URLs from managed providers (Render/Heroku) into SQLAlchemy 2.0 compatible `postgresql://` drivers.

---

## 3. Security & Access Control Model

### Authentication Pipeline
1. **Credential Transmission**: Client submits credentials via `POST /auth/login` (`application/x-www-form-urlencoded`).
2. **Password Verification**: Server compares input against bcrypt hashed password with unique salt (`passlib.context.CryptContext`).
3. **Token Issuance**: Server signs a stateless JWT containing user `sub` (ID), role claim, and expiration timestamp using `HS256` encryption.
4. **Token Verification**: Downstream endpoints decrypt the token using `python-jose` on each request, resolving the verified `User` instance before executing business logic.

### Row-Level RBAC Enforcement
- **Admin**: Unrestricted read/write across all platform resources and tenant configurations.
- **Sales Rep**: Query filters automatically restrict `Lead.assigned_to == current_user.id` and `Task.assigned_to == current_user.id`. Reps can read client accounts but cannot modify or delete them.
- **Viewer**: Read-only access across all data entities; write operations return `403 Forbidden`.

---

## 4. Production Deployment Topology

### Backend: Render.com Web Service
- **Source**: `backend/` directory of repository.
- **Build Command**: `pip install -r requirements.txt && python -m alembic upgrade head && python seed.py`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Container Health**: Managed via `/health` probe checking active database session connectivity.

### Frontend: Vercel Edge Network
- **Source**: `frontend/` directory of repository.
- **Build Output**: `dist/` (static SPA assets).
- **Rewrites**: `vercel.json` maps all paths to `/index.html` for client-side routing.
- **Environment**: `VITE_API_BASE` injects the live Render backend URL at compile time.
