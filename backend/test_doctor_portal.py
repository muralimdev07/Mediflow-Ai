import requests

BASE_URL = "http://localhost:8000/api/v1"

def test_flow():
    # 1. Test Doctor Login
    login_payload = {
        "email": "dr.sharma@mediflow.ai",
        "password": "Doctor@123"
    }
    print("Testing Doctor Login for dr.sharma@mediflow.ai...")
    
    # Try using direct test with FastAPI testclient to avoid needing server running
    from fastapi.testclient import TestClient
    from app.main import create_app

    app = create_app()
    client = TestClient(app)

    res = client.post("/api/v1/auth/doctor/login", json=login_payload)
    print(f"Login response status: {res.status_code}")
    assert res.status_code == 200, f"Login failed: {res.text}"
    data = res.json()
    token = data["access_token"]
    user = data["user"]
    print(f"Logged in successfully: {user['full_name']} ({user['role']})")
    assert user["role"] == "doctor"

    # 2. Test Doctor Dashboard
    headers = {"Authorization": f"Bearer {token}"}
    dash_res = client.get("/api/v1/doctor/dashboard", headers=headers)
    print(f"Dashboard response status: {dash_res.status_code}")
    assert dash_res.status_code == 200, f"Dashboard failed: {dash_res.text}"
    dash_data = dash_res.json()["data"]
    print("Dashboard doctor info:", dash_data["doctor"]["full_name"], dash_data["doctor"]["department"])
    print("Dashboard stats:", dash_data["stats"])
    print("AI queue intelligence:", dash_data["ai_intelligence"])

    # 3. Test Invalid Login
    bad_res = client.post("/api/v1/auth/doctor/login", json={"email": "dr.sharma@mediflow.ai", "password": "wrong"})
    assert bad_res.status_code in (401, 403), f"Should fail with bad password: {bad_res.status_code}"
    print("Bad password rejected correctly!")

    # 4. Test Patient attempting doctor login
    patient_res = client.post("/api/v1/auth/doctor/login", json={"email": "patient@mediflow.ai", "password": "Doctor@123"})
    assert patient_res.status_code in (401, 403), f"Should reject patient on doctor login: {patient_res.status_code}"
    print("Patient login on doctor portal rejected correctly!")

    # 5. Test Doctor Analytics
    analytics_res = client.get("/api/v1/doctor/analytics", headers=headers)
    assert analytics_res.status_code == 200
    print("Doctor analytics retrieved successfully!")

    # 6. Test Doctor Profile
    profile_res = client.get("/api/v1/doctor/profile", headers=headers)
    assert profile_res.status_code == 200
    print("Doctor profile retrieved:", profile_res.json()["data"]["specialization"])

    print("\nALL BACKEND DOCTOR TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_flow()
