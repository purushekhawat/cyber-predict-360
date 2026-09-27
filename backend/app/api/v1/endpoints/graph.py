from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from app.db.neo4j_client import graph_engine
from app.services.graph_service import graph_service

router = APIRouter()

@router.get("/complaint/{ack_id}", summary="Retrieve 8-Node Financial Relationship Graph for Complaint")
def get_complaint_graph(ack_id: str) -> Dict[str, Any]:
    """
    Returns 8 Node Types (Complaint, Victim, Account, Transaction, Device, UpiId, ATM, Location)
    and 6 Relationship Types for visual network money trail modeling.
    """
    try:
        return graph_engine.get_complaint_financial_graph(ack_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph retrieval error: {str(e)}")

@router.get("/account/{account_number}", summary="Retrieve Graph-Derived Risk Analytics for Account")
def get_account_graph_analytics(account_number: str) -> Dict[str, Any]:
    """
    Returns graph-derived features (account_degree, connected_complaint_count,
    transaction_hops, connected_account_count, suspicious_cluster_indicators) using neutral terminology.
    """
    try:
        return graph_service.get_account_graph_analytics(account_number)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph analytics error: {str(e)}")
