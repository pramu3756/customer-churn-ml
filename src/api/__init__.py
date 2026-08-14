from typing import List
from pydantic import BaseModel, Field


class CustomerData(BaseModel):
    customerID: str = Field(..., example="7590-VHVEG")
    tenure: int = Field(..., ge=0, example=12)
    MonthlyCharges: float = Field(..., ge=0, example=29.85)
    TotalCharges: float = Field(..., ge=0, example=358.20)
    Contract: str = Field(..., example="Month-to-month")
    PaymentMethod: str = Field(..., example="Electronic check")
    InternetService: str = Field(..., example="DSL")
    OnlineSecurity: str = Field(..., example="No")
    TechSupport: str = Field(..., example="No")
    StreamingTV: str = Field(..., example="No")
    StreamingMovies: str = Field(..., example="No")


class ChurnResponse(BaseModel):
    customer_id: str
    churn_probability: float
    churn_risk_tier: str
    top_risk_factors: List[str]
    retention_action: str


class HealthResponse(BaseModel):
    status: str
    model_version: str
