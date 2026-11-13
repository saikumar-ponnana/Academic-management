# Attendance / RNS Module — Business Rules & Specifications

## 1. Timetable-Driven Attendance Marking
- Faculty can ONLY mark attendance for sessions officially assigned to them in the institutional timetable.
- Faculty cannot mark attendance for classes taught by other faculty members.
- Cancelled class sessions strictly reject attendance marking.

## 2. Mandatory 7:00 PM (19:00:00 IST) Cutoff
- **Authoritative Server Clock**: The server's clock in timezone `Asia/Kolkata` is the single source of truth. Browser clock tampering is entirely ineffective.
- **Class Conclusion Requirement**: Attendance cannot be submitted while a class is in progress; current time must be &ge; `session.end_time`.
- **7:00 PM Rule**:
  - Before 19:00:00: Faculty can save drafts and submit official attendance.
  - At or after 19:00:00: The backend rejects unauthorized faculty attendance writes with HTTP 403:
    `"Attendance submission is closed for today. The deadline was 7:00 PM. Please contact the administrator."`
  - Past dates are strictly locked by default.

## 3. RNS Locking
- Once locked:
  - Frontend controls disable editable attendance forms.
  - Backend rejects any draft or final submission payload.
  - Read-only historical records remain accessible.
  - Faculty can continue browsing courses, uploading documents, and managing profiles.

## 4. Administrative Override Workflow
- Administrators have exclusive authority to grant late attendance exceptions.
- Admin specifies:
  - `session_id`
  - `faculty_user_id`
  - Reason for override (e.g., campus power outage, connectivity disruption)
  - Expiration time (e.g. 2 to 24 hours)
- Active approved overrides allow the assigned faculty to submit late attendance within the designated window.
- All overrides and late submissions are permanently audit-logged.
- Faculty cannot approve their own overrides.

## 5. Attendance Calculations
$$\text{Attendance Percentage} = \left(\frac{\text{Attended Sessions}}{\text{Conducted Sessions}}\right) \times 100$$
- Only officially conducted and submitted attendance sessions are included.
- Drafts, cancelled sessions, and upcoming sessions are excluded.
- Institutional exam threshold is configured at **75%**. Students below 75% are flagged with shortage warnings.

