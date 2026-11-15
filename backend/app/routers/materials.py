from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from app.database.mongodb import get_database
from app.dependencies.auth_deps import get_current_user, require_role
from app.services.storage_service import save_uploaded_material, serve_material_file
from app.services.attendance_service import get_institution_settings_db
from datetime import datetime
from typing import Optional
import uuid
import os

router = APIRouter(prefix="/materials", tags=["Study Materials"])

@router.post("/upload")
async def upload_study_material(
    title: str = Form(...),
    description: Optional[str] = Form(""),
    course_id: str = Form(...),
    category: str = Form("Lecture Notes"),
    visibility: str = Form("COURSE_RESTRICTED"),  # "COURSE_RESTRICTED" or "ELC_CENTER_WIDE"
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role(["faculty", "admin"]))
):
    db = get_database()
    inst_settings = await get_institution_settings_db(db)
    max_mb = inst_settings.get("maxUploadSizeMB", 10)
    
    # Verify course
    course = await db.courses.find_one({"_id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Selected course not found.")
        
    # If faculty, verify they teach or are permitted to upload for this course
    if current_user["role"] == "faculty":
        assignment = await db.course_assignments.find_one({
            "course_id": course_id,
            "faculty_user_id": current_user["_id"]
        })
        if not assignment and visibility != "ELC_CENTER_WIDE":
            raise HTTPException(
                status_code=403,
                detail="You can only upload course-restricted materials for courses assigned to you."
            )
            
    # Save file securely (both local disk cache and permanent MongoDB GridFS)
    file_info = await save_uploaded_material(file, max_size_mb=max_mb, db=db)
    
    material_id = f"MAT-{uuid.uuid4().hex[:10].upper()}"
    faculty_profile = await db.faculty_profiles.find_one({"user_id": current_user["_id"]})
    faculty_name = faculty_profile.get("full_name") if faculty_profile else current_user.get("full_name")
    
    material_doc = {
        "_id": material_id,
        "title": title,
        "description": description or "",
        "faculty_user_id": current_user["_id"],
        "faculty_name": faculty_name,
        "course_id": course_id,
        "course_code": course.get("code"),
        "course_name": course.get("name"),
        "department_code": course.get("department_code"),
        "semester": course.get("semester"),
        "category": category,
        "visibility": visibility,
        "original_filename": file_info["original_name"],
        "stored_filename": file_info["stored_name"],
        "file_path": file_info["file_path"],
        "file_base64": file_info.get("file_base64"),
        "gridfs_id": file_info.get("gridfs_id"),
        "file_type": file_info["file_type"],
        "mime_type": file_info["mime_type"],
        "file_size": file_info["file_size"],
        "uploaded_at": datetime.utcnow().isoformat()
    }
    
    await db.study_materials.insert_one(material_doc)
    material_doc["_id"] = str(material_doc["_id"])
    return {
        "message": "Study material uploaded successfully.",
        "material": material_doc
    }

@router.get("")
async def list_study_materials(
    course_id: Optional[str] = None,
    faculty_user_id: Optional[str] = None,
    category: Optional[str] = None,
    department_code: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    role = current_user.get("role")
    
    query = {}
    
    # Role-based visibility enforcement
    if role == "student":
        # Get courses the student is enrolled in
        enrollments = await db.enrollments.find({"student_user_id": current_user["_id"], "status": "enrolled"}).to_list(100)
        enrolled_cids = [e["course_id"] for e in enrollments]
        
        # Student sees materials that are either ELC_CENTER_WIDE OR in courses they are enrolled in
        query["$or"] = [
            {"visibility": "ELC_CENTER_WIDE"},
            {"course_id": {"$in": enrolled_cids}}
        ]
    elif role == "faculty":
        # Faculty can see everything or their own uploads easily
        pass
    # Admin sees all
    
    # Specific filters
    if course_id:
        query["course_id"] = course_id
    if faculty_user_id:
        query["faculty_user_id"] = faculty_user_id
    if category:
        query["category"] = category
    if department_code:
        query["department_code"] = department_code
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"faculty_name": {"$regex": search, "$options": "i"}}
        ]
        
    materials = await db.study_materials.find(query, {"file_base64": 0}).sort("uploaded_at", -1).to_list(500)
    for m in materials:
        m["_id"] = str(m["_id"])
    return materials

async def verify_material_access(material: dict, user: dict, db):
    if user.get("role") in ["admin", "faculty"]:
        return True
    # If ELC_CENTER_WIDE, any authenticated student has access
    if material.get("visibility") == "ELC_CENTER_WIDE":
        return True
    # If COURSE_RESTRICTED, student must be enrolled
    enrolled = await db.enrollments.find_one({
        "student_user_id": user["_id"],
        "course_id": material["course_id"],
        "status": "enrolled"
    })
    if not enrolled:
        raise HTTPException(
            status_code=403,
            detail="Access denied: This study material is restricted to students enrolled in this specific course."
        )
    return True

@router.get("/{id}")
async def get_study_material_detail(id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    mat = await db.study_materials.find_one({"_id": id})
    if not mat:
        raise HTTPException(status_code=404, detail="Study material not found.")
        
    await verify_material_access(mat, current_user, db)
    mat["_id"] = str(mat["_id"])
    mat.pop("file_base64", None)
    return mat

@router.get("/{id}/download")
async def download_study_material(id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    mat = await db.study_materials.find_one({"_id": id})
    if not mat:
        raise HTTPException(status_code=404, detail="Study material not found.")
        
    await verify_material_access(mat, current_user, db)
    return await serve_material_file(mat, mat["original_filename"], inline=False, db=db)

@router.get("/{id}/preview")
async def preview_study_material(id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    mat = await db.study_materials.find_one({"_id": id})
    if not mat:
        raise HTTPException(status_code=404, detail="Study material not found.")
        
    await verify_material_access(mat, current_user, db)
    return await serve_material_file(mat, mat["original_filename"], inline=True, db=db)

@router.delete("/{id}")
async def delete_study_material(id: str, current_user: dict = Depends(require_role(["faculty", "admin"]))):
    db = get_database()
    mat = await db.study_materials.find_one({"_id": id})
    if not mat:
        raise HTTPException(status_code=404, detail="Study material not found.")
        
    # Faculty can delete their own materials or materials belonging to courses assigned to them
    if current_user["role"] == "faculty":
        is_uploader = str(mat.get("faculty_user_id")) == str(current_user["_id"])
        is_assigned = await db.course_assignments.find_one({
            "course_id": mat.get("course_id"),
            "faculty_user_id": current_user["_id"]
        })
        if not is_uploader and not is_assigned:
            raise HTTPException(status_code=403, detail="You can only delete study materials for courses assigned to you or uploaded by you.")
        
    # Delete from disk
    if os.path.exists(mat.get("file_path", "")):
        try:
            os.remove(mat["file_path"])
        except Exception:
            pass

    # Delete from MongoDB GridFS
    if mat.get("gridfs_id"):
        try:
            from bson import ObjectId
            from motor.motor_asyncio import AsyncIOMotorGridFSBucket
            fs = AsyncIOMotorGridFSBucket(db)
            await fs.delete(ObjectId(mat["gridfs_id"]))
        except Exception:
            pass
            
    await db.study_materials.delete_one({"_id": id})
    return {"message": "Study material deleted successfully."}

