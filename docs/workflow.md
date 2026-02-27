# User Workflow & Automation Logic — Cape Neto Edition

## 1. The Sales Funnel Path
The CRM follows the real-world conversation flow:
`Instagram DM` -> `Qualification` -> `WhatsApp/Call` -> `Proposal` -> `Follow-ups` -> `Client`.

## 2. Homepage Behavior (The Action Hub)
Upon login, the user is NOT shown a list of leads. They are shown the **"What do I do today?"** dashboard:
1. **New Inquiries**: Leads in `New Inquiry` stage needing a first response.
2. **Tasks Due Today**: Actions like "Send Proposal" or "Call Lead".
3. **Overdue Follow-ups**: Automated tasks that were missed.
4. **Today's Calls**: Leads in `Call Scheduled` stage for today.

## 3. 🤖 Automation: Stage-Triggered Tasks
To ensure no lead is forgotten, the system automatically creates tasks when specific stages are reached:

### Trigger: Status -> "Proposal Sent"
The system creates 4 automatic tasks for that lead:
- **Task 1**: "Confirm Receipt" (Due: Tomorrow)
- **Task 2**: "Follow-up Message" (Due: Day 2)
- **Task 3**: "1-Week Check-in" (Due: Day 7)
- **Task 4**: "Final 2-Week Mark (Lost?)" (Due: Day 14)

### Trigger: Status -> "Call Scheduled"
- **Task 1**: "Prepare for Call" (Due: Date of Call)

## 4. Closing the Loop
- **Winning**: When status becomes `Won`, the lead is archived as a successful client.
- **Losing**: When status becomes `Lost`, the user **must** provide a `lost_reason` (e.g., "Price too high", "No response").
- **Re-engaging**: If a lead is not ready now, they move to `Re-engage Later`, and a task is set for 2 months in the future.
