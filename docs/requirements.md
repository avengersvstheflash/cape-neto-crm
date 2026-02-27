# Product Requirements Document (PRD) — Cape Neto Edition

## Project Vision
A conversation-driven lead tracking and "Daily Action" system. The goal is to ensure no Instagram DM or WhatsApp follow-up is ever forgotten.

## 🎯 The "Daily Action" Dashboard (Homepage)
The system must open to a "What do I do today?" screen, NOT a lead list.
- **Tasks Due Today**: Immediate actions needed.
- **Overdue Follow-ups**: Leads that went silent.
- **New Inquiries**: Leads needing their first response.
- **Call Schedule**: Upcoming meetings for the day.

## Functional Requirements
- **Lead Fields**: Must include `instagram_username`, `whatsapp_available` (Yes/No), and `lead_source`.
- **Pipeline Stages**: `New Inquiry` -> `Contacted` -> `Qualified` -> `Call Scheduled` -> `Proposal Sent` -> `Negotiation` -> `Won` -> `Lost` -> `Re-engage Later`.
- **Automated Tasks**: Moving a lead to `Proposal Sent` must automatically trigger a sequence of 4 follow-up tasks (Day 1, Day 2, 1 Week, 2 Weeks).
- **Lost Audit**: Every 'Lost' lead must have a `lost_reason` recorded.
