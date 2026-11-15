from datetime import datetime
from app.core.security import get_password_hash
from app.database.mongodb import get_database
import logging

logger = logging.getLogger(__name__)

async def seed_database():
    """
    Production-Level Initialization:
    Ensures institution settings, department, administrator,
    and official CSE (Cyber Security) faculty & timetable exist.
    """
    db = get_database()
    if db is None:
        logger.error("Cannot initialize: Database connection not initialized.")
        return

    logger.info("Verifying production-level baseline for ELC Center...")

    # 1. Institution Settings
    inst_settings = {
        "_id": "default",
        "institutionName": "GAYATRI VIDYA PARISHAD INSTITUTE OF HIGHER LEARNING AND RESEARCH",
        "campus": "ELC Center — Kommadi, Visakhapatnam",
        "timezone": "Asia/Kolkata",
        "attendanceCutoff": "19:00",
        "minimumAttendancePercentage": 75.0,
        "maxUploadSizeMB": 10,
        "header_image_url": "/assets/gvp_header.png",
        "updated_at": datetime.utcnow().isoformat()
    }
    await db.institution_settings.update_one({"_id": "default"}, {"$set": inst_settings}, upsert=True)

    # 2. Baseline Academic Department: CSE (Cyber Security) only
    dept = {
        "_id": "dept-cyber",
        "code": "CYBER",
        "name": "CSE (Cyber Security)",
        "description": "Department of Computer Science & Engineering (Cyber Security) — M.Tech Program"
    }
    await db.departments.update_one({"_id": dept["_id"]}, {"$set": dept}, upsert=True)

    # 3. Primary Institutional Administrator
    admin_id = "user-admin-001"
    existing_admin = await db.users.find_one({"email": "admin@elc.edu"})
    if not existing_admin:
        admin_user = {
            "_id": admin_id,
            "email": "admin@elc.edu",
            "password_hash": get_password_hash("Admin@123"),
            "role": "admin",
            "full_name": "Administrative Controller — ELC",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
        await db.users.insert_one(admin_user)

    # 4. Official Faculty Accounts for CSE (Cyber Security)
    faculty_list = [
        {
            "id": "fac-cyber-001",
            "name": "Dr. Birender Biswal",
            "faculty_id": "FAC-CYBER-001",
            "email": "biswal@elc.edu",
            "designation": "Professor",
            "highest_degree": "Ph.D.",
            "specialization": "Research Methodology & IPR"
        },
        {
            "id": "fac-cyber-002",
            "name": "Dr. P. Prapoorna Roja",
            "faculty_id": "FAC-CYBER-002",
            "email": "prapoorna@elc.edu",
            "designation": "Associate Professor",
            "highest_degree": "Ph.D.",
            "specialization": "Advanced Computer Networks"
        },
        {
            "id": "fac-cyber-003",
            "name": "Dr. P. Muralidhar Rao",
            "faculty_id": "FAC-CYBER-003",
            "email": "muralidhar@elc.edu",
            "designation": "Professor",
            "highest_degree": "Ph.D.",
            "specialization": "ML Applications for Cyber Security"
        },
        {
            "id": "fac-cyber-004",
            "name": "Dr. A. Yashwanth",
            "faculty_id": "FAC-CYBER-004",
            "email": "yashwanth@elc.edu",
            "designation": "Assistant Professor",
            "highest_degree": "Ph.D.",
            "specialization": "Ethical Hacking & Network Defense"
        },
        {
            "id": "fac-cyber-005",
            "name": "Dr. K.K. Sandhya Rani",
            "faculty_id": "FAC-CYBER-005",
            "email": "sandhya@elc.edu",
            "designation": "Associate Professor",
            "highest_degree": "Ph.D.",
            "specialization": "Operating System Security"
        },
        {
            "id": "fac-cyber-006",
            "name": "Dr. Ch. Sita Kumari",
            "faculty_id": "FAC-CYBER-006",
            "email": "sita@elc.edu",
            "designation": "Associate Professor",
            "highest_degree": "Ph.D.",
            "specialization": "Cloud Security"
        }
    ]

    fac_map = {}
    for f in faculty_list:
        user_id = f"user-{f['id']}"
        fac_map[f["name"]] = user_id
        await db.users.update_one(
            {"email": f["email"]},
            {
                "$setOnInsert": {
                    "_id": user_id,
                    "password_hash": get_password_hash("Faculty@123"),
                    "created_at": datetime.utcnow().isoformat()
                },
                "$set": {
                    "email": f["email"],
                    "role": "faculty",
                    "full_name": f["name"],
                    "is_active": True,
                }
            },
            upsert=True
        )
        await db.faculty_profiles.update_one(
            {"user_id": user_id},
            {
                "$setOnInsert": {
                    "_id": f"prof-{user_id}",
                    "created_at": datetime.utcnow().isoformat()
                },
                "$set": {
                    "user_id": user_id,
                    "faculty_id": f["faculty_id"],
                    "full_name": f["name"],
                    "email": f["email"],
                    "designation": f["designation"],
                    "department_code": "CYBER",
                    "highest_degree": f["highest_degree"],
                    "specialization": f["specialization"],
                    "profile_status": "approved",
                    "completion_percentage": 100,
                }
            },
            upsert=True
        )

    # 5. Courses & Assignments
    courses = [
        {"_id": "CRS-CYB101", "code": "CYB101", "name": "Research Methodology / IPR", "credits": 3, "department_code": "CYBER", "semester": 1, "faculty_name": "Dr. Birender Biswal"},
        {"_id": "CRS-CYB102", "code": "CYB102", "name": "Advanced Computer Networks", "credits": 4, "department_code": "CYBER", "semester": 1, "faculty_name": "Dr. P. Prapoorna Roja"},
        {"_id": "CRS-CYB103", "code": "CYB103", "name": "ML Applications for Cyber Security", "credits": 4, "department_code": "CYBER", "semester": 1, "faculty_name": "Dr. P. Muralidhar Rao"},
        {"_id": "CRS-CYB104", "code": "CYB104", "name": "Ethical Hacking", "credits": 4, "department_code": "CYBER", "semester": 1, "faculty_name": "Dr. A. Yashwanth"},
        {"_id": "CRS-CYB105", "code": "CYB105", "name": "Operating System Security", "credits": 4, "department_code": "CYBER", "semester": 1, "faculty_name": "Dr. K.K. Sandhya Rani"},
        {"_id": "CRS-CYB106", "code": "CYB106", "name": "Cloud Security", "credits": 4, "department_code": "CYBER", "semester": 1, "faculty_name": "Dr. Ch. Sita Kumari"},
        {"_id": "CRS-CYB107L", "code": "CYB107L", "name": "ML Applications for Cyber Security Lab", "credits": 2, "department_code": "CYBER", "semester": 1, "faculty_name": "Dr. P. Muralidhar Rao"},
        {"_id": "CRS-CYB108L", "code": "CYB108L", "name": "Ethical Hacking Lab", "credits": 2, "department_code": "CYBER", "semester": 1, "faculty_name": "Dr. A. Yashwanth"},
        {"_id": "CRS-CYB-ACT", "code": "CYB-ACT", "name": "Co-Curricular (Library / Sports / Counselling)", "credits": 1, "department_code": "CYBER", "semester": 1, "faculty_name": "Dr. Birender Biswal"}
    ]

    for c in courses:
        fac_name = c.pop("faculty_name")
        c_id = c["_id"]
        c_data = {k: v for k, v in c.items() if k != "_id"}
        c_data["created_at"] = datetime.utcnow().isoformat()
        await db.courses.update_one({"_id": c_id}, {"$set": c_data}, upsert=True)
        fac_user_id = fac_map.get(fac_name)
        asg_id = f"ASG-{c['code']}-1"
        await db.course_assignments.update_one(
            {"_id": asg_id},
            {"$set": {
                "course_id": c_id,
                "course_code": c["code"],
                "course_name": c["name"],
                "faculty_user_id": fac_user_id,
                "faculty_name": fac_name,
                "department_code": "CYBER",
                "semester": 1,
                "section": "1",
                "academic_year": "2026-27",
                "status": "active"
            }},
            upsert=True
        )

    # 6. Timetable Slots (If empty)
    existing_tt = await db.timetable_entries.count_documents({"department_code": "CYBER"})
    if existing_tt == 0:
        timetable_slots = [
            {"day": "Monday", "start": "11:10", "end": "12:00", "code": "CYB101", "name": "Research Methodology / IPR", "teacher": "Dr. Birender Biswal", "loc": "B8-205"},
            {"day": "Monday", "start": "12:50", "end": "13:40", "code": "CYB103", "name": "ML Applications for Cyber Security", "teacher": "Dr. P. Muralidhar Rao", "loc": "B4-404"},
            {"day": "Monday", "start": "13:40", "end": "14:30", "code": "CYB105", "name": "Operating System Security", "teacher": "Dr. K.K. Sandhya Rani", "loc": "B4-404"},
            {"day": "Monday", "start": "14:30", "end": "15:20", "code": "CYB102", "name": "Advanced Computer Networks", "teacher": "Dr. P. Prapoorna Roja", "loc": "B4-404"},
            {"day": "Monday", "start": "15:20", "end": "17:00", "code": "CYB-ACT", "name": "Library", "teacher": "Dr. Birender Biswal", "loc": "Central Library"},

            {"day": "Tuesday", "start": "11:10", "end": "12:00", "code": "CYB101", "name": "Research Methodology / IPR", "teacher": "Dr. Birender Biswal", "loc": "B8-205"},
            {"day": "Tuesday", "start": "12:50", "end": "13:40", "code": "CYB102", "name": "Advanced Computer Networks", "teacher": "Dr. P. Prapoorna Roja", "loc": "B4-404"},
            {"day": "Tuesday", "start": "13:40", "end": "16:10", "code": "CYB107L", "name": "ML Applications for Cyber Security Lab", "teacher": "Dr. P. Muralidhar Rao", "loc": "PG & Research Lab"},
            {"day": "Tuesday", "start": "16:10", "end": "17:00", "code": "CYB-ACT", "name": "Sports", "teacher": "Dr. Birender Biswal", "loc": "Sports Complex"},

            {"day": "Wednesday", "start": "11:10", "end": "12:00", "code": "CYB102", "name": "Advanced Computer Networks", "teacher": "Dr. P. Prapoorna Roja", "loc": "B4-404"},
            {"day": "Wednesday", "start": "12:50", "end": "13:40", "code": "CYB-ACT", "name": "Counselling", "teacher": "Dr. Birender Biswal", "loc": "B4-404"},
            {"day": "Wednesday", "start": "13:40", "end": "14:30", "code": "CYB104", "name": "Ethical Hacking", "teacher": "Dr. A. Yashwanth", "loc": "B4-404"},
            {"day": "Wednesday", "start": "14:30", "end": "15:20", "code": "CYB105", "name": "Operating System Security", "teacher": "Dr. K.K. Sandhya Rani", "loc": "B4-404"},
            {"day": "Wednesday", "start": "15:20", "end": "16:10", "code": "CYB106", "name": "Cloud Security", "teacher": "Dr. Ch. Sita Kumari", "loc": "B4-404"},
            {"day": "Wednesday", "start": "16:10", "end": "17:00", "code": "CYB-ACT", "name": "Counselling", "teacher": "Dr. Birender Biswal", "loc": "B4-404"},

            {"day": "Thursday", "start": "11:10", "end": "12:00", "code": "CYB101", "name": "Research Methodology / IPR", "teacher": "Dr. Birender Biswal", "loc": "B8-205"},
            {"day": "Thursday", "start": "12:50", "end": "13:40", "code": "CYB-ACT", "name": "Counselling", "teacher": "Dr. Birender Biswal", "loc": "B4-404"},
            {"day": "Thursday", "start": "13:40", "end": "14:30", "code": "CYB104", "name": "Ethical Hacking", "teacher": "Dr. A. Yashwanth", "loc": "B4-404"},
            {"day": "Thursday", "start": "14:30", "end": "15:20", "code": "CYB103", "name": "ML Applications for Cyber Security", "teacher": "Dr. P. Muralidhar Rao", "loc": "B4-404"},
            {"day": "Thursday", "start": "15:20", "end": "16:10", "code": "CYB-ACT", "name": "Library", "teacher": "Dr. Birender Biswal", "loc": "Central Library"},
            {"day": "Thursday", "start": "16:10", "end": "17:00", "code": "CYB-ACT", "name": "Sports", "teacher": "Dr. Birender Biswal", "loc": "Sports Complex"},

            {"day": "Friday", "start": "11:10", "end": "12:00", "code": "CYB103", "name": "ML Applications for Cyber Security", "teacher": "Dr. P. Muralidhar Rao", "loc": "B4-404"},
            {"day": "Friday", "start": "12:50", "end": "13:40", "code": "CYB106", "name": "Cloud Security", "teacher": "Dr. Ch. Sita Kumari", "loc": "B4-404"},
            {"day": "Friday", "start": "13:40", "end": "16:10", "code": "CYB108L", "name": "Ethical Hacking Lab", "teacher": "Dr. A. Yashwanth", "loc": "PG & Research Lab"},
            {"day": "Friday", "start": "16:10", "end": "17:00", "code": "CYB-ACT", "name": "Counselling", "teacher": "Dr. Birender Biswal", "loc": "B4-404"},

            {"day": "Saturday", "start": "11:10", "end": "12:00", "code": "CYB104", "name": "Ethical Hacking", "teacher": "Dr. A. Yashwanth", "loc": "B4-404"},
            {"day": "Saturday", "start": "12:50", "end": "13:40", "code": "CYB105", "name": "Operating System Security", "teacher": "Dr. K.K. Sandhya Rani", "loc": "B4-404"},
            {"day": "Saturday", "start": "13:40", "end": "14:30", "code": "CYB106", "name": "Cloud Security", "teacher": "Dr. Ch. Sita Kumari", "loc": "B4-404"},
            {"day": "Saturday", "start": "14:30", "end": "15:20", "code": "CYB-ACT", "name": "Library", "teacher": "Dr. Birender Biswal", "loc": "Central Library"},
            {"day": "Saturday", "start": "15:20", "end": "17:00", "code": "CYB-ACT", "name": "Sports", "teacher": "Dr. Birender Biswal", "loc": "Sports Complex"}
        ]
        for idx, s in enumerate(timetable_slots, start=1):
            tt_id = f"TT-CYBER-{s['day'][:3].upper()}-{idx:02d}"
            await db.timetable_entries.insert_one({
                "_id": tt_id,
                "academic_year": "2026-27",
                "semester": 1,
                "department_code": "CYBER",
                "section": "1",
                "course_id": f"CRS-{s['code']}",
                "course_code": s["code"],
                "course_name": s["name"],
                "faculty_user_id": fac_map.get(s["teacher"]),
                "faculty_name": s["teacher"],
                "day_of_week": s["day"],
                "start_time": s["start"],
                "end_time": s["end"],
                "location": s["loc"],
                "status": "active"
            })

    # 7. Official Student Account (M.Tech Cyber Security)
    student_email = "saikumar.mtech.gvp@gmail.com"
    student_user_id = "user-stu-cyber-001"
    
    existing_stu = await db.users.find_one({"email": student_email})
    if not existing_stu:
        await db.users.insert_one({
            "_id": student_user_id,
            "email": student_email,
            "password_hash": get_password_hash("Student@123"),
            "role": "student",
            "full_name": "Saikumar Ponnana",
            "is_active": True,
            "has_custom_password": False,
            "created_at": datetime.utcnow().isoformat()
        })
    else:
        update_fields = {
            "email": student_email,
            "role": "student",
            "full_name": "Saikumar Ponnana",
            "is_active": True,
        }
        # Only set initial password if user has NOT changed to a custom password
        if not existing_stu.get("has_custom_password", False):
            update_fields["password_hash"] = get_password_hash("Student@123")
        await db.users.update_one({"email": student_email}, {"$set": update_fields})

    stu_user = await db.users.find_one({"email": student_email})
    actual_stu_id = stu_user["_id"] if stu_user else student_user_id

    await db.student_profiles.update_one(
        {"user_id": actual_stu_id},
        {
            "$setOnInsert": {
                "_id": f"prof-{actual_stu_id}",
                "user_id": actual_stu_id,
                "created_at": datetime.utcnow().isoformat()
            },
            "$set": {
                "user_id": actual_stu_id,
                "student_id": "STU-CYBER-001",
                "roll_number": "26GVPCYB001",
                "full_name": "Saikumar Ponnana",
                "email": student_email,
                "department_code": "CYBER",
                "academic_year": "2026-27",
                "semester": 1,
                "section": "1",
            }
        },
        upsert=True
    )

    # Auto-enroll student into active courses
    matching_courses = await db.courses.find({"department_code": "CYBER", "semester": 1}).to_list(50)
    for c in matching_courses:
        await db.enrollments.update_one(
            {"student_user_id": actual_stu_id, "course_id": c["_id"]},
            {
                "$set": {
                    "student_user_id": actual_stu_id,
                    "student_name": "Saikumar Ponnana",
                    "roll_number": "26GVPCYB001",
                    "course_id": c["_id"],
                    "course_code": c.get("code"),
                    "department_code": "CYBER",
                    "semester": 1,
                    "section": "1",
                    "academic_year": "2026-27",
                    "status": "enrolled",
                    "enrolled_at": datetime.utcnow().isoformat()
                }
            },
            upsert=True
        )

    # 8. Baseline Study Materials: Dr. P. Muralidhar Rao's ML Lab Manual
    existing_ml_mat = await db.study_materials.find_one({"course_code": "CYB103"})
    if not existing_ml_mat:
        from app.services.storage_service import ALLOWED_EXTENSIONS
        import zipfile
        import io

        def create_ml_lab_docx_bytes():
            content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>"""
            rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""
            doc_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="1E3A8A"/></w:rPr><w:t>GAYATRI VIDYA PARISHAD</w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="24"/><w:color w:val="4B5563"/></w:rPr><w:t>INSTITUTE OF HIGHER LEARNING AND RESEARCH</w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/><w:color w:val="6B7280"/></w:rPr><w:t>ELC Center - Department of CSE (Cyber Security) - M.Tech Program</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="2563EB"/></w:rPr><w:t>Machine Learning Applications for Cyber Security</w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="374151"/></w:rPr><w:t>LAB MANUAL &amp; PRACTICAL EXPERIMENTS (CYB103 / CYB107L)</w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:i/><w:sz w:val="22"/><w:color w:val="6B7280"/></w:rPr><w:t>Course Instructor: Dr. P. Muralidhar Rao, Professor</w:t></w:r></w:p>
    <w:p><w:r><w:t>---------------------------------------------------------------------------------------------------------</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="1E40AF"/></w:rPr><w:t>EXPERIMENT 1: Network Intrusion Detection with Tree Classifiers</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>Objective: Implement and evaluate Decision Trees and Random Forests on the NSL-KDD benchmark intrusion dataset. Preprocess continuous and categorical features, execute one-hot encoding, and compute precision, recall, and ROC-AUC metrics.</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="1E40AF"/></w:rPr><w:t>EXPERIMENT 2: Malicious Traffic Classification using Support Vector Machines</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>Objective: Train linear and radial basis function (RBF) kernel SVMs to classify anomalous packet sequences from standard HTTPS sessions. Evaluate decision boundary stability and hyperparameter tuning with C and gamma.</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="1E40AF"/></w:rPr><w:t>EXPERIMENT 3: Unsupervised Network Flow Anomaly Detection</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>Objective: Apply Isolation Forest and Local Outlier Factor (LOF) models to identify zero-day port scans and data exfiltration patterns without labeled training data.</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="1E40AF"/></w:rPr><w:t>EXPERIMENT 4: Deep Learning Autoencoders for Payload Inspection</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>Objective: Design and train a multilayer autoencoder using PyTorch / TensorFlow to reconstruct normal application layer traffic. Detect adversarial payloads by flagging high reconstruction loss.</w:t></w:r></w:p>
  </w:body>
</w:document>"""
            buf = io.BytesIO()
            with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
                z.writestr("[Content_Types].xml", content_types)
                z.writestr("_rels/.rels", rels)
                z.writestr("word/document.xml", doc_xml)
            return buf.getvalue()

        docx_content = create_ml_lab_docx_bytes()
        filename = "Machine Learning Cyber Security Lab Manual.docx"
        
        # Save to GridFS
        gridfs_id = None
        try:
            from motor.motor_asyncio import AsyncIOMotorGridFSBucket
            fs = AsyncIOMotorGridFSBucket(db)
            grid_in = fs.open_upload_stream(
                filename,
                metadata={"contentType": ALLOWED_EXTENSIONS[".docx"]}
            )
            await grid_in.write(docx_content)
            await grid_in.close()
            gridfs_id = str(grid_in._id)
            logger.info(f"Seeded ML Lab Manual into MongoDB GridFS with id {gridfs_id}")
        except Exception as e:
            logger.warning(f"Could not seed docx to GridFS: {e}")

        muralidhar_uid = fac_map.get("Dr. P. Muralidhar Rao", "user-fac-cyber-003")
        await db.study_materials.insert_one({
            "_id": "MAT-CYB103-ML-LAB",
            "title": "Machine Learning Cyber Security Lab Manual",
            "description": "Comprehensive practical laboratory manual covering intrusion detection, anomaly detection, SVM traffic classification, and autoencoders.",
            "faculty_user_id": muralidhar_uid,
            "faculty_name": "Dr. P. Muralidhar Rao",
            "course_id": "CRS-CYB103",
            "course_code": "CYB103",
            "course_name": "ML Applications for Cyber Security",
            "department_code": "CYBER",
            "semester": 1,
            "category": "Lab Manual",
            "visibility": "COURSE_RESTRICTED",
            "original_filename": filename,
            "stored_filename": "Machine_Learning_Cyber_Security_Lab_Manual.docx",
            "file_path": "",
            "gridfs_id": gridfs_id,
            "file_type": "docx",
            "mime_type": ALLOWED_EXTENSIONS[".docx"],
            "file_size": len(docx_content),
            "uploaded_at": datetime.utcnow().isoformat()
        })
        logger.info("Seeded official ML Lab Manual for Dr. P. Muralidhar Rao into study_materials.")

    logger.info("Production baseline initialized: Settings, Faculty, Courses, Timetable, Student, and Materials verified.")
