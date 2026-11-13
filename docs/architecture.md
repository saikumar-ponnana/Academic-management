# ELC Center — System Architecture

## Overview
The **ELC Center Academic Management System** is a full-stack, enterprise-grade academic portal built for **Gayatri Vidya Parishad Institute of Higher Learning & Research**. It connects Administrators, Faculty, and Students through a shared, secure, database-backed platform.

```
                      +---------------------------------------+
                      | Gayatri Vidya Parishad Static Header  |
                      |        Banner Across All Pages        |
                      +---------------------------------------+
                                          |
                      +---------------------------------------+
                      |         React.js + Tailwind UI        |
                      | (Admin, Faculty, Student Dashboards)  |
                      +---------------------------------------+
                                          |
                                   REST / JSON APIs
                                          |
                      +---------------------------------------+
                      |         Python FastAPI Backend        |
                      |   - JWT & Argon2 Authentication       |
                      |   - Authoritative 7:00 PM RNS Engine  |
                      |   - Role-Based Access Controls        |
                      |   - Private Material Streamer         |
                      +---------------------------------------+
                                          |
                      +---------------------------------------+
                      |          MongoDB Database             |
                      |  - Async Motor / PyMongo Driver       |
                      |  - Unique Indexes & Audit Logs        |
                      |  - Standalone / Atlas / Mock Fallback |
                      +---------------------------------------+
```

## Frontend Architecture
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS & Lucide React icons
- **State & Context**: `AuthContext` managing authentication tokens and active user profile
- **HTTP Client**: Axios with request and response interceptors
- **Routing**: React Router with `ProtectedRoute` enforcing role-specific authorization

## Backend Architecture
- **Framework**: FastAPI (Python 3.12+)
- **Validation**: Pydantic v2 schemas
- **Security**: JWT tokens, HTTP-only authenticated cookies, argon2/bcrypt password hashing
- **Server Clock**: Python timezone-aware `pytz` clock set to `Asia/Kolkata`
- **Time Cutoff Engine**: Strictly enforces 19:00:00 (7:00 PM IST) daily deadline for class attendance submissions
- **Storage Service**: Private filesystem storage for PDFs, DOCX, PPTX, and image study materials, served strictly via authenticated endpoints

