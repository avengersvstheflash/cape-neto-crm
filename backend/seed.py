"""
seed.py — Cape Neto CRM Database Seeder
Populates realistic demo data for local development, testing, and portfolio demonstrations.

Usage:
    python seed.py
"""

import sys
from datetime import datetime, date, timedelta
from database import SessionLocal, engine, Base
import models
from auth import hash_password

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

def seed():
    print("[*] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("🌱 Seeding Pipeline Stages...")
        stages_data = [
            {"name": "New Inbound DM", "position": 1, "auto_tasks": "Send introductory DM response"},
            {"name": "Initial Contact", "position": 2, "auto_tasks": "Qualify budget & requirements"},
            {"name": "Proposal Sent", "position": 3, "auto_tasks": "Follow up on proposal within 48h"},
            {"name": "Deal Closed / Won", "position": 4, "auto_tasks": "Onboard client into portal"},
            {"name": "Closed / Lost", "position": 5, "auto_tasks": "Archive conversation log"},
        ]

        stage_map = {}
        for s in stages_data:
            existing = db.query(models.PipelineStage).filter_by(name=s["name"]).first()
            if not existing:
                stage = models.PipelineStage(**s)
                db.add(stage)
                db.flush()
                stage_map[s["name"]] = stage
            else:
                stage_map[s["name"]] = existing

        print("🌱 Seeding Clients...")
        clients_data = [
            {
                "name": "Table Mountain Roasters",
                "slug": "table-mountain-roasters",
                "owner_email": "hello@tablemountainroast.co.za",
                "plan": "pro",
                "status": "active",
                "joined_at": date.today() - timedelta(days=90),
                "plan_renews_at": date.today() + timedelta(days=275),
            },
            {
                "name": "Kirstenbosch Botanics Studio",
                "slug": "kirstenbosch-botanics",
                "owner_email": "info@kirstenboschbotanics.co.za",
                "plan": "growth",
                "status": "active",
                "joined_at": date.today() - timedelta(days=45),
                "plan_renews_at": date.today() + timedelta(days=135),
            },
            {
                "name": "Camps Bay Luxury Stays",
                "slug": "camps-bay-stays",
                "owner_email": "booking@campsbayluxury.com",
                "plan": "enterprise",
                "status": "active",
                "joined_at": date.today() - timedelta(days=120),
                "plan_renews_at": date.today() + timedelta(days=245),
            },
        ]

        client_map = {}
        for c in clients_data:
            existing = db.query(models.Client).filter_by(slug=c["slug"]).first()
            if not existing:
                client = models.Client(**c)
                db.add(client)
                db.flush()
                client_map[c["slug"]] = client
            else:
                client_map[c["slug"]] = existing

        print("🌱 Seeding Users...")
        users_data = [
            {
                "email": "admin@capeneto.com",
                "password_hash": hash_password("admin123"),
                "role": "admin",
            },
            {
                "email": "sarah.rep@capeneto.com",
                "password_hash": hash_password("rep123"),
                "role": "sales_rep",
            },
            {
                "email": "auditor@capeneto.com",
                "password_hash": hash_password("viewer123"),
                "role": "viewer",
            }
        ]

        user_map = {}
        for u in users_data:
            existing = db.query(models.User).filter_by(email=u["email"]).first()
            if not existing:
                user = models.User(**u)
                db.add(user)
                db.flush()
                user_map[u["email"]] = user
            else:
                user_map[u["email"]] = existing

        admin = user_map["admin@capeneto.com"]
        rep = user_map["sarah.rep@capeneto.com"]

        print("🌱 Seeding Leads...")
        leads_data = [
            {
                "instagram_handle": "@cape_craft_spirits",
                "full_name": "Liam Van Der Merwe",
                "phone": "+27 82 555 0192",
                "email": "liam@capecraftspirits.co.za",
                "source": "instagram",
                "status": "active",
                "deal_value": 45000.00,
                "notes": "Interested in 6-month Instagram content & branding campaign. High intent.",
                "stage_id": stage_map["Proposal Sent"].id,
                "assigned_to": admin.id,
            },
            {
                "instagram_handle": "@stellenbosch_fit",
                "full_name": "Anika Botha",
                "phone": "+27 83 444 8812",
                "email": "anika@stellenboschfit.co.za",
                "source": "instagram",
                "status": "active",
                "deal_value": 24000.00,
                "notes": "Sent DM asking about social media management and Reels production package.",
                "stage_id": stage_map["Initial Contact"].id,
                "assigned_to": rep.id,
            },
            {
                "instagram_handle": "@atlantic_seaboard_realty",
                "full_name": "Marcus Thorne",
                "phone": "+27 82 999 1100",
                "email": "marcus@asrealty.co.za",
                "source": "instagram",
                "status": "won",
                "deal_value": 75000.00,
                "notes": "Contract signed. Onboarding scheduled for next Monday.",
                "stage_id": stage_map["Deal Closed / Won"].id,
                "assigned_to": admin.id,
            },
            {
                "instagram_handle": "@houtbay_surf_co",
                "full_name": "Kai Petersen",
                "phone": "+27 71 333 4422",
                "email": "kai@houtbaysurf.co.za",
                "source": "instagram",
                "status": "active",
                "deal_value": 18000.00,
                "notes": "Requested pricing brochure via Instagram DM comment.",
                "stage_id": stage_map["New Inbound DM"].id,
                "assigned_to": rep.id,
            },
            {
                "instagram_handle": "@bree_street_bakery",
                "full_name": "Chloe Du Plessis",
                "phone": "+27 84 222 7766",
                "email": "chloe@breestreetbakes.co.za",
                "source": "instagram",
                "status": "lost",
                "deal_value": 15000.00,
                "notes": "Budget paused until Q3.",
                "stage_id": stage_map["Closed / Lost"].id,
                "assigned_to": rep.id,
            },
            {
                "instagram_handle": "@waterfront_wellness",
                "full_name": "Dr. Sipho Dlamini",
                "phone": "+27 81 123 9876",
                "email": "sipho@waterfrontwellness.co.za",
                "source": "instagram",
                "status": "paused",
                "deal_value": 32000.00,
                "notes": "Renovating clinic, requested follow-up in 3 weeks.",
                "stage_id": stage_map["Initial Contact"].id,
                "assigned_to": admin.id,
            },
        ]

        lead_map = {}
        for l in leads_data:
            existing = db.query(models.Lead).filter_by(instagram_handle=l["instagram_handle"]).first()
            if not existing:
                lead = models.Lead(**l)
                db.add(lead)
                db.flush()
                lead_map[l["instagram_handle"]] = lead
            else:
                lead_map[l["instagram_handle"]] = existing

        print("🌱 Seeding Tasks...")
        tasks_data = [
            {
                "title": "Send SMM retainer proposal",
                "description": "Email updated Tier 2 social media retainer proposal to Liam.",
                "task_type": "proposal",
                "due_date": date.today() + timedelta(days=1),
                "priority": "urgent",
                "status": "pending",
                "lead_id": lead_map["@cape_craft_spirits"].id,
                "assigned_to": admin.id,
            },
            {
                "title": "Discovery call on Reels strategy",
                "description": "Schedule 20-min intro call to review Instagram Reels strategy.",
                "task_type": "call",
                "due_date": date.today() + timedelta(days=2),
                "priority": "high",
                "status": "pending",
                "lead_id": lead_map["@stellenbosch_fit"].id,
                "assigned_to": rep.id,
            },
            {
                "title": "Send media kit & rate card",
                "description": "DM link to 2026 agency rate card and case studies.",
                "task_type": "follow_up",
                "due_date": date.today() - timedelta(days=1),  # Overdue demo
                "priority": "medium",
                "status": "pending",
                "lead_id": lead_map["@houtbay_surf_co"].id,
                "assigned_to": rep.id,
            },
            {
                "title": "Send contract & kickoff packet",
                "description": "Send DocuSign contract and onboarding questionnaire.",
                "task_type": "manual",
                "due_date": date.today() - timedelta(days=3),
                "priority": "urgent",
                "status": "done",
                "completed_at": datetime.utcnow() - timedelta(days=2),
                "lead_id": lead_map["@atlantic_seaboard_realty"].id,
                "assigned_to": admin.id,
            },
        ]

        for t in tasks_data:
            existing = db.query(models.Task).filter_by(title=t["title"], lead_id=t["lead_id"]).first()
            if not existing:
                db.add(models.Task(**t))

        print("🌱 Seeding Activities...")
        activities_data = [
            {
                "lead_id": lead_map["@cape_craft_spirits"].id,
                "user_id": admin.id,
                "action_type": "message_sent",
                "description": "Inbound DM received inquiring about agency retainer.",
            },
            {
                "lead_id": lead_map["@cape_craft_spirits"].id,
                "user_id": admin.id,
                "action_type": "stage_change",
                "description": "Advanced from Initial Contact to Proposal Sent.",
            },
            {
                "lead_id": lead_map["@atlantic_seaboard_realty"].id,
                "user_id": admin.id,
                "action_type": "deal_created",
                "description": "Deal closed for ZAR 75,000.00 annual retainer.",
            },
            {
                "lead_id": lead_map["@atlantic_seaboard_realty"].id,
                "user_id": admin.id,
                "action_type": "task_completed",
                "description": "Completed onboarding contract dispatch.",
            },
            {
                "lead_id": lead_map["@stellenbosch_fit"].id,
                "user_id": rep.id,
                "action_type": "note_added",
                "description": "Client requested proposal specifically highlighting Reels production.",
            },
        ]

        for a in activities_data:
            existing = db.query(models.Activity).filter_by(lead_id=a["lead_id"], description=a["description"]).first()
            if not existing:
                db.add(models.Activity(**a))

        db.commit()
        print("\n✅ Seed completed successfully!")
        print("─────────────────────────────────────────────────────")
        print("Demo Credentials:")
        print("  • Admin:     admin@capeneto.com       / admin123")
        print("  • Sales Rep: sarah.rep@capeneto.com   / rep123")
        print("  • Viewer:    auditor@capeneto.com     / viewer123")
        print("─────────────────────────────────────────────────────")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
