from fastapi import APIRouter, Depends, HTTPException, status
from app.database.mongodb import get_database
from app.dependencies.auth_deps import get_current_user, require_role
from app.schemas.all_schemas import InstitutionSettingsUpdate
from app.services.attendance_service import get_institution_settings_db
from datetime import datetime

router = APIRouter(prefix="/settings", tags=["Institution Settings"])

@router.get("")
async def get_settings(current_user: dict = Depends(get_current_user)):
    db = get_database()
    return await get_institution_settings_db(db)

@router.patch("")
async def update_settings(
    req: InstitutionSettingsUpdate,
    current_user: dict = Depends(require_role(["admin"]))
):
    db = get_database()
    update_data = {k: v for k, v in req.dict(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    await db.institution_settings.update_one(
        {"_id": "default"},
        {"$set": update_data},
        upsert=True
    )
    return await get_institution_settings_db(db)

