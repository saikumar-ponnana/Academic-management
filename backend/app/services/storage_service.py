import os
import uuid
from fastapi import UploadFile, HTTPException, status
from fastapi.responses import FileResponse
from typing import Dict, Any, Optional
from app.core.config import settings

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

async def save_uploaded_material(file: UploadFile, max_size_mb: int = 10) -> Dict[str, Any]:
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
    
    with open(file_path, "wb") as f:
        f.write(content)
        
    return {
        "stored_name": unique_name,
        "original_name": filename,
        "file_path": file_path,
        "file_type": ext.lstrip("."),
        "mime_type": ALLOWED_EXTENSIONS[ext],
        "file_size": file_size
    }

def serve_material_file(file_path: str, original_name: str, inline: bool = False):
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File could not be found on storage."
        )
    
    _, ext = os.path.splitext(original_name)
    ext = ext.lower()
    media_type = ALLOWED_EXTENSIONS.get(ext, "application/octet-stream")
    disposition = "inline" if inline else "attachment"
    
    return FileResponse(
        path=file_path,
        filename=original_name,
        media_type=media_type,
        headers={"Content-Disposition": f'{disposition}; filename="{original_name}"'}
    )
