"""
Populate Official CSE (Cyber Security) Timetable & Faculty
==========================================================
Source: Official Timetable for M.Tech • Semester 1 • Section 1 • 2026-27
Institution: Gayatri Vidya Parishad — ELC Center
"""

import asyncio
import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.core.security import get_password_hash

async def populate_cybersecurity():
    await connect_to_mongo()
    db = get_database()
    print("Populating CSE (Cyber Security) Official Timetable & Faculty...")

    dept_code = "CYBER"
    semester = 1
    section = "1"
    academic_year = "2026-27"

    # 1. Ensure Department exists
    dept = {
        "_id": "dept-cyber",
        "code": "CYBER",
        "name": "CSE (Cyber Security)",
        "description": "Department of Computer Science & Engineering (Cyber Security) — M.Tech Program"
    }
    await db.departments.update_one({"_id": dept["_id"]}, {"$set": dept}, upsert=True)
    print("  [+] Department CSE (Cyber Security) verified")

    # 2. Teachers / Faculty
    faculty_list = [
        {
            "id": "fac-cyber-001",
            "name": "Dr. Birender Biswal",
            "faculty_id": "FAC-CYBER-001",
            "email": "biswal@elc.edu",
            "designation": "Professor",
            "highest_degree": "Ph.D.",
            "specialization": "Research Methodology & IPR"
        },
        {
            "id": "fac-cyber-002",
            "name": "Dr. P. Prapoorna Roja",
            "faculty_id": "FAC-CYBER-002",
            "email": "prapoorna@elc.edu",
            "designation": "Associate Professor",
            "highest_degree": "Ph.D.",
            "specialization": "Advanced Computer Networks"
        },
        {
            "id": "fac-cyber-003",
            "name": "Dr. P. Muralidhar Rao",
            "faculty_id": "FAC-CYBER-003",
            "email": "muralidhar@elc.edu",
            "designation": "Professor",
            "highest_degree": "Ph.D.",
            "specialization": "ML Applications for Cyber Security"
        },
        {
            "id": "fac-cyber-004",
            "name": "Dr. A. Yashwanth",
            "faculty_id": "FAC-CYBER-004",
            "email": "yashwanth@elc.edu",
            "designation": "Assistant Professor",
            "highest_degree": "Ph.D.",
            "specialization": "Ethical Hacking & Network Defense"
        },
        {
            "id": "fac-cyber-005",
            "name": "Dr. K.K. Sandhya Rani",
            "faculty_id": "FAC-CYBER-005",
            "email": "sandhya@elc.edu",
            "designation": "Associate Professor",
            "highest_degree": "Ph.D.",
            "specialization": "Operating System Security"
        },
        {
            "id": "fac-cyber-006",
            "name": "Dr. Ch. Sita Kumari",
            "faculty_id": "FAC-CYBER-006",
            "email": "sita@elc.edu",
            "designation": "Associate Professor",
            "highest_degree": "Ph.D.",
            "specialization": "Cloud Security"
        }
    ]

    fac_map = {}
    for f in faculty_list:
        user_id = f"user-{f['id']}"
        fac_map[f["name"]] = user_id
        # User record
        await db.users.update_one(
            {"email": f["email"]},
            {"$set": {
                "_id": user_id,
                "email": f["email"],
                "password_hash": get_password_hash("Faculty@123"),
                "role": "faculty",
                "full_name": f["name"],
                "is_active": True,
                "created_at": datetime.utcnow().isoformat()
            }},
            upsert=True
        )
        # Profile record
        await db.faculty_profiles.update_one(
            {"user_id": user_id},
            {"$set": {
                "_id": f"prof-{user_id}",
                "user_id": user_id,
                "faculty_id": f["faculty_id"],
                "full_name": f["name"],
                "email": f["email"],
                "designation": f["designation"],
                "department_code": dept_code,
                "highest_degree": f["highest_degree"],
                "specialization": f["specialization"],
                "profile_status": "approved",
                "completion_percentage": 100,
                "created_at": datetime.utcnow().isoformat()
            }},
            upsert=True
        )
        print(f"  [+] Faculty account created: {f['name']} ({f['email']} / Faculty@123)")

    # 3. Subjects / Courses
    courses = [
        {
            "_id": "CRS-CYB101",
            "code": "CYB101",
            "name": "Research Methodology / IPR",
            "credits": 3,
            "department_code": dept_code,
            "semester": semester,
            "faculty_name": "Dr. Birender Biswal"
        },
        {
            "_id": "CRS-CYB102",
            "code": "CYB102",
            "name": "Advanced Computer Networks",
            "credits": 4,
            "department_code": dept_code,
            "semester": semester,
            "faculty_name": "Dr. P. Prapoorna Roja"
        },
        {
            "_id": "CRS-CYB103",
            "code": "CYB103",
            "name": "ML Applications for Cyber Security",
            "credits": 4,
            "department_code": dept_code,
            "semester": semester,
            "faculty_name": "Dr. P. Muralidhar Rao"
        },
        {
            "_id": "CRS-CYB104",
            "code": "CYB104",
            "name": "Ethical Hacking",
            "credits": 4,
            "department_code": dept_code,
            "semester": semester,
            "faculty_name": "Dr. A. Yashwanth"
        },
        {
            "_id": "CRS-CYB105",
            "code": "CYB105",
            "name": "Operating System Security",
            "credits": 4,
            "department_code": dept_code,
            "semester": semester,
            "faculty_name": "Dr. K.K. Sandhya Rani"
        },
        {
            "_id": "CRS-CYB106",
            "code": "CYB106",
            "name": "Cloud Security",
            "credits": 4,
            "department_code": dept_code,
            "semester": semester,
            "faculty_name": "Dr. Ch. Sita Kumari"
        },
        {
            "_id": "CRS-CYB107L",
            "code": "CYB107L",
            "name": "ML Applications for Cyber Security Lab",
            "credits": 2,
            "department_code": dept_code,
            "semester": semester,
            "faculty_name": "Dr. P. Muralidhar Rao"
        },
        {
            "_id": "CRS-CYB108L",
            "code": "CYB108L",
            "name": "Ethical Hacking Lab",
            "credits": 2,
            "department_code": dept_code,
            "semester": semester,
            "faculty_name": "Dr. A. Yashwanth"
        },
        {
            "_id": "CRS-CYB-ACT",
            "code": "CYB-ACT",
            "name": "Co-Curricular (Library / Sports / Counselling)",
            "credits": 1,
            "department_code": dept_code,
            "semester": semester,
            "faculty_name": "Dr. Birender Biswal"
        }
    ]

    for c in courses:
        fac_name = c.pop("faculty_name")
        c["created_at"] = datetime.utcnow().isoformat()
        await db.courses.update_one({"_id": c["_id"]}, {"$set": c}, upsert=True)
        # Create course assignment
        fac_user_id = fac_map.get(fac_name)
        asg_id = f"ASG-{c['code']}-{section}"
        await db.course_assignments.update_one(
            {"_id": asg_id},
            {"$set": {
                "_id": asg_id,
                "course_id": c["_id"],
                "course_code": c["code"],
                "course_name": c["name"],
                "faculty_user_id": fac_user_id,
                "faculty_name": fac_name,
                "department_code": dept_code,
                "semester": semester,
                "section": section,
                "academic_year": academic_year,
                "status": "active"
            }},
            upsert=True
        )
        print(f"  [+] Course & Assignment created: {c['name']} -> {fac_name}")

    # 4. Clean old timetable entries for this section to avoid conflicts
    await db.timetable_entries.delete_many({"department_code": dept_code, "semester": semester, "section": section})

    # 5. Populate All Timetable Slots from Image
    timetable_slots = [
        # Monday
        {"day": "Monday", "start": "11:10", "end": "12:00", "code": "CYB101", "name": "Research Methodology / IPR", "teacher": "Dr. Birender Biswal", "loc": "B8-205"},
        {"day": "Monday", "start": "12:50", "end": "13:40", "code": "CYB103", "name": "ML Applications for Cyber Security", "teacher": "Dr. P. Muralidhar Rao", "loc": "B4-404"},
        {"day": "Monday", "start": "13:40", "end": "14:30", "code": "CYB105", "name": "Operating System Security", "teacher": "Dr. K.K. Sandhya Rani", "loc": "B4-404"},
        {"day": "Monday", "start": "14:30", "end": "15:20", "code": "CYB102", "name": "Advanced Computer Networks", "teacher": "Dr. P. Prapoorna Roja", "loc": "B4-404"},
        {"day": "Monday", "start": "15:20", "end": "17:00", "code": "CYB-ACT", "name": "Library", "teacher": "Dr. Birender Biswal", "loc": "Central Library"},

        # Tuesday
        {"day": "Tuesday", "start": "11:10", "end": "12:00", "code": "CYB101", "name": "Research Methodology / IPR", "teacher": "Dr. Birender Biswal", "loc": "B8-205"},
        {"day": "Tuesday", "start": "12:50", "end": "13:40", "code": "CYB102", "name": "Advanced Computer Networks", "teacher": "Dr. P. Prapoorna Roja", "loc": "B4-404"},
        {"day": "Tuesday", "start": "13:40", "end": "16:10", "code": "CYB107L", "name": "ML Applications for Cyber Security Lab", "teacher": "Dr. P. Muralidhar Rao", "loc": "PG & Research Lab"},
        {"day": "Tuesday", "start": "16:10", "end": "17:00", "code": "CYB-ACT", "name": "Sports", "teacher": "Dr. Birender Biswal", "loc": "Sports Complex"},

        # Wednesday
        {"day": "Wednesday", "start": "11:10", "end": "12:00", "code": "CYB102", "name": "Advanced Computer Networks", "teacher": "Dr. P. Prapoorna Roja", "loc": "B4-404"},
        {"day": "Wednesday", "start": "12:50", "end": "13:40", "code": "CYB-ACT", "name": "Counselling", "teacher": "Dr. Birender Biswal", "loc": "B4-404"},
        {"day": "Wednesday", "start": "13:40", "end": "14:30", "code": "CYB104", "name": "Ethical Hacking", "teacher": "Dr. A. Yashwanth", "loc": "B4-404"},
        {"day": "Wednesday", "start": "14:30", "end": "15:20", "code": "CYB105", "name": "Operating System Security", "teacher": "Dr. K.K. Sandhya Rani", "loc": "B4-404"},
        {"day": "Wednesday", "start": "15:20", "end": "16:10", "code": "CYB106", "name": "Cloud Security", "teacher": "Dr. Ch. Sita Kumari", "loc": "B4-404"},
        {"day": "Wednesday", "start": "16:10", "end": "17:00", "code": "CYB-ACT", "name": "Counselling", "teacher": "Dr. Birender Biswal", "loc": "B4-404"},

        # Thursday
        {"day": "Thursday", "start": "11:10", "end": "12:00", "code": "CYB101", "name": "Research Methodology / IPR", "teacher": "Dr. Birender Biswal", "loc": "B8-205"},
        {"day": "Thursday", "start": "12:50", "end": "13:40", "code": "CYB-ACT", "name": "Counselling", "teacher": "Dr. Birender Biswal", "loc": "B4-404"},
        {"day": "Thursday", "start": "13:40", "end": "14:30", "code": "CYB104", "name": "Ethical Hacking", "teacher": "Dr. A. Yashwanth", "loc": "B4-404"},
        {"day": "Thursday", "start": "14:30", "end": "15:20", "code": "CYB103", "name": "ML Applications for Cyber Security", "teacher": "Dr. P. Muralidhar Rao", "loc": "B4-404"},
        {"day": "Thursday", "start": "15:20", "end": "16:10", "code": "CYB-ACT", "name": "Library", "teacher": "Dr. Birender Biswal", "loc": "Central Library"},
        {"day": "Thursday", "start": "16:10", "end": "17:00", "code": "CYB-ACT", "name": "Sports", "teacher": "Dr. Birender Biswal", "loc": "Sports Complex"},

        # Friday
        {"day": "Friday", "start": "11:10", "end": "12:00", "code": "CYB103", "name": "ML Applications for Cyber Security", "teacher": "Dr. P. Muralidhar Rao", "loc": "B4-404"},
        {"day": "Friday", "start": "12:50", "end": "13:40", "code": "CYB106", "name": "Cloud Security", "teacher": "Dr. Ch. Sita Kumari", "loc": "B4-404"},
        {"day": "Friday", "start": "13:40", "end": "16:10", "code": "CYB108L", "name": "Ethical Hacking Lab", "teacher": "Dr. A. Yashwanth", "loc": "PG & Research Lab"},
        {"day": "Friday", "start": "16:10", "end": "17:00", "code": "CYB-ACT", "name": "Counselling", "teacher": "Dr. Birender Biswal", "loc": "B4-404"},

        # Saturday
        {"day": "Saturday", "start": "11:10", "end": "12:00", "code": "CYB104", "name": "Ethical Hacking", "teacher": "Dr. A. Yashwanth", "loc": "B4-404"},
        {"day": "Saturday", "start": "12:50", "end": "13:40", "code": "CYB105", "name": "Operating System Security", "teacher": "Dr. K.K. Sandhya Rani", "loc": "B4-404"},
        {"day": "Saturday", "start": "13:40", "end": "14:30", "code": "CYB106", "name": "Cloud Security", "teacher": "Dr. Ch. Sita Kumari", "loc": "B4-404"},
        {"day": "Saturday", "start": "14:30", "end": "15:20", "code": "CYB-ACT", "name": "Library", "teacher": "Dr. Birender Biswal", "loc": "Central Library"},
        {"day": "Saturday", "start": "15:20", "end": "17:00", "code": "CYB-ACT", "name": "Sports", "teacher": "Dr. Birender Biswal", "loc": "Sports Complex"}
    ]

    for idx, s in enumerate(timetable_slots, start=1):
        tt_id = f"TT-CYBER-{s['day'][:3].upper()}-{idx:02d}"
        fac_user_id = fac_map.get(s["teacher"])
        course_id = f"CRS-{s['code']}"
        entry = {
            "_id": tt_id,
            "academic_year": academic_year,
            "semester": semester,
            "department_code": dept_code,
            "section": section,
            "course_id": course_id,
            "course_code": s["code"],
            "course_name": s["name"],
            "faculty_user_id": fac_user_id,
            "faculty_name": s["teacher"],
            "day_of_week": s["day"],
            "start_time": s["start"],
            "end_time": s["end"],
            "location": s["loc"],
            "status": "active"
        }
        await db.timetable_entries.insert_one(entry)

    print(f"\n  [SUCCESS] All {len(timetable_slots)} timetable sessions populated into MongoDB Atlas!")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(populate_cybersecurity())

