import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database

async def clean_departments():
    await connect_to_mongo()
    db = get_database()
    
    # 1. Delete all other branches: CSE, ECE, IT
    res = await db.departments.delete_many({"code": {"$in": ["CSE", "ECE", "IT"]}})
    print(f"Deleted {res.deleted_count} obsolete departments (CSE, ECE, IT).")
    
    # 2. Ensure ONLY CSE (Cyber Security) exists
    await db.departments.update_one(
        {"_id": "dept-cyber"},
        {"$set": {
            "_id": "dept-cyber",
            "code": "CYBER",
            "name": "CSE (Cyber Security)",
            "description": "Department of Computer Science & Engineering (Cyber Security) — M.Tech Program"
        }},
        upsert=True
    )
    
    remaining = await db.departments.find({}).to_list(100)
    print("Active Departments in MongoDB:")
    for d in remaining:
        print(f"  - [{d.get('code')}] {d.get('name')}")
        
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(clean_departments())

