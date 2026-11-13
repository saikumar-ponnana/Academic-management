from fastapi import APIRouter, Depends, HTTPException, status
from app.database.mongodb import get_database
from app.dependencies.auth_deps import require_role
from app.schemas.all_schemas import FacultyProfileUpdate
from app.services.attendance_service import get_institution_settings_db, get_current_institution_time
from datetime import datetime
import pytz

router = APIRouter(prefix="/faculty", tags=["Faculty"])

def calculate_completion_percentage(profile: dict) -> int:
    fields_to_check = [
        "full_name", "phone", "qualifications", "highest_degree",
        "graduation_year", "university", "department", "specialization",
        "designation", "department_code", "date_of_joining"
    ]
    filled = sum(1 for field in fields_to_check if profile.get(field))
    return int((filled / len(fields_to_check)) * 100)

@router.get("/profile")
async def get_faculty_profile(current_user: dict = Depends(require_role(["faculty", "admin"]))):
    db = get_database()
    profile = await db.faculty_profiles.find_one({"user_id": current_user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")
    profile["_id"] = str(profile["_id"])
    profile["completion_percentage"] = calculate_completion_percentage(profile)
    return profile

@router.patch("/profile")
async def update_faculty_profile(
    data: FacultyProfileUpdate,
    current_user: dict = Depends(require_role(["faculty"]))
):
    db = get_database()
    profile = await db.faculty_profiles.find_one({"user_id": current_user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")
        
    update_data = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()
    # Once entered, it is automatically approved and immediately active
    update_data["profile_status"] = "approved"

    user_update = {}
    if "email" in update_data and update_data["email"]:
        new_email = update_data["email"].strip().lower()
        if new_email != current_user.get("email"):
            conflict = await db.users.find_one({"email": new_email, "_id": {"$ne": current_user["_id"]}})
            if conflict:
                raise HTTPException(status_code=400, detail=f"Email '{new_email}' is already in use by another account.")
            user_update["email"] = new_email
            update_data["email"] = new_email

    if "full_name" in update_data and update_data["full_name"]:
        user_update["full_name"] = update_data["full_name"].strip()
        update_data["full_name"] = user_update["full_name"]
    
    # Recalculate completion
    merged = {**profile, **update_data}
    update_data["completion_percentage"] = calculate_completion_percentage(merged)
    
    await db.faculty_profiles.update_one(
        {"user_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    if user_update:
        await db.users.update_one({"_id": current_user["_id"]}, {"$set": user_update})

    # Cascade name changes to course assignments and timetable
    if "full_name" in user_update:
        await db.course_assignments.update_many(
            {"faculty_user_id": current_user["_id"]},
            {"$set": {"faculty_name": user_update["full_name"]}}
        )
        await db.timetable_entries.update_many(
            {"faculty_user_id": current_user["_id"]},
            {"$set": {"faculty_name": user_update["full_name"]}}
        )
        
    updated = await db.faculty_profiles.find_one({"user_id": current_user["_id"]})
    updated["_id"] = str(updated["_id"])
    return updated

@router.post("/profile/submit")
async def submit_faculty_profile(current_user: dict = Depends(require_role(["faculty"]))):
    db = get_database()
    profile = await db.faculty_profiles.find_one({"user_id": current_user["_id"]})
    if not profile:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")
        
    perc = calculate_completion_percentage(profile)
    await db.faculty_profiles.update_one(
        {"user_id": current_user["_id"]},
        {"$set": {
            "profile_status": "approved",  # Automatically active
            "completion_percentage": perc,
            "updated_at": datetime.utcnow().isoformat()
        }}
    )
    return {"message": "Faculty profile updated and active immediately.", "status": "approved"}

@router.get("/dashboard")
async def get_faculty_dashboard(current_user: dict = Depends(require_role(["faculty"]))):
    db = get_database()
    fac_id = current_user["_id"]
    profile = await db.faculty_profiles.find_one({"user_id": fac_id})
    
    # Institution time & today
    inst_settings = await get_institution_settings_db(db)
    now = get_current_institution_time(inst_settings.get("timezone"))
    today_str = now.strftime("%Y-%m-%d")
    current_day_name = now.strftime("%A")  # "Monday", etc.
    cutoff_time = inst_settings.get("attendanceCutoff", "19:00")
    
    # Assigned courses
    assignments = await db.course_assignments.find({"faculty_user_id": fac_id, "status": "active"}).to_list(100)
    course_ids = [a["course_id"] for a in assignments]
    
    # Enrolled students count across assigned courses
    enrolled_count = await db.enrollments.count_documents({"course_id": {"$in": course_ids}, "status": "enrolled"})
    
    # Today's timetable
    today_classes = await db.timetable_entries.find({
        "faculty_user_id": fac_id,
        "day_of_week": current_day_name,
        "status": "active"
    }).sort("start_time", 1).to_list(100)
    
    for c in today_classes:
        c["_id"] = str(c["_id"])
        # Check attendance session status for today
        session_id = f"{c['_id']}_{today_str}"
        c["session_id"] = session_id
        att_sess = await db.attendance_sessions.find_one({"session_id": session_id})
        if att_sess:
            c["attendance_status"] = att_sess.get("submission_status", "submitted")
            c["present_count"] = att_sess.get("present_count", 0)
            c["absent_count"] = att_sess.get("absent_count", 0)
        else:
            # Check if locked (past cutoff)
            cur_time_str = now.strftime("%H:%M")
            if cur_time_str >= cutoff_time:
                # Check for override
                ov = await db.attendance_overrides.find_one({
                    "session_id": session_id,
                    "status": "approved",
                    "expires_at": {"$gt": now.isoformat()}
                })
                c["attendance_status"] = "override_approved" if ov else "locked"
            else:
                c["attendance_status"] = "pending"
                
    # Materials uploaded count
    materials_count = await db.study_materials.count_documents({"faculty_user_id": fac_id})
    
    # Pending attendance count today
    pending_att_count = sum(1 for c in today_classes if c.get("attendance_status") in ["pending", "draft", "override_approved"])
    completed_att_count = sum(1 for c in today_classes if c.get("attendance_status") == "submitted")
    
    # Announcements
    announcements = await db.announcements.find({
        "$or": [{"target_role": "all"}, {"target_role": "faculty"}]
    }).sort("created_at", -1).limit(5).to_list(5)
    for a in announcements:
        a["_id"] = str(a["_id"])
        
    return {
        "faculty_name": current_user.get("full_name", "Faculty Member"),
        "profile": profile,
        "profile_completion": calculate_completion_percentage(profile or {}),
        "assigned_courses_count": len(assignments),
        "total_students": enrolled_count,
        "materials_uploaded": materials_count,
        "today_classes": today_classes,
        "today_classes_count": len(today_classes),
        "pending_attendance_count": pending_att_count,
        "completed_attendance_count": completed_att_count,
        "announcements": announcements,
        "cutoff_time": cutoff_time,
        "current_time": now.strftime("%I:%M %p"),
        "current_date": today_str
    }

@router.get("/courses")
async def get_faculty_courses(current_user: dict = Depends(require_role(["faculty"]))):
    db = get_database()
    fac_id = current_user["_id"]
    
    assignments = await db.course_assignments.find({"faculty_user_id": fac_id, "status": "active"}).to_list(100)
    result = []
    
    for a in assignments:
        course = await db.courses.find_one({"_id": a["course_id"]})
        if not course:
            continue
            
        student_count = await db.enrollments.count_documents({
            "course_id": a["course_id"],
            "section": a.get("section"),
            "status": "enrolled"
        })
        
        materials_count = await db.study_materials.count_documents({
            "course_id": a["course_id"],
            "faculty_user_id": fac_id
        })
        
        # Attendance sessions conducted
        conducted_sessions = await db.attendance_sessions.count_documents({
            "course_id": a["course_id"],
            "faculty_user_id": fac_id,
            "submission_status": "submitted"
        })
        
        result.append({
            "assignment_id": str(a["_id"]),
            "course_id": a["course_id"],
            "code": course.get("code"),
            "name": course.get("name"),
            "department_code": a.get("department_code"),
            "semester": a.get("semester"),
            "section": a.get("section"),
            "academic_year": a.get("academic_year"),
            "enrolled_students": student_count,
            "materials_count": materials_count,
            "conducted_sessions": conducted_sessions,
            "credits": course.get("credits", 3),
            "description": course.get("description", "")
        })
        
    return result

@router.get("/timetable")
async def get_faculty_timetable(current_user: dict = Depends(require_role(["faculty"]))):
    db = get_database()
    fac_id = current_user["_id"]
    
    entries = await db.timetable_entries.find({"faculty_user_id": fac_id, "status": "active"}).sort("start_time", 1).to_list(200)
    for e in entries:
        e["_id"] = str(e["_id"])
    return entries

@router.get("/students")
async def get_faculty_students(current_user: dict = Depends(require_role(["faculty"]))):
    db = get_database()
    fac_id = current_user["_id"]
    
    assignments = await db.course_assignments.find({"faculty_user_id": fac_id, "status": "active"}).to_list(100)
    course_ids = [a["course_id"] for a in assignments]
    
    enrollments = await db.enrollments.find({"course_id": {"$in": course_ids}, "status": "enrolled"}).to_list(500)
    student_user_ids = list({e["student_user_id"] for e in enrollments})
    
    students = await db.student_profiles.find({"user_id": {"$in": student_user_ids}}).to_list(500)
    for s in students:
        s["_id"] = str(s["_id"])
        # Find which courses of this faculty they take
        s["enrolled_courses"] = [
            e["course_code"] for e in enrollments if e["student_user_id"] == s["user_id"]
        ]
    return students

