from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from app.core.security import verify_password, get_password_hash, create_access_token
from app.database.mongodb import get_database
from app.dependencies.auth_deps import get_current_user
from app.schemas.all_schemas import LoginRequest, LoginResponse, ChangePasswordRequest, ForgotPasswordRequest, UserRegisterRequest, ProfileUpdateRequest
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=LoginResponse)
async def register(req: UserRegisterRequest, response: Response):
    db = get_database()
    email_clean = req.email.strip().lower()
    
    # Check if email exists
    existing = await db.users.find_one({"email": email_clean})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )

    if len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters."
        )

    role = req.role.lower().strip()
    if role not in ["student", "faculty", "admin"]:
        role = "student"

    user_id = f"user-{role[:3]}-{uuid.uuid4().hex[:8]}"
    pwd_hash = get_password_hash(req.password)
    now_iso = datetime.utcnow().isoformat()

    user_doc = {
        "_id": user_id,
        "email": email_clean,
        "password_hash": pwd_hash,
        "role": role,
        "full_name": req.full_name.strip(),
        "is_active": True,
        "created_at": now_iso
    }
    await db.users.insert_one(user_doc)

    user_data = {
        "id": user_id,
        "email": email_clean,
        "role": role,
        "full_name": req.full_name.strip(),
        "avatar_url": ""
    }

    if role == "student":
        roll = (req.roll_number or f"26GVP{req.department_code or 'GEN'}{uuid.uuid4().hex[:4]}").strip().upper()
        # Verify unique roll number
        existing_roll = await db.student_profiles.find_one({"roll_number": roll})
        if existing_roll:
            await db.users.delete_one({"_id": user_id})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Roll number {roll} is already registered."
            )

        student_doc = {
            "_id": f"prof-{user_id}",
            "user_id": user_id,
            "student_id": f"STU-{uuid.uuid4().hex[:6].upper()}",
            "roll_number": roll,
            "full_name": req.full_name.strip(),
            "email": email_clean,
            "phone": req.phone or "",
            "department_code": req.department_code or "CYBER",
            "academic_year": req.academic_year or "2026-27",
            "semester": req.semester if req.semester is not None else 1,
            "section": (req.section or "1").strip().upper(),
            "created_at": now_iso
        }
        await db.student_profiles.insert_one(student_doc)

        # Auto-enroll in existing matching courses
        matching_courses = await db.courses.find({
            "department_code": student_doc["department_code"],
            "semester": student_doc["semester"]
        }).to_list(50)

        for c in matching_courses:
            await db.enrollments.insert_one({
                "_id": f"ENR-{uuid.uuid4().hex[:8].upper()}",
                "student_user_id": user_id,
                "student_name": student_doc["full_name"],
                "roll_number": roll,
                "course_id": c["_id"],
                "course_code": c.get("code"),
                "department_code": student_doc["department_code"],
                "semester": student_doc["semester"],
                "section": student_doc["section"],
                "academic_year": student_doc["academic_year"],
                "status": "enrolled",
                "enrolled_at": now_iso
            })

        user_data["roll_number"] = roll
        user_data["department_code"] = student_doc["department_code"]
        user_data["semester"] = student_doc["semester"]
        user_data["section"] = student_doc["section"]

    elif role == "faculty":
        fid = (req.faculty_id or f"FAC-{req.department_code or 'CYBER'}-{uuid.uuid4().hex[:4]}").strip().upper()
        existing_fid = await db.faculty_profiles.find_one({"faculty_id": fid})
        if existing_fid:
            await db.users.delete_one({"_id": user_id})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Faculty ID {fid} is already registered."
            )

        # Faculty Registration: Requires Administrator Approval
        faculty_doc = {
            "_id": f"prof-{user_id}",
            "user_id": user_id,
            "faculty_id": fid,
            "full_name": req.full_name.strip(),
            "email": email_clean,
            "phone": req.phone or "",
            "department": req.department_code or "CYBER",
            "department_code": req.department_code or "CYBER",
            "designation": req.designation or "Assistant Professor",
            "highest_degree": req.highest_degree or "Ph.D. / M.Tech",
            "specialization": req.specialization or "Cyber Security",
            "qualifications": req.highest_degree or "M.Tech",
            "profile_status": "pending",  # Pending Admin Approval
            "completion_percentage": 85,
            "created_at": now_iso
        }
        await db.faculty_profiles.insert_one(faculty_doc)
        # Deactivate user login until approved by Admin
        await db.users.update_one({"_id": user_id}, {"$set": {"is_active": False}})

        user_data["faculty_id"] = fid
        user_data["department"] = faculty_doc["department"]
        user_data["department_code"] = faculty_doc["department_code"]
        user_data["profile_status"] = "pending"
        user_data["is_active"] = False

        return LoginResponse(
            access_token="",
            token_type="bearer",
            user=user_data
        )

    # Issue JWT token (for students who get instant auto-enrollment)
    token = create_access_token(subject=user_id, role=role)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=86400,
        samesite="lax",
        secure=False
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user_data
    )

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, response: Response):
    db = get_database()
    identifier = credentials.email.strip().lower()
    
    # Check by email OR faculty_id / roll_number in profiles
    user = await db.users.find_one({"email": identifier})
    if not user:
        # Check faculty ID
        fac = await db.faculty_profiles.find_one({"faculty_id": {"$regex": f"^{identifier}$", "$options": "i"}})
        if fac:
            user = await db.users.find_one({"_id": fac["user_id"]})
        else:
            # Check student roll number
            stu = await db.student_profiles.find_one({"roll_number": {"$regex": f"^{identifier}$", "$options": "i"}})
            if stu:
                user = await db.users.find_one({"_id": stu["user_id"]})
                
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your email/ID and password."
        )
        
    if user.get("role") == "faculty":
        fac = await db.faculty_profiles.find_one({"user_id": user["_id"]})
        if fac and fac.get("profile_status") == "pending":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your faculty registration is currently pending Administrator approval. Once approved, you will be able to log in."
            )
        if fac and fac.get("profile_status") == "rejected":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your faculty registration has been declined by the administrator."
            )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is pending approval or deactivated. Please contact the administrator."
        )
        
    # Generate token
    token = create_access_token(subject=user["_id"], role=user["role"])
    
    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=86400,
        samesite="lax",
        secure=False  # Allow local HTTP development
    )
    
    # Attach profile info
    user_data = {
        "id": user["_id"],
        "email": user["email"],
        "role": user["role"],
        "full_name": user.get("full_name", ""),
        "avatar_url": user.get("avatar_url", "")
    }
    
    if user["role"] == "faculty":
        fac_p = await db.faculty_profiles.find_one({"user_id": user["_id"]})
        if fac_p:
            user_data["faculty_id"] = fac_p.get("faculty_id")
            user_data["department"] = fac_p.get("department")
            user_data["department_code"] = fac_p.get("department_code")
            user_data["profile_status"] = fac_p.get("profile_status", "draft")
    elif user["role"] == "student":
        stu_p = await db.student_profiles.find_one({"user_id": user["_id"]})
        if stu_p:
            user_data["roll_number"] = stu_p.get("roll_number")
            user_data["department_code"] = stu_p.get("department_code")
            user_data["semester"] = stu_p.get("semester")
            user_data["section"] = stu_p.get("section")
            
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user_data
    )

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Successfully logged out."}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_data = {
        "id": current_user["_id"],
        "email": current_user["email"],
        "role": current_user["role"],
        "full_name": current_user.get("full_name", ""),
        "avatar_url": current_user.get("avatar_url", "")
    }
    if current_user["role"] == "faculty":
        fac = await db.faculty_profiles.find_one({"user_id": current_user["_id"]})
        if fac:
            fac["_id"] = str(fac["_id"])
            user_data["profile"] = fac
    elif current_user["role"] == "student":
        stu = await db.student_profiles.find_one({"user_id": current_user["_id"]})
        if stu:
            stu["_id"] = str(stu["_id"])
            user_data["profile"] = stu
    return user_data

@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    if not verify_password(req.current_password, current_user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed."
        )
    if len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )
    new_hash = get_password_hash(req.new_password)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password_hash": new_hash}}
    )
    return {"message": "Password changed successfully. You can now use your new password."}

@router.patch("/profile")
async def update_profile(
    req: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    user_id = current_user["_id"]
    role = current_user.get("role")
    
    update_user = {}
    update_profile_doc = {}
    
    # 1. Email change handling: overwrite and verify uniqueness across system
    if req.email:
        new_email = req.email.strip().lower()
        if new_email != current_user.get("email"):
            conflict = await db.users.find_one({"email": new_email, "_id": {"$ne": user_id}})
            if conflict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Email address '{new_email}' is already registered to another account."
                )
            update_user["email"] = new_email
            update_profile_doc["email"] = new_email
            logger.info(f"User {user_id} updated email from {current_user.get('email')} to {new_email}")

    # 2. Name change handling
    if req.full_name and req.full_name.strip():
        name_clean = req.full_name.strip()
        update_user["full_name"] = name_clean
        update_profile_doc["full_name"] = name_clean

    # 3. Phone change handling
    if req.phone is not None:
        update_profile_doc["phone"] = req.phone.strip()
        
    now_iso = datetime.utcnow().isoformat()
    update_profile_doc["updated_at"] = now_iso

    # Apply updates to db.users (enables login with new email)
    if update_user:
        await db.users.update_one({"_id": user_id}, {"$set": update_user})
        
    # Apply role-specific profile updates and cascade changes
    if role == "faculty":
        if req.designation: update_profile_doc["designation"] = req.designation.strip()
        if req.highest_degree: update_profile_doc["highest_degree"] = req.highest_degree.strip()
        if req.specialization: update_profile_doc["specialization"] = req.specialization.strip()
        if req.qualifications: update_profile_doc["qualifications"] = req.qualifications.strip()
        if req.additional_qualifications: update_profile_doc["additional_qualifications"] = req.additional_qualifications.strip()
        if req.university: update_profile_doc["university"] = req.university.strip()
        if req.graduation_year: update_profile_doc["graduation_year"] = req.graduation_year
        
        await db.faculty_profiles.update_one({"user_id": user_id}, {"$set": update_profile_doc})
        
        # Cascade faculty name and email updates across courses and timetable
        cascade_set = {}
        if "full_name" in update_user:
            cascade_set["faculty_name"] = update_user["full_name"]
        if cascade_set:
            await db.course_assignments.update_many({"faculty_user_id": user_id}, {"$set": cascade_set})
            await db.timetable_entries.update_many({"faculty_user_id": user_id}, {"$set": cascade_set})
            
    elif role == "student":
        await db.student_profiles.update_one({"user_id": user_id}, {"$set": update_profile_doc})
        
        # Cascade student name updates across enrollments
        if "full_name" in update_user:
            await db.enrollments.update_many(
                {"student_user_id": user_id},
                {"$set": {"student_name": update_user["full_name"]}}
            )

    # Return refreshed user record for instant frontend sync
    fresh_user = await db.users.find_one({"_id": user_id})
    fresh_user_data = {
        "id": fresh_user["_id"],
        "email": fresh_user["email"],
        "role": fresh_user["role"],
        "full_name": fresh_user.get("full_name", "")
    }
    if role == "faculty":
        fresh_prof = await db.faculty_profiles.find_one({"user_id": user_id})
        if fresh_prof:
            fresh_prof["_id"] = str(fresh_prof["_id"])
            fresh_user_data["profile"] = fresh_prof
    elif role == "student":
        fresh_prof = await db.student_profiles.find_one({"user_id": user_id})
        if fresh_prof:
            fresh_prof["_id"] = str(fresh_prof["_id"])
            fresh_user_data["profile"] = fresh_prof

    return {
        "message": "Profile and login credentials updated successfully. You can now log in with your updated details.",
        "user": fresh_user_data
    }

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    # Does not reveal whether user exists
    db = get_database()
    user = await db.users.find_one({"email": req.email.strip().lower()})
    if user:
        logger.info(f"[Recovery Workflow] Password reset requested for: {req.email}. Institutional email provider interface initialized.")
    return {
        "message": "If this account is registered with ELC Center, password recovery instructions have been prepared.",
        "note": "For local development demo, administrator can reset credentials via Admin Panel."
    }

