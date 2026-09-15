# Cape Neto CRM — Development Roadmap & Product Milestones

Comprehensive tracking of shipped engineering phases and future product roadmap for the Cape Neto agency CRM platform.

---

## 🏆 Completed Milestones (Shipped & Verified)

### Phase 1: Foundation & Backend Architecture ✅
- [x] FastAPI application core with OpenAPI self-documentation (`/docs`, `/redoc`)
- [x] SQLAlchemy 2.0 ORM data model definition (7 primary models)
- [x] Alembic migration pipeline with SQLite batch mode (`render_as_batch=True`)
- [x] Stateless JWT bearer authentication with salted `bcrypt` password hashing
- [x] Role-Based Access Control (RBAC) dependency injection (`admin`, `sales_rep`, `viewer`)
- [x] Comprehensive database seeder (`seed.py`) with realistic South African agency data

### Phase 2: Core CRM Domain & Relational Integrity ✅
- [x] Instagram-native lead intake engine with handle sanitization (`@` prefixing and lowercase normalization)
- [x] Relational task queue with priority levels (`low`, `medium`, `high`, `urgent`) and overdue detection
- [x] Chronological activity audit trail capturing touchpoints and note history
- [x] Converted client accounts directory with tiered retainers (`starter`, `growth`, `pro`, `enterprise`)
- [x] Dynamic pipeline stage management router (`/pipeline-stages/`)
- [x] Full CRUD operations (Create, Read, Update, Delete) across Leads, Tasks, Clients, and Activities
- [x] Automated backend regression test suite (14/14 passing tests in `test_api.py`)

### Phase 3: Modern Analytics Dashboard & Interconnected UI ✅
- [x] Lightweight single-page application built with React 18 and Vite 6
- [x] Tailwind CSS utility system with cubic-bezier micro-animations and loading skeletons
- [x] Recharts SVG analytics dashboard (Pipeline Funnel, Lead Sources, ZAR Revenue Forecast, Task Completion)
- [x] Dynamic right-side slide-over drawer (`LeadDetailPanel.jsx`) connecting leads to linked tasks and activities
- [x] 1-Click task resolution and inline note logging without page reload
- [x] Live search, status toggle filters, and animated toast notification system

### Phase 4: Production Deployment Readiness ✅
- [x] Environment-aware API client (`VITE_API_BASE`) with local fallback
- [x] Vercel single-page application deployment configuration (`vercel.json`)
- [x] Render.com web service blueprint (`render.yaml`) with automated migration execution
- [x] PostgreSQL connection string auto-normalization (`postgres://` &rarr; `postgresql://`)
- [x] Production ASGI process management with Uvicorn and Gunicorn

---

## 🚀 Future Product Roadmap (Next Generations)

### Phase 5: Live Social Channel Integrations (Q3 2026)
- **Meta Graph API Webhook Worker**: Direct ingestion of incoming Instagram Direct Messages via verified Meta webhook listeners (`WebhookLog` entity).
- **WhatsApp Business Cloud API**: Two-way messaging bridge allowing agents to reply to WhatsApp inquiries directly from the lead detail panel.
- **Automated Task Triggers**: Real-time task creation when a lead moves into `Proposal Sent` (Day 1, Day 3, 1-Week automated follow-up scheduling).

### Phase 6: Multi-Agency SaaS Architecture (Q4 2026)
- **Tenant Isolation**: Tenant scoping partitioning data across multiple marketing agencies.
- **Client Collaboration Portal**: Restricted portal access for clients to review proposal drafts, upload creative assets, and review contract renewal terms.
- **AI-Powered Response Copilot**: Integration with Google Gemini / DeepMind APIs to analyze DM inquiry intent, generate contextual reply drafts, and predict deal closing probabilities.
