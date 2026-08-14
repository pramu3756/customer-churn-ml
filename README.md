# Customer Retention & Churn Prediction System

An end-to-end Machine Learning application that predicts customer churn probability, classifies customers into risk tiers, identifies the main churn risk factors using SHAP explainability, and provides targeted customer retention recommendations.

## 🚀 Features

- Customer churn probability prediction
- Low, Medium, and High churn risk classification
- Multiple ML model comparison
- Logistic Regression, Random Forest, and Gradient Boosting
- Customer-specific SHAP explanations
- Top churn risk factors
- Retention recommendations
- FastAPI REST API
- Interactive React frontend
- Automated API and ML pipeline tests
- Data leakage prevention
- Feature engineering and preprocessing pipeline

## 🧠 Machine Learning Workflow

The project follows an end-to-end ML pipeline:

1. Data ingestion
2. Data cleaning
3. Column standardization
4. Leakage-column removal
5. Feature engineering
6. Train/test split
7. Data preprocessing
8. Model training
9. Model comparison
10. Model selection
11. SHAP explainability
12. API deployment
13. React frontend integration

## 🤖 Models

The following classification models were evaluated:

| Model | F1 Score | ROC-AUC |
|---|---:|---:|
| Logistic Regression | 0.6282 | 0.8446 |
| Random Forest | 0.5598 | 0.8163 |
| Gradient Boosting | 0.5714 | 0.8419 |

### Best Model

**Logistic Regression**

- F1 Score: **0.6282**
- ROC-AUC: **0.8446**
- Accuracy: **0.7488**

The model was selected based on its overall predictive performance and ROC-AUC.

## 🔍 Explainable AI

SHAP is used to provide customer-specific explanations for predictions.

Example:

- Contract: Month-to-month → increases churn risk
- Internet Service: DSL → reduces churn risk
- Streaming Services → reduces churn risk

This makes the prediction more interpretable and useful for customer retention teams.

## ⚙️ Technologies

### Machine Learning

- Python
- Pandas
- NumPy
- Scikit-learn
- SHAP
- Joblib

### Backend

- FastAPI
- Uvicorn
- Pydantic

### Frontend

- React
- Vite
- JavaScript
- CSS

### Testing

- Pytest
- FastAPI TestClient

## 📁 Project Structure

```text
customer-churn-ml/
│
├── data/
│   └── raw/
│       └── telco_churn_raw.csv
│
├── artifacts/
│   ├── churn_model.joblib
│   ├── preprocessor.joblib
│   └── model_metadata.json
│
├── src/
│   ├── api/
│   ├── models/
│   ├── processing/
│   └── explainability/
│
├── tests/
│   ├── test_api.py
│   └── test_pipeline.py
│
├── frontend/
│
├── requirements.txt
└── README.md