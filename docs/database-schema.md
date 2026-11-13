# MongoDB Database Schema Specification

The application utilizes 18 normalized collections in MongoDB:

1. `users`: Credentials, role (`admin`, `faculty`, `student`), `password_hash`, `is_active`.
2. `faculty_profiles`: Personal, academic, and professional fields, `profile_status`, `completion_percentage`.
3. `student_profiles`: Roll number, department, semester, section, academic year.
4. `departments`: Code (`CSE`, `ECE`, `IT`), department name, description.
5. `courses`: Course code (`CS201`), course name, credits, department code, semester.
6. `course_assignments`: Faculty-to-course and section allocations approved by admin.
7. `enrollments`: Student course enrollments.
8. `timetable_entries`: Weekly schedules (Day, Start Time, End Time, Room Location, Faculty, Section).
9. `attendance_sessions`: Generated or submitted session records with compound unique index on `session_id`.
10. `attendance_records`: Individual student attendance records (`present` / `absent`).
11. `attendance_overrides`: Admin-approved late attendance exceptions with expiration timestamps.
12. `attendance_audit_logs`: Timestamped logs of submissions, drafts, and overrides.
13. `study_materials`: Metadata of uploaded files, category, and visibility (`COURSE_RESTRICTED` vs `ELC_CENTER_WIDE`).
14. `announcements`: Broadcast messages targeting all, faculty, or students.
15. `institution_settings`: Timezone (`Asia/Kolkata`), cutoff (`19:00`), min percentage (75%).

