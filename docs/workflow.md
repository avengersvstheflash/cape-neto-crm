# User Workflow & Logic

## 1. Authentication & Session Management
- **Flow**: Landing Page -> Login Form -> Backend Validation -> JWT Token Storage (LocalStorage) -> Dashboard.
- **Security**: Token expires after 24 hours; unauthenticated users are automatically redirected to the Login page.

## 2. Lead Acquisition & Onboarding
- **Action**: "Add Lead" button on Dashboard or Leads List.
- **Process**: User fills out the 8 core fields (Name, Email, Source, etc.).
- **Validation**: System checks for valid email format and ensuring the lead isn't a duplicate.
- **Outcome**: Lead is created with status `New` and assigned to the current user.

## 3. The Sales Pipeline Journey
- **Kanban Movement**: Dragging a lead card from `Contacted` to `Proposal Sent`.
- **Automatic Trigger**: When a status changes, the system auto-logs an activity: *"Status changed from [Old Status] to [New Status] by [User] on [Date]."*
- **Manual Logging**: Users click "Log Activity" on the Lead Detail page to record specifics of calls or meetings.

## 4. Conversion (The "Winning" Moment)
- **Trigger**: When a Lead Status is updated to `Won`.
- **Process**: A "Convert to Client" modal appears.
- **Data Migration**: 
  - The Lead is marked as `is_converted: true`.
  - A new record is created in the `Clients` table using the lead's data.
  - The interaction history remains linked for full visibility.

## 5. Task & Follow-up Management
- **Dashboard Widget**: Shows "Tasks Due Today" and "Overdue Tasks" in red.
- **Workflow**: Completing a task (checkbox click) marks it as `Done` and removes it from the active dashboard view but keeps it in the "Completed Tasks" history.
