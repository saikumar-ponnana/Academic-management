import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.database.seed_data import seed_database

# Routers
from app.routers import auth, faculty, students, courses, timetable, attendance, materials, admin, settings as inst_settings, departments

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("elc_center")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up ELC Center Academic Management Backend...")
    await connect_to_mongo()
    await seed_database()
    yield
    # Shutdown
    logger.info("Shutting down ELC Center Academic Management Backend...")
    await close_mongo_connection()

app = FastAPI(
    title="ELC Center Academic Management API",
    description="Backend API for Gayatri Vidya Parishad Institute of Higher Learning & Research — ELC Center Academic Portal",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*(\.vercel\.app|\.onrender\.com)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers (Support both /api prefix and direct root paths)
for pfx in [settings.API_V1_STR, ""]:
    app.include_router(auth.router, prefix=pfx)
    app.include_router(faculty.router, prefix=pfx)
    app.include_router(students.router, prefix=pfx)
    app.include_router(courses.router, prefix=pfx)
    app.include_router(timetable.router, prefix=pfx)
    app.include_router(attendance.router, prefix=pfx)
    app.include_router(materials.router, prefix=pfx)
    app.include_router(admin.router, prefix=pfx)
    app.include_router(inst_settings.router, prefix=pfx)
    app.include_router(departments.router, prefix=pfx)

@app.get("/")
async def root():
    return {
        "institution": "GAYATRI VIDYA PARISHAD INSTITUTE OF HIGHER LEARNING AND RESEARCH",
        "system": "ELC Center Academic Management System",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    from app.database.mongodb import db_wrapper
    masked_url = ""
    if settings.MONGODB_URL:
        if "@" in settings.MONGODB_URL:
            masked_url = "mongodb+srv://***@" + settings.MONGODB_URL.split("@")[-1]
        else:
            masked_url = settings.MONGODB_URL[:20]
    return {
        "status": "healthy",
        "service": "elc_academic_backend",
        "is_mock_database": db_wrapper.is_mock,
        "database_name": settings.DATABASE_NAME,
        "mongodb_host": masked_url
    }

