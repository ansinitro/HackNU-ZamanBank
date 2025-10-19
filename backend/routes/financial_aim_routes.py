from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import List
from database import get_db
from models import FinancialAim, FinancialAimWithTx, FinancialAimSchema
from schemas.financial_aims import FinancialAimCreate, FinancialAimResponse, FinancialAimUpdate
from routes.user_routes import get_current_user

router = APIRouter(prefix="/financial-aims", tags=["Financial Aims"])


# 🟢 Create Financial Aim
@router.post("/", response_model=FinancialAimResponse)
async def create_financial_aim(
        aim: FinancialAimCreate,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user)
):
    print(aim)
    print(current_user)
    print(current_user.id)

    new_aim = FinancialAim(**aim.dict(), user_id=current_user.id)
    db.add(new_aim)
    await db.commit()
    await db.refresh(new_aim)

    return new_aim


# 🟡 Get all aims for current user
@router.get("/", response_model=List[FinancialAimResponse])
async def get_financial_aims(
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user)
):
    print(current_user.id)

    # Use SQLAlchemy 2.0 style with select()
    from sqlalchemy import select

    stmt = select(FinancialAim).filter(FinancialAim.user_id == current_user.id)
    result = await db.execute(stmt)
    aims = result.scalars().all()

    return aims


# 🟣 Get aim by ID
@router.get("/{aim_id}", response_model=FinancialAimResponse)
async def get_financial_aim(
        aim_id: int,
        db: AsyncSession = Depends(get_db),
        current_user=Depends(get_current_user)
):
    from sqlalchemy import select

    stmt = select(FinancialAim).where(
        FinancialAim.id == aim_id,
        FinancialAim.user_id == current_user.id
    )
    result = await db.execute(stmt)
    aim = result.scalar_one_or_none()

    if not aim:
        raise HTTPException(status_code=404, detail="Financial aim not found")

    return aim


# 🟠 Update aim
@router.put("/{aim_id}", response_model=FinancialAimResponse)
def update_financial_aim(
        aim_id: int,
        updated_aim: FinancialAimUpdate,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    aim = db.query(FinancialAim).filter(
        FinancialAim.id == aim_id,
        FinancialAim.user_id == current_user.id
    ).first()

    if not aim:
        raise HTTPException(status_code=404, detail="Financial aim not found")

    for field, value in updated_aim.dict(exclude_unset=True).items():
        setattr(aim, field, value)

    db.commit()
    db.refresh(aim)
    return aim


# 🔴 Delete aim
@router.delete("/{aim_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_financial_aim(
        aim_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    aim = db.query(FinancialAim).filter(
        FinancialAim.id == aim_id,
        FinancialAim.user_id == current_user.id
    ).first()

    if not aim:
        raise HTTPException(status_code=404, detail="Financial aim not found")

    db.delete(aim)
    db.commit()
    return


