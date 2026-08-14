import pandas as pd


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans raw dataset, handles missing values and data type conversions."""
    df = df.copy()
    if 'TotalCharges' in df.columns:
        df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
        df['TotalCharges'] = df['TotalCharges'].fillna(df['MonthlyCharges'] * df['tenure'])
    return df
