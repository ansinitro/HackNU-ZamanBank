from sqlalchemy import Column, Integer, String, Float, ForeignKey
from database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    financial_aims = relationship("FinancialAim", back_populates="user")


class FinancialAim(Base):
    __tablename__ = "financial_aims"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="financial_aims")