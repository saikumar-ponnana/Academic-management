# MongoDB Database Setup & Table (Collection) Guide
**Gayatri Vidya Parishad Institute of Higher Learning & Research — ELC Center**

This guide provides step-by-step instructions for establishing the MongoDB database, creating collections (tables), configuring indexes, and working with production-ready user data.

---

## 1. Automated Setup (Recommended)

You can automatically generate all collections and indexes using the provided Python scripts:

```powershell
# In the backend directory:
cd backend

# Option A: Initialize all collections & indexes with 0 dummy records
python scripts/init_mongo.py

# Option B: Reset to clean production baseline (wiping any previous test data)
python scripts/reset_to_clean.py
```

---

## 2. Manual Setup via MongoDB Shell (`mongosh`)

Open your terminal or `mongosh` connection:

```javascript
// Connect and switch to the database
use elc_center_db;

// 1. Users Collection
db.createCollection("users");
db.users.createIndex({ "email": 1 }, { unique: true });

// 2. Faculty Profiles
db.createCollection("faculty_profiles");
db.faculty_profiles.createIndex({ "user_id": 1 }, { unique: true });
db.faculty_profiles.createIndex({ "faculty_id": 1 }, { unique: true });

// 3. Student Profiles
db.createCollection("student_profiles");
db.student_profiles.createIndex({ "user_id": 1 }, { unique: true });
db.student_profiles.createIndex({ "roll_number": 1 }, { unique: true });

// 4. Academic Departments
db.createCollection("departments");
db.departments.createIndex({ "code": 1 }, { unique: true });

// 5. Courses (Subjects)
db.createCollection("courses");
db.courses.createIndex({ "code": 1 }, { unique: true });

// 6. Course Assignments (Faculty Teaching Allocations)
db.createCollection("course_assignments");
db.course_assignments.createIndex({ "course_id": 1, "faculty_user_id": 1, "section": 1 });

// 7. Student Enrollments
db.createCollection("enrollments");
db.enrollments.createIndex({ "student_user_id": 1, "course_id": 1 }, { unique: true });

// 8. Timetable Entries
db.createCollection("timetable_entries");
db.timetable_entries.createIndex({ "faculty_user_id": 1, "day_of_week": 1, "start_time": 1 });
db.timetable_entries.createIndex({ "department_code": 1, "semester": 1, "section": 1, "day_of_week": 1 });

// 9. Attendance Sessions (Idempotent by session_id)
db.createCollection("attendance_sessions");
db.attendance_sessions.createIndex({ "session_id": 1 }, { unique: true });
db.attendance_sessions.createIndex({ "course_id": 1, "date": 1 });

// 10. Individual Student Attendance Records
db.createCollection("attendance_records");
db.attendance_records.createIndex({ "attendance_session_id": 1, "student_user_id": 1 }, { unique: true });
db.attendance_records.createIndex({ "session_id": 1, "student_user_id": 1 });

// 11. Administrative Attendance Overrides
db.createCollection("attendance_overrides");
db.attendance_overrides.createIndex({ "session_id": 1, "faculty_user_id": 1 });

// 12. Attendance Audit Logs
db.createCollection("attendance_audit_logs");
db.attendance_audit_logs.createIndex({ "session_id": 1, "timestamp": 1 });

// 13. Study Materials Repository
db.createCollection("study_materials");
db.study_materials.createIndex({ "course_id": 1 });
db.study_materials.createIndex({ "faculty_user_id": 1 });

// 14. Campus Announcements
db.createCollection("announcements");

// 15. Institution Configuration Settings
db.createCollection("institution_settings");
```

---

## 3. Creating Collections in MongoDB Compass GUI

1. Open **MongoDB Compass**.
2. Connect to your database: `mongodb://localhost:27017` (or your MongoDB Atlas connection string).
3. Click **Create Database**:
   - **Database Name**: `elc_center_db`
   - **Collection Name**: `users`
4. In `elc_center_db`, click **Create Collection** to add the remaining collections:
   - `student_profiles`
   - `faculty_profiles`
   - `departments`
   - `courses`
   - `course_assignments`
   - `enrollments`
   - `timetable_entries`
   - `attendance_sessions`
   - `attendance_records`
   - `attendance_overrides`
   - `attendance_audit_logs`
   - `study_materials`
   - `announcements`
   - `institution_settings`
5. Click into each collection's **Indexes** tab and create the unique indexes listed in Section 2.

---

## 4. Production Architectural Behaviors

### 👤 1. First-Time User Registration
- First-time users can register directly via the portal: [http://localhost:5173/register](http://localhost:5173/register).
- Students select **Register as Student**:
  - Provides Name, Email, Password, Roll Number, Department, Semester, Section.
  - Generates `users` document and `student_profiles` document.
  - Automatically enrolls student into active courses matching their department & semester.
- Faculty select **Register as Faculty**:
  - Provides Name, Email, Password, Faculty ID, Department, Designation, Degree.
  - Generates `users` and `faculty_profiles` document.
  - Automatically logs the user in upon completion.

### ⚡ 2. Automatic Faculty Profile Updates (No Approval Barrier)
- As requested, **faculty profile updates require NO administrator approval**.
- Once a faculty member enters or modifies their educational qualifications, highest degree, graduation year, specialization, or personal phone number, changes are saved to MongoDB and set to `approved` / active immediately.

