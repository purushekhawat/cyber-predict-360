#!/usr/bin/env python3
"""
CYBER-PREDICT 360 - Synthetic Data PostGIS Ingestion CLI
PS ID: 26184 (I4C, Ministry of Home Affairs)

This script parses the generated raw synthetic CSV datasets and populates the PostGIS
database with spatial Point geometry objects.
"""

import os
import sys
import pandas as pd
from sqlalchemy import text
from app.core.database import engine, SessionLocal, Base
from app.db.models import Account, AtmLocation, CybercrimeComplaint, FinancialTransaction, CashWithdrawal

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data", "raw")

def ingest_data():
    print("--- CYBER-PREDICT 360 PostGIS Data Ingestion ---")
    
    # 1. Create Tables DDL
    print("Creating PostGIS Database Tables if not present...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Load CSVs
        atms_df = pd.read_csv(os.path.join(DATA_RAW_DIR, "atm_locations.csv"))
        accounts_df = pd.read_csv(os.path.join(DATA_RAW_DIR, "accounts.csv"))
        complaints_df = pd.read_csv(os.path.join(DATA_RAW_DIR, "cybercrime_complaints.csv"))
        txns_df = pd.read_csv(os.path.join(DATA_RAW_DIR, "financial_transactions.csv"))
        withdrawals_df = pd.read_csv(os.path.join(DATA_RAW_DIR, "cash_withdrawals.csv"))

        # Ingest Accounts
        print(f"Ingesting {len(accounts_df)} Accounts...")
        for _, row in accounts_df.iterrows():
            acc = Account(
                account_number=row["account_number"],
                account_type=row["account_type"],
                bank_name=row["bank_name"],
                holder_name=row.get("holder_name"),
                primary_hub=row.get("primary_hub"),
                risk_score=row.get("risk_score", 0.0)
            )
            db.merge(acc)

        # Ingest ATMs with PostGIS ST_SetSRID Point
        print(f"Ingesting {len(atms_df)} ATM Locations with Spatial Point Geometry...")
        for _, row in atms_df.iterrows():
            atm = AtmLocation(
                atm_id=row["atm_id"],
                bank_name=row["bank_name"],
                address=row["address"],
                city=row["city"],
                hub_name=row.get("hub_name"),
                pincode=str(row.get("pincode", "")),
                latitude=row["latitude"],
                longitude=row["longitude"],
                risk_rating=row.get("risk_rating", 0.5),
                location=f"SRID=4326;POINT({row['longitude']} {row['latitude']})"
            )
            db.merge(atm)

        # Ingest Complaints
        print(f"Ingesting {len(complaints_df)} Cybercrime Complaints...")
        for _, row in complaints_df.iterrows():
            c = CybercrimeComplaint(
                complaint_ack_id=row["complaint_ack_id"],
                crime_category=row["crime_category"],
                victim_account_number=row["victim_account_number"],
                fraudster_phone=row.get("fraudster_phone"),
                loss_amount=row["loss_amount"],
                incident_timestamp=pd.to_datetime(row["incident_timestamp"]),
                reported_timestamp=pd.to_datetime(row["reported_timestamp"]),
                origin_hub=row.get("origin_hub"),
                latitude=row.get("latitude"),
                longitude=row.get("longitude"),
                complaint_location=f"SRID=4326;POINT({row['longitude']} {row['latitude']})" if pd.notnull(row.get("longitude")) else None,
                status=row.get("status", "REGISTERED")
            )
            db.merge(c)

        # Ingest Transactions
        print(f"Ingesting {len(txns_df)} Multi-Hop Financial Transactions...")
        for _, row in txns_df.iterrows():
            t = FinancialTransaction(
                transaction_id=row["transaction_id"],
                complaint_ack_id=row["complaint_ack_id"],
                source_account=row["source_account"],
                target_account=row["target_account"],
                amount=row["amount"],
                timestamp=pd.to_datetime(row["timestamp"]),
                hop_level=row["hop_level"],
                transaction_type=row["transaction_type"],
                status=row.get("status", "SUCCESS")
            )
            db.merge(t)

        # Ingest Cash Withdrawals
        print(f"Ingesting {len(withdrawals_df)} Cash Withdrawal Events...")
        for _, row in withdrawals_df.iterrows():
            w = CashWithdrawal(
                withdrawal_id=row["withdrawal_id"],
                transaction_id=row["transaction_id"],
                complaint_ack_id=row["complaint_ack_id"],
                atm_id=row["atm_id"],
                bank_name=row.get("bank_name"),
                amount=row["amount"],
                withdrawal_timestamp=pd.to_datetime(row["withdrawal_timestamp"]),
                lag_hours_post_incident=row["lag_hours_post_incident"],
                atm_latitude=row["atm_latitude"],
                atm_longitude=row["atm_longitude"],
                withdrawal_latitude=row["withdrawal_latitude"],
                withdrawal_longitude=row["withdrawal_longitude"],
                withdrawal_location=f"SRID=4326;POINT({row['withdrawal_longitude']} {row['withdrawal_latitude']})",
                risk_level=row.get("risk_level", "HIGH")
            )
            db.merge(w)

        db.commit()
        print(">>> PostGIS Database Ingestion Completed Successfully! <<<")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database ingestion failed: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    ingest_data()
