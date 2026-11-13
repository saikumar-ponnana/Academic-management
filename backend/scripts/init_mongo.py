"""
MongoDB Collection Initialization & Schema Setup Script
======================================================
This script initializes all collections for the ELC Center Academic Management System
with indexes and schema constraints.

Can be run via:
    python scripts/init_mongo.py
Or executed in mongosh / MongoDB Compass.
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database, ensure_indexes
from app.database.seed_data import seed_database

async def init_collections():
    print("================================================================")
    print(" Gayatri Vidya Parishad — ELC Center MongoDB Initializer")
    print("================================================================")
    await connect_to_mongo()
    db = get_database()
    
    collections = [
        "users",
        "faculty_profiles",
        "student_profiles",
        "departments",
        "courses",
        "course_assignments",
        "enrollments",
        "timetable_entries",
        "attendance_sessions",
        "attendance_records",
        "attendance_overrides",
        "attendance_audit_logs",
        "study_materials",
        "announcements",
        "notifications",
        "audit_logs",
        "institution_settings"
    ]
    
    print("\n1. Ensuring MongoDB Collections exist:")
    existing = await db.list_collection_names()
    for col in collections:
        if col not in existing:
            await db.create_collection(col)
            print(f"   [+] Created collection: {col}")
        else:
            print(f"   [=] Existing collection: {col}")
            
    print("\n2. Applying Production Indexes:")
    await ensure_indexes()
    
    print("\n3. Seeding Institutional Baseline (Admin, Settings, Departments):")
    await seed_database()
    print("   [+] Admin account verified: admin@elc.edu / Admin@123")
    print("   [+] Institutional Settings & Academic Departments verified")
    
    print("\nCollections and Indexes ready for production!")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(init_collections())

