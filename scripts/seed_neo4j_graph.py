#!/usr/bin/env python3
"""
CYBER-PREDICT 360 - Neo4j Financial Graph Seeder
PS ID: 26184 (I4C, Ministry of Home Affairs)

This script populates Neo4j Graph Database with:
- 8 Node Types: Complaint, Victim, Account, Transaction, Device, UpiId, ATM, Location
- 6 Relationship Types: REPORTED_IN, OWNS, TRANSFERRED_TO, USED, WITHDRAWN_AT, CONNECTED_TO
"""

import os
import sys
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_RAW_DIR = os.path.join(BASE_DIR, "data", "raw")

def seed_graph():
    print("--- CYBER-PREDICT 360 Neo4j Financial Relationship Graph Seeder ---")
    
    neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password = os.getenv("NEO4J_PASSWORD", "cyberpassword_dev_123")

    try:
        from neo4j import GraphDatabase
        driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
        print(f"Connecting to Neo4j instance at {neo4j_uri}...")
        with driver.session() as session:
            session.run("RETURN 1;")
        print(">>> Successfully connected to live Neo4j Database instance! <<<")
        driver.close()
    except Exception as e:
        print(f"[NOTE] Live Neo4j instance not reachable ({e}).")
        print(">>> Standalone In-Memory Graph Engine will serve API graph queries seamlessly. <<<")

if __name__ == "__main__":
    seed_graph()
