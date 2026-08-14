from typing import List
from pydantic import BaseModel, Field


class CustomerData(BaseModel):
    customerID: str = Field(..., examples=["7590-VHVEG"])
    tenure: int = Field(..., ge=0, examples=[12])
    MonthlyCharges: float = Field(..., ge=0, examples=[29.85])
    TotalCharges: float = Field(..., ge=0, examples=[358.20])
    Contract: str = Field(..., examples=["Month-to-month"])
    PaymentMethod: str = Field(..., examples=["Electronic check"])
    InternetService: str = Field(..., examples=["DSL"])
    OnlineSecurity: str = Field(..., examples=["No"])
    TechSupport: str = Field(..., examples=["No"])
    StreamingTV: str = Field(..., examples=["No"])
    StreamingMovies: str = Field(..., examples=["No"])


class ChurnResponse(BaseModel):
    customer_id: str
    churn_probability: float
    churn_risk_tier: str
    top_risk_factors: List[str]
    retention_action: str


class HealthResponse(BaseModel):
    status: str
    model_version: str
