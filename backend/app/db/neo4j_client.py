import os
from typing import Dict, List, Any
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data", "raw")

class StandaloneGraphEngine:
    """
    In-memory Graph Engine Fallback for CYBER-PREDICT 360.
    Models 8 Node Types and 6 Relationship Types from synthetic CSV datasets.
    """

    def __init__(self, data_dir: str = DATA_RAW_DIR):
        self.data_dir = data_dir

    def load_df(self, name: str) -> pd.DataFrame:
        path = os.path.join(self.data_dir, name)
        return pd.read_csv(path) if os.path.exists(path) else pd.DataFrame()

    def get_complaint_financial_graph(self, complaint_ack_id: str) -> Dict[str, Any]:
        complaints = self.load_df("cybercrime_complaints.csv")
        txns = self.load_df("financial_transactions.csv")
        withdrawals = self.load_df("cash_withdrawals.csv")
        atms = self.load_df("atm_locations.csv")

        c_row = complaints[complaints["complaint_ack_id"] == complaint_ack_id]
        if c_row.empty and not complaints.empty:
            c_row = complaints.head(1)
            complaint_ack_id = str(c_row.iloc[0]["complaint_ack_id"])

        nodes = []
        edges = []
        node_ids = set()

        def add_node(nid: str, label: str, props: dict):
            if nid not in node_ids:
                node_ids.add(nid)
                nodes.append({"id": nid, "label": label, "properties": props})

        # 1. Complaint Node
        if not c_row.empty:
            cdata = c_row.iloc[0]
            add_node(complaint_ack_id, "Complaint", {
                "ack_id": complaint_ack_id,
                "category": cdata.get("crime_category", "UPI_FRAUD"),
                "loss_amount": float(cdata.get("loss_amount", 0))
            })

            # 2. Victim Node & REPORTED_IN
            victim_acc = str(cdata.get("victim_account_number", "VIC_1001"))
            victim_id = f"VIC_{victim_acc}"
            add_node(victim_id, "Victim", {"victim_id": victim_id, "name": f"Victim ({victim_acc})"})
            add_node(victim_acc, "Account", {"account_number": victim_acc, "type": "VICTIM"})
            
            edges.append({"source": victim_id, "target": complaint_ack_id, "type": "REPORTED_IN"})
            edges.append({"source": victim_id, "target": victim_acc, "type": "OWNS"})

            # 3. Device & UPI Nodes
            dev_id = f"DEV_{victim_acc[-4:]}"
            upi_id = f"{victim_acc.lower()}@upi"
            add_node(dev_id, "Device", {"device_id": dev_id, "os": "Android/iOS"})
            add_node(upi_id, "UpiId", {"upi_id": upi_id, "handle": "upi"})
            
            edges.append({"source": victim_acc, "target": dev_id, "type": "USED"})
            edges.append({"source": victim_acc, "target": upi_id, "type": "CONNECTED_TO"})

        # 4. Multi-Hop Transactions & Mule Accounts
        c_txns = txns[txns["complaint_ack_id"] == complaint_ack_id]
        for _, row in c_txns.iterrows():
            src = str(row["source_account"])
            tgt = str(row["target_account"])
            hop = int(row["hop_level"])
            
            src_type = "MULE_L1" if hop == 2 else ("VICTIM" if hop == 1 else "MULE_L2")
            tgt_type = "MULE_L2" if hop == 2 else ("MULE_L1" if hop == 1 else "ATM_CASH_OUT")
            
            add_node(src, "Account", {"account_number": src, "type": src_type})
            add_node(tgt, "Account" if not tgt.startswith("CASH_ATM") else "ATM", {
                "account_number" if not tgt.startswith("CASH_ATM") else "atm_id": tgt,
                "type": tgt_type
            })
            
            edges.append({
                "source": src,
                "target": tgt,
                "type": "TRANSFERRED_TO" if not tgt.startswith("CASH_ATM") else "WITHDRAWN_AT",
                "amount": float(row["amount"]),
                "hop_level": hop
            })

        # 5. ATM & Location Nodes
        c_wth = withdrawals[withdrawals["complaint_ack_id"] == complaint_ack_id]
        if not c_wth.empty:
            wdata = c_wth.iloc[0]
            atm_id = str(wdata["atm_id"])
            loc_id = f"LOC_{wdata.get('city', 'DELHI')}"
            
            add_node(atm_id, "ATM", {"atm_id": atm_id, "bank": wdata.get("bank_name", "SBI")})
            add_node(loc_id, "Location", {"location_id": loc_id, "lat": float(wdata["atm_latitude"]), "lng": float(wdata["atm_longitude"])})
            
            edges.append({"source": atm_id, "target": loc_id, "type": "CONNECTED_TO"})

        return {
            "complaint_ack_id": complaint_ack_id,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "nodes": nodes,
            "edges": edges
        }

graph_engine = StandaloneGraphEngine()
