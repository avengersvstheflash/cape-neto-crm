# Product Requirements Document (PRD)

## Project Vision
To build a high-performance, lightweight CRM that solves the "lost lead" problem for the Cape Neto agency.

## Functional Requirements (The "Must-Haves")

### 1. User Identity & Security
- System must allow separate accounts for team members.
- Passwords must never be stored in plain text (use `bcrypt`).
- Access to all client data must require a valid JWT token.

### 2. Lead Pipeline (The Core)
- Users must be able to add leads with Name, Email, Source, and Estimated Value.
- Leads must move through status stages: `New` -> `Contacted` -> `Proposal` -> `Negotiation` -> `Won/Lost`.
- A drag-and-drop Kanban board must visualize this pipeline.

### 3. Interaction Audit Trail
- Every call or meeting note must be timestamped.
- Notes cannot be deleted (to maintain an accurate history of the relationship).

### 4. Client Conversion
- When a lead is marked as 'Won', it must be convertible into a 'Client' record with additional fields (Contract Start Date, Value).

## Non-Functional Requirements (The "Quality Controls")
- **Performance**: Every page must load in under 2 seconds.
- **Responsiveness**: The CRM must be usable on a tablet or mobile browser.
- **Reliability**: Data must be stored in a relational database (Relational data = Relational DB).
