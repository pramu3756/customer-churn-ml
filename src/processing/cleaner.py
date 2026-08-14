import pandas as pd


# ---------------------------------------------------------
# Map different dataset column names to our standard names
# ---------------------------------------------------------
COLUMN_MAPPING = {
    "CustomerID": "customerID",

    "Tenure Months": "tenure",

    "Internet Service": "InternetService",
    "Online Security": "OnlineSecurity",
    "Online Backup": "OnlineBackup",
    "Device Protection": "DeviceProtection",
    "Tech Support": "TechSupport",

    "Streaming TV": "StreamingTV",
    "Streaming Movies": "StreamingMovies",

    "Payment Method": "PaymentMethod",

    "Monthly Charges": "MonthlyCharges",
    "Total Charges": "TotalCharges",

    "Churn Label": "Churn"
}


# ---------------------------------------------------------
# Columns that must NEVER be used as ML features
# ---------------------------------------------------------
LEAKAGE_COLUMNS = [
    "Churn Value",
    "Churn Score",
    "Churn Reason"
]


# ---------------------------------------------------------
# Required columns after standardization
# ---------------------------------------------------------
REQUIRED_COLUMNS = [
    "tenure",
    "InternetService",
    "OnlineSecurity",
    "PaymentMethod",
    "StreamingMovies",
    "StreamingTV",
    "TechSupport",
    "MonthlyCharges",
    "TotalCharges",
    "Churn"
]


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean and standardize the Telco Customer Churn dataset.

    Supports datasets with column names such as:
        Tenure Months
        Internet Service
        Monthly Charges
        Churn Label

    and converts them into the standard names expected
    by the ML pipeline.
    """

    df = df.copy()

    # -----------------------------------------------------
    # 1. Clean column names
    # -----------------------------------------------------
    df.columns = (
        df.columns
        .astype(str)
        .str.strip()
    )

    print("\nOriginal columns:")
    print(df.columns.tolist())

    # -----------------------------------------------------
    # 2. Remove data leakage columns
    # -----------------------------------------------------
    leakage_found = [
        column
        for column in LEAKAGE_COLUMNS
        if column in df.columns
    ]

    if leakage_found:
        print("\nRemoving leakage columns:")
        print(leakage_found)

        df = df.drop(
            columns=leakage_found,
            errors="ignore"
        )

    # -----------------------------------------------------
    # 3. Rename columns to standard names
    # -----------------------------------------------------
    rename_map = {
        old: new
        for old, new in COLUMN_MAPPING.items()
        if old in df.columns
    }

    df = df.rename(
        columns=rename_map
    )

    print("\nStandardized columns:")
    print(df.columns.tolist())

    # -----------------------------------------------------
    # 4. Check required columns
    # -----------------------------------------------------
    missing_columns = [
        column
        for column in REQUIRED_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            "CSV is missing required columns after "
            f"standardization: {', '.join(missing_columns)}"
        )

    # -----------------------------------------------------
    # 5. Convert numeric columns
    # -----------------------------------------------------
    df["tenure"] = pd.to_numeric(
        df["tenure"],
        errors="coerce"
    )

    df["MonthlyCharges"] = pd.to_numeric(
        df["MonthlyCharges"],
        errors="coerce"
    )

    df["TotalCharges"] = pd.to_numeric(
        df["TotalCharges"],
        errors="coerce"
    )

    # -----------------------------------------------------
    # 6. Handle missing TotalCharges
    # -----------------------------------------------------
    missing_total = df["TotalCharges"].isna()

    if missing_total.any():

        df.loc[
            missing_total,
            "TotalCharges"
        ] = (
            df.loc[missing_total, "MonthlyCharges"]
            *
            df.loc[missing_total, "tenure"]
        )

    # -----------------------------------------------------
    # 7. Clean target column
    # -----------------------------------------------------
    df["Churn"] = (
        df["Churn"]
        .astype(str)
        .str.strip()
        .str.lower()
        .map({
            "yes": 1,
            "no": 0,
            "1": 1,
            "0": 0
        })
    )

    # -----------------------------------------------------
    # 8. Remove rows with invalid target
    # -----------------------------------------------------
    before = len(df)

    df = df.dropna(
        subset=["Churn"]
    )

    removed = before - len(df)

    if removed > 0:
        print(
            f"\nRemoved {removed} rows "
            "with invalid churn labels."
        )

    # -----------------------------------------------------
    # 9. Remove duplicate customers
    # -----------------------------------------------------
    if "customerID" in df.columns:

        before = len(df)

        df = df.drop_duplicates(
            subset=["customerID"]
        )

        removed = before - len(df)

        if removed > 0:
            print(
                f"Removed {removed} duplicate customers."
            )

    # -----------------------------------------------------
    # 10. Fill missing categorical values
    # -----------------------------------------------------
    categorical_columns = [
        "InternetService",
        "OnlineSecurity",
        "PaymentMethod",
        "StreamingMovies",
        "StreamingTV",
        "TechSupport"
    ]

    for column in categorical_columns:

        if column in df.columns:

            df[column] = (
                df[column]
                .fillna("Unknown")
                .astype(str)
                .str.strip()
            )

    # -----------------------------------------------------
    # 11. Remove impossible numeric values
    # -----------------------------------------------------
    df = df[
        (df["tenure"] >= 0) &
        (df["MonthlyCharges"] >= 0) &
        (df["TotalCharges"] >= 0)
    ]

    # -----------------------------------------------------
    # 12. Convert target to integer
    # -----------------------------------------------------
    df["Churn"] = df["Churn"].astype(int)

    # -----------------------------------------------------
    # 13. Final information
    # -----------------------------------------------------
    print("\nCleaning completed.")
    print(f"Final dataset shape: {df.shape}")

    print("\nChurn distribution:")
    print(
        df["Churn"]
        .value_counts()
    )

    return df