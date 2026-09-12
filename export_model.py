import os
import json
import time
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

def export():
    print("=" * 75)
    print("STEP 1: TRAINING & PERSISTING LEAK PREDICTION MODEL & METADATA")
    print("=" * 75)

    artifacts_dir = "model"
    os.makedirs(artifacts_dir, exist_ok=True)

    dataset_dir = "dataset" if os.path.exists(os.path.join("dataset", "train_data.csv")) else "."
    train_path = os.path.join(dataset_dir, "train_data.csv")
    test_path = os.path.join(dataset_dir, "test_data.csv")

    print(f"Loading '{train_path}' and '{test_path}'...")
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)

    target_col = "incident_label"
    leak_and_id_cols = [
        "risk_class", "risk_score", "leak_location", "leak_severity",
        "confirmed_by", "timestamp", "plant_id", "plant_name",
        "process_unit_id", "process_unit_name", "equipment_id", "equipment_name"
    ]

    cols_to_drop = leak_and_id_cols + [target_col]
    X_train = train_df.drop(columns=cols_to_drop).copy()
    y_train = train_df[target_col].copy()

    X_test = test_df.drop(columns=cols_to_drop).copy()
    y_test = test_df[target_col].copy()

    categorical_cols = [
        "equipment_type", "process_type", "fuel_or_material_type",
        "shift", "maintenance_status"
    ]
    numeric_cols = [c for c in X_train.columns if c not in categorical_cols]
    feature_order = list(X_train.columns)

    # 1. Compute and store numeric medians
    numeric_medians = {}
    for col in numeric_cols:
        med = float(X_train[col].median())
        numeric_medians[col] = med
        X_train[col] = X_train[col].fillna(med)
        X_test[col] = X_test[col].fillna(med)

    # 2. Fit label encoders and build dictionary mappings
    categorical_mappings = {}
    categorical_fallbacks = {}
    for col in categorical_cols:
        le = LabelEncoder()
        # Treat missing as string 'nan'
        X_train[col] = le.fit_transform(X_train[col].astype(str))
        X_test[col] = le.transform(X_test[col].astype(str))
        
        # Mapping dict
        mapping = {cls_val: int(idx) for idx, cls_val in enumerate(le.classes_)}
        categorical_mappings[col] = mapping
        # Default fallback is 'nan' if present, otherwise most common index
        categorical_fallbacks[col] = mapping.get('nan', 0)

    # 3. Train Model
    print(f"\nTraining RandomForestClassifier(n_estimators=200, class_weight='balanced', random_state=42)...")
    t0 = time.time()
    rf = RandomForestClassifier(
        n_estimators=200,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    fit_duration = time.time() - t0
    print(f"Model trained in {fit_duration:.2f}s")

    # 4. Verify test accuracy
    test_preds = rf.predict(X_test)
    test_acc = float(accuracy_score(y_test, test_preds))
    print(f"Verified Test Accuracy: {test_acc:.4f} ({test_acc * 100:.2f}%)")

    # 5. Extract sample test cases for classes 0, 1, 2, 3 for immediate website testing
    sample_inputs = {}
    label_names = {
        0: "Normal",
        1: "Warning",
        2: "Leak Suspected",
        3: "Confirmed Leak"
    }
    risk_levels = {
        0: "Low",
        1: "Moderate",
        2: "High",
        3: "Critical"
    }

    # Extract one clear example of each class from test set
    for target_class in [0, 1, 2, 3]:
        matching = test_df[test_df[target_col] == target_class]
        if not matching.empty:
            sample_row = matching.iloc[0]
            # Convert to dictionary with original features
            sample_dict = {
                k: (int(v) if isinstance(v, (np.integer, int))
                    else (round(float(v), 4) if isinstance(v, (np.floating, float)) else str(v)))
                for k, v in sample_row.items()
                if k not in cols_to_drop and k != target_col and pd.notnull(v)
            }
            sample_inputs[label_names[target_class]] = sample_dict

    # 6. Save Model to Joblib
    model_path = os.path.join(artifacts_dir, "leak_detector_model.joblib")
    print(f"\nSaving model to '{model_path}'...")
    joblib.dump(rf, model_path)

    # 7. Save Metadata JSON
    metadata = {
        "model_type": "RandomForestClassifier",
        "n_estimators": 200,
        "class_weight": "balanced",
        "test_accuracy": round(test_acc, 4),
        "target_column": target_col,
        "label_names": {str(k): v for k, v in label_names.items()},
        "risk_levels": {str(k): v for k, v in risk_levels.items()},
        "feature_order": feature_order,
        "numeric_features": numeric_cols,
        "categorical_features": categorical_cols,
        "numeric_medians": numeric_medians,
        "categorical_mappings": categorical_mappings,
        "categorical_fallbacks": categorical_fallbacks,
        "sample_inputs": sample_inputs
    }

    metadata_path = os.path.join(artifacts_dir, "model_metadata.json")
    print(f"Saving metadata to '{metadata_path}'...")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nModel artifacts successfully generated in '{artifacts_dir}/':")
    print(f"  - {model_path} ({os.path.getsize(model_path) / 1024 / 1024:.2f} MB)")
    print(f"  - {metadata_path} ({os.path.getsize(metadata_path) / 1024:.2f} KB)")
    print("=" * 75)

if __name__ == "__main__":
    export()
