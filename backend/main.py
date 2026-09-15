from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
import models
from database import engine, get_db
from config import settings
from routers import auth, leads, tasks, activities, clients, users, pipeline_stages

# Create all DB tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cape Neto CRM API",
    description="Production-grade, Instagram-native CRM REST API for digital agency workflows",
    version="1.0.0",
)

# CORS configuration for local and live frontend (Vercel)
origins = ["*"]
if settings.frontend_url:
    origins.append(settings.frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(leads.router)
app.include_router(tasks.router)
app.include_router(activities.router)
app.include_router(clients.router)
app.include_router(users.router)
app.include_router(pipeline_stages.router)

@app.get("/")
def root():
    return {
        "message": "🚀 Cape Neto CRM Backend API Live",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
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