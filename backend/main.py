from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, get_db
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import models
from routers import auth


# Create all DB tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cape Neto CRM API - Phase 1.5")

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
def root():
    return {
        "message": "🚀 Cape Neto CRM Backend: Alive and Task-Centric!",
        "version": "Phase 1.5",
        "next": "Ready for Task/Lead models"
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
