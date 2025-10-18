from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime
from database import Base
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.sql import func
import enum

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    financial_aims = relationship("FinancialAim", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    bank_account = relationship("BankAccount", back_populates="user")

class FinancialAim(Base):
    __tablename__ = "financial_aims"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="financial_aims")
    transactions = relationship("FinancialTransaction", back_populates="aim")

class BankAccount(Base):
    __tablename__ = "bankaccounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    account_number = Column(String(34), unique=True, nullable=False)

    balance = Column(Float, nullable=False, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="bank_account")
    financial_transactions = relationship("FinancialTransaction", back_populates="bank_account")


class TransactionType(enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    user = relationship("User", back_populates="transactions")
    
# AIM Money
class FinancialTransactionType(enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"

class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    transaction_type = Column(Enum(FinancialTransactionType), nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    aim_id = Column(Integer, ForeignKey("financial_aims.id", ondelete="CASCADE"))
    bank_account_id = Column(Integer, ForeignKey("bankaccounts.id", ondelete="CASCADE"))
    
    # Fix the relationships
    aim = relationship("FinancialAim", back_populates="transactions")
    bank_account = relationship("BankAccount", back_populates="financial_transactions")