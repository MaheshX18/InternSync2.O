import urllib.request
import urllib.parse
import json

BASE_URL = "http://localhost:3000/api/v1"

def print_result(test_name, passed, message=""):
    status = "PASS" if passed else "FAIL"
    color = "\033[92m" if passed else "\033[91m"
    reset = "\033[0m"
    print(f"[{color}{status}{reset}] {test_name} {message}")
    if not passed:
        raise Exception(f"Test failed: {test_name} - {message}")

def make_request(url, method="GET", headers=None, data=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    
    encoded_data = None
    if data is not None:
        encoded_data = json.dumps(data).encode("utf-8")
        
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

def run_tests():
    print("==================================================")
    print("VERIFYING PHASE 10 — CAREER READINESS ENGINE")
    print("==================================================")

    # 1. Login as Student
    status, res = make_request(f"{BASE_URL}/auth/login", method="POST", data={
        "email": "student@university.edu",
        "password": "Password123!"
    })
    print_result("1. Student Login", status == 200 and res.get("success", False))
    student_token = res["data"]["accessToken"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 2. Login as Company
    status, comp_res = make_request(f"{BASE_URL}/auth/login", method="POST", data={
        "email": "recruiter@techcorp.com",
        "password": "Password123!"
    })
    print_result("2. Company Login", status == 200 and comp_res.get("success", False))
    company_token = comp_res["data"]["accessToken"]
    company_headers = {"Authorization": f"Bearer {company_token}"}

    # 3. GET /api/v1/career/readiness
    status, readiness_res = make_request(f"{BASE_URL}/career/readiness", headers=student_headers)
    print_result("3. GET /api/v1/career/readiness Endpoint", status == 200 and readiness_res.get("success", False))
    data = readiness_res.get("data", {})

    # 4. Score and Meta Fields
    print_result("4. Score and Level Fields Present", "score" in data and "level" in data and "summary" in data)
    print(f"   -> Calculated Readiness Score: {data['score']}/100 ({data['level']})")
    print(f"   -> Summary: {data['summary']}")

    # 5. Check 9 Component Drivers
    components = data.get("components", [])
    print_result("5. Exactly 9 Components Present", len(components) == 9)
    
    total_weight = sum(c.get("weight", 0) for c in components)
    print_result("6. Component Weights Sum to 100%", total_weight == 100)
    print(f"   -> Total Weight Sum: {total_weight}%")

    required_keys = [
        "technical_skills", "dsa_coding", "resume_quality",
        "projects_experience", "internship_activity", "interview_preparation",
        "learning_progress", "profile_completeness", "application_activity"
    ]
    comp_keys = [c.get("key") for c in components]
    all_keys_present = all(k in comp_keys for k in required_keys)
    print_result("7. All 9 Required Component Keys Present", all_keys_present)

    # 8. Check Component Data Fields and Explainability
    sample_comp = components[0]
    has_explainability = all("explanation" in c and len(c["explanation"]) > 0 for c in components)
    print_result("8. All Components Contain Detailed Explainability", has_explainability)

    # 9. Strengths & Weaknesses Lists
    print_result("9. Strengths & Weaknesses Present", "strengths" in data and "weaknesses" in data)
    print(f"   -> Strengths Count: {len(data['strengths'])}, Weaknesses Count: {len(data['weaknesses'])}")

    # 10. Actionable Recommendations
    recs = data.get("recommendations", [])
    print_result("10. Actionable Recommendations Generated", len(recs) > 0)
    if len(recs) > 0:
        first_rec = recs[0]
        has_route = "actionRoute" in first_rec and first_rec["actionRoute"].startswith("/")
        print_result("11. Recommendations Mapped to Action Routes", has_route)
        print(f"   -> First Recommendation: '{first_rec.get('title')}' -> {first_rec.get('actionRoute')}")

    # 12. Score History / Trend
    trend = data.get("trend", [])
    print_result("12. Historical Score Trend Present", len(trend) > 0)
    if len(trend) > 0:
        print(f"   -> Historical Trend Points: {len(trend)}, Latest: {trend[-1]['score']} pts on {trend[-1]['date']}")

    # 13. Target Role Parameter Override
    status, role_override_res = make_request(f"{BASE_URL}/career/readiness?targetRole=Frontend%20Developer", headers=student_headers)
    print_result("13. Target Role Override Query Param", status == 200 and role_override_res.get("data", {}).get("targetRole") == "Frontend Developer")

    # 14. Alias Endpoint /api/v1/readiness
    status, alias_res = make_request(f"{BASE_URL}/readiness", headers=student_headers)
    print_result("14. GET /api/v1/readiness Alias Endpoint", status == 200 and alias_res.get("success", False))

    # 15. Role-Based Access Control (Company Token Forbidden)
    status, comp_access_res = make_request(f"{BASE_URL}/career/readiness", headers=company_headers)
    print_result("15. Role Security — Company Access Blocked (403)", status == 403)

    # 16. Unauthorized Access Control
    status, unauth_res = make_request(f"{BASE_URL}/career/readiness")
    print_result("16. Security — Unauthorized Access Blocked (401)", status == 401)

    # 17. Regression Check Phase 7 Recommendations
    status, rec7 = make_request(f"{BASE_URL}/recommendations", headers=student_headers)
    print_result("17. Phase 7 Regression — Recommendations API", status == 200 and rec7.get("success", False))

    # 18. Regression Check Phase 8 Resume Analysis
    status, res8 = make_request(f"{BASE_URL}/resume/me", headers=student_headers)
    print_result("18. Phase 8 Regression — Resume Analysis API", status == 200 and res8.get("success", False))

    # 19. Regression Check Phase 9 Skill Roadmap
    status, res9 = make_request(f"{BASE_URL}/skills/roadmap", headers=student_headers)
    print_result("19. Phase 9 Regression — Skill Roadmap API", status == 200 and res9.get("success", False))

    print("==================================================")
    print("ALL PHASE 10 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
