from fastapi import FastAPI

app = FastAPI(title="Cape Neto CRM API - Phase 1.5")

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

