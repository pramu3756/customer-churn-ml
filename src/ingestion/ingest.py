import os
import numpy as np
import pandas as pd

def generate_synthetic_telco_churn_data(n_samples: int = 5000, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    customer_ids = [
        f"{np.random.randint(1000, 9999)}-{chr(np.random.randint(65, 91))}{chr(np.random.randint(65, 91))}{chr(np.random.randint(65, 91))}"
        for _ in range(n_samples)
    ]
    tenure = np.random.randint(1, 72, size=n_samples)
    monthly_charges = np.random.uniform(18.0, 118.0, size=n_samples)
    total_charges = tenure * monthly_charges * np.random.uniform(0.95, 1.05, size=n_samples)
    contract_types = np.random.choice(['Month-to-month', 'One year', 'Two year'], size=n_samples, p=[0.55, 0.25, 0.20])
    payment_methods = np.random.choice(['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'], size=n_samples)
    internet_service = np.random.choice(['DSL', 'Fiber optic', 'No'], size=n_samples, p=[0.4, 0.45, 0.15])
    online_security = np.random.choice(['Yes', 'No', 'No internet service'], size=n_samples, p=[0.35, 0.50, 0.15])
    tech_support = np.random.choice(['Yes', 'No', 'No internet service'], size=n_samples, p=[0.30, 0.55, 0.15])
    streaming_tv = np.random.choice(['Yes', 'No', 'No internet service'], size=n_samples, p=[0.40, 0.45, 0.15])
    streaming_movies = np.random.choice(['Yes', 'No', 'No internet service'], size=n_samples, p=[0.40, 0.45, 0.15])
    churn_prob = (
        (contract_types == 'Month-to-month') * 0.35 +
        (payment_methods == 'Electronic check') * 0.20 +
        (tenure < 12) * 0.25 +
        (monthly_charges > 70) * 0.20 +
        (online_security == 'No') * 0.15 +
        (tech_support == 'No') * 0.15 - 0.20
    )
    churn_prob = 1 / (1 + np.exp(-churn_prob))
    churn = (np.random.rand(n_samples) < churn_prob).astype(int)
    return pd.DataFrame({
        'customerID': customer_ids, 'tenure': tenure,
        'MonthlyCharges': np.round(monthly_charges, 2),
        'TotalCharges': np.round(total_charges, 2),
        'Contract': contract_types, 'PaymentMethod': payment_methods,
        'InternetService': internet_service, 'OnlineSecurity': online_security,
        'TechSupport': tech_support, 'StreamingTV': streaming_tv,
        'StreamingMovies': streaming_movies, 'Churn': churn
    })

if __name__ == "__main__":
    os.makedirs("data/raw", exist_ok=True)
    generate_synthetic_telco_churn_data().to_csv("data/raw/telco_churn_raw.csv", index=False)
