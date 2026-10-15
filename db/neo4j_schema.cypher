// CYBER-PREDICT 360 - Neo4j Graph Database Schema & DDL Constraints
// PS ID: 26184 (I4C, Ministry of Home Affairs)

// 1. Create Unique Constraints for 8 Node Types
CREATE CONSTRAINT complaint_ack_unique IF NOT EXISTS FOR (c:Complaint) REQUIRE c.complaint_ack_id IS UNIQUE;
CREATE CONSTRAINT victim_id_unique IF NOT EXISTS FOR (v:Victim) REQUIRE v.victim_id IS UNIQUE;
CREATE CONSTRAINT account_no_unique IF NOT EXISTS FOR (a:Account) REQUIRE a.account_number IS UNIQUE;
CREATE CONSTRAINT transaction_id_unique IF NOT EXISTS FOR (t:Transaction) REQUIRE t.transaction_id IS UNIQUE;
CREATE CONSTRAINT device_id_unique IF NOT EXISTS FOR (d:Device) REQUIRE d.device_id IS UNIQUE;
CREATE CONSTRAINT upi_id_unique IF NOT EXISTS FOR (u:UpiId) REQUIRE u.upi_id IS UNIQUE;
CREATE CONSTRAINT atm_id_unique IF NOT EXISTS FOR (m:ATM) REQUIRE m.atm_id IS UNIQUE;
CREATE CONSTRAINT location_id_unique IF NOT EXISTS FOR (l:Location) REQUIRE l.location_id IS UNIQUE;

// 2. Create Search Indexes
CREATE INDEX complaint_category_idx IF NOT EXISTS FOR (c:Complaint) ON (c.crime_category);
CREATE INDEX account_type_idx IF NOT EXISTS FOR (a:Account) ON (a.account_type);
CREATE INDEX atm_hub_idx IF NOT EXISTS FOR (m:ATM) ON (m.hub_name);

// 3. Schema Reference Documentation
// Nodes: Complaint, Victim, Account, Transaction, Device, UpiId, ATM, Location
// Relationships:
//   (v:Victim)-[:REPORTED_IN]->(c:Complaint)
//   (v:Victim)-[:OWNS]->(a:Account)
//   (a1:Account)-[:TRANSFERRED_TO {amount, hop_level, timestamp}]->(a2:Account)
//   (a:Account)-[:USED]->(d:Device)
//   (a:Account)-[:CONNECTED_TO]->(u:UpiId)
//   (a:Account)-[:WITHDRAWN_AT {amount, lag_hours}]->(m:ATM)
//   (m:ATM)-[:CONNECTED_TO]->(l:Location)
