import asyncio
import os
import sys

# Ensure backend root is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.database.seed_data import seed_database

async def reset_database():
    print("Connecting to MongoDB...")
    await connect_to_mongo()
    db = get_database()
    
    collections_to_clear = [
        "student_profiles",
        "faculty_profiles",
        "courses",
        "course_assignments",
        "enrollments",
        "timetable_entries",
        "attendance_sessions",
        "attendance_records",
        "attendance_overrides",
        "attendance_audit_logs",
        "study_materials",
        "announcements"
    ]
    
    print("Clearing synthetic/dummy collections...")
    for col in collections_to_clear:
        res = await db[col].delete_many({})
        print(f" - Cleared {res.deleted_count} documents from '{col}'")
        
    # Clear dummy users except admin
    u_res = await db.users.delete_many({"role": {"$ne": "admin"}})
    print(f" - Cleared {u_res.deleted_count} synthetic users (retained Master Admin).")
    
    # Also reset institution settings to ensure fresh production defaults
    await db.institution_settings.delete_many({})
    
    print("Re-applying clean production baseline...")
    await seed_database()
    print("Database successfully reset to a clean, production-ready starting state!")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(reset_database())

