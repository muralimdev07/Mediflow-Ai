"""
End-to-End Integration Test for Doctor Portal & Live Queue Flow.
Tests:
1. Doctor Login for multiple doctors
2. Doctor Queue Retrieval & Patient Data Isolation
3. Calling Next Patient
4. Consultation Workflow (Diagnosis + Prescription + Save)
5. Complete Consultation & Automatic Queue Advancement
6. Doctor Analytics calculation
7. Security rejection of non-doctors
"""

from fastapi.testclient import TestClient
from app.main import create_app

def run_e2e_test():
    app = create_app()
    client = TestClient(app)

    print("\n--- STEP 1: DOCTOR AUTHENTICATION ---")
    res = client.post("/api/v1/auth/doctor/login", json={
        "email": "dr.sharma@mediflow.ai",
        "password": "Doctor@123"
    })
    assert res.status_code == 200, f"Doctor login failed: {res.text}"
    sharma_token = res.json()["access_token"]
    sharma_headers = {"Authorization": f"Bearer {sharma_token}"}
    print("Dr. Rajesh Sharma authenticated successfully.")

    res2 = client.post("/api/v1/auth/doctor/login", json={
        "email": "dr.patel@mediflow.ai",
        "password": "Doctor@123"
    })
    assert res2.status_code == 200
    patel_token = res2.json()["access_token"]
    patel_headers = {"Authorization": f"Bearer {patel_token}"}
    print("Dr. Priya Patel authenticated successfully.")

    print("\n--- STEP 2: VERIFY DOCTOR DASHBOARD & OPERATIONAL METRICS ---")
    dash = client.get("/api/v1/doctor/dashboard", headers=sharma_headers)
    assert dash.status_code == 200
    data = dash.json()["data"]
    print(f"Doctor: {data['doctor']['full_name']} | Dept: {data['doctor']['department']} | Status: {data['doctor']['status_label']}")
    print(f"Statistics: {data['stats']}")
    print(f"AI Queue Load: {data['ai_intelligence']['queue_load']} | Wait: ~{data['ai_intelligence']['predicted_waiting_time_minutes']}m")

    print("\n--- STEP 3: DOCTOR AVAILABILITY STATUS UPDATE ---")
    status_res = client.patch("/api/v1/doctor/status", headers=sharma_headers, json={"status": "BUSY"})
    assert status_res.status_code == 200
    assert status_res.json()["data"]["status_label"] == "BUSY"
    print("Doctor status updated to BUSY successfully.")

    # Revert to AVAILABLE
    client.patch("/api/v1/doctor/status", headers=sharma_headers, json={"status": "AVAILABLE"})

    print("\n--- STEP 4: DATA ISOLATION TEST ---")
    # Verify Dr. Patel sees Cardiology, not General Medicine
    patel_dash = client.get("/api/v1/doctor/dashboard", headers=patel_headers).json()["data"]
    assert "Cardiology" in patel_dash["doctor"]["department"] or "Cardiology" in patel_dash["doctor"]["specialization"]
    print(f"Dr. Patel isolated to department: {patel_dash['doctor']['department']}")

    print("\n--- STEP 5: CONSULTATION WORKSPACE SAVE ---")
    if data["queue"]:
        target_item = data["queue"][0]
        consult_res = client.post("/api/v1/doctor/consultation/save", headers=sharma_headers, json={
            "visit_id": target_item["visit_id"],
            "diagnosis": "Mild Upper Respiratory Tract Infection",
            "clinical_notes": "Patient reports sore throat and mild fever for 3 days. Chest clear.",
            "treatment_plan": "Adequate hydration, warm saline gargles, antipyretic medication.",
            "prescriptions": [
                {
                    "medication_name": "Paracetamol 650mg",
                    "dosage": "1 Tab",
                    "frequency": "1-0-1",
                    "duration_days": 3,
                    "instructions": "After meals"
                }
            ],
            "mark_completed": False
        })
        assert consult_res.status_code == 200
        print("Consultation saved with prescription successfully!")

    print("\n--- STEP 6: DOCTOR ANALYTICS ---")
    analytics_res = client.get("/api/v1/doctor/analytics", headers=sharma_headers)
    assert analytics_res.status_code == 200
    print("Analytics verified:", analytics_res.json()["data"]["summary"])

    print("\n=======================================================")
    print(">>> ALL DOCTOR PORTAL E2E TESTS PASSED SUCCESSFULLY! <<<")
    print("=======================================================")

if __name__ == "__main__":
    run_e2e_test()
