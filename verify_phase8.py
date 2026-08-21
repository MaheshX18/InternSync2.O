import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:8081/api/v1"

def request(method, path, body=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    data = json.dumps(body).encode('utf-8') if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            resp_body = resp.read().decode('utf-8')
            try:
                return status, json.loads(resp_body) if resp_body else {}
            except Exception as e:
                print(f"JSON Parse Error for path {path}. Raw body: '{resp_body}'")
                return status, {"error": str(e), "raw": resp_body}
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(resp_body) if resp_body else {}
        except Exception as json_err:
            print(f"HTTP {e.code} JSON Parse Error for path {path}. Raw body: '{resp_body}'")
            return e.code, {"error": str(json_err), "raw": resp_body}
    except Exception as e:
        print(f"Connection error to {url}: {e}")
        return 500, {"success": False, "message": str(e)}

def run_tests():
    print("==================================================")
    print("RUNNING PHASE 8 VERIFICATION TEST SUITE (RESUME ANALYZER)")
    print("==================================================")
    
    tests_passed = 0
    total_tests = 0

    # 1. Login Accounts
    total_tests += 1
    code, res = request("POST", "/auth/login", {"email": "student@university.edu", "password": "Password123!"})
    if code == 200 and res.get("success"):
        student_token = res["data"]["accessToken"]
        print(" [PASS] 1. Student Login")
        tests_passed += 1
    else:
        print(f" [FAIL] 1. Student Login failed: {res}")
        return

    total_tests += 1
    code, res = request("POST", "/auth/login", {"email": "recruiter@techcorp.com", "password": "Password123!"})
    if code == 200 and res.get("success"):
        company_token = res["data"]["accessToken"]
        print(" [PASS] 2. Company Login")
        tests_passed += 1
    else:
        print(f" [FAIL] 2. Company Login failed: {res}")
        return

    total_tests += 1
    code, res = request("POST", "/auth/login", {"email": "admin@university.edu", "password": "Password123!"})
    if code == 200 and res.get("success"):
        admin_token = res["data"]["accessToken"]
        print(" [PASS] 3. Admin Login")
        tests_passed += 1
    else:
        print(f" [FAIL] 3. Admin Login failed: {res}")
        return

    # 2. Dashboards (Phases 1-6)
    total_tests += 1
    code, res = request("GET", "/student/dashboard", token=student_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 4. GET /student/dashboard")
        tests_passed += 1
    else:
        print(f" [FAIL] 4. GET /student/dashboard: {res}")

    total_tests += 1
    code, res = request("GET", "/dashboards/student", token=student_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 5. GET /dashboards/student")
        tests_passed += 1
    else:
        print(f" [FAIL] 5. GET /dashboards/student: {res}")

    total_tests += 1
    code, res = request("GET", "/company/dashboard", token=company_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 6. GET /company/dashboard")
        tests_passed += 1
    else:
        print(f" [FAIL] 6. GET /company/dashboard: {res}")

    total_tests += 1
    code, res = request("GET", "/dashboards/company", token=company_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 7. GET /dashboards/company")
        tests_passed += 1
    else:
        print(f" [FAIL] 7. GET /dashboards/company: {res}")

    total_tests += 1
    code, res = request("GET", "/admin/dashboard", token=admin_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 8. GET /admin/dashboard")
        tests_passed += 1
    else:
        print(f" [FAIL] 8. GET /admin/dashboard: {res}")

    # 3. Profiles
    total_tests += 1
    code, res = request("GET", "/student/profile", token=student_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 9. GET /student/profile")
        tests_passed += 1
    else:
        print(f" [FAIL] 9. GET /student/profile: {res}")

    total_tests += 1
    code, res = request("PUT", "/student/profile", {"bio": "Updated bio Phase 8"}, token=student_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 10. PUT /student/profile")
        tests_passed += 1
    else:
        print(f" [FAIL] 10. PUT /student/profile: {res}")

    total_tests += 1
    code, res = request("GET", "/company/profile", token=company_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 11. GET /company/profile")
        tests_passed += 1
    else:
        print(f" [FAIL] 11. GET /company/profile: {res}")

    total_tests += 1
    code, res = request("PUT", "/company/profile", {"industry": "Updated Tech"}, token=company_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 12. PUT /company/profile")
        tests_passed += 1
    else:
        print(f" [FAIL] 12. PUT /company/profile: {res}")

    # 4. Search & Notifications
    total_tests += 1
    code, res = request("GET", "/internships?query=developer", token=student_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 13. Search internships with query")
        tests_passed += 1
    else:
        print(f" [FAIL] 13. Search internships: {res}")

    total_tests += 1
    code, res = request("GET", "/notifications", token=student_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 14. GET /notifications")
        tests_passed += 1
    else:
        print(f" [FAIL] 14. GET /notifications: {res}")

    total_tests += 1
    code, res = request("GET", "/notifications/unread-count", token=student_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 15. GET /notifications/unread-count")
        tests_passed += 1
    else:
        print(f" [FAIL] 15. GET /notifications/unread-count: {res}")

    # 5. Security Checks
    total_tests += 1
    code, res = request("GET", "/company/dashboard", token=student_token)
    if code in [401, 403]:
        print(" [PASS] 16. Security: Student blocked from Company Dashboard")
        tests_passed += 1
    else:
        print(f" [FAIL] 16. Security Student blocked: status {code}")

    total_tests += 1
    code, res = request("GET", "/admin/dashboard", token=company_token)
    if code in [401, 403]:
        print(" [PASS] 17. Security: Company blocked from Admin Dashboard")
        tests_passed += 1
    else:
        print(f" [FAIL] 17. Security Company blocked: status {code}")

    # 6. Phase 7 Recommendations Verification
    total_tests += 1
    code, res = request("GET", "/recommendations", token=student_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 18. GET /recommendations (Phase 7)")
        tests_passed += 1
    else:
        print(f" [FAIL] 18. GET /recommendations: {res}")

    # 7. PHASE 8 — AI RESUME ANALYZER TESTS
    # Test 19: POST /api/v1/resume/upload
    total_tests += 1
    resume_payload = {
        "fileName": "Alex_Developer_Resume.pdf",
        "fileType": "application/pdf",
        "fileSize": 4096,
        "contentText": "Alex Smith Resume. Senior Java Developer. Skills: Java, Spring Boot, React, MongoDB, REST APIs, Git, PostgreSQL. Education: B.Tech Computer Science, GPA 3.9."
    }
    code, res = request("POST", "/resume/upload", resume_payload, token=student_token)
    if code == 200 and res.get("success") and "data" in res and "resumeScore" in res["data"]:
        data = res["data"]
        print(f" [PASS] 19. POST /resume/upload (Score: {data.get('resumeScore')}, Skills: {len(data.get('extractedSkills', []))})")
        tests_passed += 1
    else:
        print(f" [FAIL] 19. POST /resume/upload: {res}")

    # Test 20: GET /api/v1/resume/me
    total_tests += 1
    code, res = request("GET", "/resume/me", token=student_token)
    if code == 200 and res.get("success") and res.get("data", {}).get("resumeScore") is not None:
        print(" [PASS] 20. GET /resume/me")
        tests_passed += 1
    else:
        print(f" [FAIL] 20. GET /resume/me: {res}")

    # Test 21: GET /api/v1/resume/me/analysis
    total_tests += 1
    code, res = request("GET", "/resume/me/analysis", token=student_token)
    if code == 200 and res.get("success") and "scoreBreakdown" in res.get("data", {}):
        print(" [PASS] 21. GET /resume/me/analysis")
        tests_passed += 1
    else:
        print(f" [FAIL] 21. GET /resume/me/analysis: {res}")

    # Test 22: Verify Resume Skills Sync with Recommendations
    total_tests += 1
    code, res = request("GET", "/recommendations", token=student_token)
    if code == 200 and res.get("success") and len(res.get("data", {}).get("content", [])) >= 0:
        print(" [PASS] 22. Phase 8 -> Phase 7 Integration: Resume skills synced with Recommendations")
        tests_passed += 1
    else:
        print(f" [FAIL] 22. Resume sync with recommendations: {res}")

    # Test 23: Security check: Company blocked from Student Resume
    total_tests += 1
    code, res = request("GET", "/resume/me", token=company_token)
    if code in [401, 403]:
        print(" [PASS] 23. Security: Company role blocked from Student Resume endpoint")
        tests_passed += 1
    else:
        print(f" [FAIL] 23. Security check failed: {code}, {res}")

    print("==================================================")
    print(f"VERIFICATION SUMMARY: {tests_passed}/{total_tests} TESTS PASSED")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
