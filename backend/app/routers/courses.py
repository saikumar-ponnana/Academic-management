from fastapi import APIRouter, Depends, HTTPException, status
from app.database.mongodb import get_database
from app.dependencies.auth_deps import get_current_user, require_role
from app.schemas.all_schemas import CourseCreateRequest
from datetime import datetime

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post("")
async def create_course(
    req: CourseCreateRequest,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    code = req.code.strip().upper()
    existing = await db.courses.find_one({"code": code})
    if existing:
        raise HTTPException(status_code=400, detail=f"Course with code '{code}' already exists.")
    
    course_id = f"CRS-{code}"
    doc = {
        "_id": course_id,
        "code": code,
        "name": req.name.strip(),
        "department_code": req.department_code.strip().upper(),
        "semester": req.semester,
        "credits": req.credits,
        "description": req.description or "",
        "created_at": datetime.utcnow().isoformat()
    }
    await db.courses.insert_one(doc)
    doc["_id"] = str(doc["_id"])
    return doc

@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    res = await db.courses.delete_one({"_id": course_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found.")
    await db.course_assignments.delete_many({"course_id": course_id})
    await db.timetable_entries.delete_many({"course_id": course_id})
    return {"message": "Course and associated assignments removed successfully."}

@router.get("")
async def get_courses(current_user: dict = Depends(get_current_user)):
    db = get_database()
    role = current_user.get("role")
    
    if role == "faculty":
        # Only faculty's assigned courses
        assignments = await db.course_assignments.find({"faculty_user_id": current_user["_id"], "status": "active"}).to_list(100)
        c_ids = [a["course_id"] for a in assignments]
        courses = await db.courses.find({"_id": {"$in": c_ids}}).to_list(100)
    elif role == "student":
        # Only student's enrolled courses
        enrollments = await db.enrollments.find({"student_user_id": current_user["_id"], "status": "enrolled"}).to_list(100)
        c_ids = [e["course_id"] for e in enrollments]
        courses = await db.courses.find({"_id": {"$in": c_ids}}).to_list(100)
    else:
        # Admin sees all courses
        courses = await db.courses.find({}).to_list(200)
        
    for c in courses:
        c["_id"] = str(c["_id"])
    return courses

@router.get("/{course_id}")
async def get_course_detail(course_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    course = await db.courses.find_one({"_id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
        
    course["_id"] = str(course["_id"])
    
    # Faculty teaching this course
    assignments = await db.course_assignments.find({"course_id": course_id, "status": "active"}).to_list(50)
    for a in assignments:
        a["_id"] = str(a["_id"])
    course["assignments"] = assignments
    
    # Students count
    enrolled_count = await db.enrollments.count_documents({"course_id": course_id, "status": "enrolled"})
    course["enrolled_students_count"] = enrolled_count
    
    # Materials count
    materials_count = await db.study_materials.count_documents({"course_id": course_id})
    course["materials_count"] = materials_count
    
    return course

@router.get("/{course_id}/students")
async def get_course_students(course_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    enrollments = await db.enrollments.find({"course_id": course_id, "status": "enrolled"}).to_list(500)
    student_ids = [e["student_user_id"] for e in enrollments]
    
    students = await db.student_profiles.find({"user_id": {"$in": student_ids}}).to_list(500)
    
    # Calculate attendance for each student in this course
    sessions = await db.attendance_sessions.find({"course_id": course_id, "submission_status": "submitted"}).to_list(200)
    conducted_count = len(sessions)
    session_ids = [s["_id"] for s in sessions]
    
    for s in students:
        s["_id"] = str(s["_id"])
        if conducted_count > 0:
            attended = await db.attendance_records.count_documents({
                "attendance_session_id": {"$in": session_ids},
                "student_user_id": s["user_id"],
                "status": "present"
            })
            s["conducted_sessions"] = conducted_count
            s["attended_sessions"] = attended
            s["attendance_percentage"] = round((attended / conducted_count * 100), 1)
        else:
            s["conducted_sessions"] = 0
            s["attended_sessions"] = 0
            s["attendance_percentage"] = 100.0
            
    return students

@router.get("/{course_id}/materials")
async def get_course_materials(course_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    role = current_user.get("role")
    query = {"course_id": course_id}
    
    materials = await db.study_materials.find(query).sort("uploaded_at", -1).to_list(100)
    for m in materials:
        m["_id"] = str(m["_id"])
    return materials

@router.get("/{course_id}/timetable")
async def get_course_timetable(course_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    entries = await db.timetable_entries.find({"course_id": course_id, "status": "active"}).sort("start_time", 1).to_list(50)
    for e in entries:
        e["_id"] = str(e["_id"])
    return entries

