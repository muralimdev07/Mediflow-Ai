import joblib
import pandas as pd

print("=" * 60)
print("MEDIFLOW AI - PATIENT PRIORITY PREDICTION")
print("=" * 60)

# Load trained model
model = joblib.load("ML/priority_model.pkl")

print("\nEnter Patient Details")
print("-" * 40)

age = float(input("Age: "))
heart_rate = float(input("Heart Rate (bpm): "))
systolic_bp = float(input("Systolic BP: "))
diastolic_bp = float(input("Diastolic BP: "))
temperature = float(input("Temperature (°C): "))
spo2 = float(input("SpO2 (%): "))
patients_ahead = float(input("Patients Ahead: "))
waiting_time = float(input("Current Waiting Time (minutes): "))

# IMPORTANT:
# These columns are in the EXACT order used during model training.

patient = pd.DataFrame([[
    age,
    heart_rate,
    systolic_bp,
    diastolic_bp,
    temperature,
    spo2,
    patients_ahead,
    waiting_time
]], columns=[
    "Age",
    "Heart_Rate_bpm",
    "Systolic_BP",
    "Diastolic_BP",
    "Temperature_C",
    "SpO2_Percent",
    "Patients_Ahead",
    "Actual_Waiting_Time_Min"
])

# Make prediction
prediction = model.predict(patient)[0]

print("\n" + "=" * 60)
print("AI PREDICTION")
print("=" * 60)

print(f"\nPatient Priority: {prediction}")

if prediction == "Emergency":
    print("🔴 EMERGENCY - Immediate medical attention required!")

elif prediction == "Urgent":
    print("🟠 URGENT - Patient should be attended soon.")

else:
    print("🟢 NORMAL - Patient can follow the normal queue.")

print("\n" + "=" * 60)

