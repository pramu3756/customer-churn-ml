import pandas as pd
from src.ingestion.ingest import generate_synthetic_telco_churn_data
from src.processing.cleaner import clean_data
from src.processing.features import engineer_features


def test_data_ingestion():
    df = generate_synthetic_telco_churn_data(n_samples=50)
    assert len(df) == 50
    assert "Churn" in df.columns and "tenure" in df.columns


def test_data_cleaner():
    df = pd.DataFrame({
        "customerID": ["TEST-1"],
        "tenure": [5],
        "MonthlyCharges": [50.0],
        "TotalCharges": [" "],
        "Contract": ["Month-to-month"],
        "PaymentMethod": ["Electronic check"],
        "InternetService": ["DSL"],
        "OnlineSecurity": ["No"],
        "TechSupport": ["No"],
        "StreamingTV": ["No"],
        "StreamingMovies": ["No"],
        "Churn": ["No"]
    })
    cleaned = clean_data(df)
    assert cleaned["TotalCharges"].iloc[0] == 250.0
    assert cleaned["Churn"].iloc[0] == 0


def test_feature_engineering():
    df = pd.DataFrame({
        "tenure": [12],
        "MonthlyCharges": [50.0],
        "TotalCharges": [600.0],
        "StreamingTV": ["Yes"],
        "StreamingMovies": ["No"]
    })
    result = engineer_features(df)
    assert "ChargeRatio" in result.columns
    assert "StreamingCount" in result.columns
    assert "TenureGroup" in result.columns
    assert "MonthlyChargePerTenure" in result.columns
    assert result["StreamingCount"].iloc[0] == 1
