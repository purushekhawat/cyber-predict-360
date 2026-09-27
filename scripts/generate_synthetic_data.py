#!/usr/bin/env python3
"""
CYBER-PREDICT 360 - Reproducible Synthetic Data Generator
PS ID: 26184 (I4C, Ministry of Home Affairs)

This script generates synthetic, privacy-preserving datasets with realistic
spatial, temporal, and financial transaction patterns for predictive model training.

Patterns Included:
- Multi-victim fan-in to shared mule accounts (Layer 1 & Layer 2)
- Multi-hop rapid transaction bursts (Victim -> Mule L1 -> Mule L2 -> ATM Cash Out)
- Regional spatial clustering (Delhi-NCR, Mumbai, Bengaluru, Hyderabad, Jamtara-Deoghar, Mewat, Kolkata)
- Time-of-day cash withdrawal lag distributions post-incident
- ATM historical withdrawal risk ratings
"""

import os
import random
import json
from datetime import datetime, timedelta
import numpy as np
import pandas as pd

# Set fixed random seed for 100% reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
DATA_PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

os.makedirs(DATA_RAW_DIR, exist_ok=True)
os.makedirs(DATA_PROCESSED_DIR, exist_ok=True)

# Synthetic Configuration Parameters
NUM_ATMS = 120
NUM_VICTIMS = 300
NUM_MULE_L1 = 90
NUM_MULE_L2 = 35
NUM_KINGPINS = 15
NUM_COMPLAINTS = 600

# Geographic Hub Clusters (Center Lat, Center Lng, Spread Deg)
GEO_HUBS = {
    "Delhi_NCR": (28.6139, 77.2090, 0.12),
    "Mumbai_Metro": (19.0760, 72.8777, 0.12),
    "Bengaluru_Tech": (12.9716, 77.5946, 0.10),
    "Hyderabad_Cyber": (17.3850, 78.4867, 0.10),
    "Jamtara_Deoghar": (24.2167, 86.8000, 0.20),
    "Mewat_Region": (28.0000, 77.0000, 0.18),
    "Kolkata_East": (22.5726, 88.3639, 0.12)
}

BANKS = [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", 
    "Punjab National Bank", "Canara Bank", "Bank of Baroda", "Union Bank of India"
]

CRIME_CATEGORIES = [
    ("UPI_FRAUD", 0.35),
    ("INVESTMENT_SCAM", 0.25),
    ("JOB_SCAM", 0.15),
    ("IMPERSONATION_I4C_POLICE", 0.15),
    ("CUSTOMER_CARE_PHISHING", 0.10)
]

def generate_random_point_in_hub(hub_name: str):
    center_lat, center_lng, spread = GEO_HUBS[hub_name]
    lat = center_lat + np.random.normal(0, spread * 0.4)
    lng = center_lng + np.random.normal(0, spread * 0.4)
    return round(float(lat), 6), round(float(lng), 6)

def generate_atms():
    print("Generating synthetic ATM Locations dataset...")
    atms = []
    hubs = list(GEO_HUBS.keys())
    
    for i in range(1, NUM_ATMS + 1):
        atm_id = f"ATM_{i:04d}"
        hub = hubs[i % len(hubs)]
        lat, lng = generate_random_point_in_hub(hub)
        bank = random.choice(BANKS)
        address = f"Plot {random.randint(1, 999)}, Sector {random.randint(1, 50)}, {hub.replace('_', ' ')}"
        city = hub.split("_")[0]
        pincode = f"{random.randint(11, 85)}{random.randint(100, 999)}"
        risk_rating = round(random.uniform(0.2, 0.98), 3)
        
        atms.append({
            "atm_id": atm_id,
            "bank_name": bank,
            "address": address,
            "city": city,
            "hub_name": hub,
            "pincode": pincode,
            "latitude": lat,
            "longitude": lng,
            "risk_rating": risk_rating,
            "is_active": True
        })
        
    df = pd.DataFrame(atms)
    df.to_csv(os.path.join(DATA_RAW_DIR, "atm_locations.csv"), index=False)
    return df

def generate_accounts():
    print("Generating synthetic Accounts dataset...")
    accounts = []
    
    # 1. Victim Accounts
    for i in range(1, NUM_VICTIMS + 1):
        acc_no = f"VIC_ACC_{i:04d}"
        bank = random.choice(BANKS)
        hub = random.choice(list(GEO_HUBS.keys()))
        accounts.append({
            "account_number": acc_no,
            "account_type": "VICTIM",
            "bank_name": bank,
            "holder_name": f"Victim User {i}",
            "primary_hub": hub,
            "risk_score": round(random.uniform(0.01, 0.15), 3)
        })
        
    # 2. Mule Layer 1 Accounts (Receive direct victim transfers)
    for i in range(1, NUM_MULE_L1 + 1):
        acc_no = f"MUL1_ACC_{i:04d}"
        bank = random.choice(BANKS)
        hub = random.choice(list(GEO_HUBS.keys()))
        accounts.append({
            "account_number": acc_no,
            "account_type": "MULE_L1",
            "bank_name": bank,
            "holder_name": f"Mule L1 Account {i}",
            "primary_hub": hub,
            "risk_score": round(random.uniform(0.70, 0.95), 3)
        })

    # 3. Mule Layer 2 Accounts (Aggregators / Layering)
    for i in range(1, NUM_MULE_L2 + 1):
        acc_no = f"MUL2_ACC_{i:04d}"
        bank = random.choice(BANKS)
        hub = random.choice(list(GEO_HUBS.keys()))
        accounts.append({
            "account_number": acc_no,
            "account_type": "MULE_L2",
            "bank_name": bank,
            "holder_name": f"Mule L2 Aggregator {i}",
            "primary_hub": hub,
            "risk_score": round(random.uniform(0.85, 0.99), 3)
        })

    # 4. Kingpins / Cash-Out Controllers
    for i in range(1, NUM_KINGPINS + 1):
        acc_no = f"KING_ACC_{i:04d}"
        bank = random.choice(BANKS)
        hub = random.choice(["Jamtara_Deoghar", "Mewat_Region", "Delhi_NCR"])
        accounts.append({
            "account_number": acc_no,
            "account_type": "KINGPIN",
            "bank_name": bank,
            "holder_name": f"Syndicate Controller {i}",
            "primary_hub": hub,
            "risk_score": round(random.uniform(0.92, 0.999), 3)
        })

    df = pd.DataFrame(accounts)
    df.to_csv(os.path.join(DATA_RAW_DIR, "accounts.csv"), index=False)
    return df

def generate_complaints_and_transactions(atms_df: pd.DataFrame, accounts_df: pd.DataFrame):
    print("Generating Cybercrime Complaints, Multi-Hop Transactions & Cash Withdrawals datasets...")
    
    victims = accounts_df[accounts_df["account_type"] == "VICTIM"]["account_number"].tolist()
    mules_l1 = accounts_df[accounts_df["account_type"] == "MULE_L1"]["account_number"].tolist()
    mules_l2 = accounts_df[accounts_df["account_type"] == "MULE_L2"]["account_number"].tolist()
    atms = atms_df.to_dict(orient="records")

    complaints = []
    transactions = []
    withdrawals = []

    start_date = datetime(2026, 8, 1, 0, 0, 0)
    
    categories, weights = zip(*CRIME_CATEGORIES)
    
    txn_id_counter = 100000
    withdrawal_id_counter = 50000

    for i in range(1, NUM_COMPLAINTS + 1):
        complaint_ack_id = f"ACK202609{i:05d}"
        category = random.choices(categories, weights=weights)[0]
        victim_acc = random.choice(victims)
        
        # Incident Timestamp (spread over 30 days)
        incident_ts = start_date + timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59),
            seconds=random.randint(0, 59)
        )
        
        # Reporting Lag (30 min to 12 hours)
        reporting_lag_minutes = random.randint(30, 720)
        reported_ts = incident_ts + timedelta(minutes=reporting_lag_minutes)
        
        # Loss Amount
        if category == "INVESTMENT_SCAM":
            loss_amount = float(random.randint(50000, 500000))
        elif category == "JOB_SCAM":
            loss_amount = float(random.randint(20000, 150000))
        else:
            loss_amount = float(random.randint(5000, 75000))

        # Origin spatial location of victim complaint
        hub_name = random.choice(list(GEO_HUBS.keys()))
        complaint_lat, complaint_lng = generate_random_point_in_hub(hub_name)

        fraudster_phone = f"+91-{random.randint(70000, 99999)}{random.randint(10000, 99999)}"

        complaints.append({
            "complaint_ack_id": complaint_ack_id,
            "crime_category": category,
            "victim_account_number": victim_acc,
            "fraudster_phone": fraudster_phone,
            "loss_amount": loss_amount,
            "incident_timestamp": incident_ts.isoformat(),
            "reported_timestamp": reported_ts.isoformat(),
            "origin_hub": hub_name,
            "latitude": complaint_lat,
            "longitude": complaint_lng,
            "status": "REGISTERED"
        })

        # --- MULTI-HOP TRANSACTION CHAIN GENERATION ---
        
        # Hop 1: Victim -> Mule Layer 1 (Instant within 1-15 mins of incident)
        mule_l1_acc = random.choice(mules_l1)
        txn_id_1 = f"TXN_{txn_id_counter}"
        txn_id_counter += 1
        hop1_ts = incident_ts + timedelta(minutes=random.randint(1, 15))
        
        transactions.append({
            "transaction_id": txn_id_1,
            "complaint_ack_id": complaint_ack_id,
            "source_account": victim_acc,
            "target_account": mule_l1_acc,
            "amount": loss_amount,
            "timestamp": hop1_ts.isoformat(),
            "hop_level": 1,
            "transaction_type": "UPI",
            "status": "SUCCESS"
        })

        # Hop 2 (80% probability): Mule Layer 1 -> Mule Layer 2 (Layering burst)
        final_mule_acc = mule_l1_acc
        hop2_amount = loss_amount
        if random.random() < 0.80:
            mule_l2_acc = random.choice(mules_l2)
            txn_id_2 = f"TXN_{txn_id_counter}"
            txn_id_counter += 1
            hop2_ts = hop1_ts + timedelta(minutes=random.randint(2, 35))
            
            # Splitting / commission deduction
            hop2_amount = round(loss_amount * random.uniform(0.85, 0.95), 2)
            
            transactions.append({
                "transaction_id": txn_id_2,
                "complaint_ack_id": complaint_ack_id,
                "source_account": mule_l1_acc,
                "target_account": mule_l2_acc,
                "amount": hop2_amount,
                "timestamp": hop2_ts.isoformat(),
                "hop_level": 2,
                "transaction_type": "IMPS",
                "status": "SUCCESS"
            })
            final_mule_acc = mule_l2_acc
            last_hop_ts = hop2_ts
        else:
            last_hop_ts = hop1_ts

        # --- ATM CASH WITHDRAWAL EVENT GENERATION ---
        
        # Cash Out Lag post fraud (Exponential distribution centered around 1-6 hours)
        withdrawal_lag_hours = float(np.random.exponential(scale=3.5))
        withdrawal_lag_hours = max(0.5, min(48.0, withdrawal_lag_hours)) # bounded 30 min to 48 hrs
        
        withdrawal_ts = last_hop_ts + timedelta(hours=withdrawal_lag_hours)
        
        # Pick ATM matching origin hub or high risk hub
        matching_atms = [a for a in atms if a["hub_name"] == hub_name]
        selected_atm = random.choice(matching_atms if matching_atms else atms)
        
        # Withdrawal Txn record
        txn_id_3 = f"TXN_{txn_id_counter}"
        txn_id_counter += 1
        withdrawal_amount = round(hop2_amount * random.uniform(0.90, 1.0), 2)
        
        transactions.append({
            "transaction_id": txn_id_3,
            "complaint_ack_id": complaint_ack_id,
            "source_account": final_mule_acc,
            "target_account": f"CASH_ATM_{selected_atm['atm_id']}",
            "amount": withdrawal_amount,
            "timestamp": withdrawal_ts.isoformat(),
            "hop_level": 3,
            "transaction_type": "ATM_CASH_WITHDRAWAL",
            "status": "COMPLETED"
        })

        # Cash Withdrawal Event Details
        withdrawal_id = f"WTH_{withdrawal_id_counter}"
        withdrawal_id_counter += 1
        
        # Small GPS noise offset from ATM location (~50m to 300m)
        w_lat = round(selected_atm["latitude"] + float(np.random.normal(0, 0.002)), 6)
        w_lng = round(selected_atm["longitude"] + float(np.random.normal(0, 0.002)), 6)

        withdrawals.append({
            "withdrawal_id": withdrawal_id,
            "transaction_id": txn_id_3,
            "complaint_ack_id": complaint_ack_id,
            "atm_id": selected_atm["atm_id"],
            "bank_name": selected_atm["bank_name"],
            "amount": withdrawal_amount,
            "withdrawal_timestamp": withdrawal_ts.isoformat(),
            "lag_hours_post_incident": round(withdrawal_lag_hours, 2),
            "atm_latitude": selected_atm["latitude"],
            "atm_longitude": selected_atm["longitude"],
            "withdrawal_latitude": w_lat,
            "withdrawal_longitude": w_lng,
            "risk_level": "HIGH" if withdrawal_lag_hours <= 3.0 else ("MEDIUM" if withdrawal_lag_hours <= 12.0 else "LOW")
        })

    # Save to CSV files
    pd.DataFrame(complaints).to_csv(os.path.join(DATA_RAW_DIR, "cybercrime_complaints.csv"), index=False)
    pd.DataFrame(transactions).to_csv(os.path.join(DATA_RAW_DIR, "financial_transactions.csv"), index=False)
    pd.DataFrame(withdrawals).to_csv(os.path.join(DATA_RAW_DIR, "cash_withdrawals.csv"), index=False)

    print(f"Successfully generated:")
    print(f"  - {len(complaints)} Complaints")
    print(f"  - {len(transactions)} Multi-Hop Transactions")
    print(f"  - {len(withdrawals)} Cash Withdrawals")

def main():
    print(f"--- Starting Reproducible Synthetic Data Generation (Seed={SEED}) ---")
    atms_df = generate_atms()
    accounts_df = generate_accounts()
    generate_complaints_and_transactions(atms_df, accounts_df)
    
    # Save Metadata Summary
    metadata = {
        "dataset_name": "CYBER-PREDICT 360 Synthetic Cybercrime Dataset",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "random_seed": SEED,
        "counts": {
            "atms": NUM_ATMS,
            "accounts": NUM_VICTIMS + NUM_MULE_L1 + NUM_MULE_L2 + NUM_KINGPINS,
            "complaints": NUM_COMPLAINTS,
        },
        "geographic_hubs": list(GEO_HUBS.keys()),
        "synthetic_notice": "100% Privacy-Preserving Synthetic Data for SIH Prototype PS ID 26184."
    }
    
    with open(os.path.join(DATA_RAW_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"--- Data Generation Complete! Saved datasets to {DATA_RAW_DIR} ---")

if __name__ == "__main__":
    main()
