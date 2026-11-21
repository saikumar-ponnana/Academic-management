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
    import uuid
    db = get_database()
    code = req.code.strip().upper()
    existing = await db.courses.find_one({"code": code})
    if existing:
        raise HTTPException(status_code=400, detail=f"Course with code '{code}' already exists.")
    
    course_id = f"CRS-{code}"
    now_iso = datetime.utcnow().isoformat()
    dept_code = req.department_code.strip().upper()
    
    doc = {
        "_id": course_id,
        "code": code,
        "name": req.name.strip(),
        "department_code": dept_code,
        "semester": req.semester,
        "credits": req.credits,
        "description": req.description or "",
        "created_at": now_iso
    }
    await db.courses.insert_one(doc)

    enrolled_count = 0
    # 1. Auto-enroll existing students matching this department and semester
    if req.auto_enroll_students:
        students = await db.student_profiles.find({
            "department_code": dept_code,
            "semester": req.semester
        }).to_list(500)

        for s in students:
            enr_id = f"ENR-{uuid.uuid4().hex[:8].upper()}"
            await db.enrollments.update_one(
                {"student_user_id": s["user_id"], "course_id": course_id},
                {
                    "$setOnInsert": {
                        "_id": enr_id,
                        "enrolled_at": now_iso
                    },
                    "$set": {
                        "student_user_id": s["user_id"],
                        "student_name": s.get("full_name"),
                        "roll_number": s.get("roll_number"),
                        "course_id": course_id,
                        "course_code": code,
                        "department_code": dept_code,
                        "semester": req.semester,
                        "section": s.get("section", "1"),
                        "academic_year": s.get("academic_year", "2026-27"),
                        "status": "enrolled"
                    }
                },
                upsert=True
            )
            enrolled_count += 1

    # 2. Map faculty if provided
    fac_name = None
    if req.faculty_user_id:
        fac = await db.faculty_profiles.find_one({"user_id": req.faculty_user_id})
        fac_name = fac.get("full_name") if fac else "Faculty Instructor"
        asg_id = f"ASG-{course_id}-{req.faculty_user_id}"
        await db.course_assignments.update_one(
            {"course_id": course_id, "faculty_user_id": req.faculty_user_id},
            {
                "$set": {
                    "_id": asg_id,
                    "course_id": course_id,
                    "course_code": code,
                    "course_name": doc["name"],
                    "faculty_user_id": req.faculty_user_id,
                    "faculty_name": fac_name,
                    "department_code": dept_code,
                    "semester": req.semester,
                    "section": "1",
                    "academic_year": "2026-2027",
                    "status": "active",
                    "assigned_at": now_iso
                }
            },
            upsert=True
        )

    # 3. Create baseline syllabus & study material record
    mat_id = f"MAT-{code}-SYLLABUS"
    await db.study_materials.update_one(
        {"_id": mat_id},
        {
            "$set": {
                "_id": mat_id,
                "title": f"{doc['name']} - Syllabus & Course Curriculum",
                "description": doc["description"] or f"Official academic syllabus and curriculum guidelines for {code}: {doc['name']}.",
                "course_id": course_id,
                "course_code": code,
                "course_name": doc["name"],
                "department_code": dept_code,
                "semester": req.semester,
                "category": "Syllabus",
                "visibility": "PUBLIC",
                "faculty_user_id": req.faculty_user_id or "admin",
                "faculty_name": fac_name or "Academic Administration",
                "file_type": "info",
                "uploaded_at": now_iso
            }
        },
        upsert=True
    )

    doc["_id"] = str(doc["_id"])
    doc["enrolled_students_count"] = enrolled_count
    doc["faculty_assigned"] = fac_name
    doc["materials_count"] = 1
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
        # Quick counts for UI cards
        c_id = c["_id"]
        c["enrolled_students_count"] = await db.enrollments.count_documents({"course_id": c_id, "status": "enrolled"})
        asg = await db.course_assignments.find_one({"course_id": c_id, "status": "active"})
        c["assigned_faculty_name"] = asg.get("faculty_name") if asg else None
        c["materials_count"] = await db.study_materials.count_documents({"course_id": c_id})
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

