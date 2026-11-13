from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.database.mongodb import get_database
from app.dependencies.auth_deps import get_current_user, require_role
from app.schemas.all_schemas import TimetableCreateRequest
from app.services.attendance_service import get_institution_settings_db, get_current_institution_time
from typing import Optional
import uuid

router = APIRouter(prefix="/timetable", tags=["Timetable"])

def times_overlap(s1: str, e1: str, s2: str, e2: str) -> bool:
    return max(s1, s2) < min(e1, e2)

@router.get("")
async def get_timetables(
    department_code: Optional[str] = None,
    semester: Optional[int] = None,
    section: Optional[str] = None,
    faculty_user_id: Optional[str] = None,
    day_of_week: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    query = {"status": "active"}
    
    if department_code:
        query["department_code"] = department_code
    if semester:
        query["semester"] = semester
    if section:
        query["section"] = section
    if faculty_user_id:
        query["faculty_user_id"] = faculty_user_id
    if day_of_week:
        query["day_of_week"] = day_of_week
        
    entries = await db.timetable_entries.find(query).sort("start_time", 1).to_list(500)
    for e in entries:
        e["_id"] = str(e["_id"])
    return entries

@router.get("/today")
async def get_today_timetable(current_user: dict = Depends(get_current_user)):
    db = get_database()
    inst_settings = await get_institution_settings_db(db)
    now = get_current_institution_time(inst_settings.get("timezone"))
    current_day = now.strftime("%A")
    today_str = now.strftime("%Y-%m-%d")
    cutoff_time = inst_settings.get("attendanceCutoff", "19:00")
    
    role = current_user.get("role")
    query = {"day_of_week": current_day, "status": "active"}
    
    if role == "faculty":
        query["faculty_user_id"] = current_user["_id"]
    elif role == "student":
        stu = await db.student_profiles.find_one({"user_id": current_user["_id"]})
        if stu:
            query["department_code"] = stu.get("department_code")
            query["semester"] = stu.get("semester")
            query["section"] = stu.get("section")
            
    entries = await db.timetable_entries.find(query).sort("start_time", 1).to_list(100)
    
    for e in entries:
        e["_id"] = str(e["_id"])
        session_id = f"{e['_id']}_{today_str}"
        e["session_id"] = session_id
        
        # Check attendance
        att = await db.attendance_sessions.find_one({"session_id": session_id})
        if att:
            e["attendance_status"] = att.get("submission_status", "submitted")
            e["present_count"] = att.get("present_count", 0)
            e["absent_count"] = att.get("absent_count", 0)
        else:
            cur_time = now.strftime("%H:%M")
            if cur_time >= cutoff_time:
                ov = await db.attendance_overrides.find_one({
                    "session_id": session_id,
                    "status": "approved",
                    "expires_at": {"$gt": now.isoformat()}
                })
                e["attendance_status"] = "override_approved" if ov else "locked"
            elif cur_time < e.get("end_time"):
                e["attendance_status"] = "in_progress" if cur_time >= e.get("start_time") else "upcoming"
            else:
                e["attendance_status"] = "pending"
                
    return {
        "day": current_day,
        "date": today_str,
        "classes": entries
    }

@router.post("")
async def create_timetable_entry(
    req: TimetableCreateRequest,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    
    # 1. Fetch course details
    course = await db.courses.find_one({"_id": req.course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
        
    # 2. Fetch faculty details
    faculty_user = await db.users.find_one({"_id": req.faculty_user_id})
    if not faculty_user:
        raise HTTPException(status_code=404, detail="Faculty user not found.")
    faculty_profile = await db.faculty_profiles.find_one({"user_id": req.faculty_user_id})
    faculty_name = faculty_profile.get("full_name") if faculty_profile else faculty_user.get("full_name")
    
    # 3. Check timetable conflicts:
    # A: Same faculty has another class on same day with overlapping time
    faculty_conflict = await db.timetable_entries.find({
        "faculty_user_id": req.faculty_user_id,
        "day_of_week": req.day_of_week,
        "status": "active"
    }).to_list(50)
    for c in faculty_conflict:
        if times_overlap(req.start_time, req.end_time, c["start_time"], c["end_time"]):
            raise HTTPException(
                status_code=400,
                detail=f"Faculty schedule conflict: {faculty_name} already teaches {c.get('course_name')} ({c.get('start_time')}-{c.get('end_time')}) on {req.day_of_week}."
            )
            
    # B: Same section has another class at the same time
    section_conflict = await db.timetable_entries.find({
        "department_code": req.department_code,
        "semester": req.semester,
        "section": req.section,
        "day_of_week": req.day_of_week,
        "status": "active"
    }).to_list(50)
    for c in section_conflict:
        if times_overlap(req.start_time, req.end_time, c["start_time"], c["end_time"]):
            raise HTTPException(
                status_code=400,
                detail=f"Section schedule conflict: Section {req.section} already has {c.get('course_name')} ({c.get('start_time')}-{c.get('end_time')}) on {req.day_of_week}."
            )
            
    # C: Same room location is occupied
    room_conflict = await db.timetable_entries.find({
        "location": req.location,
        "day_of_week": req.day_of_week,
        "status": "active"
    }).to_list(50)
    for c in room_conflict:
        if times_overlap(req.start_time, req.end_time, c["start_time"], c["end_time"]):
            raise HTTPException(
                status_code=400,
                detail=f"Room conflict: Location '{req.location}' is already booked for {c.get('course_name')} ({c.get('start_time')}-{c.get('end_time')}) on {req.day_of_week}."
            )
            
    entry_id = f"TT-{uuid.uuid4().hex[:8].upper()}"
    new_entry = {
        "_id": entry_id,
        "academic_year": req.academic_year,
        "semester": req.semester,
        "department_code": req.department_code,
        "section": req.section,
        "course_id": req.course_id,
        "course_code": course.get("code"),
        "course_name": course.get("name"),
        "faculty_user_id": req.faculty_user_id,
        "faculty_name": faculty_name,
        "day_of_week": req.day_of_week,
        "start_time": req.start_time,
        "end_time": req.end_time,
        "location": req.location,
        "effective_start_date": req.effective_start_date,
        "effective_end_date": req.effective_end_date,
        "status": "active"
    }
    
    await db.timetable_entries.insert_one(new_entry)
    new_entry["_id"] = str(new_entry["_id"])
    return new_entry

@router.delete("/{entry_id}")
async def delete_timetable_entry(entry_id: str, current_user: dict = Depends(require_role(["admin"]))):
    db = get_database()
    res = await db.timetable_entries.delete_one({"_id": entry_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Timetable entry not found.")
    return {"message": "Timetable entry removed successfully."}

