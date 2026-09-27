import os
from typing import Dict, List, Any
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data", "raw")

class GraphAnalyticsService:
    """
    Computes Graph-Derived Features & Risk Indicators from Neo4j / In-Memory Graph.
    Uses strict neutral risk terminology (e.g. 'suspicious pattern', 'fan-in indicator').
    Zero labeling of accounts as criminal.
    """

    def __init__(self, data_dir: str = DATA_RAW_DIR):
        self.data_dir = data_dir

    def load_df(self, name: str) -> pd.DataFrame:
        path = os.path.join(self.data_dir, name)
        return pd.read_csv(path) if os.path.exists(path) else pd.DataFrame()

    def get_account_graph_analytics(self, account_number: str) -> Dict[str, Any]:
        txns = self.load_df("financial_transactions.csv")
        accounts = self.load_df("accounts.csv")
        complaints = self.load_df("cybercrime_complaints.csv")

        if txns.empty:
            return {
                "account_number": account_number,
                "account_degree": 0,
                "connected_complaint_count": 0,
                "transaction_hops": 0,
                "connected_account_count": 0,
                "suspicious_cluster_indicators": ["Single Account Profile"]
            }

        # Incoming & Outgoing Edges
        in_edges = txns[txns["target_account"] == account_number]
        out_edges = txns[txns["source_account"] == account_number]

        in_degree = len(in_edges)
        out_degree = len(out_edges)
        account_degree = in_degree + out_degree

        # Distinct connected complaints
        conn_complaints = set(in_edges["complaint_ack_id"]).union(set(out_edges["complaint_ack_id"]))
        connected_complaint_count = len(conn_complaints)

        # Distinct connected accounts
        conn_accs = set(in_edges["source_account"]).union(set(out_edges["target_account"])) - {account_number}
        connected_account_count = len(conn_accs)

        # Transaction hop depth
        all_acc_txns = pd.concat([in_edges, out_edges])
        max_hops = int(all_acc_txns["hop_level"].max()) if not all_acc_txns.empty else 1

        # Neutral Risk Pattern Indicators
        indicators = []
        if connected_complaint_count >= 3:
            indicators.append(f"Multi-Victim Convergence Indicator ({connected_complaint_count} Complaints)")
        if in_degree >= 5:
            indicators.append(f"High In-Degree Fan-In Pattern (Degree: {in_degree})")
        if max_hops >= 2:
            indicators.append(f"Rapid Layering Multi-Hop Velocity ({max_hops} Hops)")
        if not indicators:
            indicators.append("Standard Low-Density Graph Pattern")

        return {
            "account_number": account_number,
            "account_degree": account_degree,
            "connected_complaint_count": connected_complaint_count,
            "transaction_hops": max_hops,
            "connected_account_count": connected_account_count,
            "suspicious_cluster_indicators": indicators,
            "risk_assessment_notice": "Neutral decision-support graph analytics. All patterns reflect statistical structure only."
        }

graph_service = GraphAnalyticsService()
