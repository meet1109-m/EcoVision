import time
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def main():
    print("=" * 80)
    print("INDUSTRIAL LEAK INCIDENT DETECTION - TRAINING & EVALUATION PIPELINE")
    print("=" * 80)

    # ---------------------------------------------------------
    # TASK 1: PREPARE FEATURES
    # ---------------------------------------------------------
    print("\n" + "-" * 80)
    print("TASK 1: PREPARE FEATURES")
    print("-" * 80)

    import os
    if os.path.exists(os.path.join("model_data", "train_data.csv")):
        dataset_dir = "model_data"
    elif os.path.exists(os.path.join("dataset", "train_data.csv")):
        dataset_dir = "dataset"
    else:
        dataset_dir = "."
    train_path = os.path.join(dataset_dir, "train_data.csv")
    test_path = os.path.join(dataset_dir, "test_data.csv")

    print(f"Loading '{train_path}' and '{test_path}'...")
    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)

    print(f"Loaded Train set: {train_df.shape[0]:,} rows, {train_df.shape[1]} columns")
    print(f"Loaded Test set:  {test_df.shape[0]:,} rows, {test_df.shape[1]} columns")

    target_col = "incident_label"
    leak_and_id_cols = [
        "risk_class", "risk_score", "leak_location", "leak_severity",
        "confirmed_by", "timestamp", "plant_id", "plant_name",
        "process_unit_id", "process_unit_name", "equipment_id", "equipment_name"
    ]

    print("\nColumns to drop (target leakage / pure identifiers / free text):")
    for col in leak_and_id_cols:
        print(f"  - {col}")

    # Drop columns
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

    print(f"\nRemaining feature count: {len(X_train.columns)}")
    print(f"Categorical features ({len(categorical_cols)}): {categorical_cols}")
    print(f"Numeric features ({len(numeric_cols)}): {numeric_cols}")

    # 1. Fill missing numeric values with column median from training data ONLY
    print("\nComputing column medians on numeric features using training data only...")
    train_medians = X_train[numeric_cols].median()

    # Verify missing counts before imputation
    train_num_nulls_before = X_train[numeric_cols].isnull().sum().sum()
    test_num_nulls_before = X_test[numeric_cols].isnull().sum().sum()
    print(f"Missing numeric entries before imputation -> Train: {train_num_nulls_before:,}, Test: {test_num_nulls_before:,}")

    X_train[numeric_cols] = X_train[numeric_cols].fillna(train_medians)
    X_test[numeric_cols] = X_test[numeric_cols].fillna(train_medians)

    train_num_nulls_after = X_train[numeric_cols].isnull().sum().sum()
    test_num_nulls_after = X_test[numeric_cols].isnull().sum().sum()
    print(f"Missing numeric entries after imputation  -> Train: {train_num_nulls_after}, Test: {test_num_nulls_after}")

    # 2. Label-encode categorical features
    print("\nLabel-encoding categorical features (fitted on train, applied to test)...")
    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        # Ensure missing values (if any) are handled uniformly as string before encoding
        X_train[col] = le.fit_transform(X_train[col].astype(str))
        X_test[col] = le.transform(X_test[col].astype(str))
        label_encoders[col] = le
        print(f"  Encoded '{col}': {len(le.classes_)} unique classes -> {list(le.classes_)}")

    # Verification: ensure zero nulls remain and shapes align
    assert X_train.isnull().sum().sum() == 0, "Null values remain in X_train!"
    assert X_test.isnull().sum().sum() == 0, "Null values remain in X_test!"
    print(f"\nFinal feature matrix shapes:")
    print(f"  X_train: {X_train.shape}, y_train: {y_train.shape}")
    print(f"  X_test:  {X_test.shape}, y_test:  {y_test.shape}")

    # ---------------------------------------------------------
    # TASK 2: TRAIN
    # ---------------------------------------------------------
    print("\n" + "-" * 80)
    print("TASK 2: TRAIN MODEL ON TRAIN DATA ONLY")
    print("-" * 80)

    rf_model = RandomForestClassifier(
        n_estimators=200,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    print(f"Initializing RandomForestClassifier with hyperparameters:")
    print(f"  - n_estimators: 200")
    print(f"  - class_weight: 'balanced'")
    print(f"  - random_state: 42")
    print(f"  - n_jobs: -1")

    print("\nFitting model on train_data ONLY...")
    t_start = time.time()
    rf_model.fit(X_train, y_train)
    fit_duration = time.time() - t_start
    print(f"Model training completed successfully in {fit_duration:.2f} seconds!")

    # ---------------------------------------------------------
    # TASK 3: EVALUATE
    # ---------------------------------------------------------
    print("\n" + "-" * 80)
    print("TASK 3: EVALUATE ON TEST DATA")
    print("-" * 80)

    print("Generating predictions on test_data.csv (never seen during training)...")
    y_pred = rf_model.predict(X_test)

    # 1. Overall Accuracy
    acc = accuracy_score(y_test, y_pred)
    print(f"\n==================================================")
    print(f"OVERALL ACCURACY: {acc:.4f} ({acc * 100:.2f}%)")
    print(f"==================================================")

    # Class definitions
    target_names = [
        "Normal (0)",
        "Warning (1)",
        "Leak Suspected (2)",
        "Confirmed Leak (3)"
    ]

    # 2. Full Classification Report
    print("\nCLASSIFICATION REPORT:")
    print("-" * 65)
    report = classification_report(y_test, y_pred, target_names=target_names, digits=4)
    print(report)

    # 3. Confusion Matrix (Rows = Actual, Cols = Predicted)
    cm = confusion_matrix(y_test, y_pred, labels=[0, 1, 2, 3])
    cm_df = pd.DataFrame(
        cm,
        index=[f"Actual {name}" for name in target_names],
        columns=[f"Pred {name}" for name in target_names]
    )
    print("CONFUSION MATRIX (Rows = Actual, Cols = Predicted):")
    print("-" * 65)
    print(cm_df.to_string())
    print("-" * 65)

    # Row-wise normalized confusion matrix (Recall / Class Accuracy)
    cm_norm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
    cm_norm_df = pd.DataFrame(
        (cm_norm * 100).round(2),
        index=[f"Actual {name}" for name in target_names],
        columns=[f"Pred {name} (%)" for name in target_names]
    )
    print("\nNORMALIZED CONFUSION MATRIX (Row Recall %):")
    print("-" * 65)
    print(cm_norm_df.to_string())
    print("-" * 65)

    # 4. Top 10 Most Important Features
    importances = rf_model.feature_importances_
    feat_importances = pd.DataFrame({
        "Feature": X_train.columns,
        "Importance": importances,
        "Importance (%)": (importances * 100).round(2)
    }).sort_values(by="Importance", ascending=False).reset_index(drop=True)

    print("\nTOP 10 MOST IMPORTANT FEATURES:")
    print("=" * 65)
    top10_df = feat_importances.head(10).copy()
    top10_df.index = range(1, 11)
    top10_df.index.name = "Rank"
    print(top10_df.to_string())
    print("=" * 65)

if __name__ == "__main__":
    main()
