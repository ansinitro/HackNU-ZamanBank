# ...existing code...
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import FinancialTransaction, FinancialTransactionType, FinancialAim, BankAccount
from routes.user_routes import get_current_user

router = APIRouter(prefix="/financial-transaction", tags=["Financial Transactions"])

# Pydantic models
class TransactionBase(BaseModel):
    amount: float
    transaction_type: FinancialTransactionType

class FinancialTransactionCreate(TransactionBase):
    aim_id: int

class FinancialTransactionUpdate(BaseModel):
    amount: Optional[float]
    transaction_type: Optional[FinancialTransactionType]

class FinancialTransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    bank_account_id: int
    aim_id: int

    class Config:
        orm_mode = True

@router.post("/", response_model=FinancialTransactionResponse)
async def create_financial_transaction(
    transaction: FinancialTransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Load user's bank account
    result = await db.execute(
        select(BankAccount).where(BankAccount.user_id == current_user.id)
    )
    bank_account = result.scalar_one_or_none()
    if not bank_account:
        raise HTTPException(status_code=404, detail="Bank account not found")

    # Load financial aim (belongs to current user)
    result = await db.execute(
        select(FinancialAim).where(
            FinancialAim.id == transaction.aim_id,
            FinancialAim.user_id == current_user.id
        )
    )
    aim = result.scalar_one_or_none()
    if not aim:
        raise HTTPException(status_code=404, detail="Financial aim not found")

    # Basic validation
    if transaction.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")

    # Apply transaction: deposit = move from bank -> aim, withdrawal = move from aim -> bank
    if transaction.transaction_type == FinancialTransactionType.DEPOSIT:
        if bank_account.balance < transaction.amount:
            raise HTTPException(status_code=400, detail="Insufficient funds in bank account")
        bank_account.balance -= transaction.amount
        aim.current_amount += transaction.amount

    elif transaction.transaction_type == FinancialTransactionType.WITHDRAWAL:
        if aim.current_amount < transaction.amount:
            raise HTTPException(status_code=400, detail="Insufficient funds in aim account")
        bank_account.balance += transaction.amount
        aim.current_amount -= transaction.amount

    else:
        raise HTTPException(status_code=400, detail="Unsupported financial transaction type")

    # Create DB record
    db_transaction = FinancialTransaction(
        amount=transaction.amount,
        transaction_type=transaction.transaction_type,
        aim_id=transaction.aim_id,
        bank_account_id=bank_account.id
    )

    db.add(db_transaction)

    # commit and refresh
    await db.commit()
    await db.refresh(db_transaction)
    # optionally refresh updated objects if needed
    await db.refresh(aim)
    await db.refresh(bank_account)

    return db_transaction

@router.get("/{aim_id}", response_model=List[FinancialTransactionResponse])
async def get_aim_transactions(
    aim_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify aim belongs to user
    result = await db.execute(
        select(FinancialAim).where(
            FinancialAim.id == aim_id,
            FinancialAim.user_id == current_user.id
        )
    )
    aim = result.scalar_one_or_none()
    if not aim:
        raise HTTPException(status_code=404, detail="Financial aim not found")

    result = await db.execute(
        select(FinancialTransaction).where(FinancialTransaction.aim_id == aim_id).order_by(FinancialTransaction.created_at.desc())
    )
    transactions = result.scalars().all()

    return transactions

@router.get("/", response_model=List[FinancialTransactionResponse])
async def get_all_user_aim_transactions(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Get all aims for the user
    result = await db.execute(select(FinancialAim).where(FinancialAim.user_id == current_user.id))
    aims = result.scalars().all()
    aim_ids = [a.id for a in aims]
    if not aim_ids:
        return []

    result = await db.execute(
        select(FinancialTransaction).where(FinancialTransaction.aim_id.in_(aim_ids)).order_by(FinancialTransaction.created_at.desc())
    )
    transactions = result.scalars().all()

    return transactions
# ...existing code...