from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Tuple
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from dataclasses import dataclass
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from jose import JWTError, jwt
from database import get_db
from models import User, BankAccount, FinancialTransaction, FinancialAim
from config import SECRET_KEY, ALGORITHM
from auth import oauth2_scheme

@dataclass
class UserFinancialProfile:
    user_id: int
    username: str
    
    # Account metrics
    total_balance: float
    num_accounts: int
    avg_account_age_days: float
    
    # Transaction metrics
    total_transactions: int
    total_deposit: float
    total_withdrawal: float
    avg_transaction_amount: float
    transaction_frequency: float  # transactions per day
    
    # Financial aims metrics
    num_aims: int
    total_target_amount: float
    total_current_amount: float
    completion_rate: float
    avg_aim_progress: float
    num_completed_aims: int
    
    # Behavioral patterns
    savings_rate: float  # current_amount / target_amount
    net_flow: float  # deposits - withdrawals

class UserSimilarityService:
    """Service to calculate user similarity based on financial behavior"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_user_profile(self, user_id: int) -> UserFinancialProfile:
        """Extract comprehensive financial profile for a user"""
        
        # Get account metrics
        account_query = select(
            func.count(BankAccount.id).label('num_accounts'),
            func.sum(BankAccount.balance).label('total_balance'),
            func.avg(
                func.extract('epoch', func.now() - BankAccount.created_at) / 86400
            ).label('avg_account_age')
        ).where(BankAccount.user_id == user_id)
        
        account_result = await self.db.execute(account_query)
        account_data = account_result.first()
        
        # Get transaction metrics
        from sqlalchemy import case
        from models import FinancialTransactionType  # Import your enum
        
        transaction_query = select(
            func.count(FinancialTransaction.id).label('total_transactions'),
            func.sum(
                case(
                    (FinancialTransaction.transaction_type == FinancialTransactionType.DEPOSIT, FinancialTransaction.amount),
                    else_=0
                )
            ).label('total_deposit'),
            func.sum(
                case(
                    (FinancialTransaction.transaction_type == FinancialTransactionType.WITHDRAWAL, FinancialTransaction.amount),
                    else_=0
                )
            ).label('total_withdrawal'),
            func.avg(FinancialTransaction.amount).label('avg_transaction'),
            func.min(FinancialTransaction.created_at).label('first_transaction')
        ).join(BankAccount).where(BankAccount.user_id == user_id)
        
        transaction_result = await self.db.execute(transaction_query)
        transaction_data = transaction_result.first()
        
        # Get financial aims metrics
        aims_query = select(
            func.count(FinancialAim.id).label('num_aims'),
            func.sum(FinancialAim.target_amount).label('total_target'),
            func.sum(FinancialAim.current_amount).label('total_current'),
            func.sum(
                case((FinancialAim.is_completed == True, 1), else_=0)
            ).label('num_completed'),
            func.avg(
                FinancialAim.current_amount / FinancialAim.target_amount * 100
            ).label('avg_progress')
        ).where(FinancialAim.user_id == user_id)
        
        aims_result = await self.db.execute(aims_query)
        aims_data = aims_result.first()
        
        # Get username
        user_query = select(User.username).where(User.id == user_id)
        user_result = await self.db.execute(user_query)
        username = user_result.scalar_one_or_none()
        
        # Calculate derived metrics
        num_accounts = account_data.num_accounts or 0
        total_balance = float(account_data.total_balance or 0)
        avg_account_age = float(account_data.avg_account_age or 0)
        
        total_transactions = transaction_data.total_transactions or 0
        total_deposit = float(transaction_data.total_deposit or 0)
        total_withdrawal = float(transaction_data.total_withdrawal or 0)
        avg_transaction = float(transaction_data.avg_transaction or 0)
        
        # Calculate transaction frequency
        first_transaction = transaction_data.first_transaction
        if first_transaction and total_transactions > 0:
            days_active = (datetime.now() - first_transaction).days or 1
            transaction_frequency = total_transactions / days_active
        else:
            transaction_frequency = 0
        
        num_aims = aims_data.num_aims or 0
        total_target = float(aims_data.total_target or 0)
        total_current = float(aims_data.total_current or 0)
        num_completed = aims_data.num_completed or 0
        avg_progress = float(aims_data.avg_progress or 0)
        
        completion_rate = (num_completed / num_aims * 100) if num_aims > 0 else 0
        savings_rate = (total_current / total_target * 100) if total_target > 0 else 0
        net_flow = total_deposit - total_withdrawal
        
        return UserFinancialProfile(
            user_id=user_id,
            username=username or f"User {user_id}",
            total_balance=total_balance,
            num_accounts=num_accounts,
            avg_account_age_days=avg_account_age,
            total_transactions=total_transactions,
            total_deposit=total_deposit,
            total_withdrawal=total_withdrawal,
            avg_transaction_amount=avg_transaction,
            transaction_frequency=transaction_frequency,
            num_aims=num_aims,
            total_target_amount=total_target,
            total_current_amount=total_current,
            completion_rate=completion_rate,
            avg_aim_progress=avg_progress,
            num_completed_aims=num_completed,
            savings_rate=savings_rate,
            net_flow=net_flow
        )
    
    def profile_to_vector(self, profile: UserFinancialProfile) -> np.ndarray:
        """Convert user profile to feature vector for similarity calculation"""
        return np.array([
            profile.total_balance,
            profile.num_accounts,
            profile.avg_account_age_days,
            profile.total_transactions,
            profile.total_deposit,
            profile.total_withdrawal,
            profile.avg_transaction_amount,
            profile.transaction_frequency,
            profile.num_aims,
            profile.total_target_amount,
            profile.total_current_amount,
            profile.completion_rate,
            profile.avg_aim_progress,
            profile.num_completed_aims,
            profile.savings_rate,
            profile.net_flow
        ])
    
    async def find_similar_users(
        self, 
        user_id: int, 
        top_n: int = 5
    ) -> List[Tuple[UserFinancialProfile, float]]:
        """Find the most similar users to a given user"""
        
        # Get all user IDs
        users_query = select(User.id)
        users_result = await self.db.execute(users_query)
        all_user_ids = [row[0] for row in users_result.fetchall()]
        
        # Get profiles for all users
        profiles = []
        vectors = []
        
        target_profile = None
        target_vector = None
        
        for uid in all_user_ids:
            profile = await self.get_user_profile(uid)
            vector = self.profile_to_vector(profile)
            
            if uid == user_id:
                target_profile = profile
                target_vector = vector
            else:
                profiles.append(profile)
                vectors.append(vector)
        
        if target_profile is None or len(profiles) == 0:
            return []
        
        # Normalize features
        scaler = StandardScaler()
        all_vectors = np.vstack([target_vector] + vectors)
        normalized = scaler.fit_transform(all_vectors)
        
        target_normalized = normalized[0].reshape(1, -1)
        others_normalized = normalized[1:]
        
        # Calculate cosine similarity
        similarities = cosine_similarity(target_normalized, others_normalized)[0]
        
        # Sort by similarity and get top N
        similar_indices = np.argsort(similarities)[::-1][:top_n]
        
        results = [
            (profiles[idx], float(similarities[idx]))
            for idx in similar_indices
        ]
        
        return results
    
    async def get_similarity_explanation(
        self,
        user1_id: int,
        user2_id: int
    ) -> Dict[str, any]:
        """Get detailed explanation of why two users are similar"""
        
        profile1 = await self.get_user_profile(user1_id)
        profile2 = await self.get_user_profile(user2_id)
        
        vector1 = self.profile_to_vector(profile1)
        vector2 = self.profile_to_vector(profile2)
        
        # Calculate overall similarity
        scaler = StandardScaler()
        normalized = scaler.fit_transform([vector1, vector2])
        similarity = cosine_similarity([normalized[0]], [normalized[1]])[0][0]
        
        # Calculate feature-wise differences
        feature_names = [
            'total_balance', 'num_accounts', 'avg_account_age_days',
            'total_transactions', 'total_deposit', 'total_withdrawal',
            'avg_transaction_amount', 'transaction_frequency',
            'num_aims', 'total_target_amount', 'total_current_amount',
            'completion_rate', 'avg_aim_progress', 'num_completed_aims',
            'savings_rate', 'net_flow'
        ]
        
        differences = {}
        for i, feature in enumerate(feature_names):
            diff = abs(vector1[i] - vector2[i])
            avg = (vector1[i] + vector2[i]) / 2
            pct_diff = (diff / avg * 100) if avg != 0 else 0
            differences[feature] = {
                'user1': float(vector1[i]),
                'user2': float(vector2[i]),
                'difference': float(diff),
                'percent_difference': float(pct_diff)
            }
        
        return {
            'similarity_score': float(similarity),
            'user1': profile1.__dict__,
            'user2': profile2.__dict__,
            'feature_comparison': differences
        }


# FastAPI route example
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/similarity", tags=["similarity"])

@router.get("/find-similar/{user_id}")
async def find_similar_users(
    user_id: int,
    top_n: int = 5,
    db: AsyncSession = Depends(get_db)
):
    """Find users similar to the specified user"""
    service = UserSimilarityService(db)
    
    try:
        similar_users = await service.find_similar_users(user_id, top_n)
        
        return {
            "user_id": user_id,
            "similar_users": [
                {
                    "user_id": profile.user_id,
                    "username": profile.username,
                    "similarity_score": score,
                    "profile_summary": {
                        "total_balance": profile.total_balance,
                        "num_transactions": profile.total_transactions,
                        "num_aims": profile.num_aims,
                        "savings_rate": profile.savings_rate,
                        "completion_rate": profile.completion_rate
                    }
                }
                for profile, score in similar_users
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/compare/{user1_id}/{user2_id}")
async def compare_users(
    user1_id: int,
    user2_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed comparison between two users"""
    service = UserSimilarityService(db)
    
    try:
        comparison = await service.get_similarity_explanation(user1_id, user2_id)
        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/{user_id}")
async def get_user_financial_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive financial profile for a user"""
    service = UserSimilarityService(db)
    
    try:
        profile = await service.get_user_profile(user_id)
        return profile.__dict__
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))