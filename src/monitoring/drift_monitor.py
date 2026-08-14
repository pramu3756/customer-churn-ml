import numpy as np
import pandas as pd
from scipy.stats import ks_2samp

def calculate_psi(expected: pd.Series, actual: pd.Series) -> float:
    expected_pct = expected.value_counts(normalize=True)
    actual_pct = actual.value_counts(normalize=True)
    categories = list(set(expected_pct.index).union(set(actual_pct.index)))
    expected_pct = expected_pct.reindex(categories, fill_value=1e-4)
    actual_pct = actual_pct.reindex(categories, fill_value=1e-4)
    return float(np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct)))

def run_drift_analysis(baseline_df: pd.DataFrame, live_df: pd.DataFrame, threshold_pval=0.05) -> dict:
    drift_summary, drifted_count, total_count = {}, 0, 0
    for col in baseline_df.select_dtypes(include=[np.number]).columns:
        if col in live_df.columns:
            total_count += 1
            stat, p_val = ks_2samp(baseline_df[col].dropna(), live_df[col].dropna())
            drift = p_val < threshold_pval
            drifted_count += int(drift)
            drift_summary[col] = {"type": "numeric", "test": "ks", "p_value": float(p_val), "drift": drift}
    for col in baseline_df.select_dtypes(include=['object', 'category']).columns:
        if col in live_df.columns and col != "customerID":
            total_count += 1
            psi = calculate_psi(baseline_df[col].dropna(), live_df[col].dropna())
            drift = psi > 0.20
            drifted_count += int(drift)
            drift_summary[col] = {"type": "categorical", "test": "psi", "psi_value": float(psi), "drift": drift}
    ratio = drifted_count / max(total_count, 1)
    return {"total_features": total_count, "drifted_features": drifted_count, "drift_ratio": round(ratio, 3),
            "retraining_required": ratio >= 0.25, "details": drift_summary}
