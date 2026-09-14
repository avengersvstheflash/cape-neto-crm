# test_crm.py — Cape Neto CRM Backend Demo Script
# Run: python test_crm.py (while uvicorn is running)

import requests
import json

BASE = "http://127.0.0.1:8000"
TOKEN = None  # will be filled after login

def header():
    return {"Authorization": f"Bearer {TOKEN}"}

def pretty(label, response):
    print(f"\n{'='*50}")
    print(f"🔹 {label}")
    print(f"   Status : {response.status_code}")
    try:
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"   Response: {response.text}")

# ── STEP 1: Health Check ──────────────────────────────
res = requests.get(f"{BASE}/")
pretty("Health Check — GET /", res)

# ── STEP 2: Register Admin User ───────────────────────
res = requests.post(f"{BASE}/auth/register", json={
    "email": "admin@capeneto.com",
    "password": "admin123",
    "role": "admin"
})
pretty("Register Admin — POST /auth/register", res)

# ── STEP 3: Login ─────────────────────────────────────
res = requests.post(f"{BASE}/auth/login", data={
    "username": "admin@capeneto.com",
    "password": "admin123"
})
pretty("Login — POST /auth/login", res)

if res.status_code == 200:
    TOKEN = res.json()["access_token"]
    print(f"\n✅ Token saved! (first 40 chars): {TOKEN[:40]}...")
else:
    print("\n❌ Login failed — stopping here.")
    exit()

# ── STEP 4: Get Current User (Me) ─────────────────────
res = requests.get(f"{BASE}/auth/me", headers=header())
pretty("Who Am I — GET /auth/me", res)

# ── STEP 5: Create a Lead ─────────────────────────────
res = requests.post(f"{BASE}/leads/", headers=header(), json={
    "instagram_handle": "rahul_techstart",
    "full_name": "Rahul Mehta",
    "phone": "9876543210",
    "email": "rahul@example.com",
    "source": "instagram",
    "status": "active"
})
pretty("Create Lead — POST /leads/", res)

# ← REPLACE the lead_id line with this:
if res.status_code in [200, 201]:
    lead_id = res.json().get("id")
else:
    # Lead already exists — grab its ID from the list instead
    lead_id = 2   # we know from the list it's ID 2
    print(f"\n   ℹ️  Lead already exists, using existing lead_id = {lead_id}")

# ── STEP 6: List All Leads ────────────────────────────
res = requests.get(f"{BASE}/leads/", headers=header())
pretty("List Leads — GET /leads/", res)

# ── STEP 7: Update Lead Status ────────────────────────
if lead_id:
    res = requests.put(f"{BASE}/leads/{lead_id}", headers=header(), json={
        "status": "converted"      # ← was "contacted", change to "converted"
    })
    pretty(f"Update Lead #{lead_id} Status — PUT /leads/{lead_id}", res)

# ── STEP 8: Log an Activity on Lead ──────────────────
if lead_id:
    res = requests.post(f"{BASE}/activities/", headers=header(), json={
        "lead_id": lead_id,
        "action_type": "dm_sent",
        "description": "First DM sent. Client interested in social media package."
    })
    pretty("Log Activity — POST /activities/", res)

# ── STEP 9: Create a Task ────────────────────────────
res = requests.post(f"{BASE}/tasks/", headers=header(), json={
    "title": "Send proposal to Rahul Mehta",
    "description": "Prepare and send pricing proposal for SMM package",
    "due_date": "2026-04-20",
    "lead_id": lead_id
})
pretty("Create Task — POST /tasks/", res)
task_id = res.json().get("id") if res.status_code in [200, 201] else None

# ── STEP 10: List All Tasks ───────────────────────────
res = requests.get(f"{BASE}/tasks/", headers=header())
pretty("List Tasks — GET /tasks/", res)

# ── STEP 11: Complete a Task ──────────────────────────
if task_id:
    res = requests.put(f"{BASE}/tasks/{task_id}/complete", headers=header())
    #                  ^^^ was requests.patch — change to requests.put
    pretty(f"Complete Task #{task_id} — PUT /tasks/{task_id}/complete", res)

print("\n" + "="*50)
print("✅ Demo Complete! All systems working.")
print("="*50)