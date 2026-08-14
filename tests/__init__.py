import pandas as pd
from src.ingestion.ingest import generate_synthetic_telco_churn_data
from src.processing.cleaner import clean_data
from src.processing.features import engineer_features


def test_data_ingestion():
    df = generate_synthetic_telco_churn_data(n_samples=50)
    assert len(df) == 50
    assert 'Churn' in df.columns
    assert 'tenure' in df.columns


def test_data_cleaner():
    df = pd.DataFrame({
        'tenure': [5],
        'MonthlyCharges': [50.0],
        'TotalCharges': [" "]  # Whitespace coercion test
    })
    cleaned = clean_data(df)
    assert cleaned['TotalCharges'].iloc[0] == 250.0


def test_feature_engineering():
    df = pd.DataFrame({
        'tenure': [12],
        'MonthlyCharges': [50.0],
        'TotalCharges': [600.0],
        'StreamingTV': ['Yes'],
        'StreamingMovies': ['No']
    })
    res = engineer_features(df)
    assert 'ChargeRatio' in res.columns
    assert 'StreamingCount' in res.columns
    assert res['StreamingCount'].iloc[0] == 1
