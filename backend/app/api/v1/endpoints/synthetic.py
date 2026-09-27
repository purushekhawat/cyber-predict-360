import os
from typing import Dict, Any, List
from fastapi import APIRouter, Query
import pandas as pd

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data", "raw")

def load_df(filename: str) -> pd.DataFrame:
    filepath = os.path.join(DATA_RAW_DIR, filename)
    if os.path.exists(filepath):
        return pd.read_csv(filepath)
    return pd.DataFrame()

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

    return {
        "dataset_name": "CYBER-PREDICT 360 Synthetic Cybercrime Dataset",
        "synthetic_notice": "Privacy-preserving synthetic dataset generated with fixed seed=42.",
        "counts": {
            "total_atms": len(atms),
            "total_accounts": len(accounts),
            "total_complaints": len(complaints),
            "total_transactions": len(txns),
            "total_withdrawals": len(withdrawals),
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
