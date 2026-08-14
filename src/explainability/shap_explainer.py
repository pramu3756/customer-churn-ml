import numpy as np
import shap


def _readable_name(name: str) -> str:
    replacements = {
        "num__MonthlyCharges": "Monthly Charges",
        "num__TotalCharges": "Total Charges",
        "num__tenure": "Customer Tenure",
        "num__ChargeRatio": "Charge Ratio",
        "num__StreamingCount": "Streaming Services",
        "num__MonthlyChargePerTenure": "Monthly Charge per Tenure",

        "cat__Contract_": "Contract: ",
        "cat__PaymentMethod_": "Payment Method: ",
        "cat__InternetService_": "Internet Service: ",
        "cat__OnlineSecurity_": "Online Security: ",
        "cat__TechSupport_": "Technical Support: ",
        "cat__StreamingTV_": "Streaming TV: ",
        "cat__StreamingMovies_": "Streaming Movies: ",
        "cat__TenureGroup_": "Tenure Group: ",
    }

    for prefix, replacement in replacements.items():
        if name.startswith(prefix):
            return name.replace(prefix, replacement, 1)

    return name.replace("num__", "").replace("cat__", "")


def get_top_risk_factors(
    model,
    preprocessor,
    input_data,
    top_n=3
):
    """
    Generate customer-specific SHAP explanations
    for the trained Logistic Regression model.
    """

    # Transform customer input
    processed_data = preprocessor.transform(input_data)

    # Convert sparse matrix to dense
    if hasattr(processed_data, "toarray"):
        X = processed_data.toarray()
    else:
        X = np.asarray(processed_data)

    # Get feature names
    feature_names = preprocessor.get_feature_names_out()

    # Use zero baseline
    background = np.zeros(
        (1, X.shape[1]),
        dtype=float
    )

    # SHAP LinearExplainer
    explainer = shap.LinearExplainer(
        model,
        background
    )

    explanation = explainer(X)

    values = np.asarray(
        explanation.values
    )

    # Handle binary classification
    if values.ndim == 3:
        values = values[:, :, 1]

    if values.ndim == 1:
        values = values.reshape(1, -1)

    customer_values = values[0]

    # Collect SHAP factors
    candidates = []

    for i, value in enumerate(customer_values):

        value = float(value)

        if not np.isfinite(value):
            continue

        if abs(value) < 0.000001:
            continue

        candidates.append({
            "name": _readable_name(
                str(feature_names[i])
            ),
            "value": value,
            "impact": abs(value)
        })

    # Strongest factors first
    candidates.sort(
        key=lambda x: x["impact"],
        reverse=True
    )

    # Remove duplicate groups
    selected = []
    seen_groups = set()

    for item in candidates:

        name = item["name"]

        if ": " in name:
            group = name.split(
                ": ",
                1
            )[0]
        else:
            group = name

        if group in seen_groups:
            continue

        seen_groups.add(group)
        selected.append(item)

        if len(selected) >= top_n:
            break

    # Create API response
    factors = []

    for item in selected:

        if item["value"] > 0:
            direction = "increases churn risk"
        else:
            direction = "reduces churn risk"

        factors.append({
            "feature": item["name"],
            "impact": round(
                item["impact"],
                4
            ),
            "direction": direction
        })

    return factors