import pytz
from datetime import datetime, date, time
from typing import Optional, Tuple, Dict, Any
from fastapi import HTTPException, status
from app.core.config import settings

def get_institution_timezone(timezone_str: Optional[str] = None) -> pytz.BaseTzInfo:
    tz_name = timezone_str or settings.DEFAULT_TIMEZONE
    try:
        return pytz.timezone(tz_name)
    except Exception:
        return pytz.timezone("Asia/Kolkata")

def get_current_institution_time(timezone_str: Optional[str] = None) -> datetime:
    tz = get_institution_timezone(timezone_str)
    return datetime.now(tz)

async def get_institution_settings_db(db) -> Dict[str, Any]:
    inst = await db.institution_settings.find_one({"_id": "default"})
    if not inst:
        return {
            "institutionName": "GVP Institute of Higher Learning & Research — ELC Center",
            "timezone": settings.DEFAULT_TIMEZONE,
            "attendanceCutoff": settings.ATTENDANCE_CUTOFF_TIME,
            "minimumAttendancePercentage": settings.MINIMUM_ATTENDANCE_PERCENTAGE,
            "maxUploadSizeMB": settings.MAX_UPLOAD_SIZE_MB
        }
    return inst

async def check_attendance_eligibility(
    db,
    session: Dict[str, Any],
    faculty_user_id: str,
    is_admin: bool = False
) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Validates if attendance can be marked/submitted for a session.
    Enforces:
    1. Faculty ownership (faculty must own the session unless admin).
    2. Session not cancelled.
    3. Scheduled class has ended (current time >= session end_time on today's date).
    4. 7:00 PM cutoff on the session date:
       - If current time >= 19:00:00 on the class date or date is in past, reject UNLESS active approved override exists.
    Returns: (is_eligible, reason_or_status_message, active_override)
    """
    if not is_admin and str(session.get("faculty_user_id")) != str(faculty_user_id):
        return False, "Unauthorized: You are not assigned to teach this class session.", None

    if session.get("status") == "cancelled":
        return False, "Cannot submit attendance for a cancelled class session.", None

    inst_settings = await get_institution_settings_db(db)
    tz = get_institution_timezone(inst_settings.get("timezone"))
    now = datetime.now(tz)
    today_str = now.strftime("%Y-%m-%d")
    current_time_str = now.strftime("%H:%M:%S")

    session_date_str = session.get("date")
    session_start_time = session.get("start_time")  # e.g. "10:00"
    session_end_time = session.get("end_time")      # e.g. "11:00"
    cutoff_time_str = inst_settings.get("attendanceCutoff", "19:00")
    if len(cutoff_time_str) == 5:
        cutoff_time_str = f"{cutoff_time_str}:00"

    # Check if there is an active approved override for this session
    override = await db.attendance_overrides.find_one({
        "session_id": session.get("session_id"),
        "status": "approved",
        "expires_at": {"$gt": now.isoformat()}
    })

    # If admin is taking action, bypass deadline restrictions
    if is_admin:
        return True, "Admin access granted", override

    # Check class start / end time rule:
    # A class cannot accept attendance before it finishes
    if session_date_str == today_str:
        # If class has not ended yet
        if current_time_str < session_end_time:
            return False, f"Attendance submission is only allowed after the scheduled class has ended ({session_end_time}).", None

        # Check 7:00 PM cutoff
        if current_time_str >= cutoff_time_str:
            if override:
                return True, f"Late submission allowed under approved administrative override (Expires: {override.get('expires_at')}).", override
            return False, "Attendance submission is closed for today. The deadline was 7:00 PM. Please contact the administrator.", None
        
        # Valid today session within allowed window
        return True, "Eligible for submission", None

    elif session_date_str < today_str:
        # Past date session
        if override:
            return True, f"Late submission allowed under approved administrative override (Expires: {override.get('expires_at')}).", override
        return False, "Attendance submission is closed for this past date. Please contact the administrator for an override.", None

    else:
        # Future date session
        return False, "Cannot submit attendance for a future scheduled class.", None

