# API Specification (v1)

## Base URL
`http://localhost:8000/api/v1`

## Authentication
**Method**: JWT Bearer Token  
**Header**: `Authorization: Bearer <your_token>`

---

## 🔐 Authentication Endpoints
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/auth/register` | `POST` | Create a new user account. |
| `/auth/login` | `POST` | Exchange credentials for a JWT token. |
| `/auth/me` | `GET` | Get profile of currently logged-in user. |

---

## 👥 Lead Management Endpoints
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/leads` | `GET` | List leads (supports filters: status, assigned_to). |
| `/leads/{id}` | `GET` | Get full details of a specific lead. |
| `/leads` | `POST` | Add a new lead to the pipeline. |
| `/leads/{id}` | `PUT` | Update lead info or change status. |
| `/leads/{id}/convert` | `POST` | Transform a 'Won' lead into a Client record. |

---

## 📋 Activity & Interaction Endpoints
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/activities` | `GET` | Get history for a lead (query: `related_to_id`). |
| `/activities` | `POST` | Log a new call, email, or meeting note. |

---

## ✅ Task Endpoints
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/tasks` | `GET` | List tasks (filters: assigned_to, status). |
| `/tasks` | `POST` | Create a new to-do item. |
| `/tasks/{id}/complete`| `PUT` | Mark a task as finished. |

---

## 📊 Dashboard Endpoints
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/dashboard/stats` | `GET` | Get totals (leads, revenue, active clients). |
