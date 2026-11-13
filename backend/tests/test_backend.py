import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from datetime import datetime, timedelta
import pytz

from app.main import app
from app.database.mongodb import connect_to_mongo, get_database
from app.database.seed_data import seed_database
from app.services.attendance_service import check_attendance_eligibility

@pytest_asyncio.fixture(autouse=True)
async def init_db():
    await connect_to_mongo()
    await seed_database()

@pytest.mark.asyncio
async def test_first_time_user_registration():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        import uuid
        uid = uuid.uuid4().hex[:6]
        # 1. Register a new real student
        student_payload = {
            "role": "student",
            "email": f"student.{uid}@elc.edu",
            "password": "Password@123",
            "full_name": "Siddharth Verma",
            "roll_number": f"26GVP{uid.upper()}",
            "department_code": "CYBER",
            "semester": 3,
            "section": "A"
        }
        res = await client.post("/api/auth/register", json=student_payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["user"]["role"] == "student"
        assert data["user"]["roll_number"] == f"26GVP{uid.upper()}"

        # 2. Register a new real faculty (immediate active status, no approval needed)
        faculty_payload = {
            "role": "faculty",
            "email": f"faculty.{uid}@elc.edu",
            "password": "Password@123",
            "full_name": "Dr. V. Rao",
            "faculty_id": f"FAC-{uid.upper()}",
            "department_code": "CYBER",
            "designation": "Professor"
        }
        res = await client.post("/api/auth/register", json=faculty_payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["user"]["role"] == "faculty"
        assert data["user"]["profile_status"] == "approved"

        # 3. Update faculty profile: should be active immediately with NO admin approval
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        update_res = await client.patch("/api/faculty/profile", json={"highest_degree": "Ph.D. in AI"}, headers=headers)
        assert update_res.status_code == 200
        assert update_res.json()["profile_status"] == "approved"
        assert update_res.json()["highest_degree"] == "Ph.D. in AI"

@pytest.mark.asyncio
async def test_admin_faculty_student_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Admin login
        res = await client.post("/api/auth/login", json={"email": "admin@elc.edu", "password": "Admin@123"})
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["user"]["role"] == "admin"
        assert "access_token" in data

        import uuid
        uid = uuid.uuid4().hex[:6]
        # Register faculty & student to test clean login
        await client.post("/api/auth/register", json={
            "role": "faculty", "email": f"faculty.{uid}@elc.edu", "password": "Faculty@123",
            "full_name": "Test Faculty", "faculty_id": f"FAC-{uid.upper()}", "department_code": "CYBER"
        })
        await client.post("/api/auth/register", json={
            "role": "student", "email": f"student.{uid}@elc.edu", "password": "Student@123",
            "full_name": "Test Student", "roll_number": f"26{uid.upper()}", "department_code": "CYBER", "semester": 1, "section": "A"
        })

        # 2. Faculty login
        res = await client.post("/api/auth/login", json={"email": f"faculty.{uid}@elc.edu", "password": "Faculty@123"})
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["user"]["role"] == "faculty"
        assert data["user"]["faculty_id"] == f"FAC-{uid.upper()}"

        # 3. Student login (by email)
        res = await client.post("/api/auth/login", json={"email": f"student.{uid}@elc.edu", "password": "Student@123"})
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["user"]["role"] == "student"

        # 4. Student login by roll number
        res = await client.post("/api/auth/login", json={"email": f"26{uid.upper()}", "password": "Student@123"})
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["user"]["role"] == "student"

        # 5. Invalid password
        res = await client.post("/api/auth/login", json={"email": "admin@elc.edu", "password": "WrongPassword"})
        assert res.status_code == 401

@pytest.mark.asyncio
async def test_faculty_profile_and_courses():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        import uuid
        uid = uuid.uuid4().hex[:6]
        # Register and login faculty
        reg = await client.post("/api/auth/register", json={
            "role": "faculty", "email": f"prof.{uid}@elc.edu", "password": "Faculty@123",
            "full_name": "Prof. Sharma", "faculty_id": f"FAC-{uid.upper()}", "department_code": "CYBER"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Get profile
        res = await client.get("/api/faculty/profile", headers=headers)
        assert res.status_code == 200
        assert res.json()["faculty_id"] == f"FAC-{uid.upper()}"

        # Get assigned courses
        res = await client.get("/api/faculty/courses", headers=headers)
        assert res.status_code == 200

@pytest.mark.asyncio
async def test_attendance_7pm_cutoff_and_override():
    db = get_database()
    tz = pytz.timezone("Asia/Kolkata")
    now = datetime.now(tz)
    today_str = now.strftime("%Y-%m-%d")

    # Session on today's date with period 10:00 to 11:00
    mock_session = {
        "session_id": f"TEST-TT-001_{today_str}",
        "faculty_user_id": "fac-001",
        "date": today_str,
        "start_time": "10:00",
        "end_time": "11:00",
        "status": "active"
    }

    # 1. Other faculty cannot submit for this session
    eligible, msg, _ = await check_attendance_eligibility(db, mock_session, faculty_user_id="fac-002", is_admin=False)
    assert eligible is False
    assert "not assigned" in msg.lower()

    # 2. Cancelled class cannot accept attendance
    mock_session_cancelled = {**mock_session, "status": "cancelled"}
    eligible, msg, _ = await check_attendance_eligibility(db, mock_session_cancelled, faculty_user_id="fac-001")
    assert eligible is False
    assert "cancelled" in msg.lower()

    # 3. Simulate post-7:00 PM on a past session without override
    past_session = {
        "session_id": "TEST-PAST-001_2026-10-10",
        "faculty_user_id": "fac-001",
        "date": "2026-10-10",
        "start_time": "10:00",
        "end_time": "11:00",
        "status": "active"
    }
    eligible, msg, _ = await check_attendance_eligibility(db, past_session, faculty_user_id="fac-001", is_admin=False)
    assert eligible is False
    assert "closed" in msg.lower()

    # 4. Grant Admin Override for past session
    expires_at = (now + timedelta(hours=2)).isoformat()
    await db.attendance_overrides.insert_one({
        "_id": "TEST-OVR-01",
        "session_id": "TEST-PAST-001_2026-10-10",
        "faculty_user_id": "fac-001",
        "status": "approved",
        "expires_at": expires_at
    })

    # Now verify that with active approved override, faculty CAN submit!
    eligible, msg, override = await check_attendance_eligibility(db, past_session, faculty_user_id="fac-001", is_admin=False)
    assert eligible is True
    assert override is not None
    assert "override" in msg.lower()

    # 5. Clean up test override
    await db.attendance_overrides.delete_one({"_id": "TEST-OVR-01"})

@pytest.mark.asyncio
async def test_student_material_permissions():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        import uuid
        uid = uuid.uuid4().hex[:6]
        # Register and login student
        reg = await client.post("/api/auth/register", json={
            "role": "student", "email": f"student.{uid}@elc.edu", "password": "Student@123",
            "full_name": "Aarav Sharma", "roll_number": f"26{uid.upper()}", "department_code": "CYBER", "semester": 3, "section": "A"
        })
        token = reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # List materials: should return 200 list
        res = await client.get("/api/materials", headers=headers)
        assert res.status_code == 200
        materials = res.json()
        assert isinstance(materials, list)

@pytest.mark.asyncio
async def test_attendance_reports_and_csv():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/auth/login", json={"email": "admin@elc.edu", "password": "Admin@123"})
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # JSON report
        res = await client.get("/api/attendance/reports?department_code=CYBER&section=A", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "records" in data

        # CSV report
        res = await client.get("/api/attendance/reports?department_code=CYBER&section=A&format=csv", headers=headers)
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]
        assert "Roll Number" in res.text
