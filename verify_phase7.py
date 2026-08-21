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
    print("RUNNING PHASE 7 VERIFICATION TEST SUITE (WITH RECOMMENDATIONS)")
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

    # 2. Student Dashboard
    total_tests += 1
    code, res = request("GET", "/student/dashboard", token=student_token)
    if code == 200 and res.get("success") and "totalApplications" in res.get("data", {}):
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

    # 3. Company Dashboard
    total_tests += 1
    code, res = request("GET", "/company/dashboard", token=company_token)
    if code == 200 and res.get("success") and "totalPostings" in res.get("data", {}):
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

    # 4. Admin Dashboard
    total_tests += 1
    code, res = request("GET", "/admin/dashboard", token=admin_token)
    if code == 200 and res.get("success") and "totalUsers" in res.get("data", {}):
        print(" [PASS] 8. GET /admin/dashboard")
        tests_passed += 1
    else:
        print(f" [FAIL] 8. GET /admin/dashboard: {res}")

    # 5. Profiles
    total_tests += 1
    code, res = request("GET", "/student/profile", token=student_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 9. GET /student/profile")
        tests_passed += 1
    else:
        print(f" [FAIL] 9. GET /student/profile: {res}")

    total_tests += 1
    code, res = request("PUT", "/student/profile", {"bio": "Passionate software engineer & AI learner"}, token=student_token)
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
    code, res = request("PUT", "/company/profile", {"industry": "Software Engineering"}, token=company_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 12. PUT /company/profile")
        tests_passed += 1
    else:
        print(f" [FAIL] 12. PUT /company/profile: {res}")

    # 6. Internship Search & Filter
    total_tests += 1
    code, res = request("GET", "/internships?search=software", token=student_token)
    if code == 200 and res.get("success"):
        print(" [PASS] 13. Search internships with query")
        tests_passed += 1
    else:
        print(f" [FAIL] 13. Search internships with query: {res}")

    # 7. Notifications
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

    # 8. Security Access Controls
    total_tests += 1
    code, res = request("GET", "/company/dashboard", token=student_token)
    if code in [403, 401]:
        print(" [PASS] 16. Security: Student blocked from Company Dashboard (403/401)")
        tests_passed += 1
    else:
        print(f" [FAIL] 16. Security check failed, status: {code}")

    total_tests += 1
    code, res = request("GET", "/admin/dashboard", token=company_token)
    if code in [403, 401]:
        print(" [PASS] 17. Security: Company blocked from Admin Dashboard (403/401)")
        tests_passed += 1
    else:
        print(f" [FAIL] 17. Security check failed, status: {code}")

    # --- PHASE 7 NEW TESTS: RECOMMENDATION ENGINE ---
    total_tests += 1
    code, res = request("GET", "/recommendations", token=student_token)
    if code == 200 and res.get("success") and "content" in res.get("data", {}):
        print(" [PASS] 18. GET /recommendations (Student)")
        tests_passed += 1
    else:
        print(f" [FAIL] 18. GET /recommendations: {res}")

    total_tests += 1
    code, res = request("GET", "/recommendations/me", token=student_token)
    if code == 200 and res.get("success") and "content" in res.get("data", {}):
        print(" [PASS] 19. GET /recommendations/me (Alias Endpoint)")
        tests_passed += 1
    else:
        print(f" [FAIL] 19. GET /recommendations/me: {res}")

    total_tests += 1
    code, res = request("GET", "/recommendations?minMatchScore=50", token=student_token)
    if code == 200 and res.get("success"):
        recs = res["data"].get("content", [])
        all_valid = all(r.get("matchScore", 0) >= 50 and "whyMatches" in r and "matchedSkills" in r for r in recs)
        if all_valid or len(recs) == 0:
            print(" [PASS] 20. GET /recommendations with minMatchScore=50 filter & score breakdown")
            tests_passed += 1
        else:
            print(f" [FAIL] 20. Invalid match scores or structure in recommendations: {recs}")
    else:
        print(f" [FAIL] 20. GET /recommendations with filter: {res}")

    total_tests += 1
    code, res = request("GET", "/recommendations", token=company_token)
    if code in [403, 401]:
        print(" [PASS] 21. Security: Company role blocked from Student Recommendations (403/401)")
        tests_passed += 1
    else:
        print(f" [FAIL] 21. Security check failed for Recommendations, status: {code}")

    print("==================================================")
    print(f"VERIFICATION SUMMARY: {tests_passed}/{total_tests} TESTS PASSED")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
