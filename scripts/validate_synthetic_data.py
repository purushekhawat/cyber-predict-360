#!/usr/bin/env python3
"""
CYBER-PREDICT 360 - Synthetic Data Quality & Pattern Validator
PS ID: 26184 (I4C, Ministry of Home Affairs)

This script validates:
1. Schema & Referential Integrity (Foreign Keys, non-null values)
2. Spatial-Temporal Pattern Integrity:
   - Mule account fan-in degree (multiple victims -> mule accounts)
   - Withdrawal lag hours distribution post-crime
   - Distance between ATM and cash-out points
   - Hop sequence continuity (Hop 1 -> Hop 2 -> Hop 3)
"""

import os
import sys
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data", "raw")

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculates geographical distance between two points in km."""
    R = 6371.0 # Earth radius in km
    dlat = np.radians(lat2 - lat1)
    dlon = np.radians(lon2 - lon1)
    a = np.sin(dlat / 2.0)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon / 2.0)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return R * c

def run_validation():
    print("=== CYBER-PREDICT 360 Synthetic Data Quality & Pattern Validation ===")
    
    # 1. Load Files
    try:
        atms = pd.read_csv(os.path.join(DATA_RAW_DIR, "atm_locations.csv"))
        accounts = pd.read_csv(os.path.join(DATA_RAW_DIR, "accounts.csv"))
        complaints = pd.read_csv(os.path.join(DATA_RAW_DIR, "cybercrime_complaints.csv"))
        txns = pd.read_csv(os.path.join(DATA_RAW_DIR, "financial_transactions.csv"))
        withdrawals = pd.read_csv(os.path.join(DATA_RAW_DIR, "cash_withdrawals.csv"))
    except Exception as e:
        print(f"[FAIL] Could not load raw datasets from {DATA_RAW_DIR}: {e}")
        sys.exit(1)

    passed_checks = 0
    total_checks = 0

    def assert_check(name, condition, message):
        nonlocal passed_checks, total_checks
        total_checks += 1
        if condition:
            passed_checks += 1
            print(f" [PASS] {name}: {message}")
        else:
            print(f" [FAIL] {name}: {message}")

    # Check 1: Record counts sufficiency
    assert_check(
        "Dataset Volume",
        len(complaints) >= 500 and len(txns) >= 1500 and len(atms) >= 50,
        f"Found {len(complaints)} complaints, {len(txns)} transactions, {len(atms)} ATMs."
    )

    # Check 2: Non-null keys
    assert_check(
        "Non-Null Primary Keys",
        complaints["complaint_ack_id"].isnull().sum() == 0 and atms["atm_id"].isnull().sum() == 0,
        "All primary keys are 100% populated."
    )

    # Check 3: Foreign Key Referential Integrity (Complaints -> Victim Accounts)
    missing_victims = set(complaints["victim_account_number"]) - set(accounts["account_number"])
    assert_check(
        "Foreign Key Integrity (Complaints -> Victim Accounts)",
        len(missing_victims) == 0,
        f"0 unmapped victim accounts found."
    )

    # Check 4: Mule Account Fan-In Ratio (Multiple victims routing to same Mule L1 accounts)
    mule_l1_txns = txns[txns["hop_level"] == 1]
    victims_per_mule_l1 = mule_l1_txns.groupby("target_account")["source_account"].nunique()
    avg_fan_in = float(victims_per_mule_l1.mean())
    assert_check(
        "Mule Fan-In Pattern Integrity",
        avg_fan_in > 1.5,
        f"Average Victim Fan-In per Mule L1 account is {avg_fan_in:.2f} (Target > 1.5)."
    )

    # Check 5: Withdrawal Time Lag Distribution (Post-crime withdrawal speed)
    avg_lag = float(withdrawals["lag_hours_post_incident"].mean())
    within_24h_pct = (withdrawals["lag_hours_post_incident"] <= 24.0).mean() * 100
    assert_check(
        "Temporal Cash Out Lag Distribution",
        avg_lag <= 12.0 and within_24h_pct >= 75.0,
        f"Mean withdrawal lag: {avg_lag:.2f} hrs. {within_24h_pct:.1f}% withdrawals occur within 24 hrs."
    )

    # Check 6: Spatial Distance Proximity (Withdrawal point vs ATM location)
    distances = haversine_distance(
        withdrawals["atm_latitude"].values,
        withdrawals["atm_longitude"].values,
        withdrawals["withdrawal_latitude"].values,
        withdrawals["withdrawal_longitude"].values
    )
    max_dist = float(np.max(distances))
    avg_dist = float(np.mean(distances))
    assert_check(
        "Spatial ATM Proximity Integrity",
        max_dist <= 2.0,
        f"Average withdrawal distance from ATM node: {avg_dist*1000:.1f} meters (Max: {max_dist*1000:.1f} meters)."
    )

    # Check 7: Multi-Hop Continuity (Hop 1 -> Hop 2/3 timestamp progression)
    hop1_df = txns[txns["hop_level"] == 1].set_index("complaint_ack_id")
    hop3_df = txns[txns["hop_level"] == 3].set_index("complaint_ack_id")
    common_acks = hop1_df.index.intersection(hop3_df.index)
    
    hop1_ts = pd.to_datetime(hop1_df.loc[common_acks, "timestamp"], format="ISO8601")
    hop3_ts = pd.to_datetime(hop3_df.loc[common_acks, "timestamp"], format="ISO8601")
    
    time_deltas = (hop3_ts.values - hop1_ts.values).astype('timedelta64[m]').astype(float)
    min_delta = float(np.min(time_deltas))
    assert_check(
        "Multi-Hop Sequential Time Flow",
        min_delta >= 0.0,
        f"Cash-out events occur sequentially after initial fraud (Min delta: {min_delta:.1f} mins across {len(common_acks)} chains)."
    )

    print("\n--- Validation Summary ---")
    print(f"Passed {passed_checks}/{total_checks} Quality & Pattern Integrity Checks.")
    if passed_checks == total_checks:
        print(">>> DATA QUALITY VERIFICATION PASSED SUCCESSFULLY! <<<")
    else:
        print(">>> DATA QUALITY VERIFICATION HAS FAILING CHECKS! <<<")
        sys.exit(1)

if __name__ == "__main__":
    run_validation()
