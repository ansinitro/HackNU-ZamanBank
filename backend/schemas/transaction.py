from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"


class TransactionBase(BaseModel):
    amount: float
    description: str
    transaction_type: TransactionType


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: Optional[float]
    description: Optional[str]
    transaction_type: Optional[TransactionType]


class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    user_id: int

    class Config:
        orm_mode = True

class TranscationGenerationRequest(BaseModel):
    user_id: int
    count: int


    

class FinancialTransactionUpdate(BaseModel):
    amount: Optional[float]
    transaction_type: Optional[TransactionType]


class FinancialTransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    bank_account_id: int

    class Config:
        orm_mode = True

