import pandas as pd
import numpy as np
import pickle

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ============================================================
# 1. LOAD DATASET
# ============================================================

DATASET_PATH = "Smart_Hospital_5000_Dataset.csv"

print("=" * 60)
print("MEDIFLOW AI - PATIENT PRIORITY MODEL")
print("=" * 60)

print("\nLoading dataset...")

df = pd.read_csv(DATASET_PATH)

print(f"Dataset loaded successfully!")
print(f"Total records: {len(df)}")


# ============================================================
# 2. SELECT FEATURES
# ============================================================

features = [
    "Age",
    "Heart_Rate_bpm",
    "Systolic_BP",
    "Diastolic_BP",
    "Temperature_C",
    "SpO2_Percent",
    "Patients_Ahead",
    "Actual_Waiting_Time_Min"
]

target = "Priority_Level"


# ============================================================
# 3. CHECK REQUIRED COLUMNS
# ============================================================

print("\nChecking dataset columns...")

missing_columns = [
    column
    for column in features + [target]
    if column not in df.columns
]

if missing_columns:

    print("\nERROR!")
    print("The following columns are missing:")

    for column in missing_columns:
        print("-", column)

    exit()


print("All required columns found.")


# ============================================================
# 4. PREPARE DATA
# ============================================================

X = df[features]

y = df[target]


# Remove missing values

valid_rows = X.notnull().all(axis=1) & y.notnull()

X = X[valid_rows]

y = y[valid_rows]


print("\nTraining data:")
print(f"Features: {X.shape}")
print(f"Target: {y.shape}")


# ============================================================
# 5. SPLIT DATA
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.20,

    random_state=42,

    stratify=y
)


print("\nData split completed.")

print(f"Training records: {len(X_train)}")
print(f"Testing records: {len(X_test)}")


# ============================================================
# 6. TRAIN RANDOM FOREST
# ============================================================

print("\nTraining Random Forest AI model...")

model = RandomForestClassifier(

    n_estimators=200,

    max_depth=12,

    random_state=42,

    class_weight="balanced"
)


model.fit(

    X_train,

    y_train
)


print("Model training completed!")


# ============================================================
# 7. TEST MODEL
# ============================================================

print("\nTesting model...")

y_pred = model.predict(X_test)


accuracy = accuracy_score(

    y_test,

    y_pred
)


print("\n" + "=" * 60)

print(
    f"MODEL ACCURACY: {accuracy * 100:.2f}%"
)

print("=" * 60)


print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred
    )
)


# ============================================================
# 8. FEATURE IMPORTANCE
# ============================================================

print("\nFeature Importance:")

importance = pd.DataFrame({

    "Feature":
        features,

    "Importance":
        model.feature_importances_

})


importance = importance.sort_values(

    by="Importance",

    ascending=False
)


print(
    importance.to_string(index=False)
)


# ============================================================
# 9. SAVE MODEL
# ============================================================

MODEL_PATH = "ML/priority_model.pkl"


with open(

    MODEL_PATH,

    "wb"

) as file:

    pickle.dump(
        model,
        file
    )


print("\n" + "=" * 60)

print("MODEL SAVED SUCCESSFULLY!")

print(
    f"Location: {MODEL_PATH}"
)

print("=" * 60)