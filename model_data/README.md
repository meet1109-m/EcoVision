# Model & Dataset Package (`model_data/`)

This directory contains the self-contained package of the industrial leak incident detection model, including all training and evaluation datasets, model weights, metadata, and inference code.

---

## 1. Directory Contents

| File | Size | Description |
| :--- | :---: | :--- |
| **`leak_detector_model.joblib`** | 74.3 MB | Serialized production `RandomForestClassifier` (200 estimators, balanced class weights, **95.25% test accuracy**). |
| **`model_metadata.json`** | ~7 KB | Complete preprocessor configuration: 28-feature order, numeric medians for imputation, categorical mappings, and top feature importances. |
| **`industrial_leak_training_50k.csv`** | 16.0 MB | Full 50,000-row industrial sensor dataset with telemetry, emissions, and leak incidents. |
| **`train_data.csv`** | 12.8 MB | Stratified 80% training split (40,000 rows). |
| **`test_data.csv`** | 3.2 MB | Stratified 20% test split (10,000 rows). |
| **`predictor.py`** | ~10 KB | Standalone inference engine (`LeakIncidentPredictor`) for single and batch predictions. |
| **`train_and_evaluate.py`** | ~7 KB | Script to train the model from scratch and evaluate precision, recall, confusion matrix, and feature importances. |
| **`export_model.py`** | ~5 KB | Script to train and re-export the model weights and metadata JSON. |
| **`split_dataset.py`** | ~3 KB | Script to perform stratified train/test split from raw data. |

---

## 2. Quick Usage

### In Python:
```python
from predictor import LeakIncidentPredictor

predictor = LeakIncidentPredictor()

# Pass any sensor reading dictionary
result = predictor.predict({
    "equipment_type": "Compressor",
    "process_type": "Refining",
    "pressure_bar": 45.2,
    "temperature_c": 120.5,
    "emission_above_baseline_pct": 52.0
})

print(result["incident_label"])   # e.g. "Warning"
print(result["risk_level"])       # e.g. "Moderate"
print(result["confidence_pct"])   # e.g. "77.0%"
print(result["probabilities"])
```

### Self-Test:
```bash
python predictor.py
```
