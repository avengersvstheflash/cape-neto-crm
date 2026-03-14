from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models

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

@app.get("/")
def root():
    return {
        "message": "🚀 Cape Neto CRM Backend: Alive and Task-Centric!",
        "version": "Phase 1.5",
        "next": "Ready for Task/Lead models"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
