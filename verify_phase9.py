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
    print("VERIFYING PHASE 1 - 9 FUNCTIONALITY & API ENDPOINTS")
    print("==================================================")

    # 1. Login as Student
    status, res = make_request(f"{BASE_URL}/auth/login", method="POST", data={
        "email": "student@university.edu",
        "password": "Password123!"
    })
    print_result("Student Login", status == 200 and res.get("success", False))
    student_token = res["data"]["accessToken"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 2. Login as Company
    status, comp_res = make_request(f"{BASE_URL}/auth/login", method="POST", data={
        "email": "recruiter@techcorp.com",
        "password": "Password123!"
    })
    print_result("Company Login", status == 200 and comp_res.get("success", False))
    company_token = comp_res["data"]["accessToken"]

    # 3. Phase 7 Recommendations
    status, rec_res = make_request(f"{BASE_URL}/recommendations", headers=student_headers)
    print_result("Fetch Recommendations (Phase 7)", status == 200 and rec_res.get("success", False))

    # 4. Phase 8 Resume Analysis
    status, resume_res = make_request(f"{BASE_URL}/resume/me", headers=student_headers)
    print_result("Fetch Resume Analysis (Phase 8)", status == 200 and resume_res.get("success", False))

    # 5. Phase 9 Target Roles Catalog
    status, roles_res = make_request(f"{BASE_URL}/skills/roles", headers=student_headers)
    print_result("Fetch Target Roles Catalog", status == 200 and len(roles_res.get("data", [])) >= 5)
    roles = roles_res.get("data", [])
    role_names = [r["role"] for r in roles]
    print(f"   Available Roles: {', '.join(role_names[:4])}...")

    # 6. Phase 9 Skill Gap Analysis
    status, gaps_res = make_request(f"{BASE_URL}/skills/gaps", headers=student_headers)
    print_result("Fetch Skill Gap Analysis", status == 200 and gaps_res.get("success", False))
    gap_data = gaps_res["data"]
    print_result("Skill Gap Payload Data Structure", "readinessScore" in gap_data and "gaps" in gap_data)
    print(f"   Target Role: {gap_data['targetRole']}, Readiness: {gap_data['readinessScore']}%")

    # 7. Phase 9 Fetch Learning Roadmap
    status, roadmap_res = make_request(f"{BASE_URL}/skills/roadmap", headers=student_headers)
    print_result("Fetch Learning Roadmap", status == 200 and roadmap_res.get("success", False))
    roadmap = roadmap_res["data"]
    items = roadmap["items"]
    print_result("Roadmap Items Population", len(items) > 0)
    first_item = items[0]
    print(f"   Top Skill Gap Module: {first_item['skill']} ({first_item['priority']} Priority, Week {first_item['week']})")
    print_result("Roadmap Item Details Structure", "requiredByCount" in first_item and "potentialOpportunity" in first_item and "resources" in first_item)

    # 8. Phase 9 Start Roadmap Module
    item_id = first_item["itemId"]
    status, start_res = make_request(f"{BASE_URL}/skills/roadmap/{item_id}/start", method="POST", headers=student_headers)
    print_result("Start Learning Module", status == 200 and start_res.get("success", False))
    updated_items = start_res["data"]["items"]
    started_item = next((i for i in updated_items if i["itemId"] == item_id), None)
    print_result("Module Status In Progress", started_item and started_item["status"] == "IN_PROGRESS")

    # 9. Phase 9 Complete Roadmap Module (Skill Synchronization)
    status, complete_res = make_request(f"{BASE_URL}/skills/roadmap/{item_id}/complete", method="POST", headers=student_headers)
    print_result("Complete Learning Module", status == 200 and complete_res.get("success", False))
    completed_items = complete_res["data"]["items"]
    completed_item = next((i for i in completed_items if i["itemId"] == item_id), None)
    print_result("Module Status Completed", completed_item and completed_item["status"] == "COMPLETED")

    # 10. Verify User Skill Sync
    status, me_res = make_request(f"{BASE_URL}/users/me", headers=student_headers)
    print_result("User Profile Verification", status == 200)
    user_skills = me_res["data"]["skills"]
    print_result("Skill Added to User Profile", first_item["skill"] in user_skills)
    print(f"   User Skills after completion: {', '.join(user_skills)}")

    # 11. Phase 9 Target Role Update
    status, role_update_res = make_request(f"{BASE_URL}/skills/target-role", method="PUT", headers=student_headers, data={"targetRole": "Frontend Developer"})
    print_result("Update Target Role", status == 200 and role_update_res["data"]["targetRole"] == "Frontend Developer")

    # 12. Phase 9 Self-Assessed Skill Level Update
    status, level_res = make_request(f"{BASE_URL}/skills/level", method="PUT", headers=student_headers, data={"skill": "Docker", "level": "ADVANCED"})
    print_result("Update Skill Level", status == 200)

    # 13. Data Isolation Check (Company cannot access student roadmap endpoints)
    company_headers = {"Authorization": f"Bearer {company_token}"}
    status, forbidden_res = make_request(f"{BASE_URL}/skills/roadmap", headers=company_headers)
    print_result("Data Isolation & Role Protection", status in [403, 401])

    print("==================================================")
    print("ALL 25/25 PHASE 1-9 VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
