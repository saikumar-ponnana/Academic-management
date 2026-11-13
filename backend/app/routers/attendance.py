from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from app.database.mongodb import get_database
from app.dependencies.auth_deps import get_current_user, require_role
from app.schemas.all_schemas import AttendanceSessionSubmitRequest
from app.services.attendance_service import (
    get_institution_settings_db,
    get_current_institution_time,
    check_attendance_eligibility
)
from datetime import datetime
from typing import Optional, List
import io
import csv

router = APIRouter(prefix="/attendance", tags=["Attendance / RNS"])

@router.get("/today")
async def get_today_attendance_sessions(current_user: dict = Depends(get_current_user)):
    db = get_database()
    inst_settings = await get_institution_settings_db(db)
    now = get_current_institution_time(inst_settings.get("timezone"))
    today_str = now.strftime("%Y-%m-%d")
    current_day = now.strftime("%A")
    cutoff_time = inst_settings.get("attendanceCutoff", "19:00")
    
    role = current_user.get("role")
    query = {"day_of_week": current_day, "status": "active"}
    
    if role == "faculty":
        query["faculty_user_id"] = current_user["_id"]
        
    tt_entries = await db.timetable_entries.find(query).sort("start_time", 1).to_list(100)
    sessions = []
    
    for t in tt_entries:
        session_id = f"{t['_id']}_{today_str}"
        session_meta = {
            "session_id": session_id,
            "timetable_entry_id": t["_id"],
            "course_id": t["course_id"],
            "course_code": t.get("course_code"),
            "course_name": t.get("course_name"),
            "faculty_user_id": t.get("faculty_user_id"),
            "faculty_name": t.get("faculty_name"),
            "department_code": t.get("department_code"),
            "semester": t.get("semester"),
            "section": t.get("section"),
            "location": t.get("location"),
            "date": today_str,
            "start_time": t.get("start_time"),
            "end_time": t.get("end_time"),
            "status": "active"
        }
        
        # Check eligibility and override
        is_eligible, eligibility_msg, override = await check_attendance_eligibility(
            db, session_meta, current_user["_id"], is_admin=(role == "admin")
        )
        
        # Check existing attendance session
        att_session = await db.attendance_sessions.find_one({"session_id": session_id})
        
        # Count students enrolled in this course & section
        student_count = await db.enrollments.count_documents({
            "course_id": t["course_id"],
            "section": t.get("section"),
            "status": "enrolled"
        })
        
        session_status = "pending"
        present_count = 0
        absent_count = 0
        if att_session:
            session_status = att_session.get("submission_status", "submitted")
            present_count = att_session.get("present_count", 0)
            absent_count = att_session.get("absent_count", 0)
        elif not is_eligible and "closed" in eligibility_msg.lower():
            session_status = "locked"
        elif override:
            session_status = "override_approved"
            
        sessions.append({
            **session_meta,
            "total_students": student_count,
            "present_count": present_count,
            "absent_count": absent_count,
            "submission_status": session_status,
            "is_eligible_to_mark": is_eligible,
            "eligibility_message": eligibility_msg,
            "has_override": bool(override),
            "cutoff_deadline": cutoff_time,
            "submitted_at": att_session.get("submitted_at") if att_session else None
        })
        
    return {
        "date": today_str,
        "day": current_day,
        "current_time": now.strftime("%H:%M:%S"),
        "cutoff_time": cutoff_time,
        "sessions": sessions
    }

@router.get("/session/{session_id}")
async def get_session_attendance_register(session_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    role = current_user.get("role")
    
    # Parse timetable entry id and date from session_id: {tt_id}_{YYYY-MM-DD}
    parts = session_id.rsplit("_", 1)
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid session ID format.")
    tt_id, date_str = parts[0], parts[1]
    
    tt = await db.timetable_entries.find_one({"_id": tt_id})
    if not tt:
        raise HTTPException(status_code=404, detail="Scheduled class timetable entry not found.")
        
    session_meta = {
        "session_id": session_id,
        "timetable_entry_id": tt_id,
        "course_id": tt["course_id"],
        "course_code": tt.get("course_code"),
        "course_name": tt.get("course_name"),
        "faculty_user_id": tt.get("faculty_user_id"),
        "faculty_name": tt.get("faculty_name"),
        "department_code": tt.get("department_code"),
        "semester": tt.get("semester"),
        "section": tt.get("section"),
        "location": tt.get("location"),
        "date": date_str,
        "start_time": tt.get("start_time"),
        "end_time": tt.get("end_time"),
        "status": tt.get("status", "active")
    }
    
    is_eligible, eligibility_msg, override = await check_attendance_eligibility(
        db, session_meta, current_user["_id"], is_admin=(role == "admin")
    )
    
    # Fetch existing attendance session and records if any
    existing_session = await db.attendance_sessions.find_one({"session_id": session_id})
    existing_records = {}
    if existing_session:
        records_cursor = db.attendance_records.find({"attendance_session_id": existing_session["_id"]})
        async for rec in records_cursor:
            existing_records[rec["student_user_id"]] = rec["status"]
            
    # Fetch enrolled students
    enrollments = await db.enrollments.find({
        "course_id": tt["course_id"],
        "section": tt.get("section"),
        "status": "enrolled"
    }).to_list(500)
    
    student_ids = [e["student_user_id"] for e in enrollments]
    students = await db.student_profiles.find({"user_id": {"$in": student_ids}}).sort("roll_number", 1).to_list(500)
    
    student_roster = []
    for s in students:
        s_id = s["user_id"]
        # Default status: existing marked status, or "present" by default
        cur_status = existing_records.get(s_id, "present")
        student_roster.append({
            "student_user_id": s_id,
            "roll_number": s.get("roll_number"),
            "student_name": s.get("full_name"),
            "email": s.get("email"),
            "status": cur_status
        })
        
    return {
        "session": session_meta,
        "submission_status": existing_session.get("submission_status") if existing_session else "pending",
        "is_eligible": is_eligible,
        "eligibility_message": eligibility_msg,
        "has_override": bool(override),
        "students": student_roster,
        "total_students": len(student_roster),
        "present_count": sum(1 for s in student_roster if s["status"] == "present"),
        "absent_count": sum(1 for s in student_roster if s["status"] == "absent"),
        "submitted_at": existing_session.get("submitted_at") if existing_session else None,
        "override_details": override
    }

@router.post("/session/{session_id}/submit")
async def submit_attendance(
    session_id: str,
    payload: AttendanceSessionSubmitRequest,
    is_draft: bool = Query(False),
    current_user: dict = Depends(require_role(["faculty", "admin"]))
):
    db = get_database()
    role = current_user.get("role")
    
    parts = session_id.rsplit("_", 1)
    if len(parts) != 2:
        raise HTTPException(status_code=400, detail="Invalid session ID format.")
    tt_id, date_str = parts[0], parts[1]
    
    tt = await db.timetable_entries.find_one({"_id": tt_id})
    if not tt:
        raise HTTPException(status_code=404, detail="Scheduled class timetable entry not found.")
        
    session_meta = {
        "session_id": session_id,
        "timetable_entry_id": tt_id,
        "course_id": tt["course_id"],
        "course_code": tt.get("course_code"),
        "faculty_user_id": tt.get("faculty_user_id"),
        "date": date_str,
        "start_time": tt.get("start_time"),
        "end_time": tt.get("end_time"),
        "status": tt.get("status", "active")
    }
    
    # 7:00 PM CUTOFF & ELIGIBILITY ENFORCEMENT
    is_eligible, reason, override = await check_attendance_eligibility(
        db, session_meta, current_user["_id"], is_admin=(role == "admin")
    )
    if not is_eligible:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=reason
        )
        
    inst_settings = await get_institution_settings_db(db)
    now = get_current_institution_time(inst_settings.get("timezone"))
    submission_timestamp = now.isoformat()
    submission_status = "draft" if is_draft else "submitted"
    
    present_count = sum(1 for r in payload.records if r.status == "present")
    absent_count = sum(1 for r in payload.records if r.status == "absent")
    total_count = len(payload.records)
    
    # Upsert Attendance Session (Idempotent)
    session_doc = {
        "session_id": session_id,
        "timetable_entry_id": tt_id,
        "course_id": tt["course_id"],
        "course_code": tt.get("course_code"),
        "course_name": tt.get("course_name"),
        "faculty_user_id": tt.get("faculty_user_id"),
        "faculty_name": tt.get("faculty_name"),
        "department_code": tt.get("department_code"),
        "semester": tt.get("semester"),
        "section": tt.get("section"),
        "date": date_str,
        "start_time": tt.get("start_time"),
        "end_time": tt.get("end_time"),
        "submission_status": submission_status,
        "total_students": total_count,
        "present_count": present_count,
        "absent_count": absent_count,
        "remarks": payload.remarks or "",
        "updated_at": submission_timestamp
    }
    
    if not is_draft:
        session_doc["submitted_at"] = submission_timestamp
        session_doc["submitted_by"] = current_user["_id"]
        session_doc["is_late_submission"] = bool(override)
        if override:
            session_doc["override_id"] = str(override["_id"])
            # Mark override as used
            await db.attendance_overrides.update_one(
                {"_id": override["_id"]},
                {"$set": {"used": True, "used_at": submission_timestamp}}
            )
            
    # Check if session exists
    existing = await db.attendance_sessions.find_one({"session_id": session_id})
    if existing:
        await db.attendance_sessions.update_one({"session_id": session_id}, {"$set": session_doc})
        att_session_id = existing["_id"]
    else:
        session_doc["created_at"] = submission_timestamp
        session_doc["_id"] = f"AS-{session_id}"
        await db.attendance_sessions.insert_one(session_doc)
        att_session_id = session_doc["_id"]
        
    # Upsert individual student attendance records
    for r in payload.records:
        rec_id = f"{att_session_id}_{r.student_user_id}"
        await db.attendance_records.update_one(
            {"_id": rec_id},
            {"$set": {
                "_id": rec_id,
                "attendance_session_id": att_session_id,
                "session_id": session_id,
                "student_user_id": r.student_user_id,
                "roll_number": r.roll_number,
                "student_name": r.student_name,
                "status": r.status,
                "marked_at": submission_timestamp
            }},
            upsert=True
        )
        
    # Audit Log
    await db.attendance_audit_logs.insert_one({
        "session_id": session_id,
        "action": "SUBMIT_ATTENDANCE" if not is_draft else "SAVE_DRAFT",
        "actor_user_id": current_user["_id"],
        "actor_role": role,
        "details": f"Marked {present_count} present, {absent_count} absent. Late submission: {bool(override)}",
        "timestamp": submission_timestamp
    })
    
    return {
        "message": "Attendance successfully submitted and recorded." if not is_draft else "Draft saved successfully.",
        "session_id": session_id,
        "status": submission_status,
        "present_count": present_count,
        "absent_count": absent_count,
        "total_count": total_count,
        "submitted_at": submission_timestamp
    }

@router.get("/reports")
async def get_attendance_reports(
    course_id: Optional[str] = None,
    department_code: Optional[str] = None,
    section: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    threshold: Optional[str] = None,  # "low" (<75%), "mid" (75-85%), "high" (>85%)
    format: Optional[str] = None,      # "csv" or None
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    role = current_user.get("role")
    
    # Base query for submitted sessions
    query = {"submission_status": "submitted"}
    if role == "faculty":
        query["faculty_user_id"] = current_user["_id"]
    if course_id:
        query["course_id"] = course_id
    if department_code:
        query["department_code"] = department_code
    if section:
        query["section"] = section
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["date"] = {"$gte": start_date}
    elif end_date:
        query["date"] = {"$lte": end_date}
        
    sessions = await db.attendance_sessions.find(query).sort("date", -1).to_list(1000)
    session_ids = [s["_id"] for s in sessions]
    
    # Calculate student attendance percentages
    student_query = {}
    if department_code:
        student_query["department_code"] = department_code
    if section:
        student_query["section"] = section
        
    students = await db.student_profiles.find(student_query).sort("roll_number", 1).to_list(1000)
    report_rows = []
    
    for s in students:
        s_id = s["user_id"]
        # Find relevant sessions for this student's section/course
        matching_sessions = [sess for sess in sessions if sess.get("section") == s.get("section")]
        conducted = len(matching_sessions)
        if conducted == 0:
            continue
            
        m_ids = [m["_id"] for m in matching_sessions]
        attended = await db.attendance_records.count_documents({
            "attendance_session_id": {"$in": m_ids},
            "student_user_id": s_id,
            "status": "present"
        })
        
        pct = round((attended / conducted * 100), 1)
        
        # Apply threshold filter if requested
        if threshold == "low" and pct >= 75.0:
            continue
        if threshold == "mid" and (pct < 75.0 or pct > 85.0):
            continue
        if threshold == "high" and pct <= 85.0:
            continue
            
        report_rows.append({
            "student_user_id": s_id,
            "roll_number": s.get("roll_number"),
            "student_name": s.get("full_name"),
            "department": s.get("department_code"),
            "section": s.get("section"),
            "semester": s.get("semester"),
            "conducted_sessions": conducted,
            "attended_sessions": attended,
            "attendance_percentage": pct,
            "is_low_attendance": pct < 75.0
        })
        
    # CSV export
    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Roll Number", "Student Name", "Department", "Section", "Semester", "Conducted Sessions", "Attended Sessions", "Attendance %", "Low Attendance Alert"])
        for r in report_rows:
            writer.writerow([
                r["roll_number"],
                r["student_name"],
                r["department"],
                r["section"],
                r["semester"],
                r["conducted_sessions"],
                r["attended_sessions"],
                f"{r['attendance_percentage']}%",
                "YES (<75%)" if r["is_low_attendance"] else "NO"
            ])
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=attendance_report.csv"}
        )
        
    return {
        "total_records": len(report_rows),
        "total_sessions_analyzed": len(sessions),
        "low_attendance_count": sum(1 for r in report_rows if r["is_low_attendance"]),
        "records": report_rows
    }

@router.get("/my-report")
async def get_my_student_report(current_user: dict = Depends(require_role(["student"]))):
    db = get_database()
    stu_id = current_user["_id"]
    profile = await db.student_profiles.find_one({"user_id": stu_id})
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")
        
    enrollments = await db.enrollments.find({"student_user_id": stu_id, "status": "enrolled"}).to_list(100)
    course_reports = []
    
    total_conducted = 0
    total_attended = 0
    
    for e in enrollments:
        cid = e["course_id"]
        course = await db.courses.find_one({"_id": cid})
        sessions = await db.attendance_sessions.find({
            "course_id": cid,
            "section": profile.get("section"),
            "submission_status": "submitted"
        }).sort("date", 1).to_list(200)
        
        c_conducted = len(sessions)
        session_ids = [s["_id"] for s in sessions]
        
        # Get detailed day-by-day logs
        records = await db.attendance_records.find({
            "attendance_session_id": {"$in": session_ids},
            "student_user_id": stu_id
        }).to_list(200)
        record_map = {r["session_id"]: r["status"] for r in records}
        
        session_history = []
        c_attended = 0
        for s in sessions:
            st = record_map.get(s["session_id"], "absent")
            if st == "present":
                c_attended += 1
            session_history.append({
                "date": s.get("date"),
                "time": f"{s.get('start_time')} - {s.get('end_time')}",
                "status": st
            })
            
        pct = round((c_attended / c_conducted * 100), 1) if c_conducted > 0 else 100.0
        total_conducted += c_conducted
        total_attended += c_attended
        
        course_reports.append({
            "course_id": cid,
            "course_code": course.get("code") if course else e.get("course_code"),
            "course_name": course.get("name") if course else e.get("course_code"),
            "conducted": c_conducted,
            "attended": c_attended,
            "percentage": pct,
            "is_low": pct < 75.0,
            "history": session_history
        })
        
    overall_pct = round((total_attended / total_conducted * 100), 1) if total_conducted > 0 else 100.0
    return {
        "student_name": profile.get("full_name"),
        "roll_number": profile.get("roll_number"),
        "department": profile.get("department_code"),
        "overall_percentage": overall_pct,
        "total_conducted": total_conducted,
        "total_attended": total_attended,
        "courses": course_reports
    }

