# Cape Neto CRM — REST API Specification (v1)

Comprehensive API documentation for the Cape Neto CRM backend engine. Built with FastAPI, SQLAlchemy 2.0, Pydantic V2, and JWT Bearer authentication with row-level RBAC.

---

## 🌐 Environments

| Environment | Base URL | Notes |
|---|---|---|
| **Local Development** | `http://127.0.0.1:8000` | SQLite local persistence |
| **Interactive Swagger Docs** | `http://127.0.0.1:8000/docs` | OpenAPI UI with "Authorize" button |
| **ReDoc Documentation** | `http://127.0.0.1:8000/redoc` | Static specification browser |
| **Production (Render)** | `https://<your-render-app>.onrender.com` | Live deployed API |

---

## 🔐 Authentication & Headers

All protected endpoints require a valid JSON Web Token (JWT) passed in the `Authorization` HTTP header:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Token expiration default: **60 minutes** (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| Endpoint Group | `admin` | `sales_rep` | `viewer` |
|---|---|---|---|
| **Auth & Profile** | Full access | Self profile only | Self profile only |
| **Leads** | Full CRUD across all leads | CRUD scoped to assigned leads | Read-only |
| **Tasks Queue** | Full CRUD across all tasks | CRUD scoped to own assigned tasks | Read-only |
| **Activities Audit** | Full CRUD across all logs | Create & Edit/Delete own logs | Read-only |
| **Client Accounts** | Full CRUD (Create/Edit/Delete) | Read-only directory | Read-only directory |
| **Pipeline Stages** | Full CRUD (Configure/Reorder) | Read-only stages | Read-only stages |
| **User Directory** | Full CRUD & Role assignment | Read-only | Read-only |

---

## 1. Authentication (`/auth`)

### `POST /auth/register`
Register a new agency team member.
- **Access**: Public or Admin
- **Request Body**:
  ```json
  {
    "email": "agent@capeneto.com",
    "password": "SecurePassword123!",
    "role": "sales_rep"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "id": 4,
    "email": "agent@capeneto.com",
    "role": "sales_rep",
    "created_at": "2026-09-15T10:00:00Z"
  }
  ```

### `POST /auth/login`
Authenticate with credentials and receive a signed Bearer token.
- **Request Content-Type**: `application/x-www-form-urlencoded`
- **Form Fields**: `username` (email), `password`
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "token_type": "bearer"
  }
  ```

### `GET /auth/me`
Retrieve profile of currently authenticated user session.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  {
    "id": 1,
    "email": "admin@capeneto.com",
    "role": "admin",
    "created_at": "2026-09-14T12:00:00Z"
  }
  ```

---

## 2. Lead Management (`/leads`)

### `GET /leads/`
List leads with filtering and pagination. Scoped by RBAC (sales reps only receive their assigned leads).
- **Query Parameters**:
  - `status` (*string*, optional): Filter by `active`, `won`, `lost`, `paused`
  - `stage_id` (*int*, optional): Filter by pipeline stage ID
  - `source` (*string*, optional): Filter by acquisition source (e.g. `instagram`, `referral`)
  - `search` (*string*, optional): Case-insensitive match on Instagram handle
  - `skip` (*int*, default `0`): Pagination offset
  - `limit` (*int*, default `20`, max `100`): Results limit
- **Response `200 OK`**: Array of `LeadResponse` objects.

### `POST /leads/`
Ingest and normalize a new lead. Handles are automatically cleaned and lowercased.
- **Request Body**:
  ```json
  {
    "instagram_handle": "@cape_craft_spirits",
    "full_name": "Liam Van Der Merwe",
    "phone": "+27 82 555 1234",
    "email": "liam@capecraft.co.za",
    "source": "instagram",
    "status": "active",
    "deal_value": 35000.00,
    "notes": "Met via Instagram DM inquiry regarding brand identity retainer.",
    "stage_id": 1
  }
  ```
- **Response `201 Created`**: Complete lead entity with generated `id` and timestamps.

### `GET /leads/{id}`
Retrieve full lead details by primary key.
- **Response `200 OK`** or `404 Not Found`.

### `PUT /leads/{id}`
Modify lead contact details, stage, status, or notes.
- **Request Body**: Partial or full `LeadUpdate` schema.
- **Response `200 OK`**: Updated lead record.

### `DELETE /leads/{id}`
Permanently remove a lead and cascade clean associated task and activity records.
- **Response `204 No Content`**.

---

## 3. Task Queue (`/tasks`)

### `GET /tasks/`
List scheduled follow-up actions and task queue.
- **Query Parameters**:
  - `lead_id` (*int*, optional): Filter tasks for a specific lead
  - `status` (*string*, optional): `pending`, `in_progress`, `done`, `cancelled`
  - `overdue` (*bool*, optional): Filter tasks with past due date and incomplete status
  - `assigned_to` (*int*, optional, admin only)
- **Response `200 OK`**: Array of `TaskResponse` objects.

### `POST /tasks/`
Schedule a new follow-up action for a lead.
- **Request Body**:
  ```json
  {
    "title": "Send updated retainer deck",
    "description": "Include case studies on South African beverage brands",
    "task_type": "proposal",
    "due_date": "2026-09-18",
    "priority": "high",
    "status": "pending",
    "lead_id": 1
  }
  ```
- **Response `201 Created`**.

### `PUT /tasks/{id}`
Edit task details (title, description, priority, due date, status).
- **Response `200 OK`**: Updated task object.

### `PUT /tasks/{id}/complete`
Idempotent task resolution endpoint. Sets `status="done"` and records UTC `completed_at`.
- **Response `200 OK`**.

### `DELETE /tasks/{id}`
Delete a task from the queue.
- **Response `204 No Content`**.

---

## 4. Activity Logs & Timeline (`/activities`)

### `GET /activities/`
Chronological interaction stream across all agency leads or scoped to a single lead.
- **Query Parameters**:
  - `lead_id` (*int*, optional): Get timeline for a specific lead
  - `skip` (*int*, default `0`)
  - `limit` (*int*, default `50`, max `200`)
- **Response `200 OK`**: Array of `ActivityResponse` ordered by `created_at DESC`.

### `POST /activities/`
Record a new customer touchpoint (DM, call, note, stage change).
- **Request Body**:
  ```json
  {
    "action_type": "message_sent",
    "description": "Sent updated pricing proposal via Instagram DM",
    "activity_metadata": "{\"channel\": \"instagram_dm\", \"template\": \"pricing_v2\"}",
    "lead_id": 1
  }
  ```
- **Response `201 Created`**.

### `PUT /activities/{id}`
Edit activity description note. Scoped to author or admin.
- **Response `200 OK`**.

### `DELETE /activities/{id}`
Remove an activity record.
- **Response `204 No Content`**.

---

## 5. Client Accounts (`/clients`)

### `GET /clients/`
List active client retainers, subscription tiers, and renewal dates.
- **Response `200 OK`**: Array of `ClientOut` records.

### `POST /clients/`
Register a newly closed client account.
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "name": "Kirstenbosch Botanics Studio",
    "slug": "kirstenbosch-botanics",
    "owner_email": "info@kirstenboschbotanics.co.za",
    "plan": "growth",
    "status": "active",
    "joined_at": "2026-06-15",
    "plan_renews_at": "2027-06-15"
  }
  ```
- **Response `201 Created`**.

### `GET /clients/{id}`
Retrieve client subscription details.
- **Response `200 OK`**.

### `PATCH /clients/{id}`
Update subscription tier, renewal date, or status.
- **Access**: Admin only
- **Response `200 OK`**.

### `DELETE /clients/{id}`
Remove a client account record.
- **Access**: Admin only
- **Response `204 No Content`**.

---

## 6. Pipeline Stages (`/pipeline-stages`)

### `GET /pipeline-stages/`
List pipeline funnel stages ordered by ascending position.
- **Response `200 OK`**: Array of `PipelineStageResponse`.

### `POST /pipeline-stages/`
Create a new pipeline funnel stage.
- **Access**: Admin only
- **Request Body**:
  ```json
  {
    "name": "Contract Review",
    "position": 4,
    "auto_tasks": "Send NDA and service agreement"
  }
  ```
- **Response `201 Created`**.

### `PUT /pipeline-stages/{id}`
Update stage name, position, or automated task trigger.
- **Access**: Admin only
- **Response `200 OK`**.

### `DELETE /pipeline-stages/{id}`
Delete a stage from the pipeline.
- **Access**: Admin only
- **Response `204 No Content`**.

---

## 7. System Health & Root

### `GET /health`
Liveness and database connectivity verification probe.
- **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "database": "connected"
  }
  ```

### `GET /`
Root index reporting system info, version, and documentation routes.
- **Response `200 OK`**.
