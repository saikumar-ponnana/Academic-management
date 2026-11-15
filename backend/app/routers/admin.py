from fastapi import APIRouter, Depends, HTTPException, status
from app.database.mongodb import get_database
from app.dependencies.auth_deps import require_role
from app.core.security import get_password_hash
from app.schemas.all_schemas import (
    StudentCreateRequest,
    FacultyCreateRequest,
    CourseCreateRequest,
    CourseAssignmentRequest,
    FacultyProfileApproval,
    AttendanceOverrideCreateRequest
)
from app.services.attendance_service import get_institution_settings_db, get_current_institution_time
from datetime import datetime, timedelta
from typing import Optional, List
import uuid

from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Administrator Management"])

class AdminResetPasswordPayload(BaseModel):
    new_password: str

@router.post("/reseed")
async def trigger_reseed(current_user: dict = Depends(require_role(["admin"]))):
    from app.database.seed_data import seed_database
    await seed_database()
    return {"message": "Database baseline and official faculty/courses re-seeded successfully."}

@router.post("/reconnect-db")
async def admin_reconnect_db(current_user: dict = Depends(require_role(["admin"]))):
    from app.database.mongodb import try_reconnect_to_real_mongo, db_wrapper
    success = await try_reconnect_to_real_mongo()
    if not success:
        raise HTTPException(
            status_code=500,
            detail=f"Could not connect to MongoDB Atlas cluster: {db_wrapper.connection_error}. Ensure 0.0.0.0/0 is added to MongoDB Atlas Network Access."
        )
    return {
        "message": "Successfully connected to live MongoDB Atlas cluster!",
        "database_name": settings.DATABASE_NAME,
        "is_mock_database": db_wrapper.is_mock
    }

@router.post("/users/{user_id}/reset-password")
async def admin_reset_password(
    user_id: str,
    payload: AdminResetPasswordPayload,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    pwd_hash = get_password_hash(payload.new_password)
    res = await db.users.update_one({"_id": user_id}, {"$set": {"password_hash": pwd_hash}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Password updated successfully."}

@router.get("/dashboard")
async def get_admin_dashboard(current_user: dict = Depends(require_role(["admin"]))):
    db = get_database()
    inst_settings = await get_institution_settings_db(db)
    now = get_current_institution_time(inst_settings.get("timezone"))
    today_str = now.strftime("%Y-%m-%d")
    current_day = now.strftime("%A")
    cutoff_time = inst_settings.get("attendanceCutoff", "19:00")
    
    # Counts
    student_count = await db.student_profiles.count_documents({})
    faculty_count = await db.faculty_profiles.count_documents({})
    course_count = await db.courses.count_documents({})
    materials_count = await db.study_materials.count_documents({})
    
    # Today's classes
    today_classes = await db.timetable_entries.find({"day_of_week": current_day, "status": "active"}).to_list(200)
    total_classes_today = len(today_classes)
    
    # Check attendance status of today's classes
    completed_today = 0
    pending_today = 0
    missed_deadline = 0
    
    cur_time_str = now.strftime("%H:%M")
    past_cutoff = cur_time_str >= cutoff_time
    
    for c in today_classes:
        session_id = f"{c['_id']}_{today_str}"
        att = await db.attendance_sessions.find_one({"session_id": session_id})
        if att and att.get("submission_status") == "submitted":
            completed_today += 1
        else:
            if past_cutoff:
                # Check if override exists
                ov = await db.attendance_overrides.find_one({
                    "session_id": session_id,
                    "status": "approved",
                    "expires_at": {"$gt": now.isoformat()}
                })
                if ov:
                    pending_today += 1
                else:
                    missed_deadline += 1
            else:
                pending_today += 1
                
    # Low attendance students calculation
    # Students with < 75% overall
    all_students = await db.student_profiles.find({}).to_list(1000)
    low_attendance_students = []
    
    for s in all_students:
        s_id = s["user_id"]
        # Find conducted sessions for student's section
        sessions = await db.attendance_sessions.find({
            "section": s.get("section"),
            "submission_status": "submitted"
        }).to_list(500)
        conducted = len(sessions)
        if conducted > 0:
            session_ids = [sess["_id"] for sess in sessions]
            attended = await db.attendance_records.count_documents({
                "attendance_session_id": {"$in": session_ids},
                "student_user_id": s_id,
                "status": "present"
            })
            pct = round((attended / conducted * 100), 1)
            if pct < 75.0:
                low_attendance_students.append({
                    "student_id": s.get("student_id"),
                    "roll_number": s.get("roll_number"),
                    "name": s.get("full_name"),
                    "department": s.get("department_code"),
                    "section": s.get("section"),
                    "conducted": conducted,
                    "attended": attended,
                    "percentage": pct
                })
                
    # Pending faculty profile submissions
    pending_profiles = await db.faculty_profiles.find({"profile_status": "submitted"}).to_list(50)
    for p in pending_profiles:
        p["_id"] = str(p["_id"])
        
    return {
        "total_students": student_count,
        "total_faculty": faculty_count,
        "total_courses": course_count,
        "total_materials": materials_count,
        "today_classes_count": total_classes_today,
        "attendance_completed_today": completed_today,
        "attendance_pending_today": pending_today,
        "attendance_missed_deadlines": missed_deadline,
        "low_attendance_count": len(low_attendance_students),
        "low_attendance_sample": low_attendance_students[:10],
        "pending_faculty_approvals": len(pending_profiles),
        "pending_faculty_list": pending_profiles,
        "current_date": today_str,
        "current_time": now.strftime("%I:%M %p"),
        "cutoff_time": cutoff_time
    }

@router.get("/faculty")
async def list_faculty_members(current_user: dict = Depends(require_role(["admin"]))):
    db = get_database()
    profiles = await db.faculty_profiles.find({}).sort("faculty_id", 1).to_list(200)
    for p in profiles:
        p["_id"] = str(p["_id"])
        # Get user status
        u = await db.users.find_one({"_id": p["user_id"]})
        p["is_active"] = u.get("is_active", True) if u else True
        # Assigned courses count
        p["assigned_courses_count"] = await db.course_assignments.count_documents({
            "faculty_user_id": p["user_id"],
            "status": "active"
        })
    return profiles

@router.post("/faculty")
async def create_faculty(
    req: FacultyCreateRequest,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    # Check if email exists
    existing = await db.users.find_one({"email": req.email.strip().lower()})
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")
        
    user_id = f"user-fac-{uuid.uuid4().hex[:8]}"
    pwd_hash = get_password_hash(req.password)
    
    user_doc = {
        "_id": user_id,
        "email": req.email.strip().lower(),
        "password_hash": pwd_hash,
        "role": "faculty",
        "full_name": req.full_name,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    await db.users.insert_one(user_doc)
    
    profile_doc = {
        "_id": f"prof-{user_id}",
        "user_id": user_id,
        "faculty_id": req.faculty_id,
        "full_name": req.full_name,
        "email": req.email.strip().lower(),
        "phone": req.phone or "",
        "designation": req.designation,
        "department_code": req.department_code,
        "highest_degree": req.highest_degree,
        "specialization": req.specialization,
        "profile_status": "approved",
        "completion_percentage": 70,
        "created_at": datetime.utcnow().isoformat()
    }
    await db.faculty_profiles.insert_one(profile_doc)
    profile_doc["_id"] = str(profile_doc["_id"])
    return {"message": "Faculty account created successfully.", "faculty": profile_doc}

@router.post("/faculty/{faculty_user_id}/approve")
async def approve_faculty_profile(
    faculty_user_id: str,
    payload: FacultyProfileApproval,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    fac = await db.faculty_profiles.find_one({"user_id": faculty_user_id})
    if not fac:
        raise HTTPException(status_code=404, detail="Faculty profile not found.")
        
    new_status = "approved" if payload.approved else "rejected"
    now_iso = datetime.utcnow().isoformat()
    await db.faculty_profiles.update_one(
        {"user_id": faculty_user_id},
        {"$set": {
            "profile_status": new_status,
            "approved_by": current_user["_id"],
            "approved_at": now_iso,
            "admin_comments": payload.comments or ""
        }}
    )
    # Activate or deactivate user login
    await db.users.update_one(
        {"_id": faculty_user_id},
        {"$set": {"is_active": payload.approved}}
    )
    # Record audit log
    await db.audit_logs.insert_one({
        "action": "FACULTY_APPROVAL",
        "status": new_status,
        "faculty_user_id": faculty_user_id,
        "admin_user_id": current_user["_id"],
        "comments": payload.comments or "",
        "created_at": now_iso
    })
    return {"message": f"Faculty profile {new_status} successfully."}

@router.get("/students")
async def list_students(current_user: dict = Depends(require_role(["admin"]))):
    db = get_database()
    students = await db.student_profiles.find({}).sort("roll_number", 1).to_list(1000)
    for s in students:
        s["_id"] = str(s["_id"])
        u = await db.users.find_one({"_id": s.get("user_id")})
        if u:
            s["is_active"] = u.get("is_active", True)
            if "profile_status" not in s or not s["profile_status"]:
                s["profile_status"] = "approved" if u.get("is_active", True) else "pending"
        else:
            s["is_active"] = False
            s["profile_status"] = "pending"
    return students

@router.post("/students/{student_user_id}/approve")
async def approve_student(
    student_user_id: str,
    payload: FacultyProfileApproval,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    student = await db.student_profiles.find_one({"user_id": student_user_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")

    new_status = "approved" if payload.approved else "rejected"
    is_active = payload.approved

    await db.student_profiles.update_one(
        {"user_id": student_user_id},
        {"$set": {"profile_status": new_status, "status": new_status}}
    )

    await db.users.update_one(
        {"_id": student_user_id},
        {"$set": {"is_active": is_active}}
    )

    now_iso = datetime.utcnow().isoformat()

    # If approved, auto-enroll into courses for their branch and semester
    if payload.approved:
        matching_courses = await db.courses.find({
            "department_code": student.get("department_code", "CYBER"),
            "semester": student.get("semester", 1)
        }).to_list(50)

        for c in matching_courses:
            await db.enrollments.update_one(
                {"student_user_id": student_user_id, "course_id": c["_id"]},
                {"$setOnInsert": {
                    "_id": f"ENR-{uuid.uuid4().hex[:8].upper()}",
                    "student_user_id": student_user_id,
                    "student_name": student.get("full_name"),
                    "roll_number": student.get("roll_number"),
                    "course_id": c["_id"],
                    "course_code": c.get("code"),
                    "department_code": student.get("department_code", "CYBER"),
                    "semester": student.get("semester", 1),
                    "section": student.get("section", "1"),
                    "academic_year": student.get("academic_year", "2026-27"),
                    "status": "enrolled",
                    "enrolled_at": now_iso
                }},
                upsert=True
            )

    await db.audit_logs.insert_one({
        "action": "STUDENT_APPROVAL",
        "status": new_status,
        "student_user_id": student_user_id,
        "admin_user_id": current_user["_id"],
        "comments": payload.comments or "",
        "created_at": now_iso
    })
    return {"message": f"Student registration {new_status} successfully."}

@router.post("/students")
async def create_student(
    req: StudentCreateRequest,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    existing = await db.users.find_one({"email": req.email.strip().lower()})
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")
    existing_roll = await db.student_profiles.find_one({"roll_number": req.roll_number.strip().upper()})
    if existing_roll:
        raise HTTPException(status_code=400, detail="Roll number is already registered.")
        
    user_id = f"user-stu-{uuid.uuid4().hex[:8]}"
    pwd_hash = get_password_hash(req.password)
    
    user_doc = {
        "_id": user_id,
        "email": req.email.strip().lower(),
        "password_hash": pwd_hash,
        "role": "student",
        "full_name": req.full_name,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    await db.users.insert_one(user_doc)
    
    student_doc = {
        "_id": f"prof-{user_id}",
        "user_id": user_id,
        "student_id": f"STU-{uuid.uuid4().hex[:6].upper()}",
        "roll_number": req.roll_number.strip().upper(),
        "full_name": req.full_name,
        "email": req.email.strip().lower(),
        "phone": req.phone or "",
        "department_code": req.department_code,
        "academic_year": req.academic_year,
        "semester": req.semester,
        "section": req.section,
        "created_at": datetime.utcnow().isoformat()
    }
    await db.student_profiles.insert_one(student_doc)
    
    # Auto-enroll student into active courses for their department, semester, section
    matching_courses = await db.courses.find({
        "department_code": req.department_code,
        "semester": req.semester
    }).to_list(50)
    
    for c in matching_courses:
        enroll_id = f"ENR-{uuid.uuid4().hex[:8].upper()}"
        await db.enrollments.insert_one({
            "_id": enroll_id,
            "student_user_id": user_id,
            "student_name": req.full_name,
            "roll_number": req.roll_number.strip().upper(),
            "course_id": c["_id"],
            "course_code": c.get("code"),
            "department_code": req.department_code,
            "semester": req.semester,
            "section": req.section,
            "academic_year": req.academic_year,
            "status": "enrolled",
            "enrolled_at": datetime.utcnow().isoformat()
        })
        
    student_doc["_id"] = str(student_doc["_id"])
    return {"message": "Student created and enrolled in courses successfully.", "student": student_doc}

@router.post("/course-assignments")
async def assign_course_to_faculty(
    req: CourseAssignmentRequest,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    course = await db.courses.find_one({"_id": req.course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    fac_user = await db.users.find_one({"_id": req.faculty_user_id})
    if not fac_user:
        raise HTTPException(status_code=404, detail="Faculty user not found.")
    fac_profile = await db.faculty_profiles.find_one({"user_id": req.faculty_user_id})
    faculty_name = fac_profile.get("full_name") if fac_profile else fac_user.get("full_name")
    
    assign_id = f"ASG-{uuid.uuid4().hex[:8].upper()}"
    doc = {
        "_id": assign_id,
        "course_id": req.course_id,
        "course_code": course.get("code"),
        "course_name": course.get("name"),
        "faculty_user_id": req.faculty_user_id,
        "faculty_name": faculty_name,
        "department_code": req.department_code,
        "semester": req.semester,
        "section": req.section,
        "academic_year": req.academic_year,
        "status": "active",
        "assigned_by": current_user["_id"],
        "assigned_at": datetime.utcnow().isoformat()
    }
    await db.course_assignments.insert_one(doc)
    doc["_id"] = str(doc["_id"])
    return {"message": "Course officially assigned to faculty.", "assignment": doc}

@router.get("/course-assignments")
async def list_course_assignments(
    department_code: Optional[str] = None,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    query = {"status": "active"}
    if department_code:
        query["department_code"] = department_code
    assignments = await db.course_assignments.find(query).to_list(500)
    for a in assignments:
        a["_id"] = str(a["_id"])
    return assignments

@router.delete("/course-assignments/{assignment_id}")
async def delete_course_assignment(
    assignment_id: str,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    res = await db.course_assignments.delete_one({"_id": assignment_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course assignment not found.")
    return {"message": "Course assignment removed successfully."}

@router.delete("/faculty/{faculty_user_id}")
async def delete_faculty(
    faculty_user_id: str,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    await db.users.delete_one({"_id": faculty_user_id})
    await db.faculty_profiles.delete_one({"user_id": faculty_user_id})
    await db.course_assignments.delete_many({"faculty_user_id": faculty_user_id})
    await db.timetable_entries.delete_many({"faculty_user_id": faculty_user_id})
    return {"message": "Faculty member and all allocations removed successfully."}

@router.delete("/students/{student_user_id}")
async def delete_student(
    student_user_id: str,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    await db.users.delete_one({"_id": student_user_id})
    await db.student_profiles.delete_one({"user_id": student_user_id})
    await db.enrollments.delete_many({"student_user_id": student_user_id})
    return {"message": "Student record removed successfully."}

@router.get("/attendance-status")
async def get_attendance_monitoring(
    date: Optional[str] = None,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    inst_settings = await get_institution_settings_db(db)
    now = get_current_institution_time(inst_settings.get("timezone"))
    query_date = date or now.strftime("%Y-%m-%d")
    
    # Calculate day of week for query_date
    q_dt = datetime.strptime(query_date, "%Y-%m-%d")
    q_day = q_dt.strftime("%A")
    cutoff_time = inst_settings.get("attendanceCutoff", "19:00")
    
    # Timetable entries scheduled on that day
    scheduled_classes = await db.timetable_entries.find({"day_of_week": q_day, "status": "active"}).to_list(200)
    
    monitored_list = []
    for c in scheduled_classes:
        session_id = f"{c['_id']}_{query_date}"
        att = await db.attendance_sessions.find_one({"session_id": session_id})
        
        # Check active override
        ov = await db.attendance_overrides.find_one({
            "session_id": session_id,
            "status": "approved"
        })
        
        status_label = "pending"
        submitted_at = None
        if att and att.get("submission_status") == "submitted":
            status_label = "submitted"
            submitted_at = att.get("submitted_at")
        else:
            is_past_date = query_date < now.strftime("%Y-%m-%d")
            is_past_cutoff_today = (query_date == now.strftime("%Y-%m-%d") and now.strftime("%H:%M") >= cutoff_time)
            
            if is_past_date or is_past_cutoff_today:
                if ov and ov.get("expires_at", "") > now.isoformat():
                    status_label = "override_approved"
                else:
                    status_label = "missed_deadline"
                    
        monitored_list.append({
            "session_id": session_id,
            "course_code": c.get("course_code"),
            "course_name": c.get("course_name"),
            "faculty_user_id": c.get("faculty_user_id"),
            "faculty_name": c.get("faculty_name"),
            "department_code": c.get("department_code"),
            "section": c.get("section"),
            "time": f"{c.get('start_time')} - {c.get('end_time')}",
            "location": c.get("location"),
            "status": status_label,
            "submitted_at": submitted_at,
            "override": ov
        })
        
    return {
        "date": query_date,
        "day": q_day,
        "cutoff_time": cutoff_time,
        "sessions": monitored_list
    }

@router.post("/attendance-overrides")
async def create_attendance_override(
    req: AttendanceOverrideCreateRequest,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    inst_settings = await get_institution_settings_db(db)
    now = get_current_institution_time(inst_settings.get("timezone"))
    
    # Calculate expiration time
    expires_at = (now + timedelta(hours=req.expiration_hours)).isoformat()
    
    override_id = f"OVR-{uuid.uuid4().hex[:8].upper()}"
    override_doc = {
        "_id": override_id,
        "session_id": req.session_id,
        "faculty_user_id": req.faculty_user_id,
        "reason": req.reason,
        "approved_by": current_user["_id"],
        "approved_by_name": current_user.get("full_name", "Administrator"),
        "approved_at": now.isoformat(),
        "expires_at": expires_at,
        "status": "approved",
        "used": False,
        "used_at": None
    }
    
    # Upsert override for this session
    await db.attendance_overrides.update_one(
        {"session_id": req.session_id},
        {"$set": override_doc},
        upsert=True
    )
    
    # Audit log
    await db.attendance_audit_logs.insert_one({
        "session_id": req.session_id,
        "action": "APPROVE_OVERRIDE",
        "actor_user_id": current_user["_id"],
        "actor_role": "admin",
        "details": f"Reason: {req.reason}. Expires at: {expires_at}",
        "timestamp": now.isoformat()
    })
    
    override_doc["_id"] = str(override_doc["_id"])
    return {
        "message": f"Late attendance override approved. Valid until {expires_at}.",
        "override": override_doc
    }

@router.get("/attendance-overrides")
async def list_attendance_overrides(current_user: dict = Depends(require_role(["admin"]))):
    db = get_database()
    overrides = await db.attendance_overrides.find({}).sort("approved_at", -1).to_list(100)
    for o in overrides:
        o["_id"] = str(o["_id"])
    return overrides
