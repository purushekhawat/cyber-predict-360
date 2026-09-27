-- CYBER-PREDICT 360 Database Initialization Script
-- Enable Spatial PostGIS Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 1. Accounts Table (Victims, Mule L1, Mule L2, Kingpins)
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(100) UNIQUE NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- VICTIM, MULE_L1, MULE_L2, KINGPIN
    bank_name VARCHAR(100) NOT NULL,
    holder_name VARCHAR(150),
    primary_hub VARCHAR(100),
    risk_score NUMERIC(5, 4) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ATM / Cash Withdrawal Locations
CREATE TABLE IF NOT EXISTS atm_locations (
    id SERIAL PRIMARY KEY,
    atm_id VARCHAR(50) UNIQUE NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    hub_name VARCHAR(100),
    pincode VARCHAR(10),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    risk_rating NUMERIC(5, 4) DEFAULT 0.50,
    location GEOMETRY(Point, 4326), -- Spatial point (lon, lat)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_atm_locations_spatial ON atm_locations USING GIST (location);

-- 3. Cybercrime Complaints (Synthetic NCRP Format)
CREATE TABLE IF NOT EXISTS cybercrime_complaints (
    id SERIAL PRIMARY KEY,
    complaint_ack_id VARCHAR(100) UNIQUE NOT NULL,
    crime_category VARCHAR(100) NOT NULL,
    victim_account_number VARCHAR(100) REFERENCES accounts(account_number) ON DELETE SET NULL,
    fraudster_phone VARCHAR(50),
    loss_amount NUMERIC(12, 2) NOT NULL,
    incident_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    reported_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    origin_hub VARCHAR(100),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    complaint_location GEOMETRY(Point, 4326),
    status VARCHAR(50) DEFAULT 'REGISTERED'
);

CREATE INDEX IF NOT EXISTS idx_complaints_spatial ON cybercrime_complaints USING GIST (complaint_location);

-- 4. Financial Transactions (Multi-Hop Trail)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    complaint_ack_id VARCHAR(100) REFERENCES cybercrime_complaints(complaint_ack_id) ON DELETE CASCADE,
    source_account VARCHAR(100) NOT NULL,
    target_account VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    hop_level INT NOT NULL, -- 1, 2, 3
    transaction_type VARCHAR(50) NOT NULL, -- UPI, IMPS, NEFT, ATM_CASH_WITHDRAWAL
    status VARCHAR(50) DEFAULT 'SUCCESS'
);

CREATE INDEX IF NOT EXISTS idx_transactions_complaint ON financial_transactions(complaint_ack_id);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON financial_transactions(source_account);
CREATE INDEX IF NOT EXISTS idx_transactions_target ON financial_transactions(target_account);

-- 5. Cash Withdrawal Events
CREATE TABLE IF NOT EXISTS cash_withdrawals (
    id SERIAL PRIMARY KEY,
    withdrawal_id VARCHAR(100) UNIQUE NOT NULL,
    transaction_id VARCHAR(100) REFERENCES financial_transactions(transaction_id) ON DELETE CASCADE,
    complaint_ack_id VARCHAR(100) REFERENCES cybercrime_complaints(complaint_ack_id) ON DELETE CASCADE,
    atm_id VARCHAR(50) REFERENCES atm_locations(atm_id) ON DELETE CASCADE,
    bank_name VARCHAR(100),
    amount NUMERIC(12, 2) NOT NULL,
    withdrawal_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    lag_hours_post_incident NUMERIC(8, 2) NOT NULL,
    atm_latitude NUMERIC(10, 6) NOT NULL,
    atm_longitude NUMERIC(10, 6) NOT NULL,
    withdrawal_latitude NUMERIC(10, 6) NOT NULL,
    withdrawal_longitude NUMERIC(10, 6) NOT NULL,
    withdrawal_location GEOMETRY(Point, 4326),
    risk_level VARCHAR(20) DEFAULT 'HIGH'
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_spatial ON cash_withdrawals USING GIST (withdrawal_location);
