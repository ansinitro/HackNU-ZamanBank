# routes/transaction.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Transaction, TransactionType
from schemas.transaction import TransactionCreate, TransactionResponse, TranscationGenerationRequest
from models import User
import random
import string
from routes.user_routes import get_current_user
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import requests

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/generate")
async def generate_fake_transaction(data: TranscationGenerationRequest, db: AsyncSession = Depends(get_db)):

    # Query user with async session
    result = await db.execute(select(User).filter(User.id == data.user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Configuration
    X_LITELLM_API_KEY = "sk-roG3OusRr0TLCHAADks6lw" 
    API_KEY = "sk-1234" 
    BASE_URL = "https://openai-hub.neuraldeep.tech"

    headers = {
        "x-litellm-api-key": f"{X_LITELLM_API_KEY}",
        "accept": "application/json",
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    reqData = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": ""},
            {"role": "user", "content": f"Generate me {data.count} fake bank transactions descriptions divided by space, without anything only the descriptiions devided by whitespaces not like numbered list, without anything."}
        ],
        "temperature": 0.7
    }
    
    response = requests.post(
        f"{BASE_URL}/engines/gpt-4o-mini/chat/completions",
        headers=headers,
        json=reqData
    )
    
    if response.status_code == 200:
        result = response.json()
        response = result["choices"][0]["message"]["content"]


    descriptions = response.split(" ")
    if len(descriptions) < data.count:
         description = descriptions + descriptions

    # Create fake transactions
    fake_transaction = None
    for i in range(data.count):

            # Generate random amount
            amount = round(random.uniform(10, 1000), 2)
            
            # Randomly choose a transaction type
            transaction_type = random.choice([TransactionType.DEPOSIT, TransactionType.WITHDRAWAL, TransactionType.TRANSFER])

            fake_transaction = Transaction(
                amount=amount,
                description=descriptions[i],
                transaction_type=transaction_type,
                user_id=user.id
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
def get_user_transactions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    return transactions


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
