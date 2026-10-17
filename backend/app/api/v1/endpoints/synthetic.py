import os
import json
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query
import pandas as pd

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data", "raw")
DATA_PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

if not os.path.exists(DATA_RAW_DIR):
    alt_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))), "data", "raw")
    if os.path.exists(alt_dir):
        DATA_RAW_DIR = alt_dir
        DATA_PROCESSED_DIR = os.path.join(os.path.dirname(alt_dir), "processed")

def load_df(filename: str) -> pd.DataFrame:
    filepath = os.path.join(DATA_RAW_DIR, filename)
    if os.path.exists(filepath):
        return pd.read_csv(filepath)
    return pd.DataFrame()

def load_soa_intelligence() -> Dict[str, Any]:
    intel_path = os.path.join(DATA_PROCESSED_DIR, "soa_account_intelligence.json")
    if os.path.exists(intel_path):
        try:
            with open(intel_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"total_soa_files": 0, "total_transactions_indexed": 0, "total_turnover_inr": 0, "accounts": []}

@router.get("/stats", summary="Get Synthetic Dataset Overview & Statistics")
def get_synthetic_stats() -> Dict[str, Any]:
    """Returns high-level analytics on generated synthetic dataset."""
    atms = load_df("atm_locations.csv")
    accounts = load_df("accounts.csv")
    complaints = load_df("cybercrime_complaints.csv")
    txns = load_df("financial_transactions.csv")
    withdrawals = load_df("cash_withdrawals.csv")

    account_types = accounts["account_type"].value_counts().to_dict() if not accounts.empty else {}
    crime_categories = complaints["crime_category"].value_counts().to_dict() if not complaints.empty else {}

    total_loss = float(complaints["loss_amount"].sum()) if not complaints.empty else 0.0
    avg_withdrawal_lag = float(withdrawals["lag_hours_post_incident"].mean()) if not withdrawals.empty else 0.0

    soa_intel = load_soa_intelligence()

    return {
        "dataset_name": "CYBER-PREDICT 360 Unified Cybercrime & Banking Intelligence Dataset",
        "synthetic_notice": "Privacy-preserving dataset with 25 Proposed Core Banking Statements (494k+ transactions, 7.85B INR) integrated.",
        "counts": {
            "total_atms": len(atms),
            "total_accounts": len(accounts),
            "total_complaints": len(complaints),
            "total_transactions": len(txns),
            "total_withdrawals": len(withdrawals),
            "proposed_soa_accounts": soa_intel.get("total_soa_files", 0),
            "proposed_soa_transactions": soa_intel.get("total_transactions_indexed", 0),
            "proposed_soa_turnover_inr": soa_intel.get("total_turnover_inr", 0),
        },
        "metrics": {
            "total_loss_amount_inr": total_loss,
            "avg_withdrawal_lag_hours": round(avg_withdrawal_lag, 2),
            "account_breakdown": account_types,
            "category_breakdown": crime_categories,
        }
    }

@router.get("/complaints", summary="Query Synthetic Cybercrime Complaints")
def get_complaints(
    category: str = Query(None, description="Filter by crime category e.g. UPI_FRAUD"),
    limit: int = Query(20, ge=1, le=100)
) -> List[Dict[str, Any]]:
    df = load_df("cybercrime_complaints.csv")
    if df.empty:
        return []
    if category:
        df = df[df["crime_category"] == category]
    return df.head(limit).to_dict(orient="records")

@router.get("/mule-graph", summary="Query Mule Account Money Trail Network Graph")
def get_mule_graph(limit: int = Query(50, ge=10, le=200)) -> Dict[str, Any]:
    """Returns network nodes and edges for visualizing multi-hop victim-to-mule-to-ATM money flow."""
    txns = load_df("financial_transactions.csv")
    if txns.empty:
        return {"nodes": [], "edges": []}
    
    sample_txns = txns.head(limit)
    nodes = set()
    edges = []

    for _, row in sample_txns.iterrows():
        src = row["source_account"]
        tgt = row["target_account"]
        nodes.add(src)
        nodes.add(tgt)
        edges.append({
            "source": src,
            "target": tgt,
            "amount": float(row["amount"]),
            "hop": int(row["hop_level"]),
            "type": row["transaction_type"]
        })

    return {
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "nodes": [{"id": n, "label": n} for n in nodes],
        "edges": edges
    }

@router.get("/soa-analytics", summary="Get Proposed SOA Bank Statements Intelligence Overview")
def get_soa_analytics() -> Dict[str, Any]:
    """Returns overview of the 25 Proposed Core Banking Statement (SOA) files indexed."""
    intel = load_soa_intelligence()
    accounts = intel.get("accounts", [])
    
    total_debit = sum(a.get("total_debit_inr", 0) for a in accounts)
    total_credit = sum(a.get("total_credit_inr", 0) for a in accounts)
    
    return {
        "title": "Proposed SOA Core Banking Statements Intelligence",
        "description": "25 Statement of Account (SOA) CBS ledger files processed with 494k+ transactions across 8 major Indian banks.",
        "summary": {
            "total_files": intel.get("total_soa_files", len(accounts)),
            "total_transactions": intel.get("total_transactions_indexed", 0),
            "total_debit_inr": round(total_debit, 2),
            "total_credit_inr": round(total_credit, 2),
            "total_turnover_inr": intel.get("total_turnover_inr", 0),
            "average_risk_score": round(sum(a.get("risk_score", 0) for a in accounts) / max(1, len(accounts)), 3),
        },
        "top_mule_aggregators": sorted(accounts, key=lambda x: x.get("total_turnover_inr", 0), reverse=True)[:10]
    }

@router.get("/soa-accounts", summary="Query Proposed SOA Mule Accounts with Regulatory Lien Status")
def get_soa_accounts(
    account_type: Optional[str] = Query(None, description="Filter by KINGPIN, MULE_L2, or MULE_L1"),
    limit: int = Query(25, ge=1, le=100)
) -> List[Dict[str, Any]]:
    """Returns individual SOA accounts with parsed turnover, holder name, risk score, and CBS source file."""
    intel = load_soa_intelligence()
    accs = intel.get("accounts", [])
    if account_type:
        accs = [a for a in accs if a.get("account_type") == account_type]
    return accs[:limit]
