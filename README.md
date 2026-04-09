# Cape Neto CRM

> A custom Instagram-native Customer Relationship Management (CRM) system built for **Cape Neto** — a South African service agency. Developed as a full-stack internship project by [@avengersvstheflash](https://github.com/avengersvstheflash).

---

## Project Status

> **Week 2 Complete** — Core backend engine live. JWT auth, full CRUD, RBAC, tasks, activities, and config hardening all shipped and verified.

| Phase | Status |
|---|---|
| Week 1 — Foundation & Models | ✅ Complete |
| Week 2 — Core CRUD, Auth & RBAC | ✅ Complete |
| Week 3 — Pipeline, Conversion & Webhooks | 🔜 Up next |
| Week 4 — Frontend (React + Vite) | ⬜ Pending |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.14) |
| Database | SQLite (dev) → PostgreSQL (prod) |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic |
| Auth | JWT (python-jose) + bcrypt |
| Config | pydantic-settings + .env |
| Frontend | React + Vite (Week 4) |
| Styling | Tailwind CSS (Week 4) |

---

## Project Structure

```
cape-neto-crm/
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   │   └── 9b6850aa0158_week2_full_schema.py
│   │   └── env.py                  ← render_as_batch=True for SQLite
│   ├── routers/
│   │   ├── auth.py                 ← Register, Login, /me
│   │   ├── leads.py                ← Full CRUD + RBAC + pagination
│   │   ├── tasks.py                ← List, Create, Complete, Delete
│   │   └── activities.py          ← Timeline + Create
│   ├── auth.py                     ← JWT + bcrypt utilities
│   ├── config.py                   ← pydantic-settings env loader
│   ├── database.py                 ← SQLAlchemy engine + session
│   ├── main.py                     ← FastAPI app entry point
│   ├── models.py                   ← 7 ORM models
│   ├── schemas.py                  ← Pydantic V2 schemas
│   ├── .env                        ← Local secrets (not committed)
│   ├── alembic.ini
│   └── requirements.txt
├── docs/
├── .gitignore
├── LICENSE
└── README.md
```

---

## API Endpoints (Week 2)

### Auth — `/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login, returns JWT token |
| GET | `/auth/me` | Get current user profile |

### Leads — `/leads`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/leads/` | List leads (RBAC + filters + pagination) |
| POST | `/leads/` | Create lead (Instagram normalization) |
| GET | `/leads/{id}` | Get lead detail |
| PUT | `/leads/{id}` | Update lead (partial, RBAC) |

### Tasks — `/tasks`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks/` | List tasks (RBAC + overdue filter) |
| POST | `/tasks/` | Create task (auto-assign to creator) |
| PUT | `/tasks/{id}/complete` | Complete task + timestamp |
| DELETE | `/tasks/{id}` | Delete task (204 No Content) |

### Activities — `/activities`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/activities/` | Log an activity against a lead |
| GET | `/activities/` | Get timeline (newest first) |

### System
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check + DB connection status |
| GET | `/` | Root — API info |

---

## Data Models

7 SQLAlchemy ORM models covering the full CRM domain:

- **User** — roles: `admin`, `sales_rep`, `viewer`
- **Lead** — Instagram-native, status: `active`, `won`, `lost`, `paused`
- **Task** — type: `manual`, `call`, `follow_up`, `proposal`, `check_in`
- **Activity** — action_type: `stage_change`, `task_created`, `task_completed`, `note_added`, `deal_created`, `message_sent`, `status_change`
- **PipelineStage** — visual funnel (Week 3)
- **Deal** — linked to leads + users
- **WebhookLog** — Instagram DM event storage (Week 3)

---

## RBAC Model

| Role | Leads | Tasks | Activities |
|---|---|---|---|
| `admin` | All leads | All tasks | Full access |
| `sales_rep` | Own leads only | Own tasks only | Own leads only |
| `viewer` | Read-only | Read-only | Read-only |

---

## Getting Started

### Prerequisites
- Python 3.10+
- Git

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/avengersvstheflash/cape-neto-crm.git
cd cape-neto-crm/backend

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create your .env file
copy .env.example .env       # Windows
cp .env.example .env         # Mac/Linux
# Edit .env with your values

# 5. Run migrations
alembic upgrade head

# 6. Start the server
uvicorn main:app --reload
```

### Environment Variables

```env
DATABASE_URL=sqlite:///./crm.db
JWT_SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
DEBUG=true
```

### API Documentation

Once running, open: **http://127.0.0.1:8000/docs**

Swagger UI is available with full interactive testing for all endpoints.

---

## Roadmap

- [x] Repository initialization
- [x] Backend scaffold (FastAPI)
- [x] Database models (7 models)
- [x] Alembic migrations
- [x] JWT authentication + bcrypt
- [x] Leads CRUD with RBAC
- [x] Tasks router (create, complete, delete)
- [x] Activities timeline
- [x] Config hardening (pydantic-settings + .env)
- [ ] Pipeline stages router
- [ ] Lead → Client conversion endpoint
- [ ] Instagram webhook receiver
- [ ] Request logging middleware
- [ ] Frontend scaffold (React + Vite)
- [ ] Dashboard UI
- [ ] Production deployment

---

## Commit History

| Commit | Description |
|---|---|
| `2050e18` | feat: Week 2 complete — config hardening |
| `ed082c8` | feat: Week 2 core CRUD, RBAC, and migration restore |
| `bcb9e1e` | feat: add /health endpoint with DB check |
| `3f4b179` | feat: add Alembic migrations — initial schema |
| `d66d46a` | fix: add missing dependencies + auth.py |

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

> Developed by [@avengersvstheflash](https://github.com/avengersvstheflash) — Internship Project 2026 | Cape Neto, South Africa
