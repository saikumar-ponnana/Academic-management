from fastapi import APIRouter, Depends, HTTPException, status
from app.database.mongodb import get_database
from app.dependencies.auth_deps import get_current_user, require_role
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/departments", tags=["Departments & Branches"])

class DepartmentCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = ""

@router.get("")
async def get_departments():
    db = get_database()
    depts = await db.departments.find({}).sort("code", 1).to_list(100)
    for d in depts:
        d["_id"] = str(d["_id"])
    return depts

@router.post("")
async def create_department(
    req: DepartmentCreate,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    code = req.code.strip().upper()
    existing = await db.departments.find_one({"code": code})
    if existing:
        raise HTTPException(status_code=400, detail=f"Department with code '{code}' already exists.")
    
    dept_id = f"dept-{code.lower()}"
    doc = {
        "_id": dept_id,
        "code": code,
        "name": req.name.strip(),
        "description": req.description or f"Department of {req.name.strip()}",
        "created_at": datetime.utcnow().isoformat()
    }
    await db.departments.update_one({"_id": dept_id}, {"$set": doc}, upsert=True)
    doc["_id"] = str(doc["_id"])
    return doc

@router.delete("/{dept_id}")
async def delete_department(
    dept_id: str,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    res = await db.departments.delete_one({"_id": dept_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Department not found.")
    return {"message": "Department deleted successfully."}

