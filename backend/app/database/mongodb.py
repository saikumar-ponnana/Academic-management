import logging
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from app.core.config import settings

logger = logging.getLogger(__name__)

class MongoDB:
    client = None
    db = None
    is_mock: bool = False

db_wrapper = MongoDB()

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    try:
        real_client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=8000
        )
        # Verify connection
        await real_client.admin.command('ping')
        db_wrapper.client = real_client
        db_wrapper.db = real_client[settings.DATABASE_NAME]
        db_wrapper.is_mock = False
        logger.info(f"Successfully connected to real MongoDB database: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.warning(f"Could not connect to live MongoDB ({e}). Falling back to in-memory AsyncMongoMockClient.")
        from mongomock_motor import AsyncMongoMockClient
        mock_client = AsyncMongoMockClient()
        db_wrapper.client = mock_client
        db_wrapper.db = mock_client[settings.DATABASE_NAME]
        db_wrapper.is_mock = True
        logger.info("Running on in-memory AsyncMongoMockClient. All operations will persist during server session.")
    
    await ensure_indexes()

async def close_mongo_connection():
    if db_wrapper.client:
        logger.info("Closing MongoDB connection...")
        db_wrapper.client.close()

def get_database():
    return db_wrapper.db

async def ensure_indexes():
    db = db_wrapper.db
    if db is None:
        return
    try:
        # Users
        await db.users.create_index("email", unique=True)
        # Faculty profiles
        await db.faculty_profiles.create_index("user_id", unique=True)
        await db.faculty_profiles.create_index("faculty_id", unique=True)
        # Student profiles
        await db.student_profiles.create_index("user_id", unique=True)
        await db.student_profiles.create_index("roll_number", unique=True)
        # Courses
        await db.courses.create_index("code", unique=True)
        # Enrollments
        await db.enrollments.create_index([("student_user_id", 1), ("course_id", 1)], unique=True)
        # Timetable entries
        await db.timetable_entries.create_index([("faculty_user_id", 1), ("day_of_week", 1), ("start_time", 1)])
        # Attendance sessions compound unique index to prevent duplicates
        await db.attendance_sessions.create_index("session_id", unique=True)
        # Attendance records compound index
        await db.attendance_records.create_index([("attendance_session_id", 1), ("student_user_id", 1)], unique=True)
        # Overrides index
        await db.attendance_overrides.create_index([("session_id", 1), ("faculty_user_id", 1)])
        logger.info("MongoDB indexes verified successfully.")
    except Exception as e:
        logger.warning(f"Index creation notice: {e}")

