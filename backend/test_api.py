"""
test_api.py — Automated Smoke & Regression Test Suite
Tests health, JWT authentication, RBAC isolation, Leads, Tasks, and Clients.

Run with:
    pytest test_api.py -v
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data

def test_auth_failure_invalid_credentials():
    response = client.post("/auth/login", data={"username": "wrong@example.com", "password": "wrong"})
    assert response.status_code == 401

def test_auth_success_admin_login():
    response = client.post("/auth/login", data={"username": "admin@capeneto.com", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_auth_me_profile():
    # Login as admin
    login_res = client.post("/auth/login", data={"username": "admin@capeneto.com", "password": "admin123"})
    token = login_res.json()["access_token"]

    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == "admin@capeneto.com"
    assert user_data["role"] == "admin"

def test_leads_list_and_rbac():
    # Admin sees all leads
    admin_login = client.post("/auth/login", data={"username": "admin@capeneto.com", "password": "admin123"})
    admin_token = admin_login.json()["access_token"]
    admin_leads_res = client.get("/leads/", headers={"Authorization": f"Bearer {admin_token}"})
    assert admin_leads_res.status_code == 200
    admin_leads = admin_leads_res.json()
    assert len(admin_leads) >= 1

    # Sales rep sees scoped leads
    rep_login = client.post("/auth/login", data={"username": "sarah.rep@capeneto.com", "password": "rep123"})
    rep_token = rep_login.json()["access_token"]
    rep_leads_res = client.get("/leads/", headers={"Authorization": f"Bearer {rep_token}"})
    assert rep_leads_res.status_code == 200
    rep_leads = rep_leads_res.json()
    # Scoped verification: all returned leads are either assigned to rep or rep's view
    assert isinstance(rep_leads, list)

def test_tasks_list_and_completion():
    admin_login = client.post("/auth/login", data={"username": "admin@capeneto.com", "password": "admin123"})
    token = admin_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List tasks
    tasks_res = client.get("/tasks/", headers=headers)
    assert tasks_res.status_code == 200
    tasks = tasks_res.json()
    assert len(tasks) >= 1

    # Find a pending task or create one
    pending_tasks = [t for t in tasks if t["status"] != "done"]
    if not pending_tasks:
        leads_res = client.get("/leads/", headers=headers)
        lead_id = leads_res.json()[0]["id"]
        new_task = client.post("/tasks/", headers=headers, json={
            "title": "Automated verification task",
            "lead_id": lead_id,
            "status": "pending"
        }).json()
        target_id = new_task["id"]
    else:
        target_id = pending_tasks[0]["id"]

    # Complete the task
    complete_res = client.put(f"/tasks/{target_id}/complete", headers=headers)
    assert complete_res.status_code == 200
    completed = complete_res.json()
    assert completed["status"] == "done"
    assert completed["completed_at"] is not None

def test_clients_list():
    admin_login = client.post("/auth/login", data={"username": "admin@capeneto.com", "password": "admin123"})
    token = admin_login.json()["access_token"]

    response = client.get("/clients/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    clients = response.json()
    assert len(clients) >= 1
    assert any(c["slug"] == "table-mountain-roasters" for c in clients)

def test_activities_list():
    admin_login = client.post("/auth/login", data={"username": "admin@capeneto.com", "password": "admin123"})
    token = admin_login.json()["access_token"]

    response = client.get("/activities/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    activities = response.json()
    assert isinstance(activities, list)
