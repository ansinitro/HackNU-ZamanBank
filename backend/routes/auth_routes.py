from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import User, BankAccount
from schemas.user import UserCreate, UserLogin, Token
from auth import hash_password, verify_password, create_access_token
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=dict)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if username already exists
    result = await db.execute(select(User).where(User.iin == user_data.iin))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create user
    new_user = User(
        iin=user_data.iin,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )
    db.add(new_user)
    await db.flush()  # flush to get new_user.id before commit

    # Create default bank account for user
    new_account = BankAccount(
        user_id=new_user.id,
        account_number=str(uuid.uuid4().int)[:16],  # simple unique 16-digit number
        balance=1000.0,
    )
    db.add(new_account)

    # Commit both user and bank account
    await db.commit()
    await db.refresh(new_user)

    # Generate access token
    token = create_access_token({"sub": new_user.iin})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.iin == user_data.iin))
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": user.iin})
    return {"access_token": token, "token_type": "bearer"}
