from pydantic import BaseModel
from typing import Optional

class FinancialAimBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_amount: float
    current_amount: float = 0.0

class FinancialAimCreate(FinancialAimBase):
    pass

class FinancialAimUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    target_amount: Optional[float]
    current_amount: Optional[float]

class FinancialAimResponse(FinancialAimBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
