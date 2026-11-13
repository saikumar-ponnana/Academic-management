import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.core.security import get_password_hash

async def ensure_student():
    await connect_to_mongo()
    db = get_database()
    email = "saikumar.mtech.gvp@gmail.com"
    existing = await db.users.find_one({"email": email})
    if not existing:
        user_id = "user-stu-saikumar"
        await db.users.insert_one({
            "_id": user_id,
            "email": email,
            "password_hash": get_password_hash("Arjun@515"),
            "role": "student",
            "full_name": "Sai Kumar",
            "is_active": True,
            "created_at": "2026-11-13T00:00:00"
        })
        await db.student_profiles.insert_one({
            "_id": "prof-user-stu-saikumar",
            "user_id": user_id,
            "student_id": "STU-CYBER-001",
            "roll_number": "26MGVP001",
            "full_name": "Sai Kumar",
            "email": email,
            "phone": "8790827205",
            "department_code": "CYBER",
            "academic_year": "2026-27",
            "semester": 1,
            "section": "1",
            "created_at": "2026-11-13T00:00:00"
        })
        # Enroll in all 8 Cybersecurity courses
        courses = await db.courses.find({"department_code": "CYBER"}).to_list(100)
        for c in courses:
            await db.enrollments.update_one(
                {"student_user_id": user_id, "course_id": c["_id"]},
                {"$set": {
                    "student_user_id": user_id,
                    "course_id": c["_id"],
                    "course_code": c.get("code"),
                    "department_code": "CYBER",
                    "semester": 1,
                    "section": "1",
                    "academic_year": "2026-27",
                    "status": "enrolled"
                }},
                upsert=True
            )
        print("Sai Kumar student account verified and enrolled in all Cyber courses!")
    else:
        print("Sai Kumar account already exists in database.")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(ensure_student())

