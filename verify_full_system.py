import urllib.request
import urllib.parse
import json
import time

BASE_URL = "http://localhost:8081/api/v1"

def make_request(path, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    
    encoded_data = None
    if data is not None:
        encoded_data = json.dumps(data).encode("utf-8")
        
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body)
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(res_body)
        except Exception:
            return e.code, {"message": res_body}
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    print("==================================================")
    print("RUNNING INTERNSYNC FULL SYSTEM TEST SUITE")
    print("==================================================")
    
    results = []
    
    def log(name, passed, detail=""):
        res_str = "PASS" if passed else "FAIL"
        results.append((name, passed, detail))
        print(f"[{res_str}] {name} - {detail}")
        if not passed:
            print(f"   --> FAILED: {detail}")

    # ====================================================
    # 1. AUTHENTICATION
    # ====================================================
    print("\n--- 1. Testing Authentication ---")
    status, tpo_login = make_request("/auth/login", method="POST", data={
        "email": "tpo@university.edu",
        "password": "Password123!"
    })
    log("TPO Login (POST /auth/login)", status == 200 and tpo_login.get("success"), f"Status {status}")
    tpo_token = tpo_login.get("data", {}).get("accessToken")
    tpo_headers = {"Authorization": f"Bearer {tpo_token}"} if tpo_token else {}

    status, comp_login = make_request("/auth/login", method="POST", data={
        "email": "recruiter@techcorp.com",
        "password": "Password123!"
    })
    log("Company Login (POST /auth/login)", status == 200 and comp_login.get("success"), f"Status {status}")
    comp_token = comp_login.get("data", {}).get("accessToken")
    comp_headers = {"Authorization": f"Bearer {comp_token}"} if comp_token else {}

    status, stu_login = make_request("/auth/login", method="POST", data={
        "email": "student@university.edu",
        "password": "Password123!"
    })
    log("Student Login (POST /auth/login)", status == 200 and stu_login.get("success"), f"Status {status}")
    stu_token = stu_login.get("data", {}).get("accessToken")
    stu_headers = {"Authorization": f"Bearer {stu_token}"} if stu_token else {}

    # ====================================================
    # 2. TPO ENDPOINTS
    # ====================================================
    print("\n--- 2. Testing TPO Endpoints ---")
    
    status, tpo_dash = make_request("/tpo/dashboard", headers=tpo_headers)
    log("GET /api/v1/tpo/dashboard", status == 200 and tpo_dash.get("success"), f"Status {status}")

    status, tpo_stud = make_request("/tpo/students", headers=tpo_headers)
    log("GET /api/v1/tpo/students", status == 200 and tpo_stud.get("success"), f"Status {status}, Total students: {len(tpo_stud.get('data', []))}")

    # Empty filters test
    status, tpo_stud_empty = make_request("/tpo/students?search=&department=&readinessLevel=", headers=tpo_headers)
    log("GET /api/v1/tpo/students?search=&department=&readinessLevel= (Empty filters treated as no filter)", 
        status == 200 and tpo_stud_empty.get("success"), f"Status {status}, Count: {len(tpo_stud_empty.get('data', []))}")

    status, tpo_analytics = make_request("/tpo/analytics", headers=tpo_headers)
    log("GET /api/v1/tpo/analytics", status == 200 and tpo_analytics.get("success"), f"Status {status}")

    status, tpo_interventions = make_request("/tpo/interventions", headers=tpo_headers)
    log("GET /api/v1/tpo/interventions", status == 200 and tpo_interventions.get("success"), f"Status {status}")

    # ====================================================
    # 3. COMPANY ENDPOINTS
    # ====================================================
    print("\n--- 3. Testing Company Endpoints ---")

    status, comp_tasks = make_request("/company/tasks", headers=comp_headers)
    log("GET /api/v1/company/tasks", status == 200 and comp_tasks.get("success"), f"Status {status}, Tasks: {len(comp_tasks.get('data', []))}")

    status, comp_attendance = make_request("/company/attendance", headers=comp_headers)
    log("GET /api/v1/company/attendance", status == 200 and comp_attendance.get("success"), f"Status {status}, Records: {len(comp_attendance.get('data', []))}")

    status, comp_evals = make_request("/company/evaluations", headers=comp_headers)
    log("GET /api/v1/company/evaluations", status == 200 and comp_evals.get("success"), f"Status {status}, Evals: {len(comp_evals.get('data', []))}")

    # ====================================================
    # 4. STUDENT ENDPOINTS
    # ====================================================
    print("\n--- 4. Testing Student Endpoints ---")

    status, stu_academics = make_request("/student/academics", headers=stu_headers)
    log("GET /api/v1/student/academics", status == 200 and stu_academics.get("success"), f"Status {status}")

    status, stu_tasks = make_request("/student/tasks", headers=stu_headers)
    log("GET /api/v1/student/tasks", status == 200 and stu_tasks.get("success"), f"Status {status}, Tasks: {len(stu_tasks.get('data', []))}")

    status, stu_evals = make_request("/student/evaluations", headers=stu_headers)
    log("GET /api/v1/student/evaluations", status == 200 and stu_evals.get("success"), f"Status {status}, Evals: {len(stu_evals.get('data', []))}")

    status, stu_attendance = make_request("/student/attendance", headers=stu_headers)
    log("GET /api/v1/student/attendance", status == 200 and stu_attendance.get("success"), f"Status {status}")

    status, stu_roadmap = make_request("/skills/roadmap", headers=stu_headers)
    log("GET /api/v1/skills/roadmap", status == 200 and stu_roadmap.get("success"), f"Status {status}")

    # ====================================================
    # 5. REAL WORKFLOWS & DATA CONSISTENCY
    # ====================================================
    print("\n--- 5. Real Workflows & Data Consistency Testing ---")

    # Workflow 1: Student Registration & Profile
    ts = int(time.time())
    new_student_email = f"test_student_{ts}@university.edu"
    status, reg_res = make_request("/auth/register", method="POST", data={
        "email": new_student_email,
        "password": "Password123!",
        "firstName": "Alex",
        "lastName": "Kumar",
        "role": "STUDENT",
        "phone": "+1 555-0199",
        "collegeName": "State Institute of Technology",
        "department": "Computer Science",
        "rollNumber": f"CS-2026-{ts%1000:03d}",
        "prn": f"PRN{ts}",
        "batch": "2026"
    })
    log("Student Registration (POST /auth/register)", status == 201 and reg_res.get("success"), f"Status {status}")
    new_stu_token = reg_res.get("data", {}).get("accessToken")
    new_stu_headers = {"Authorization": f"Bearer {new_stu_token}"}
    
    # Check Profile
    status, prof_res = make_request("/auth/me", headers=new_stu_headers)
    u_data = prof_res.get("data", {})
    has_profile_fields = (
        u_data.get("firstName") == "Alex" and
        u_data.get("lastName") == "Kumar" and
        u_data.get("email") == new_student_email and
        u_data.get("phone") == "+1 555-0199" and
        u_data.get("department") == "Computer Science" and
        u_data.get("rollNumber") is not None and
        u_data.get("batch") == "2026"
    )
    log("Student Profile Verification", status == 200 and has_profile_fields, f"Fields verified: {u_data.get('email')}")

    # Browse internships
    status, int_list_res = make_request("/internships?status=PUBLISHED", headers=new_stu_headers)
    int_data = int_list_res.get("data", [])
    if isinstance(int_data, dict) and "content" in int_data:
        int_data = int_data["content"]
    elif not isinstance(int_data, list):
        int_data = []

    log("Student Browse Internships (GET /internships)", status == 200 and len(int_data) > 0, f"Found {len(int_data)} internships")
    target_int = int_data[0] if len(int_data) > 0 else {}
    target_int_id = target_int.get("id")

    # View Details
    status, int_detail = make_request(f"/internships/{target_int_id}", headers=new_stu_headers)
    is_detail_valid = status == 200 and int_detail.get("data", {}).get("title") is not None
    log("Internship View Details (GET /internships/:id - Not Blank)", is_detail_valid, f"Title: {int_detail.get('data', {}).get('title')}")

    # Apply to Internship
    status, apply_res = make_request(f"/internships/{target_int_id}/apply", method="POST", headers=new_stu_headers, data={
        "coverLetter": "I am passionate about fullstack engineering and would love to contribute.",
        "skills": ["React", "TypeScript", "Node.js"],
        "phoneNumber": "+1 555-0199",
        "university": "State Institute of Technology"
    })
    log("Student Apply to Internship (POST /internships/:id/apply)", status in [200, 201] and apply_res.get("success"), f"Status {status}")
    app_id = apply_res.get("data", {}).get("id")

    # Check Student Application View
    status, my_apps = make_request("/applications/me", headers=new_stu_headers)
    has_my_app = any(a.get("id") == app_id for a in my_apps.get("data", []))
    log("Student Sees Submitted Application in /applications/me", status == 200 and has_my_app, f"Found in {len(my_apps.get('data', []))} apps")

    # Company Views Application & Updates Status
    status, comp_apps = make_request(f"/company/internships/{target_int_id}/applications", headers=comp_headers)
    has_comp_app = any(a.get("id") == app_id for a in comp_apps.get("data", []))
    log("Company Views Application in /company/internships/:id/applications", status == 200 and has_comp_app, f"App ID {app_id}")

    # Shortlist & Accept
    status, accept_res = make_request(f"/applications/{app_id}/status", method="PATCH", headers=comp_headers, data={
        "status": "ACCEPTED",
        "notes": "Welcome to the team as a fullstack intern!"
    })
    log("Company Accepts Application (PATCH /applications/:id/status -> ACCEPTED)", status == 200 and accept_res.get("success"), f"Status {status}")

    # Company creates and assigns a task to the new student
    status, task_create = make_request("/company/tasks", method="POST", headers=comp_headers, data={
        "studentId": u_data.get("id"),
        "internshipId": target_int_id,
        "title": "Onboarding & Environment Setup",
        "description": "Set up the local development environment and run initial sanity tests.",
        "deadline": "2026-09-01T18:00:00Z"
    })
    log("Company Creates Task (POST /company/tasks)", status == 201 and task_create.get("success"), f"Status {status}")
    created_task_id = task_create.get("data", {}).get("id")

    # Student Sees Task and Updates Status
    status, stu_tasks_after = make_request("/student/tasks", headers=new_stu_headers)
    has_assigned_task = any(t.get("id") == created_task_id for t in stu_tasks_after.get("data", []))
    log("Student Sees Assigned Task (GET /student/tasks)", status == 200 and has_assigned_task, f"Task ID {created_task_id}")

    status, task_update = make_request(f"/student/tasks/{created_task_id}/status", method="PATCH", headers=new_stu_headers, data={
        "status": "COMPLETED",
        "progressPercentage": 100,
        "submissionUrl": "https://github.com/alexkumar/onboarding-setup",
        "submissionNotes": "Environment setup verified and test suite running cleanly."
    })
    log("Student Updates Task Status & Submission (PATCH /student/tasks/:id/status)", status == 200 and task_update.get("success"), f"Status {status}")

    # Student Attendance Check-in & Duplicate Prevention
    status, checkin_1 = make_request("/student/attendance/check-in", method="POST", headers=new_stu_headers, data={
        "notes": "Daily morning standup check-in"
    })
    log("Student First Check-in Today (POST /student/attendance/check-in)", status == 200 and checkin_1.get("success"), f"Status {status}")

    status, checkin_2 = make_request("/student/attendance/check-in", method="POST", headers=new_stu_headers, data={
        "notes": "Second check-in attempt"
    })
    is_duplicate_prevented = (status == 400) or (status == 200 and "already" in checkin_2.get("message", "").lower())
    log("Duplicate Same-Day Attendance Handled Cleanly", is_duplicate_prevented, f"Response: {checkin_2.get('message')}")

    # Company Submits Evaluation
    status, eval_submit = make_request("/company/evaluations", method="POST", headers=comp_headers, data={
        "studentId": u_data.get("id"),
        "internshipId": target_int_id,
        "technicalScore": 95,
        "attendanceScore": 98,
        "taskCompletionScore": 92,
        "professionalismScore": 96,
        "feedback": "Alex showed tremendous initiative during onboarding and delivered high quality work.",
        "recommendations": "Recommend for continued high-responsibility engineering modules."
    })
    log("Company Submits Evaluation (POST /company/evaluations)", status == 201 and eval_submit.get("success"), f"Status {status}")

    # Student Views Company Evaluation
    status, stu_evals_after = make_request("/student/evaluations", headers=new_stu_headers)
    has_eval = any(e.get("studentId") == u_data.get("id") for e in stu_evals_after.get("data", []))
    log("Student Views Company Evaluation (GET /student/evaluations)", status == 200 and has_eval, f"Found {len(stu_evals_after.get('data', []))} evals")

    # TPO 360-Degree Complete Student Record
    status, tpo_360 = make_request(f"/tpo/students/{u_data.get('id')}/complete-profile", headers=tpo_headers)
    tpo_data = tpo_360.get("data", {})
    has_all_360_sections = (
        "profile" in tpo_data and
        "academics" in tpo_data and
        "applications" in tpo_data and
        "attendance" in tpo_data and
        "tasks" in tpo_data and
        "evaluations" in tpo_data and
        "careerReadiness" in tpo_data
    )
    log("TPO 360° Complete Student Record (GET /tpo/students/:id/complete-profile)", status == 200 and has_all_360_sections, f"Status {status}")

    # Student Submits Off-Campus Internship -> TPO Reviews & Approves -> Student Active Internship Updates
    status, off_submit = make_request("/student/off-campus", method="POST", headers=new_stu_headers, data={
        "companyName": "Google Cloud Partner Lab",
        "internshipTitle": "Cloud Architecture Fellow",
        "description": "Building serverless microservices and multi-region deployment automation.",
        "startDate": "2026-06-01",
        "endDate": "2026-12-31",
        "duration": "6 Months",
        "location": "Remote",
        "mode": "REMOTE",
        "stipend": "$4000/month",
        "offerLetterUrl": "https://example.com/offer.pdf",
        "supervisorName": "David Miller",
        "supervisorEmail": "david.m@partnerlab.example.com",
        "supervisorPhone": "+1 555-0188"
    })
    log("Student Submits Off-Campus Internship (POST /student/off-campus)", status == 201 and off_submit.get("success"), f"Status {status}")
    off_id = off_submit.get("data", {}).get("id")

    status, off_approve = make_request(f"/tpo/off-campus/{off_id}/verify", method="POST", headers=tpo_headers, data={
        "status": "APPROVED",
        "verificationNotes": "Offer verified with company supervisor. Approved for academic credit."
    })
    log("TPO Approves Off-Campus Internship (POST /tpo/off-campus/:id/verify -> APPROVED)", status == 200 and off_approve.get("success"), f"Status {status}")

    # Check that Student's profile / active internship reflects the approved off-campus internship
    status, stu_off_list = make_request("/student/off-campus", headers=new_stu_headers)
    approved_off = next((o for o in stu_off_list.get("data", []) if o.get("id") == off_id), None)
    log("Student Sees Approved Off-Campus Record as APPROVED", approved_off is not None and approved_off.get("status") == "APPROVED", f"Status: {approved_off.get('status') if approved_off else 'None'}")

    print("\n==================================================")
    total_passed = sum(1 for _, p, _ in results if p)
    print(f"SUMMARY: {total_passed}/{len(results)} TESTS PASSED")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
