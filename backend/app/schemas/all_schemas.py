from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class UserRegisterRequest(BaseModel):
    role: str  # "student", "faculty", or "admin"
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = ""
    # Student specific
    roll_number: Optional[str] = None
    department_code: Optional[str] = "CYBER"
    semester: Optional[int] = 1
    section: Optional[str] = "1"
    academic_year: Optional[str] = "2026-27"
    # Faculty specific
    faculty_id: Optional[str] = None
    designation: Optional[str] = "Assistant Professor"
    highest_degree: Optional[str] = "Ph.D. / M.Tech"
    specialization: Optional[str] = "Cyber Security"

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    # Faculty specific
    designation: Optional[str] = None
    highest_degree: Optional[str] = None
    specialization: Optional[str] = None
    qualifications: Optional[str] = None
    additional_qualifications: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[int] = None

class FacultyProfileUpdate(BaseModel):
    # Personal
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # Academic
    qualifications: Optional[str] = None
    highest_degree: Optional[str] = None
    graduation_year: Optional[int] = None
    university: Optional[str] = None
    department: Optional[str] = None
    specialization: Optional[str] = None
    additional_qualifications: Optional[str] = None
    
    # Professional
    designation: Optional[str] = None
    department_code: Optional[str] = None
    date_of_joining: Optional[str] = None
    subjects_taught: Optional[List[str]] = []
    assigned_classes: Optional[List[str]] = []
    academic_year: Optional[str] = None
    semester: Optional[int] = None
    section: Optional[str] = None

class FacultyProfileApproval(BaseModel):
    approved: bool
    comments: Optional[str] = None

class StudentCreateRequest(BaseModel):
    email: EmailStr
    password: str = "Student@123"
    full_name: str
    roll_number: str
    phone: Optional[str] = ""
    department_code: str
    academic_year: str = "2026-2027"
    semester: int
    section: str

class FacultyCreateRequest(BaseModel):
    email: EmailStr
    password: str = "Faculty@123"
    full_name: str
    faculty_id: str
    phone: Optional[str] = ""
    designation: str = "Assistant Professor"
    department_code: str
    highest_degree: Optional[str] = "Ph.D."
    specialization: Optional[str] = "Computer Science"

class CourseCreateRequest(BaseModel):
    code: str
    name: str
    department_code: str
    semester: int
    credits: int = 3
    description: Optional[str] = ""
    faculty_user_id: Optional[str] = None
    auto_enroll_students: bool = True

class CourseAssignmentRequest(BaseModel):
    course_id: str
    faculty_user_id: str
    department_code: str
    semester: int
    section: str
    academic_year: str = "2026-2027"

class TimetableCreateRequest(BaseModel):
    academic_year: str = "2026-2027"
    semester: int
    department_code: str
    section: str
    course_id: str
    faculty_user_id: str
    day_of_week: str  # "Monday", "Tuesday", etc.
    start_time: str   # "10:00"
    end_time: str     # "11:00"
    location: str     # "Room 302"
    effective_start_date: str = "2026-06-01"
    effective_end_date: str = "2026-12-31"

class AttendanceStudentStatus(BaseModel):
    student_user_id: str
    roll_number: str
    student_name: str
    status: str  # "present" or "absent"

class AttendanceSessionSubmitRequest(BaseModel):
    records: List[AttendanceStudentStatus]
    remarks: Optional[str] = None

class AttendanceOverrideCreateRequest(BaseModel):
    session_id: str
    faculty_user_id: str
    reason: str
    expiration_hours: int = 4  # Hours until override expires

class InstitutionSettingsUpdate(BaseModel):
    institutionName: Optional[str] = None
    timezone: Optional[str] = None
    attendanceCutoff: Optional[str] = None
    minimumAttendancePercentage: Optional[float] = None
    maxUploadSizeMB: Optional[int] = None

