from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from jose import JWTError, jwt
from database import get_db
from models import User
from config import SECRET_KEY, ALGORITHM
from auth import oauth2_scheme
from models import TransactionType  # Update import path based on your structure


router = APIRouter(prefix="/users", tags=["Users"])


async def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: AsyncSession = Depends(get_db)
):
    """
    Extracts current user from JWT token in Authorization header.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub: str = payload.get("sub")
        if sub is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.iin == sub))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.get("/me")
async def read_users_me(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    # Refresh the user with eager loading
    result = await db.execute(
        select(User)
        .options(selectinload(User.bank_account))
        .where(User.id == current_user.id)
    )
    user = result.scalar_one()

    return {
        "id": user.id,
        "iin": user.iin,
        "email": user.email,
        "bank_account" : user.bank_account[0]
    }


# ...existing code...
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import random
from datetime import datetime, timedelta
from models import User, BankAccount, Transaction, FinancialAim, TransactionType
from schemas.user import UserCreate
from auth import hash_password

@router.post("/generate-test-data", response_model=List[dict])
async def generate_test_data(
    count: int = 5,
    db: AsyncSession = Depends(get_db)
):
    """Generate test users with bank accounts, aims and transactions for development."""

    created_users = []

    # Use only enum values that exist in DB enum type (avoid DB enum mismatch)
    regular_transactions = [
        TransactionType.DEPOSIT,
        TransactionType.WITHDRAWAL,
        TransactionType.TRANSFER,
    ]

    for i in range(count):
        # Create user with unique credentials
        user = User(
            username=f"testuser{i}_{random.randint(1000,9999)}",
            email=f"test{i}_{random.randint(1000,9999)}@example.com",
            hashed_password=hash_password("testpass123")
        )
        db.add(user)
        await db.flush()  # populate user.id

        # Create bank account
        bank_account = BankAccount(
            user_id=user.id,
            account_number=f"TEST{random.randint(100000, 999999)}",
            balance=round(random.uniform(1000, 10000), 2)
        )
        db.add(bank_account)
        await db.flush()  # populate bank_account.id

        # Create financial aims
        aims = []
        aim_titles = ["Vacation", "New Car", "Emergency Fund", "House", "Education"]
        for title in random.sample(aim_titles, 2):
            aim = FinancialAim(
                user_id=user.id,
                title=title,
                description=f"Saving for {title.lower()}",
                target_amount=round(random.uniform(5000, 50000), 2),
                current_amount=round(random.uniform(100, 1000), 2),
                deadline=datetime.utcnow() + timedelta(days=random.randint(30, 365))
            )
            db.add(aim)
            aims.append(aim)
        await db.flush()

        # Generate random transactions
        for _ in range(10):
            transaction_type = random.choice(regular_transactions)
            amount = round(random.uniform(10, 1000), 2)

            txn = Transaction(
                user_id=user.id,
                amount=amount,
                transaction_type=transaction_type,
                description=f"Test {transaction_type.value} transaction",
                # bank_account_id=bank_account.id,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )

            # Link some transactions to aims and update aim balances when appropriate
            if aims and random.random() < 0.3:
                aim = random.choice(aims)
                txn.aim_id = aim.id
                # treat DEPOSIT as adding to aim, WITHDRAWAL as subtracting
                if transaction_type == TransactionType.DEPOSIT:
                    aim.current_amount = (aim.current_amount or 0) + amount
                elif transaction_type == TransactionType.WITHDRAWAL:
                    aim.current_amount = max(0, (aim.current_amount or 0) - amount)

            db.add(txn)

        created_users.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "bank_account_number": bank_account.account_number
        })

    await db.commit()
    return created_users
