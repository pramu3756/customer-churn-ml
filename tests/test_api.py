from fastapi.testclient import TestClient
from src.api.app import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] in {"healthy", "model_not_ready"}


def test_invalid_payload_validation():
    payload = {
        "customerID": "INVALID-1",
        "tenure": -5,
        "MonthlyCharges": 50.0,
        "TotalCharges": 100.0,
        "Contract": "Month-to-month",
        "PaymentMethod": "Electronic check",
        "InternetService": "DSL",
        "OnlineSecurity": "No",
        "TechSupport": "No",
        "StreamingTV": "No",
        "StreamingMovies": "No"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422

def test_prediction_endpoint():
    payload = {
        "customerID": "TEST-001",
        "tenure": 12,
        "MonthlyCharges": 29.85,
        "TotalCharges": 358.2,
        "Contract": "Month-to-month",
        "PaymentMethod": "Electronic check",
        "InternetService": "DSL",
        "OnlineSecurity": "No",
        "TechSupport": "No",
        "StreamingTV": "No",
        "StreamingMovies": "No"
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["customer_id"] == "TEST-001"
    assert 0 <= data["churn_probability"] <= 1
    assert data["churn_risk_tier"] in {"LOW", "MEDIUM", "HIGH"}

    assert isinstance(data["top_risk_factors"], list)
    assert len(data["top_risk_factors"]) > 0

    assert isinstance(data["retention_action"], str)
    assert len(data["retention_action"]) > 0