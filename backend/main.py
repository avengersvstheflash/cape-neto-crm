from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
import models
from database import engine, get_db
from routers import auth, leads, tasks, activities

# Create all DB tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cape Neto CRM API - Week 2")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers - clean and simple
app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(tasks.router)
app.include_router(activities.router)

@app.get("/")
def root():
    return {
        "message": "🚀 Cape Neto CRM Backend: Week 2 - Leads + Tasks + RBAC Active!",
        "version": "Week 2",
        "endpoints": ["/docs", "/health", "/leads/", "/auth/"],
        "status": "Ready for lead CRUD operations"
    }

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)