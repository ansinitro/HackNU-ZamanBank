# routes/transaction.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.params import Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Transaction, TransactionType
from schemas.transaction import TransactionCreate, TransactionResponse, TranscationGenerationRequest
from models import User
from routes.user_routes import get_current_user
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
import requests
from datetime import date, datetime, timedelta
import random

router = APIRouter(prefix="/transactions", tags=["Transactions"])

TRANSACTION_CATEGORIES = [
    "Groceries", "Shopping", "Bills", "Entertainment",
    "Transport", "Healthcare", "Education", "Utilities",
    "Restaurant", "Travel"
]


@router.post("/generate")
async def generate_fake_transaction(data: TranscationGenerationRequest, db: AsyncSession = Depends(get_db)):
    # Query user with async session
    result = await db.execute(select(User).filter(User.id == data.user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Configuration
    X_LITELLM_API_KEY = "sk-roG3OusRr0TLCHAADks6lw"
    API_KEY = "Bearer sk-roG3OusRr0TLCHAADks6lw"
    BASE_URL = "https://openai-hub.neuraldeep.tech/v1/chat/completions"

    headers = {
        "x-litellm-api-key": f"{X_LITELLM_API_KEY}",
        "accept": "application/json",
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    # reqData = {
    #     "model": "gpt-4o-mini",
    #     "messages": [
    #         {"role": "system", "content": ""},
    #         {"role": "user",
    #          "content": f"Generate me {data.count} fake bank transactions descriptions divided by space, without anything only the descriptiions devided by whitespaces not like numbered list, without anything."}
    #     ],
    #     "temperature": 0.7
    # }
    #
    # response = requests.post(
    #     f"{BASE_URL}/engines/gpt-4o-mini/chat/completions",
    #     headers=headers,
    #     json=reqData
    # )
    #
    # if response.status_code == 200:
    #     result = response.json()
    #     response = result["choices"][0]["message"]["content"]

    # descriptions = response.split(" ")
    # if len(descriptions) < data.count:
    # description = descriptions + descriptions
    # Create fake transactions
    fake_transaction = None
    for i in range(data.count):
        # Generate random amount
        amount = round(random.uniform(10, 1000), 2)

        # Randomly choose a transaction type
        transaction_type = random.choice(
            [TransactionType.DEPOSIT, TransactionType.WITHDRAWAL, TransactionType.TRANSFER])
        category = random.choice(TRANSACTION_CATEGORIES)
        now = datetime.now()
        six_month_ago = now - timedelta(days=180)

        # Generate random created_at date
        random_created_at = six_month_ago + timedelta(
            seconds=random.randint(0, int((now - six_month_ago).total_seconds()))
        )

        # Generate random updated_at date (must be >= created_at)
        random_updated_at = random_created_at + timedelta(
            seconds=random.randint(0, int((now - random_created_at).total_seconds()))
        )

        fake_transaction = Transaction(
            amount=amount,
            description=random.choice(["Purchase",
                                       "Payment",
                                       "Fee",
                                       "Service",
                                       "Store",
                                       "Supplies",
                                       "Subscription",
                                       "Online",
                                       "Bill",
                                       "Charge"]),
            transaction_type=transaction_type,
            user_id=user.id,
            created_at=random_created_at,
            updated_at=random_updated_at
        )

        db.add(fake_transaction)

    # Commit once after all transactions are added
    await db.commit()

    # Refresh the last transaction to return it
    if fake_transaction:
        await db.refresh(fake_transaction)

    return fake_transaction


# 🟡 Get All Transactions of the Current User
@router.get("/", response_model=List[TransactionResponse])
async def get_user_transactions(
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
        date_from: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
        date_to: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
        description: Optional[str] = Query(None, description="Filter by category description"),
        txType: Optional[str] = Query(None, description="Filter by transaction type"),
):
    query = select(Transaction).filter(Transaction.user_id == current_user.id)

    if date_from:
        # Convert date to datetime at midnight
        query = query.filter(Transaction.created_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        # Include the entire date_to day (up to 23:59:59)
        end_of_day = datetime.combine(date_to, datetime.max.time())
        query = query.filter(Transaction.created_at <= end_of_day)
    if description:
        query = query.filter(Transaction.description == description)

    if txType:
        if txType == 'deposit':
            query = query.filter(Transaction.transaction_type == TransactionType.DEPOSIT)
        if txType == 'withdrawal':
            query = query.filter(Transaction.transaction_type == TransactionType.WITHDRAWAL)

    result = await db.execute(query)
    transactions = result.scalars().all()
    return transactions


@router.get("/categories", response_model=List[str])
async def get_user_tx_categories(
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user),
):
    query = (
        select(Transaction.description, func.count(Transaction.id).label("count"))
        .filter(Transaction.user_id == current_user.id)
        .group_by(Transaction.description)
        .order_by(desc("count"))
        .limit(10)
    )

    result = await db.execute(query)
    rows = result.all()

    # extract only category names sorted by frequency
    categories = [row[0] for row in rows]
    return categories


# 🟣 Get Transaction by ID for the Current User
@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction_by_id(
        transaction_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return transaction
