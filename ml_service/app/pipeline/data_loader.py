import os
from typing import Dict
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data", "raw")

class SyntheticDataLoader:
    """Loads synthetic raw CSV datasets into Pandas DataFrames for ML feature processing."""

    def __init__(self, data_dir: str = DATA_RAW_DIR):
        self.data_dir = data_dir

    def load_all(self) -> Dict[str, pd.DataFrame]:
        return {
            "atms": self.load_atms(),
            "accounts": self.load_accounts(),
            "complaints": self.load_complaints(),
            "transactions": self.load_transactions(),
            "withdrawals": self.load_withdrawals(),
        }

    def load_atms(self) -> pd.DataFrame:
        filepath = os.path.join(self.data_dir, "atm_locations.csv")
        return pd.read_csv(filepath) if os.path.exists(filepath) else pd.DataFrame()

    def load_accounts(self) -> pd.DataFrame:
        filepath = os.path.join(self.data_dir, "accounts.csv")
        return pd.read_csv(filepath) if os.path.exists(filepath) else pd.DataFrame()

    def load_complaints(self) -> pd.DataFrame:
        filepath = os.path.join(self.data_dir, "cybercrime_complaints.csv")
        return pd.read_csv(filepath) if os.path.exists(filepath) else pd.DataFrame()

    def load_transactions(self) -> pd.DataFrame:
        filepath = os.path.join(self.data_dir, "financial_transactions.csv")
        return pd.read_csv(filepath) if os.path.exists(filepath) else pd.DataFrame()

    def load_withdrawals(self) -> pd.DataFrame:
        filepath = os.path.join(self.data_dir, "cash_withdrawals.csv")
        return pd.read_csv(filepath) if os.path.exists(filepath) else pd.DataFrame()

data_loader = SyntheticDataLoader()
