import urllib.request
import urllib.parse
import json
import time
import sys

BASE_URL = "http://localhost:3000/api/v1"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    if data is not None:
        json_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    else:
        json_data = None

    req = urllib.request.Request(url, data=json_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            status_code = response.status
            try:
                parsed = json.loads(res_body)
            except Exception:
                parsed = res_body
            return status_code, parsed
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(res_body)
        except Exception:
            parsed = res_body
        return e.code, parsed
    except Exception as e:
        return 500, str(e)

def register_or_login(email, password, role, first_name="Test", last_name="User"):
    # Try register
    reg_data = {
        "email": email,
        "password": password,
        "role": role,
        "firstName": first_name,
        "lastName": last_name
    }
    if role == "ADMIN":
        reg_data["adminSecretKey"] = "InternSyncAdminMasterKey2026"

    status, res = make_request(f"{BASE_URL}/auth/register", method="POST", data=reg_data)
    if status == 201:
        return res["data"]["accessToken"]
    
    # If already exists, login
    login_data = {"email": email, "password": password}
    status, res = make_request(f"{BASE_URL}/auth/login", method="POST", data=login_data)
    if status == 200:
        return res["data"]["accessToken"]
    
    raise Exception(f"Failed to authenticate user {email}: {res}")

def run_tests():
    print("=" * 70)
    print("STARTING PHASE 4 RUNTIME & SECURITY VERIFICATION (30/30 TESTS)")
    print("=" * 70)

    passed = 0
    failed = 0

    def assert_test(num, description, condition, details=""):
        nonlocal passed, failed
        if condition:
            passed += 1
            print(f"[PASS] Test #{num:02d}: {description}")
        else:
            failed += 1
            print(f"[FAIL] Test #{num:02d}: {description} - {details}")

    # Authenticate Users
    print("\n[SETUP] Authenticating test accounts...")
    ts = int(time.time())
    student_token = register_or_login(f"student_p4_{ts}@example.com", "Password123!", "STUDENT", "Alice", "Student")
    company_a_token = register_or_login(f"company_a_p4_{ts}@example.com", "Password123!", "COMPANY", "Acme", "Corp")
    company_b_token = register_or_login(f"company_b_p4_{ts}@example.com", "Password123!", "COMPANY", "Beta", "Inc")
    admin_token = register_or_login(f"admin_p4_{ts}@example.com", "Password123!", "ADMIN", "Admin", "User")

    company_a_headers = {"Authorization": f"Bearer {company_a_token}"}
    company_b_headers = {"Authorization": f"Bearer {company_b_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # COMPANY TESTS
    print("\n--- SECTION 1: COMPANY POSTING CREATION & MANAGEMENT ---")
    
    # Test 1: POST /api/v1/internships with COMPANY JWT (valid body) -> 201
    valid_posting_a = {
        "title": "Software Engineering Intern - React & Java",
        "description": "Awesome internship position for fullstack React and Spring Boot development.",
        "requirements": ["Proficient in Java and TypeScript", "Understanding of MongoDB"],
        "responsibilities": ["Develop REST APIs", "Build clean UI components"],
        "requiredSkills": ["Java", "React", "Spring Boot", "TypeScript"],
        "location": "San Francisco, CA",
        "workplaceType": "REMOTE",
        "employmentType": "INTERNSHIP",
        "experienceLevel": "ENTRY_LEVEL",
        "stipendOrSalaryMin": 3000.0,
        "stipendOrSalaryMax": 5000.0,
        "currency": "USD",
        "isPaid": True,
        "positionsAvailable": 2,
        "publishImmediately": False
    }
    status, res = make_request(f"{BASE_URL}/internships", method="POST", data=valid_posting_a, headers=company_a_headers)
    assert_test(1, "POST /api/v1/internships with valid body as COMPANY -> 201 CREATED", status == 201, f"Status: {status}, Res: {res}")
    posting_a_id = res["data"]["id"] if status == 201 else None

    # Test 2: POST /api/v1/internships with invalid body (short title) -> 400
    invalid_posting = valid_posting_a.copy()
    invalid_posting["title"] = "Dev"  # < 5 chars
    status, res = make_request(f"{BASE_URL}/internships", method="POST", data=invalid_posting, headers=company_a_headers)
    assert_test(2, "POST /api/v1/internships with short title -> 400 BAD REQUEST", status == 400, f"Status: {status}")

    # Test 3: POST /api/v1/internships with STUDENT JWT -> 403
    status, res = make_request(f"{BASE_URL}/internships", method="POST", data=valid_posting_a, headers=student_headers)
    assert_test(3, "POST /api/v1/internships with STUDENT JWT -> 403 FORBIDDEN", status == 403, f"Status: {status}")

    # Test 4: GET /api/v1/internships/company/me -> 200
    status, res = make_request(f"{BASE_URL}/internships/company/me", method="GET", headers=company_a_headers)
    has_posting = any(p["id"] == posting_a_id for p in res.get("data", {}).get("content", [])) if status == 200 else False
    assert_test(4, "GET /api/v1/internships/company/me returns created posting -> 200 OK", status == 200 and has_posting, f"Status: {status}")

    # Test 5: GET /api/v1/internships/company/me/{id} -> 200
    status, res = make_request(f"{BASE_URL}/internships/company/me/{posting_a_id}", method="GET", headers=company_a_headers)
    assert_test(5, "GET /api/v1/internships/company/me/{id} -> 200 OK", status == 200 and res.get("data", {}).get("id") == posting_a_id, f"Status: {status}")

    # Test 6: PUT /api/v1/internships/company/me/{id} -> 200
    update_data = valid_posting_a.copy()
    update_data["title"] = "Senior Frontend Engineering Intern"
    status, res = make_request(f"{BASE_URL}/internships/company/me/{posting_a_id}", method="PUT", data=update_data, headers=company_a_headers)
    assert_test(6, "PUT /api/v1/internships/company/me/{id} updates title -> 200 OK", status == 200 and res.get("data", {}).get("title") == update_data["title"], f"Status: {status}")

    # Test 7: PUT status DRAFT -> PUBLISHED -> 200
    status, res = make_request(f"{BASE_URL}/internships/company/me/{posting_a_id}/status", method="PUT", data={"status": "PUBLISHED"}, headers=company_a_headers)
    assert_test(7, "PUT /api/v1/internships/company/me/{id}/status DRAFT -> PUBLISHED -> 200 OK", status == 200 and res.get("data", {}).get("status") == "PUBLISHED", f"Status: {status}")

    # Test 8: PUT status PUBLISHED -> UNPUBLISHED -> 200
    status, res = make_request(f"{BASE_URL}/internships/company/me/{posting_a_id}/status", method="PUT", data={"status": "UNPUBLISHED"}, headers=company_a_headers)
    assert_test(8, "PUT /api/v1/internships/company/me/{id}/status PUBLISHED -> UNPUBLISHED -> 200 OK", status == 200 and res.get("data", {}).get("status") == "UNPUBLISHED", f"Status: {status}")

    # Test 9: PUT status UNPUBLISHED -> PUBLISHED -> 200
    status, res = make_request(f"{BASE_URL}/internships/company/me/{posting_a_id}/status", method="PUT", data={"status": "PUBLISHED"}, headers=company_a_headers)
    assert_test(9, "PUT /api/v1/internships/company/me/{id}/status UNPUBLISHED -> PUBLISHED -> 200 OK", status == 200 and res.get("data", {}).get("status") == "PUBLISHED", f"Status: {status}")

    # Test 10: PUT status PUBLISHED -> CLOSED -> 200
    status, res = make_request(f"{BASE_URL}/internships/company/me/{posting_a_id}/status", method="PUT", data={"status": "CLOSED"}, headers=company_a_headers)
    assert_test(10, "PUT /api/v1/internships/company/me/{id}/status PUBLISHED -> CLOSED -> 200 OK", status == 200 and res.get("data", {}).get("status") == "CLOSED", f"Status: {status}")

    # Test 11: Company attempts invalid status transition REMOVED_BY_ADMIN -> 400
    status, res = make_request(f"{BASE_URL}/internships/company/me/{posting_a_id}/status", method="PUT", data={"status": "REMOVED_BY_ADMIN"}, headers=company_a_headers)
    assert_test(11, "Company attempting to set REMOVED_BY_ADMIN -> 400 BAD REQUEST", status == 400, f"Status: {status}")

    # IDOR TESTS (Company B accessing Company A posting)
    print("\n--- SECTION 2: IDOR SECURITY ENFORCEMENT ---")
    # Test 12: Company B GET Company A posting -> 404
    status, res = make_request(f"{BASE_URL}/internships/company/me/{posting_a_id}", method="GET", headers=company_b_headers)
    assert_test(12, "Company B GET /company/me/{CompanyA_Posting_ID} -> 404 NOT FOUND (IDOR Protection)", status == 404, f"Status: {status}")

    # Test 13: Company B PUT Company A posting -> 404
    status, res = make_request(f"{BASE_URL}/internships/company/me/{posting_a_id}", method="PUT", data=update_data, headers=company_b_headers)
    assert_test(13, "Company B PUT /company/me/{CompanyA_Posting_ID} -> 404 NOT FOUND (IDOR Protection)", status == 404, f"Status: {status}")

    # Test 14: Company B DELETE Company A posting -> 404
    status, res = make_request(f"{BASE_URL}/internships/company/me/{posting_a_id}", method="DELETE", headers=company_b_headers)
    assert_test(14, "Company B DELETE /company/me/{CompanyA_Posting_ID} -> 404 NOT FOUND (IDOR Protection)", status == 404, f"Status: {status}")

    # Create temporary posting for Company A to test DELETE
    temp_posting = valid_posting_a.copy()
    temp_posting["title"] = "Temporary Deletable Posting"
    _, temp_res = make_request(f"{BASE_URL}/internships", method="POST", data=temp_posting, headers=company_a_headers)
    temp_id = temp_res["data"]["id"]

    # Test 15: Company A DELETE own posting -> 200
    status, res = make_request(f"{BASE_URL}/internships/company/me/{temp_id}", method="DELETE", headers=company_a_headers)
    assert_test(15, "Company A DELETE own posting -> 200 OK", status == 200, f"Status: {status}")

    # PUBLIC SEARCH & BOOKMARKS
    print("\n--- SECTION 3: PUBLIC SEARCH, FILTERING & BOOKMARKS ---")
    
    # Create 2 published postings and 1 draft posting for search/filter tests
    pub_posting_1 = valid_posting_a.copy()
    pub_posting_1["title"] = "Fullstack Developer React Spring"
    pub_posting_1["workplaceType"] = "REMOTE"
    pub_posting_1["isPaid"] = True
    pub_posting_1["publishImmediately"] = True
    _, pub1_res = make_request(f"{BASE_URL}/internships", method="POST", data=pub_posting_1, headers=company_a_headers)
    pub1_id = pub1_res["data"]["id"]

    pub_posting_2 = valid_posting_a.copy()
    pub_posting_2["title"] = "Data Science & AI Specialist"
    pub_posting_2["workplaceType"] = "ON_SITE"
    pub_posting_2["isPaid"] = False
    pub_posting_2["publishImmediately"] = True
    _, pub2_res = make_request(f"{BASE_URL}/internships", method="POST", data=pub_posting_2, headers=company_a_headers)
    pub2_id = pub2_res["data"]["id"]

    draft_posting = valid_posting_a.copy()
    draft_posting["title"] = "Hidden Draft Internship Posting"
    draft_posting["publishImmediately"] = False
    _, draft_res = make_request(f"{BASE_URL}/internships", method="POST", data=draft_posting, headers=company_a_headers)
    draft_id = draft_res["data"]["id"]

    # Test 16: GET /api/v1/internships/public without JWT -> 200
    status, res = make_request(f"{BASE_URL}/internships/public", method="GET")
    assert_test(16, "GET /api/v1/internships/public without JWT -> 200 OK", status == 200, f"Status: {status}")

    # Test 17: Public search excludes DRAFT/CLOSED postings
    public_ids = [item["id"] for item in res.get("data", {}).get("content", [])]
    excludes_draft = draft_id not in public_ids and posting_a_id not in public_ids  # posting_a is CLOSED
    assert_test(17, "Public search excludes DRAFT and CLOSED postings", excludes_draft, f"Public IDs: {public_ids}")

    # Test 18: GET /api/v1/internships/public?search=Fullstack -> 200
    status, res = make_request(f"{BASE_URL}/internships/public?search=Fullstack", method="GET")
    found_pub1 = any(item["id"] == pub1_id for item in res.get("data", {}).get("content", []))
    assert_test(18, "GET /api/v1/internships/public?search=Fullstack filters correctly", status == 200 and found_pub1, f"Status: {status}")

    # Test 19: GET /api/v1/internships/public?workplaceType=REMOTE -> 200
    status, res = make_request(f"{BASE_URL}/internships/public?workplaceType=REMOTE", method="GET")
    only_remote = all(item["workplaceType"] == "REMOTE" for item in res.get("data", {}).get("content", []))
    assert_test(19, "GET /api/v1/internships/public?workplaceType=REMOTE filters correctly", status == 200 and only_remote, f"Status: {status}")

    # Test 20: GET /api/v1/internships/public?isPaid=true -> 200
    status, res = make_request(f"{BASE_URL}/internships/public?isPaid=true", method="GET")
    only_paid = all(item["isPaid"] is True for item in res.get("data", {}).get("content", []))
    assert_test(20, "GET /api/v1/internships/public?isPaid=true filters correctly", status == 200 and only_paid, f"Status: {status}")

    # Test 21: GET /api/v1/internships/public/{pub1_id} -> 200
    status, res = make_request(f"{BASE_URL}/internships/public/{pub1_id}", method="GET")
    assert_test(21, "GET /api/v1/internships/public/{id} for published posting -> 200 OK", status == 200 and res.get("data", {}).get("id") == pub1_id, f"Status: {status}")

    # Test 22: GET /api/v1/internships/public/{draft_id} -> 404
    status, res = make_request(f"{BASE_URL}/internships/public/{draft_id}", method="GET")
    assert_test(22, "GET /api/v1/internships/public/{id} for draft posting -> 404 NOT FOUND", status == 404, f"Status: {status}")

    # Test 23: POST /api/v1/internships/bookmarks/{pub1_id} with STUDENT JWT -> 200 (bookmarked=true)
    status, res = make_request(f"{BASE_URL}/internships/bookmarks/{pub1_id}", method="POST", headers=student_headers)
    assert_test(23, "POST /api/v1/internships/bookmarks/{id} as STUDENT -> 200 OK (bookmarked=true)", status == 200 and res.get("data") is True, f"Status: {status}")

    # Test 24: GET /api/v1/internships/bookmarks with STUDENT JWT -> 200
    status, res = make_request(f"{BASE_URL}/internships/bookmarks", method="GET", headers=student_headers)
    has_bookmark = any(item["id"] == pub1_id for item in res.get("data", {}).get("content", []))
    assert_test(24, "GET /api/v1/internships/bookmarks returns bookmarked posting -> 200 OK", status == 200 and has_bookmark, f"Status: {status}")

    # Test 25: POST /api/v1/internships/bookmarks/{pub1_id} toggle unbookmark -> 200 (bookmarked=false)
    status, res = make_request(f"{BASE_URL}/internships/bookmarks/{pub1_id}", method="POST", headers=student_headers)
    assert_test(25, "POST /api/v1/internships/bookmarks/{id} unbookmark -> 200 OK (bookmarked=false)", status == 200 and res.get("data") is False, f"Status: {status}")

    # Test 26: POST /api/v1/internships/bookmarks/{pub1_id} with COMPANY JWT -> 403
    status, res = make_request(f"{BASE_URL}/internships/bookmarks/{pub1_id}", method="POST", headers=company_a_headers)
    assert_test(26, "POST /api/v1/internships/bookmarks/{id} with COMPANY JWT -> 403 FORBIDDEN", status == 403, f"Status: {status}")

    # ADMIN MODERATION
    print("\n--- SECTION 4: ADMIN MODERATION & MANAGEMENT ---")

    # Test 27: GET /api/v1/admin/internships with ADMIN JWT -> 200
    status, res = make_request(f"{BASE_URL}/admin/internships", method="GET", headers=admin_headers)
    all_admin_ids = [item["id"] for item in res.get("data", {}).get("content", [])]
    assert_test(27, "GET /api/v1/admin/internships with ADMIN JWT -> 200 OK (returns all statuses)", status == 200 and draft_id in all_admin_ids, f"Status: {status}")

    # Test 28: GET /api/v1/admin/internships with STUDENT JWT -> 403
    status, res = make_request(f"{BASE_URL}/admin/internships", method="GET", headers=student_headers)
    assert_test(28, "GET /api/v1/admin/internships with STUDENT JWT -> 403 FORBIDDEN", status == 403, f"Status: {status}")

    # Test 29: PUT /api/v1/admin/internships/{id}/status to REMOVED_BY_ADMIN -> 200
    status, res = make_request(f"{BASE_URL}/admin/internships/{pub2_id}/status", method="PUT", data={"status": "REMOVED_BY_ADMIN"}, headers=admin_headers)
    assert_test(29, "PUT /api/v1/admin/internships/{id}/status to REMOVED_BY_ADMIN -> 200 OK", status == 200 and res.get("data", {}).get("status") == "REMOVED_BY_ADMIN", f"Status: {status}")

    # Test 30: DELETE /api/v1/admin/internships/{id} -> 200
    status, res = make_request(f"{BASE_URL}/admin/internships/{pub2_id}", method="DELETE", headers=admin_headers)
    assert_test(30, "DELETE /api/v1/admin/internships/{id} with ADMIN JWT -> 200 OK", status == 200, f"Status: {status}")

    print("\n" + "=" * 70)
    print(f"VERIFICATION SUMMARY: {passed}/30 TESTS PASSED, {failed}/30 FAILED")
    print("=" * 70)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
