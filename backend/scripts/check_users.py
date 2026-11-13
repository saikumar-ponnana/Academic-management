import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database

async def check():
    await connect_to_mongo()
    db = get_database()
    users = await db.users.find({}).to_list(100)
    print("Users:")
    for u in users:
        print(f"  {u.get('email')} ({u.get('role')}) - {u.get('full_name')}")
    students = await db.student_profiles.find({}).to_list(100)
    print("\nStudents:")
    for s in students:
        print(f"  {s.get('roll_number')} - {s.get('email')}")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(check())

