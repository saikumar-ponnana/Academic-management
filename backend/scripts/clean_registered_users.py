import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database

async def clean():
    await connect_to_mongo()
    db = get_database()
    
    # Delete saikumar user so user can register fresh
    res1 = await db.users.delete_many({"email": {"$regex": "saikumar", "$options": "i"}})
    res2 = await db.student_profiles.delete_many({"$or": [
        {"email": {"$regex": "saikumar", "$options": "i"}},
        {"roll_number": {"$regex": "26MGVP", "$options": "i"}}
    ]})
    print(f"Removed Sai Kumar account from DB so user can register fresh: {res1.deleted_count} users, {res2.deleted_count} profiles.")
    
    # Also delete test run users
    res_test = await db.users.delete_many({"email": {"$regex": "(test|siddharth|rao|aarav|prof\\.|student\\.|faculty\\.)", "$options": "i"}})
    await db.student_profiles.delete_many({"email": {"$regex": "(test|siddharth|rao|aarav|prof\\.|student\\.|faculty\\.)", "$options": "i"}})
    await db.faculty_profiles.delete_many({"email": {"$regex": "(test|siddharth|rao|aarav|prof\\.|student\\.|faculty\\.)", "$options": "i"}})
    print(f"Cleaned {res_test.deleted_count} test artifact users.")
    
    # Verify remaining users: only Admin and the 6 official professors!
    remaining = await db.users.find({}).to_list(100)
    print("\nClean Active Users in System:")
    for u in remaining:
        print(f"  [{u.get('role').upper()}] {u.get('email')} — {u.get('full_name')}")
        
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(clean())

