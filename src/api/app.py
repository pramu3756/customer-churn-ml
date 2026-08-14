import json
import os
from functools import lru_cache

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from src.api.schemas import ChurnResponse, CustomerData, HealthResponse
from src.explainability.shap_explainer import get_top_risk_factors
from src.processing.features import engineer_features


app = FastAPI(
    title="Customer Retention & Churn Scoring API",
    version="2.0.0",
    description="End-to-end customer churn prediction with customer-specific SHAP explanations."
)


# ============================================================
# CORS CONFIGURATION
# Allows the React/Vite frontend to communicate with FastAPI
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# MODEL ARTIFACTS
# ============================================================

ARTIFACT_DIR = os.environ.get("ARTIFACT_DIR", "artifacts")


@lru_cache(maxsize=1)
def get_artifacts():

    model_path = os.path.join(
        ARTIFACT_DIR,
        "churn_model.joblib"
    )

    preprocessor_path = os.path.join(
        ARTIFACT_DIR,
        "preprocessor.joblib"
    )

    metadata_path = os.path.join(
        ARTIFACT_DIR,
        "model_metadata.json"
    )

    if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
        raise FileNotFoundError(
            "Model artifacts not found. "
            "Add the CSV to data/raw/telco_churn_raw.csv "
            "and run: python -m src.models.train"
        )

    metadata = {}

    if os.path.exists(metadata_path):
        with open(metadata_path, encoding="utf-8") as f:
            metadata = json.load(f)

    return {
        "model": joblib.load(model_path),
        "preprocessor": joblib.load(preprocessor_path),
        "metadata": metadata
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get(
    "/health",
    response_model=HealthResponse
)
def health_check():

    try:

        arts = get_artifacts()

        return HealthResponse(
            status="healthy",
            model_version=arts["metadata"].get(
                "model_name",
                "trained-model"
            )
        )

    except Exception as exc:

        return HealthResponse(
            status="model_not_ready",
            model_version=str(exc)
        )


# ============================================================
# CHURN PREDICTION
# ============================================================

@app.post(
    "/predict",
    response_model=ChurnResponse,
    status_code=status.HTTP_200_OK
)
def predict_churn(customer: CustomerData):

    try:

        # Load trained model and preprocessing pipeline
        arts = get_artifacts()

        # Convert request into DataFrame
        raw = pd.DataFrame([
            customer.model_dump(
                exclude={"customerID"}
            )
        ])

        # Feature engineering
        df_fe = engineer_features(raw)

        # Preprocess
        df_proc = arts["preprocessor"].transform(df_fe)

        # Model prediction
        model = arts["model"]

        probability = float(
            model.predict_proba(df_proc)[0, 1]
        )

        # ====================================================
        # RISK TIER
        # ====================================================

        if probability >= 0.70:

            tier = "HIGH"

            action = (
                "Prioritize retention outreach, "
                "offer a targeted incentive, "
                "and schedule support follow-up."
            )

        elif probability >= 0.40:

            tier = "MEDIUM"

            action = (
                "Send a targeted service offer "
                "and proactive support follow-up."
            )

        else:

            tier = "LOW"

            action = (
                "Continue standard loyalty "
                "and engagement activity."
            )

        # ====================================================
        # SHAP RISK FACTORS
        # ====================================================

        factors = get_top_risk_factors(
            model,
            arts["preprocessor"],
            df_fe,
            top_n=3
        )

        factor_text = [
            f"{item['feature']} ({item['direction']})"
            for item in factors
        ]

        # ====================================================
        # RESPONSE
        # ====================================================

        return ChurnResponse(

            customer_id=customer.customerID,

            churn_probability=round(
                probability,
                4
            ),

            churn_risk_tier=tier,

            top_risk_factors=factor_text,

            retention_action=action
        )

    except FileNotFoundError as exc:

        raise HTTPException(
            status_code=503,
            detail=str(exc)
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )