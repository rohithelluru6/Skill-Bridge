import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from app.config import settings
from app.database import init_db
from app.seed_data import seed_database
from app.routes import auth, students, skills, careers, ai, progress, admin

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("skillbridge")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize schema and seed data
    logger.info("Initializing Skill Bridge database schema...")
    init_db()
    logger.info("Seeding initial data catalog...")
    seed_database()
    logger.info("Skill Bridge backend ready!")
    yield
    logger.info("Shutting down Skill Bridge backend...")

app = FastAPI(
    title="Skill Bridge – AI-Driven Skill Gap Analysis & Career Roadmap API",
    description="RESTful API powering personalized skill gap analysis, career roadmaps, and edtech tools for engineering students.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(skills.router)
app.include_router(careers.router)
app.include_router(ai.router)
app.include_router(progress.router)
app.include_router(admin.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "ai_provider": settings.AI_PROVIDER,
        "has_gemini_key": bool(settings.GEMINI_API_KEY),
        "has_openai_key": bool(settings.OPENAI_API_KEY)
    }

# Check for production client build
client_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "client", "dist")

if os.path.exists(client_dist):
    assets_dir = os.path.join(client_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        
        file_path = os.path.join(client_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        index_file = os.path.join(client_dist, "index.html")
        return FileResponse(index_file)
else:
    @app.get("/")
    def root():
        return {
            "app": "Skill Bridge API",
            "status": "online",
            "docs_url": "/docs",
            "version": "1.0.0"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
