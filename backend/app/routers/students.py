from fastapi import APIRouter, Depends, HTTPException, status
from app.database.mongodb import get_database
from app.dependencies.auth_deps import require_role
from app.services.attendance_service import get_institution_settings_db, get_current_institution_time
from app.schemas.all_schemas import ProfileUpdateRequest
from datetime import datetime

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("/dashboard")
async def get_student_dashboard(current_user: dict = Depends(require_role(["student"]))):
    db = get_database()
    stu_id = current_user["_id"]
    profile = await db.student_profiles.find_one({"user_id": stu_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    inst_settings = await get_institution_settings_db(db)
    now = get_current_institution_time(inst_settings.get("timezone"))
    today_str = now.strftime("%Y-%m-%d")
    current_day_name = now.strftime("%A")
    
    # Enrolled courses
    enrollments = await db.enrollments.find({"student_user_id": stu_id, "status": "enrolled"}).to_list(100)
    course_ids = [e["course_id"] for e in enrollments]
    
    # Calculate overall attendance
    # Find all submitted attendance sessions for the courses/section this student is in
    total_conducted = 0
    total_attended = 0
    course_stats = []
    
    for e in enrollments:
        cid = e["course_id"]
        course = await db.courses.find_one({"_id": cid})
        course_name = course.get("name", e.get("course_code")) if course else e.get("course_code")
        
        # Sessions for this course & student section
        sessions = await db.attendance_sessions.find({
            "course_id": cid,
            "section": profile.get("section"),
            "submission_status": "submitted"
        }).to_list(200)
        
        c_conducted = len(sessions)
        session_ids = [s["_id"] for s in sessions]
        
        c_attended = await db.attendance_records.count_documents({
            "attendance_session_id": {"$in": session_ids},
            "student_user_id": stu_id,
            "status": "present"
        })
        
        c_percentage = round((c_attended / c_conducted * 100), 1) if c_conducted > 0 else 100.0
        total_conducted += c_conducted
        total_attended += c_attended
        
        # Count available materials for this course
        mat_count = await db.study_materials.count_documents({
            "course_id": cid
        })
        
        course_stats.append({
            "course_id": cid,
            "code": e.get("course_code"),
            "name": course_name,
            "conducted": c_conducted,
            "attended": c_attended,
            "percentage": c_percentage,
            "materials_count": mat_count
        })
        
    overall_percentage = round((total_attended / total_conducted * 100), 1) if total_conducted > 0 else 100.0
    
    # Today's timetable for student's department, semester, section
    today_classes = await db.timetable_entries.find({
        "department_code": profile.get("department_code"),
        "semester": profile.get("semester"),
        "section": profile.get("section"),
        "day_of_week": current_day_name,
        "status": "active"
    }).sort("start_time", 1).to_list(100)
    
    for c in today_classes:
        c["_id"] = str(c["_id"])
        
    # Recent study materials (accessible: ELC wide OR student's courses)
    recent_materials = await db.study_materials.find({
        "$or": [
            {"visibility": "ELC_CENTER_WIDE"},
            {"course_id": {"$in": course_ids}}
        ]
    }).sort("uploaded_at", -1).limit(6).to_list(6)
    for m in recent_materials:
        m["_id"] = str(m["_id"])
        
    # Announcements
    announcements = await db.announcements.find({
        "$or": [{"target_role": "all"}, {"target_role": "student"}]
    }).sort("created_at", -1).limit(5).to_list(5)
    for a in announcements:
        a["_id"] = str(a["_id"])
        
    profile["_id"] = str(profile["_id"])
    return {
        "profile": profile,
        "enrolled_courses_count": len(enrollments),
        "courses_summary": course_stats,
        "overall_attendance_percentage": overall_percentage,
        "total_conducted_sessions": total_conducted,
        "total_attended_sessions": total_attended,
        "today_classes": today_classes,
        "recent_materials": recent_materials,
        "announcements": announcements,
        "current_time": now.strftime("%I:%M %p"),
        "current_date": today_str
    }

@router.get("/courses")
async def get_student_courses(current_user: dict = Depends(require_role(["student"]))):
    db = get_database()
    stu_id = current_user["_id"]
    profile = await db.student_profiles.find_one({"user_id": stu_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    enrollments = await db.enrollments.find({"student_user_id": stu_id, "status": "enrolled"}).to_list(100)
    result = []
    
    for e in enrollments:
        cid = e["course_id"]
        course = await db.courses.find_one({"_id": cid})
        assignment = await db.course_assignments.find_one({
            "course_id": cid,
            "section": profile.get("section"),
            "status": "active"
        })
        
        # Sessions & Attendance
        sessions = await db.attendance_sessions.find({
            "course_id": cid,
            "section": profile.get("section"),
            "submission_status": "submitted"
        }).to_list(200)
        conducted = len(sessions)
        session_ids = [s["_id"] for s in sessions]
        attended = await db.attendance_records.count_documents({
            "attendance_session_id": {"$in": session_ids},
            "student_user_id": stu_id,
            "status": "present"
        })
        percentage = round((attended / conducted * 100), 1) if conducted > 0 else 100.0
        
        # Materials count
        mat_count = await db.study_materials.count_documents({"course_id": cid})
        
        # Timetable for this course
        tt_entries = await db.timetable_entries.find({
            "course_id": cid,
            "section": profile.get("section"),
            "status": "active"
        }).to_list(20)
        for t in tt_entries:
            t["_id"] = str(t["_id"])
            
        result.append({
            "course_id": cid,
            "code": course.get("code") if course else e.get("course_code"),
            "name": course.get("name") if course else e.get("course_code"),
            "faculty_name": assignment.get("faculty_name", "Assigned Faculty") if assignment else "TBD",
            "semester": profile.get("semester"),
            "section": profile.get("section"),
            "credits": course.get("credits", 3) if course else 3,
            "conducted_sessions": conducted,
            "attended_sessions": attended,
            "attendance_percentage": percentage,
            "materials_count": mat_count,
            "timetable": tt_entries
        })
        
    return result

@router.get("/profile")
async def get_student_profile(current_user: dict = Depends(require_role(["student", "admin"]))):
    db = get_database()
    profile = await db.student_profiles.find_one({"user_id": current_user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")
    profile["_id"] = str(profile["_id"])
    return profile

@router.patch("/profile")
async def update_student_profile(
    data: ProfileUpdateRequest,
    current_user: dict = Depends(require_role(["student"]))
):
    db = get_database()
    user_id = current_user["_id"]
    profile = await db.student_profiles.find_one({"user_id": user_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    update_user = {}
    update_prof = {"updated_at": datetime.utcnow().isoformat()}

    # 1. Email update
    if data.email:
        new_email = data.email.strip().lower()
        if new_email != current_user.get("email"):
            conflict = await db.users.find_one({"email": new_email, "_id": {"$ne": user_id}})
            if conflict:
                raise HTTPException(status_code=400, detail=f"Email '{new_email}' is already in use by another account.")
            update_user["email"] = new_email
            update_prof["email"] = new_email

    # 2. Full Name update
    if data.full_name and data.full_name.strip():
        name_clean = data.full_name.strip()
        update_user["full_name"] = name_clean
        update_prof["full_name"] = name_clean

    # 3. Phone update
    if data.phone is not None:
        update_prof["phone"] = data.phone.strip()

    if update_user:
        await db.users.update_one({"_id": user_id}, {"$set": update_user})

    await db.student_profiles.update_one({"user_id": user_id}, {"$set": update_prof})

    if "full_name" in update_user:
        await db.enrollments.update_many(
            {"student_user_id": user_id},
            {"$set": {"student_name": update_user["full_name"]}}
        )

    updated = await db.student_profiles.find_one({"user_id": user_id})
    updated["_id"] = str(updated["_id"])
    return updated

