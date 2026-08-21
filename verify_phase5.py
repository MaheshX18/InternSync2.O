import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:8081/api/v1"

def print_pass(msg):
    print(f"\033[92m[PASS]\033[0m {msg}")

def print_fail(msg):
    print(f"\033[91m[FAIL]\033[0m {msg}")

def http_req(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    req_headers = {"Content-Type": "application/json"}
    req_headers.update(headers)

    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=req_headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            res_data = json.loads(body) if body else {}
            return resp.status, res_data
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            res_data = json.loads(body)
        except Exception:
            res_data = {"raw": body}
        return e.code, res_data

def login(email, password="Password123!"):
    status, res = http_req(f"{BASE_URL}/auth/login", "POST", {"email": email, "password": password})
    if status == 200 and res.get("success"):
        return res["data"]["accessToken"]
    role = "STUDENT"
    if "company" in email or "comp" in email:
        role = "COMPANY"
    elif "admin" in email:
        role = "ADMIN"
    reg_status, reg_res = http_req(f"{BASE_URL}/auth/register", "POST", {
        "email": email,
        "password": password,
        "firstName": email.split("@")[0].capitalize(),
        "lastName": "Test",
        "role": role
    })
    if reg_status == 201 and reg_res.get("success"):
        return reg_res["data"]["accessToken"]
    raise Exception(f"Failed to authenticate {email}: {status} - {res}")

def run_tests():
    print("="*80)
    print("STARTING PHASE 5 RUNTIME & SECURITY VERIFICATION (20/20 TESTS)")
    print("="*80)

    print("[SETUP] Authenticating test accounts...")
    admin_jwt = login("admin@university.edu")
    company_a_jwt = login("comp_a@techcorp.com")
    company_b_jwt = login("comp_b@rival.com")
    student_a_jwt = login("stud_a@university.edu")
    student_b_jwt = login("stud_b@university.edu")

    headers_admin = {"Authorization": f"Bearer {admin_jwt}"}
    headers_comp_a = {"Authorization": f"Bearer {company_a_jwt}"}
    headers_comp_b = {"Authorization": f"Bearer {company_b_jwt}"}
    headers_stud_a = {"Authorization": f"Bearer {student_a_jwt}"}
    headers_stud_b = {"Authorization": f"Bearer {student_b_jwt}"}

    passed = 0
    failed = 0

    # Company A postings
    pub_st, pub_res = http_req(f"{BASE_URL}/internships", "POST", {
        "title": "Senior Frontend Intern",
        "description": "Build high-performance React user interfaces for cloud products.",
        "requirements": ["React", "TypeScript", "Tailwind"],
        "requiredSkills": ["React", "TypeScript"],
        "location": "Remote",
        "workplaceType": "REMOTE",
        "employmentType": "INTERNSHIP",
        "experienceLevel": "ENTRY_LEVEL",
        "isPaid": True,
        "stipendOrSalaryMin": 3000,
        "positionsAvailable": 5,
        "publishImmediately": True
    }, headers_comp_a)
    pub_id = pub_res["data"]["id"]

    draft_st, draft_res = http_req(f"{BASE_URL}/internships", "POST", {
        "title": "Draft Backend Intern",
        "description": "Work on internal backend tools.",
        "requirements": ["Java", "MongoDB"],
        "requiredSkills": ["Java"],
        "location": "San Francisco, CA",
        "workplaceType": "ON_SITE",
        "employmentType": "INTERNSHIP",
        "experienceLevel": "ENTRY_LEVEL",
        "isPaid": False,
        "publishImmediately": False
    }, headers_comp_a)
    draft_id = draft_res["data"]["id"]

    exp_st, exp_res = http_req(f"{BASE_URL}/internships", "POST", {
        "title": "Expired Internship Posting",
        "description": "This internship deadline has already passed.",
        "requirements": ["Java"],
        "requiredSkills": ["Java"],
        "location": "Boston, MA",
        "workplaceType": "ON_SITE",
        "employmentType": "INTERNSHIP",
        "experienceLevel": "ENTRY_LEVEL",
        "isPaid": True,
        "applicationDeadline": "2020-01-01T00:00:00.000Z",
        "publishImmediately": True
    }, headers_comp_a)
    exp_id = exp_res["data"]["id"]

    valid_app_body = {
        "coverLetter": "I am extremely passionate about building modern web software and would love to contribute to your team.",
        "phoneNumber": "+1-555-019-2831",
        "university": "Stanford University",
        "graduationYear": "2026",
        "skills": ["React", "TypeScript", "Node.js"],
        "resumeUrl": "https://example.com/resumes/johndoe.pdf"
    }

    # Test #1: Student can apply to published internship
    st1, r1 = http_req(f"{BASE_URL}/internships/{pub_id}/applications", "POST", valid_app_body, headers_stud_a)
    if st1 == 201 and r1.get("data", {}).get("status") == "SUBMITTED":
        print_pass("Test #01: Student can apply to published internship -> 201 CREATED")
        passed += 1
        app_a_id = r1["data"]["id"]
    else:
        print_fail(f"Test #01: Student apply failed: {st1} - {r1}")
        failed += 1
        app_a_id = None

    # Test #2: Student cannot apply to draft internship
    st2, r2 = http_req(f"{BASE_URL}/internships/{draft_id}/applications", "POST", valid_app_body, headers_stud_a)
    if st2 == 400:
        print_pass("Test #02: Student cannot apply to draft internship -> 400 BAD REQUEST")
        passed += 1
    else:
        print_fail(f"Test #02: Expected 400 for draft apply, got {st2}")
        failed += 1

    # Test #3: Student cannot apply after deadline
    st3, r3 = http_req(f"{BASE_URL}/internships/{exp_id}/applications", "POST", valid_app_body, headers_stud_a)
    if st3 == 400:
        print_pass("Test #03: Student cannot apply after deadline -> 400 BAD REQUEST")
        passed += 1
    else:
        print_fail(f"Test #03: Expected 400 for expired deadline, got {st3}")
        failed += 1

    # Test #4 & #5: Student cannot apply twice / Duplicate returns 409
    st4, r4 = http_req(f"{BASE_URL}/internships/{pub_id}/applications", "POST", valid_app_body, headers_stud_a)
    if st4 == 409:
        print_pass("Test #04 & #05: Duplicate application returns -> 409 CONFLICT")
        passed += 2
    else:
        print_fail(f"Test #04 & #05: Expected 409 for duplicate application, got {st4}")
        failed += 2

    # Test #6: Student A cannot access Student B's application (IDOR)
    st_b, r_b = http_req(f"{BASE_URL}/internships/{pub_id}/applications", "POST", valid_app_body, headers_stud_b)
    app_b_id = r_b["data"]["id"] if st_b == 201 else None

    if app_b_id:
        st6, r6 = http_req(f"{BASE_URL}/applications/me/{app_b_id}", "GET", headers=headers_stud_a)
        if st6 in [404, 403]:
            print_pass("Test #06: Student A cannot access Student B's application -> 404 NOT FOUND (IDOR Protection)")
            passed += 1
        else:
            print_fail(f"Test #06: IDOR vulnerability! Student A got Student B app: {st6}")
            failed += 1
    else:
        print_fail("Test #06: Could not prepare Student B application")
        failed += 1

    # Test #7: Student cannot change application status
    st7, r7 = http_req(f"{BASE_URL}/company/applications/{app_a_id}/status", "PUT", {"status": "ACCEPTED"}, headers_stud_a)
    if st7 == 403:
        print_pass("Test #07: Student cannot update application status -> 403 FORBIDDEN")
        passed += 1
    else:
        print_fail(f"Test #07: Student status update allowed or wrong code: {st7}")
        failed += 1

    # Test #8: Company A can see applicants for Company A internships
    st8, r8 = http_req(f"{BASE_URL}/company/applications", "GET", headers=headers_comp_a)
    if st8 == 200 and len(r8.get("data", {}).get("content", [])) >= 2:
        print_pass("Test #08: Company A can see applicants for Company A internships -> 200 OK")
        passed += 1
    else:
        print_fail(f"Test #08: Company A failed to fetch applicants: {st8}")
        failed += 1

    # Test #9: Company B cannot access Company A applicants (IDOR)
    st9, r9 = http_req(f"{BASE_URL}/company/applications/{app_a_id}", "GET", headers=headers_comp_b)
    if st9 in [404, 403]:
        print_pass("Test #09: Company B cannot access Company A applicant -> 404 NOT FOUND (IDOR Protection)")
        passed += 1
    else:
        print_fail(f"Test #09: Company B accessed Company A applicant! {st9}")
        failed += 1

    # Test #10: Company B cannot modify Company A application
    st10, r10 = http_req(f"{BASE_URL}/company/applications/{app_a_id}/status", "PUT", {"status": "UNDER_REVIEW"}, headers_comp_b)
    if st10 in [404, 403]:
        print_pass("Test #10: Company B cannot modify Company A application -> 404 NOT FOUND (IDOR Protection)")
        passed += 1
    else:
        print_fail(f"Test #10: Company B modified Company A application! {st10}")
        failed += 1

    # Test #11: Company can update valid application status (SUBMITTED -> UNDER_REVIEW)
    st11, r11 = http_req(f"{BASE_URL}/company/applications/{app_a_id}/status", "PUT", {
        "status": "UNDER_REVIEW",
        "recruiterNotes": "Candidate profile matches requirements."
    }, headers_comp_a)
    if st11 == 200 and r11.get("data", {}).get("status") == "UNDER_REVIEW":
        print_pass("Test #11: Company updated status SUBMITTED -> UNDER_REVIEW -> 200 OK")
        passed += 1
    else:
        print_fail(f"Test #11: Valid status update failed: {st11} - {r11}")
        failed += 1

    # Test #12: Invalid status transitions are rejected (UNDER_REVIEW -> ACCEPTED directly)
    st12, r12 = http_req(f"{BASE_URL}/company/applications/{app_a_id}/status", "PUT", {"status": "ACCEPTED"}, headers_comp_a)
    if st12 == 400:
        print_pass("Test #12: Invalid state transition UNDER_REVIEW -> ACCEPTED rejected -> 400 BAD REQUEST")
        passed += 1
    else:
        print_fail(f"Test #12: Invalid transition allowed! Got {st12}")
        failed += 1

    # Test #13: Admin can access application management
    st13, r13 = http_req(f"{BASE_URL}/admin/applications", "GET", headers=headers_admin)
    if st13 == 200:
        print_pass("Test #13: Admin can access application management -> 200 OK")
        passed += 1
    else:
        print_fail(f"Test #13: Admin application fetch failed: {st13}")
        failed += 1

    # Test #14: Student cannot access admin application endpoints
    st14, r14 = http_req(f"{BASE_URL}/admin/applications", "GET", headers=headers_stud_a)
    if st14 == 403:
        print_pass("Test #14: Student accessing admin endpoint -> 403 FORBIDDEN")
        passed += 1
    else:
        print_fail(f"Test #14: Student accessed admin endpoint! Got {st14}")
        failed += 1

    # Test #15: Company cannot access admin application endpoints
    st15, r15 = http_req(f"{BASE_URL}/admin/applications", "GET", headers=headers_comp_a)
    if st15 == 403:
        print_pass("Test #15: Company accessing admin endpoint -> 403 FORBIDDEN")
        passed += 1
    else:
        print_fail(f"Test #15: Company accessed admin endpoint! Got {st15}")
        failed += 1

    # Test #16: Unauthenticated user cannot apply
    st16, r16 = http_req(f"{BASE_URL}/internships/{pub_id}/applications", "POST", valid_app_body)
    if st16 == 401:
        print_pass("Test #16: Unauthenticated user apply -> 401 UNAUTHORIZED")
        passed += 1
    else:
        print_fail(f"Test #16: Unauthenticated apply got {st16}")
        failed += 1

    # Test #17 & #18: Applicant count increments correctly and duplicate does not increment twice
    st_det, r_det = http_req(f"{BASE_URL}/internships/public/{pub_id}", "GET")
    count = r_det.get("data", {}).get("applicantCount")
    if count == 2:
        print_pass("Test #17 & #18: Applicant count increments correctly and duplicate does not double-count")
        passed += 2
    else:
        print_fail(f"Test #17 & #18: Expected applicantCount=2, got {count}")
        failed += 2

    # Test #19: Withdraw works for owning student
    jwt_c = login("stud_c@university.edu")
    headers_c = {"Authorization": f"Bearer {jwt_c}"}
    st_c_app, r_c_app = http_req(f"{BASE_URL}/internships/{pub_id}/applications", "POST", valid_app_body, headers_c)
    app_c_id = r_c_app["data"]["id"]

    st19, r19 = http_req(f"{BASE_URL}/applications/me/{app_c_id}/withdraw", "PUT", headers=headers_c)
    if st19 == 200 and r19.get("data", {}).get("status") == "WITHDRAWN":
        print_pass("Test #19: Withdraw works for owning student -> 200 OK (status=WITHDRAWN)")
        passed += 1
    else:
        print_fail(f"Test #19: Withdraw failed: {st19} - {r19}")
        failed += 1

    # Test #20: Existing Phase 4 public search & Phase 4 suite check
    st20, r20 = http_req(f"{BASE_URL}/internships/public?search=Frontend", "GET")
    if st20 == 200:
        print_pass("Test #20: Phase 4 public search still works -> 200 OK")
        passed += 1
    else:
        print_fail(f"Test #20: Phase 4 public search failed: {st20}")
        failed += 1

    print("="*80)
    print(f"VERIFICATION SUMMARY: {passed}/20 TESTS PASSED, {failed}/20 FAILED")
    print("="*80)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
