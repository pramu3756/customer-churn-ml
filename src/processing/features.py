import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create business-oriented features without using the target."""
    X = df.copy()

    if {"TotalCharges", "MonthlyCharges", "tenure"}.issubset(X.columns):
        X["TotalCharges"] = pd.to_numeric(X["TotalCharges"], errors="coerce")
        X["ChargeRatio"] = X["TotalCharges"] / (
            X["MonthlyCharges"] * (X["tenure"] + 1)
        )
        X["MonthlyChargePerTenure"] = (
            X["MonthlyCharges"] / (X["tenure"] + 1)
        )
    else:
        X["ChargeRatio"] = 1.0
        X["MonthlyChargePerTenure"] = 0.0

    streaming_cols = [
        c for c in ["StreamingTV", "StreamingMovies"] if c in X.columns
    ]
    X["StreamingCount"] = (
        (X[streaming_cols] == "Yes").sum(axis=1)
        if streaming_cols else 0
    )

    if "tenure" in X.columns:
        X["TenureGroup"] = pd.cut(
            X["tenure"],
            bins=[-1, 6, 12, 24, 48, float("inf")],
            labels=["0-6", "7-12", "13-24", "25-48", "49+"]
        ).astype(object)

    return X


def get_preprocessor(numeric_features: list, categorical_features: list) -> ColumnTransformer:
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    return ColumnTransformer(
        transformers=[
            ("num", num_pipeline, numeric_features),
            ("cat", cat_pipeline, categorical_features)
        ],
        remainder="drop"
    )
