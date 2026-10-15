from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.core.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String(100), unique=True, nullable=False, index=True)
    account_type = Column(String(50), nullable=False) # VICTIM, MULE_L1, MULE_L2, KINGPIN
    bank_name = Column(String(100), nullable=False)
    holder_name = Column(String(150))
    primary_hub = Column(String(100))
    risk_score = Column(Numeric(5, 4), default=0.0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class AtmLocation(Base):
    __tablename__ = "atm_locations"

    id = Column(Integer, primary_key=True, index=True)
    atm_id = Column(String(50), unique=True, nullable=False, index=True)
    bank_name = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    hub_name = Column(String(100))
    pincode = Column(String(10))
    latitude = Column(Numeric(10, 6), nullable=False)
    longitude = Column(Numeric(10, 6), nullable=False)
    risk_rating = Column(Numeric(5, 4), default=0.50)
    location = Column(Geometry(geometry_type='POINT', srid=4326))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class CybercrimeComplaint(Base):
    __tablename__ = "cybercrime_complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_ack_id = Column(String(100), unique=True, nullable=False, index=True)
    crime_category = Column(String(100), nullable=False)
    victim_account_number = Column(String(100), ForeignKey("accounts.account_number"))
    fraudster_phone = Column(String(50))
    loss_amount = Column(Numeric(12, 2), nullable=False)
    incident_timestamp = Column(DateTime(timezone=True), nullable=False)
    reported_timestamp = Column(DateTime(timezone=True), default=datetime.utcnow)
    origin_hub = Column(String(100))
    latitude = Column(Numeric(10, 6))
    longitude = Column(Numeric(10, 6))
    complaint_location = Column(Geometry(geometry_type='POINT', srid=4326))
    status = Column(String(50), default='REGISTERED')

    transactions = relationship("FinancialTransaction", back_populates="complaint")

class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(100), unique=True, nullable=False, index=True)
    complaint_ack_id = Column(String(100), ForeignKey("cybercrime_complaints.complaint_ack_id"))
    source_account = Column(String(100), nullable=False, index=True)
    target_account = Column(String(100), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    hop_level = Column(Integer, nullable=False)
    transaction_type = Column(String(50), nullable=False)
    status = Column(String(50), default='SUCCESS')

    complaint = relationship("CybercrimeComplaint", back_populates="transactions")

class CashWithdrawal(Base):
    __tablename__ = "cash_withdrawals"

    id = Column(Integer, primary_key=True, index=True)
    withdrawal_id = Column(String(100), unique=True, nullable=False, index=True)
    transaction_id = Column(String(100), ForeignKey("financial_transactions.transaction_id"))
    complaint_ack_id = Column(String(100), ForeignKey("cybercrime_complaints.complaint_ack_id"))
    atm_id = Column(String(50), ForeignKey("atm_locations.atm_id"))
    bank_name = Column(String(100))
    amount = Column(Numeric(12, 2), nullable=False)
    withdrawal_timestamp = Column(DateTime(timezone=True), nullable=False)
    lag_hours_post_incident = Column(Numeric(8, 2), nullable=False)
    atm_latitude = Column(Numeric(10, 6), nullable=False)
    atm_longitude = Column(Numeric(10, 6), nullable=False)
    withdrawal_latitude = Column(Numeric(10, 6), nullable=False)
    withdrawal_longitude = Column(Numeric(10, 6), nullable=False)
    withdrawal_location = Column(Geometry(geometry_type='POINT', srid=4326))
    risk_level = Column(String(20), default='HIGH')
