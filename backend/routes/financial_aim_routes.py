from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import FinancialAim
from schemas.financial_aims import FinancialAimCreate, FinancialAimResponse, FinancialAimUpdate
from routes.user_routes import get_current_user

router = APIRouter(prefix="/financial-aims", tags=["Financial Aims"])

# 🟢 Create Financial Aim
@router.post("/", response_model=FinancialAimResponse)
def create_financial_aim(
    aim: FinancialAimCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_aim = FinancialAim(**aim.dict(), user_id=current_user.id)
    db.add(new_aim)
    db.commit()
    db.refresh(new_aim)
    return new_aim

# 🟡 Get all aims for current user
@router.get("/", response_model=List[FinancialAimResponse])
def get_financial_aims(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    aims = db.query(FinancialAim).filter(FinancialAim.user_id == current_user.id).all()
    return aims

# 🟣 Get aim by ID
@router.get("/{aim_id}", response_model=FinancialAimResponse)
def get_financial_aim(aim_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    aim = db.query(FinancialAim).filter(
        FinancialAim.id == aim_id,
        FinancialAim.user_id == current_user.id
    ).first()

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
