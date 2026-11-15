import os
import uuid
import logging
from bson import ObjectId
from fastapi import UploadFile, HTTPException, status, Response
from fastapi.responses import FileResponse
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".ppt": "application/vnd.ms-powerpoint",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".txt": "text/plain",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg"
}

def get_storage_path() -> str:
    materials_dir = os.path.join(settings.UPLOAD_DIR, "materials")
    os.makedirs(materials_dir, exist_ok=True)
    return materials_dir

async def save_uploaded_material(file: UploadFile, max_size_mb: int = 10, db = None) -> Dict[str, Any]:
    filename = file.filename or "unknown"
    _, ext = os.path.splitext(filename)
    ext = ext.lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Supported formats: PDF, Word, PPT, Excel, Text, JPG, PNG."
        )
    
    max_bytes = max_size_mb * 1024 * 1024
    content = await file.read()
    file_size = len(content)
    
    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {max_size_mb} MB."
        )
    
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest_dir = get_storage_path()
    file_path = os.path.join(dest_dir, unique_name)
    
    # 1. Local disk write (cache)
    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        logger.warning(f"Failed to write file locally: {e}")

    # 2. Permanent MongoDB GridFS cloud persistence (survives Render restarts)
    gridfs_id = None
    if db is not None:
        try:
            from motor.motor_asyncio import AsyncIOMotorGridFSBucket
            fs = AsyncIOMotorGridFSBucket(db)
            uploaded_id = await fs.upload_from_stream(
                filename,
                content,
                metadata={
                    "contentType": ALLOWED_EXTENSIONS[ext],
                    "unique_name": unique_name
                }
            )
            gridfs_id = str(uploaded_id)
            logger.info(f"Persisted file {filename} in MongoDB GridFS with id {gridfs_id}")
        except Exception as e:
            logger.error(f"Failed to persist file in GridFS: {e}")
        
    return {
        "stored_name": unique_name,
        "original_name": filename,
        "file_path": file_path,
        "gridfs_id": gridfs_id,
        "file_type": ext.lstrip("."),
        "mime_type": ALLOWED_EXTENSIONS[ext],
        "file_size": file_size
    }

async def serve_material_file(material: Any, original_name: str, inline: bool = False, db = None):
    gridfs_id = None
    file_path = ""
    if isinstance(material, dict):
        gridfs_id = material.get("gridfs_id")
        file_path = material.get("file_path", "")
    elif isinstance(material, str):
        file_path = material
        
    _, ext = os.path.splitext(original_name)
    ext = ext.lower()
    media_type = ALLOWED_EXTENSIONS.get(ext, "application/octet-stream")
    disposition = "inline" if inline else "attachment"

    # 1. Read from MongoDB GridFS if available (permanent cloud storage)
    if db is not None and gridfs_id:
        try:
            from motor.motor_asyncio import AsyncIOMotorGridFSBucket
            fs = AsyncIOMotorGridFSBucket(db)
            grid_out = await fs.open_download_stream(ObjectId(gridfs_id))
            file_bytes = await grid_out.read()
            return Response(
                content=file_bytes,
                media_type=media_type,
                headers={"Content-Disposition": f'{disposition}; filename="{original_name}"'}
            )
        except Exception as e:
            logger.warning(f"Could not read from GridFS ({gridfs_id}): {e}, attempting disk fallback")

    # 2. Fallback to local disk if present
    if file_path and os.path.exists(file_path):
        return FileResponse(
            path=file_path,
            filename=original_name,
            media_type=media_type,
            headers={"Content-Disposition": f'{disposition}; filename="{original_name}"'}
        )

    # 3. Neither source available
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="The requested file content is no longer available on storage. Please contact the instructor or upload again."
    )
