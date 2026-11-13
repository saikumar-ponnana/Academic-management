from datetime import datetime
from app.core.security import get_password_hash
from app.database.mongodb import get_database
import logging

logger = logging.getLogger(__name__)

async def seed_database():
    """
    Production-Level Initialization:
    Establishes core institutional settings, standard academic departments,
    and the primary administrator account. No synthetic students, dummy faculty,
    or fake attendance sessions are generated. Real data is registered by users
    or entered by the administrator.
    """
    db = get_database()
    if db is None:
        logger.error("Cannot initialize: Database connection not initialized.")
        return

    # Check if institution settings already exist
    existing_settings = await db.institution_settings.find_one({"_id": "default"})
    if existing_settings:
        logger.info("Core institutional configuration already established. Skipping initialization.")
        return

    logger.info("Initializing production-level baseline for ELC Center...")

    # 1. Institution Settings
    inst_settings = {
        "_id": "default",
        "institutionName": "GAYATRI VIDYA PARISHAD INSTITUTE OF HIGHER LEARNING AND RESEARCH",
        "campus": "ELC Center — Kommadi, Visakhapatnam",
        "timezone": "Asia/Kolkata",
        "attendanceCutoff": "19:00",
        "minimumAttendancePercentage": 75.0,
        "maxUploadSizeMB": 10,
        "header_image_url": "/assets/gvp_header.png",
        "updated_at": datetime.utcnow().isoformat()
    }
    await db.institution_settings.update_one({"_id": "default"}, {"$set": inst_settings}, upsert=True)

    # 2. Baseline Academic Departments (Only Cyber Security)
    departments = [
        {"_id": "dept-cyber", "code": "CYBER", "name": "CSE (Cyber Security)", "description": "Department of Computer Science & Engineering (Cyber Security) — M.Tech Program"}
    ]
    for d in departments:
        await db.departments.update_one({"_id": d["_id"]}, {"$set": d}, upsert=True)

    # 3. Primary Institutional Administrator (Starting Point)
    admin_id = "user-admin-001"
    existing_admin = await db.users.find_one({"email": "admin@elc.edu"})
    if not existing_admin:
        admin_user = {
            "_id": admin_id,
            "email": "admin@elc.edu",
            "password_hash": get_password_hash("Admin@123"),
            "role": "admin",
            "full_name": "Administrative Controller — ELC",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
        await db.users.insert_one(admin_user)

    logger.info("Production baseline initialized: Settings, Departments, and Administrator established.")
