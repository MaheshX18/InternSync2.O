#!/bin/bash
set -e

BASE_URL="http://localhost:3000/api/v1"

echo "============================================================"
echo "          INTERNSYNC PHASE 2 SECURITY VERIFICATION          "
echo "============================================================"

echo ""
echo "--- TEST A: Register STUDENT ---"
REGISTER_STUDENT_RES=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student.alex@university.edu",
    "password": "Password123!",
    "firstName": "Alex",
    "lastName": "Rivera",
    "role": "STUDENT",
    "institutionId": "INST-9021",
    "department": "Computer Science",
    "rollNumber": "CS2026-081",
    "batch": "2026"
  }')
echo "Response: $REGISTER_STUDENT_RES"

echo ""
echo "--- TEST B: Login STUDENT ---"
LOGIN_STUDENT_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student.alex@university.edu",
    "password": "Password123!"
  }')
echo "Response: $LOGIN_STUDENT_RES"

STUDENT_ACCESS_TOKEN=$(echo "$LOGIN_STUDENT_RES" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
STUDENT_REFRESH_TOKEN=$(echo "$LOGIN_STUDENT_RES" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

echo ""
echo "Extracted Student Access Token: ${STUDENT_ACCESS_TOKEN:0:25}..."
echo "Extracted Student Refresh Token: $STUDENT_REFRESH_TOKEN"

echo ""
echo "--- TEST C: Access protected endpoint WITH JWT (/api/v1/users/me) ---"
ME_RES=$(curl -s -X GET "$BASE_URL/users/me" \
  -H "Authorization: Bearer $STUDENT_ACCESS_TOKEN")
echo "Response: $ME_RES"

echo ""
echo "--- TEST D: Access protected endpoint WITHOUT JWT (Expect 401) ---"
UNAUTH_RES=$(curl -s -i -X GET "$BASE_URL/users/me")
echo "Response Status / Body:"
echo "$UNAUTH_RES" | head -n 15

echo ""
echo "--- TEST E: STUDENT accessing STUDENT endpoint (/api/v1/test/student) (Expect 200) ---"
STUDENT_ENDPOINT_RES=$(curl -s -X GET "$BASE_URL/test/student" \
  -H "Authorization: Bearer $STUDENT_ACCESS_TOKEN")
echo "Response: $STUDENT_ENDPOINT_RES"

echo ""
echo "--- TEST F: STUDENT accessing ADMIN endpoint (/api/v1/test/admin) (Expect 403) ---"
STUDENT_TO_ADMIN_RES=$(curl -s -i -X GET "$BASE_URL/test/admin" \
  -H "Authorization: Bearer $STUDENT_ACCESS_TOKEN")
echo "Response Status / Body:"
echo "$STUDENT_TO_ADMIN_RES" | head -n 15

echo ""
echo "--- TEST G: Register & Login COMPANY ---"
REGISTER_COMPANY_RES=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@techcorp.com",
    "password": "CompanySecret123!",
    "firstName": "Sarah",
    "lastName": "Jenkins",
    "role": "COMPANY",
    "companyId": "COMP-5501",
    "phone": "+1-555-0192"
  }')
echo "Register Company Response: $REGISTER_COMPANY_RES"

LOGIN_COMPANY_RES=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@techcorp.com",
    "password": "CompanySecret123!"
  }')
echo "Login Company Response: $LOGIN_COMPANY_RES"

COMPANY_ACCESS_TOKEN=$(echo "$LOGIN_COMPANY_RES" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo ""
echo "--- TEST H: COMPANY accessing COMPANY endpoint (/api/v1/test/company) (Expect 200) ---"
COMPANY_ENDPOINT_RES=$(curl -s -X GET "$BASE_URL/test/company" \
  -H "Authorization: Bearer $COMPANY_ACCESS_TOKEN")
echo "Response: $COMPANY_ENDPOINT_RES"

echo ""
echo "--- TEST I: COMPANY accessing ADMIN endpoint (/api/v1/test/admin) (Expect 403) ---"
COMPANY_TO_ADMIN_RES=$(curl -s -i -X GET "$BASE_URL/test/admin" \
  -H "Authorization: Bearer $COMPANY_ACCESS_TOKEN")
echo "Response Status / Body:"
echo "$COMPANY_TO_ADMIN_RES" | head -n 15

echo ""
echo "--- BONUS TEST: Register ADMIN with valid Admin Secret Key ---"
REGISTER_ADMIN_RES=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.master@internsync.org",
    "password": "AdminSecurePassword2026!",
    "firstName": "System",
    "lastName": "Admin",
    "role": "ADMIN",
    "adminSecretKey": "InternSyncAdminMasterKey2026"
  }')
echo "Register Admin Response: $REGISTER_ADMIN_RES"

ADMIN_ACCESS_TOKEN=$(echo "$REGISTER_ADMIN_RES" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

echo ""
echo "--- BONUS TEST 2: ADMIN accessing ADMIN endpoint (/api/v1/test/admin) (Expect 200) ---"
ADMIN_ENDPOINT_RES=$(curl -s -X GET "$BASE_URL/test/admin" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN")
echo "Response: $ADMIN_ENDPOINT_RES"

echo ""
echo "--- TEST J: Refresh Access Token ---"
REFRESH_RES=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$STUDENT_REFRESH_TOKEN\"
  }")
echo "Refresh Response: $REFRESH_RES"

NEW_STUDENT_ACCESS_TOKEN=$(echo "$REFRESH_RES" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
NEW_STUDENT_REFRESH_TOKEN=$(echo "$REFRESH_RES" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

echo ""
echo "--- TEST K: Logout Student ---"
LOGOUT_RES=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEW_STUDENT_ACCESS_TOKEN" \
  -d "{
    \"refreshToken\": \"$NEW_STUDENT_REFRESH_TOKEN\"
  }")
echo "Logout Response: $LOGOUT_RES"

echo ""
echo "--- TEST L: Try Expired/Invalid Refresh Token (Expect 403) ---"
INVALID_REFRESH_RES=$(curl -s -i -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "invalid-non-existent-uuid-token"
  }')
echo "Response Status / Body:"
echo "$INVALID_REFRESH_RES" | head -n 15

echo ""
echo "--- TEST M: Try Duplicate Registration (Expect 409 Conflict) ---"
DUP_REG_RES=$(curl -s -i -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student.alex@university.edu",
    "password": "Password123!",
    "firstName": "Alex",
    "lastName": "Rivera",
    "role": "STUDENT"
  }')
echo "Response Status / Body:"
echo "$DUP_REG_RES" | head -n 15

echo ""
echo "--- TEST N: Try Invalid Login (Expect 401 Unauthorized) ---"
INVALID_LOGIN_RES=$(curl -s -i -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student.alex@university.edu",
    "password": "WrongPassword!"
  }')
echo "Response Status / Body:"
echo "$INVALID_LOGIN_RES" | head -n 15

echo ""
echo "============================================================"
echo "          ALL PHASE 2 SECURITY TESTS EXECUTED               "
echo "============================================================"
