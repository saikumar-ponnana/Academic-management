# Gayatri Vidya Parishad Institute of Higher Learning and Research
## ELC Center — Student, Faculty & Academic Management System

An enterprise full-stack academic web application designed for the **ELC Center at Gayatri Vidya Parishad Institute of Higher Learning & Research**.

Built strictly with **React.js (Vite + Tailwind CSS)** on the frontend, **Python FastAPI** on the backend, and **MongoDB** for persistent data management.

---

## 🏛️ Official Institutional Header
The system persistently displays the official institutional banner across all pages:
- **Gayatri Vidya Parishad Institute of Higher Learning and Research**
- Kommadi, Madhurawada, Visakhapatnam – 530 048, Andhra Pradesh
- GVP – Estd. 1988 | GVPIHLR – Estd. 2026

---

## 🚀 Key Features

### 1. Dedicated Role-Based Portals & User Registration
- **First-Time User Registration** (`/register`): Real-time registration for Students (Roll number, Department, Semester, Section) and Faculty (Faculty ID, Department, Designation, Highest degree).
- **Administrator Dashboard**: Central operations managing student rosters, faculty, course allocations, class timetables, and 7:00 PM cutoff compliance.
- **Faculty Dashboard**: Complete profile management (automatic instant updates with NO approval delay), assigned courses, weekly timetable, study materials repository, and **Attendance / RNS**.
- **Student Dashboard**: Enrolled courses, timetable, attendance percentage tracking, shortage warnings (<75%), and study materials browser with in-browser PDF preview and authenticated downloads.

### 2. Timetable-Driven Attendance / RNS Module (Critical Feature)
- **Authoritative Server Clock**: Enforced in Python using timezone-aware objects (`Asia/Kolkata`).
- **Concluded Class Validation**: A class must have finished (`current_time >= session.end_time`) before attendance can be submitted.
- **Strict 7:00 PM (19:00:00 IST) Cutoff**: Class attendance sessions lock automatically at 7:00 PM on the scheduled class date. Any unauthorized submission attempt receives HTTP 403:
  > *"Attendance submission is closed for today. The deadline was 7:00 PM. Please contact the administrator."*
- **Administrative Override Workflow**: Administrators can approve temporary exceptions for missed submissions with audit tracking.

### 3. Study Materials Management
- Private filesystem storage with MIME-type and size validation (max 10MB).
- Visibility controls: `ELC_CENTER_WIDE` vs `COURSE_RESTRICTED`.
- In-browser PDF and image previewer + secure streaming download endpoint.

---

## 🔑 Demo Credentials (Loaded Automatically)

| Role | Email / ID | Password | Notes |
|---|---|---|---|
| **Administrator** | `admin@elc.edu` | `Admin@123` | Full administrative control & override authority |
| **Faculty (CSE)** | `kumar@elc.edu` | `Faculty@123` | Dr. S. Kumar (FAC-CSE-001) |
| **Faculty (ECE)** | `sharma@elc.edu` | `Faculty@123` | Dr. R. Sharma (FAC-ECE-002) |
| **Faculty (IT)** | `anitha@elc.edu` | `Faculty@123` | Prof. P. Anitha (FAC-IT-003) |
| **Student (CSE)** | `student1@elc.edu` or `26GVPCSE001` | `Student@123` | Aarav Sharma (Sem 3, Sec A) |
| **Student (CSE)** | `student2@elc.edu` or `26GVPCSE002` | `Student@123` | Diya Patel (Sem 3, Sec A) |

*(Quick-fill demo buttons are also provided directly on the Login page!)*

---

## 🗄️ MongoDB Database & Tables (Collections) Setup

Detailed step-by-step instructions for creating collections and indexes manually in MongoDB Compass, via `mongosh`, or with automated Python scripts are available in [docs/mongodb-guide.md](file:///e:/MTech/attendence%20management/docs/mongodb-guide.md).

Quick commands:
```powershell
cd backend
python scripts/init_mongo.py       # Creates all 18 collections and indexes
python scripts/reset_to_clean.py    # Resets database to clean production baseline
```

---

## 💻 Quick Start & Execution

### 1. Launch All (Windows)
Double click `start-all.bat` or run:
```powershell
.\start-all.bat
```

### 2. Or Start Separately:
**Backend**:
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Swagger API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

**Frontend**:
```powershell
cd frontend
npm run dev
```
Open Frontend in Browser: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Automated Testing

Run the automated backend pytest suite:
```powershell
cd backend
pytest -v
```
All 5 comprehensive test suites verify:
- Authentication & credential checks (Admin, Faculty, Student)
- Course access & faculty profile approvals
- Authoritative 7:00 PM attendance deadline & administrative override validation
- Study material permission enforcement
- Attendance percentage reporting & CSV exports

