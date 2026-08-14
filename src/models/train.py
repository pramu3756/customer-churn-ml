import json
import os

import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split

from src.processing.cleaner import clean_data
from src.processing.features import engineer_features, get_preprocessor


DATA_PATH = "data/raw/telco_churn_raw.csv"
ARTIFACT_DIR = "artifacts"


def train_pipeline(data_path=DATA_PATH, artifact_dir=ARTIFACT_DIR):
    if not os.path.exists(data_path):
        raise FileNotFoundError(
            f"Dataset not found at '{data_path}'. "
            "Add your Telco churn CSV there and name it telco_churn_raw.csv."
        )

    os.makedirs(artifact_dir, exist_ok=True)
    df = clean_data(pd.read_csv(data_path))

    X = df.drop(columns=["customerID", "Churn"])
    y = df["Churn"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    X_train = engineer_features(X_train)
    X_test = engineer_features(X_test)

    numeric_cols = [
        "tenure", "MonthlyCharges", "TotalCharges",
        "ChargeRatio", "StreamingCount", "MonthlyChargePerTenure"
    ]
    categorical_cols = [
        "Contract", "PaymentMethod", "InternetService",
        "OnlineSecurity", "TechSupport", "StreamingTV",
        "StreamingMovies", "TenureGroup"
    ]

    numeric_cols = [c for c in numeric_cols if c in X_train.columns]
    categorical_cols = [c for c in categorical_cols if c in X_train.columns]

    preprocessor = get_preprocessor(numeric_cols, categorical_cols)
    X_train_proc = preprocessor.fit_transform(X_train)
    X_test_proc = preprocessor.transform(X_test)

    models = {
        "Logistic Regression": LogisticRegression(
            max_iter=2000, class_weight="balanced", random_state=42
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=300, class_weight="balanced", random_state=42, n_jobs=-1
        ),
        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=200, max_depth=3, learning_rate=0.05, random_state=42
        )
    }

    results = {}
    trained_models = {}

    print("\n" + "=" * 64)
    print("CUSTOMER CHURN MODEL COMPARISON")
    print("=" * 64)

    for name, model in models.items():
        model.fit(X_train_proc, y_train)
        y_pred = model.predict(X_test_proc)
        y_prob = model.predict_proba(X_test_proc)[:, 1]
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_prob)
        results[name] = {"f1": f1, "roc_auc": roc_auc}
        trained_models[name] = model
        print(f"{name:22s} | F1: {f1:.4f} | ROC-AUC: {roc_auc:.4f}")

    best_name = max(results, key=lambda name: results[name]["roc_auc"])
    best_model = trained_models[best_name]
    best_pred = best_model.predict(X_test_proc)

    print("\n" + "=" * 64)
    print(f"BEST MODEL: {best_name}")
    print("=" * 64)
    print(classification_report(y_test, best_pred, digits=4))

    joblib.dump(preprocessor, os.path.join(artifact_dir, "preprocessor.joblib"))
    joblib.dump(best_model, os.path.join(artifact_dir, "churn_model.joblib"))

    metadata = {
        "model_name": best_name,
        "f1_score": results[best_name]["f1"],
        "roc_auc": results[best_name]["roc_auc"],
        "numeric_features": numeric_cols,
        "categorical_features": categorical_cols,
        "feature_names": preprocessor.get_feature_names_out().tolist(),
        "training_rows": int(len(X_train)),
        "test_rows": int(len(X_test))
    }
    with open(os.path.join(artifact_dir, "model_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    os.makedirs("data/processed", exist_ok=True)
    X_train.assign(Churn=y_train.values).to_csv(
        "data/processed/baseline_train.csv", index=False
    )

    print("\nArtifacts created successfully:")
    print("  artifacts/churn_model.joblib")
    print("  artifacts/preprocessor.joblib")
    print("  artifacts/model_metadata.json")

    return best_model, preprocessor, results


if __name__ == "__main__":
    train_pipeline()
