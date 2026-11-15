import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional

# Explicitly load .env from backend directory
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(backend_dir, ".env")
if os.path.exists(env_path):
    load_dotenv(env_path, override=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "ELC Center Academic Management System")
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "elc-super-secret-jwt-key-2026-secure-hash-token-gvp")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Institution Timezone & Cutoff
    DEFAULT_TIMEZONE: str = os.getenv("DEFAULT_TIMEZONE", "Asia/Kolkata")
    ATTENDANCE_CUTOFF_TIME: str = os.getenv("ATTENDANCE_CUTOFF_TIME", "19:00")  # 7:00 PM
    MINIMUM_ATTENDANCE_PERCENTAGE: float = float(os.getenv("MINIMUM_ATTENDANCE_PERCENTAGE", 75.0))
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", 10))
    
    # Database
    MONGODB_URL: str = os.getenv(
        "MONGODB_URL",
        "mongodb+srv://saikumar:Saikumar515@cluster0.vayizaa.mongodb.net/student_center_db?retryWrites=true&w=majority"
    )
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "student_center_db")
    
    # Storage
    UPLOAD_DIR: str = os.path.join(backend_dir, "uploads")
    
    class Config:
        case_sensitive = True
        env_file = env_path
        extra = "allow"

settings = Settings()
