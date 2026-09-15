# Cape Neto CRM — Operational Workflow & User Journey

This document details the operational workflow, daily routine, and interaction patterns designed for digital marketing agents using Cape Neto CRM.

---

## 1. The Daily Operational Loop

The CRM is engineered around a **Daily Action Philosophy**: rather than presenting a static, overwhelming directory of records, the platform immediately answers: *"What needs my attention right now?"*

```
┌────────────────────────┐
│  1. Dashboard & KPIs   │ ──► Inspect pipeline health, revenue forecast, & overdue items
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  2. Task Queue Action  │ ──► Execute urgent calls, follow-ups, & proposals
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  3. Lead Slide-Over    │ ──► Complete task, review past DMs, & log interaction note
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  4. Retainer Closing   │ ──► Mark lead 'Won' & register converted Client account
└────────────────────────┘
```

---

## 2. Core User Workflows

### Workflow A: Morning Action Check
1. **Login**: Agent signs in with their assigned role (`admin` or `sales_rep`).
2. **Dashboard Overview**: The agent reviews the top **Metrics Strip**:
   - Total Leads & Active Pipeline count
   - Pending follow-up tasks (with high-visibility badge alerts for overdue actions)
   - Estimated Pipeline Deal Value in South African Rand (ZAR)
3. **Graph Inspection**:
   - **Pipeline Funnel**: Assess lead balance between initial inquiry and contract proposal.
   - **Task Completion Donut**: Track resolution velocity.

---

### Workflow B: Inbound Instagram Lead Intake
1. An inquiry arrives via Instagram Direct Message (e.g. `@artisan_bakery_ct`).
2. Agent opens **Leads & Pipeline** view and clicks **+ Add New Lead**.
3. The system enforces **Normalization**:
   - Strips extraneous whitespace and leading `@` characters, storing a clean lower-case handle.
   - Captures contact name, telephone/WhatsApp number, estimated budget, and initial DM context.
   - Assigns lead to the creating representative automatically under RBAC rules.
4. An automated timeline activity record is initialized.

---

### Workflow C: Interconnected Slide-Over Task Resolution
When working through the **Task Queue** or **Leads View**:
1. Clicking any lead card opens the **Right-Side Slide-Over Drawer** (`LeadDetailPanel.jsx`).
2. Without navigating away from their task list, the agent can:
   - Review the complete contact profile and notes.
   - View all tasks linked to this specific lead (`GET /tasks/?lead_id={id}`).
   - Click the checkmark to resolve a task (timestamped in UTC).
   - Log an activity record directly (`action_type: message_sent` with message summary).
   - Schedule the next required follow-up task.
3. Closing the drawer leaves the agent right where they were, with data asynchronously updated in the local database.

---

### Workflow D: Converting a Won Lead to an Agency Client Retainer
1. When negotiations conclude successfully, the agent updates the lead status to **Won** directly via the status selector.
2. The representative or administrator navigates to **Client Accounts** and registers the converted client:
   - Selects retainer tier: `starter`, `growth`, `pro`, or `enterprise`.
   - Records subscription start date and annual renewal milestone (`plan_renews_at`).
   - Assigns primary billing contact.
3. The Dashboard KPI counters update to reflect client conversions and closed revenue.
