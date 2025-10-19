from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Dict, Tuple

import numpy as np
from auth import oauth2_scheme
from config import SECRET_KEY, ALGORITHM
from database import get_db
from models import User, BankAccount, FinancialTransaction, FinancialAim, FinancialTransactionType
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from sqlalchemy import func, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select


@dataclass
class UserFinancialProfile:
    user_id: int
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

        transaction_query = select(
            func.count(FinancialTransaction.id).label('total_transactions'),
            func.sum(
                case(
                    (FinancialTransaction.transaction_type == FinancialTransactionType.DEPOSIT,
                     FinancialTransaction.amount),
                    else_=0
                )
            ).label('total_deposit'),
            func.sum(
                case(
                    (FinancialTransaction.transaction_type == FinancialTransactionType.WITHDRAWAL,
                     FinancialTransaction.amount),
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

        # # Get username
        # user_query = select(User.iin).where(User.id == user_id)
        # user_result = await self.db.execute(user_query)
        # iin = user_result.scalar_one_or_none()

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
            # username=username or f"User {user_id}",
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

    async def get_three_month_finances(self, user_id: int) -> Dict[str, float]:
        """Get income and outcome for last 3 months"""
        three_months_ago = datetime.now() - timedelta(days=90)

        query = select(
            func.sum(case(
                (FinancialTransaction.transaction_type == FinancialTransactionType.DEPOSIT,
                 FinancialTransaction.amount),
                else_=0
            )).label('income'),
            func.sum(case(
                (FinancialTransaction.transaction_type == FinancialTransactionType.WITHDRAWAL,
                 FinancialTransaction.amount),
                else_=0
            )).label('outcome')
        ).join(BankAccount).where(
            BankAccount.user_id == user_id,
            FinancialTransaction.created_at >= three_months_ago
        )

        result = await self.db.execute(query)
        data = result.first()

        return {
            'three_month_income': float(data.income or 0),
            'three_month_outcome': float(data.outcome or 0)
        }

    async def get_aims_summary(self, user_id: int) -> Dict[str, List]:
        """Get detailed summary of completed and in-progress aims"""
        query = select(FinancialAim).where(FinancialAim.user_id == user_id)
        result = await self.db.execute(query)
        aims = result.scalars().all()

        completed_aims = []
        in_progress_aims = []

        for aim in aims:
            progress_percent = (aim.current_amount / aim.target_amount * 100) if aim.target_amount > 0 else 0
            aim_info = {
                'title': aim.title,
                'description': aim.description,
                'target_amount': float(aim.target_amount),
                'current_amount': float(aim.current_amount),
                'progress_percent': round(progress_percent, 2)
            }

            if aim.is_completed:
                completed_aims.append(aim_info)
            else:
                in_progress_aims.append(aim_info)

        return {
            'completed_aims': completed_aims,
            'in_progress_aims': in_progress_aims
        }

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
        """Get detailed explanation of why two users are similar using the same approach as find_similar_users"""

        # Get all user IDs to maintain the same scaling context
        users_query = select(User.id)
        users_result = await self.db.execute(users_query)
        all_user_ids = [row[0] for row in users_result.fetchall()]

        # Get profiles and vectors for all users
        profiles = []
        vectors = []

        user1_profile = None
        user2_profile = None
        user1_vector = None
        user2_vector = None

        # Collect all profiles to maintain consistent scaling
        for uid in all_user_ids:
            profile = await self.get_user_profile(uid)
            vector = self.profile_to_vector(profile)

            if uid == user1_id:
                user1_profile = profile
                user1_vector = vector
            elif uid == user2_id:
                user2_profile = profile
                user2_vector = vector

            profiles.append(profile)
            vectors.append(vector)

        if not (user1_profile and user2_profile):
            raise HTTPException(status_code=404, detail="One or both users not found")

        # Normalize using all users' data for consistent scaling
        scaler = StandardScaler()
        all_vectors = np.vstack(vectors)
        normalized = scaler.fit_transform(all_vectors)

        # Find indices of our users in the normalized array
        user1_idx = all_user_ids.index(user1_id)
        user2_idx = all_user_ids.index(user2_id)

        # Calculate similarity using normalized vectors
        similarity = cosine_similarity(
            normalized[user1_idx].reshape(1, -1),
            normalized[user2_idx].reshape(1, -1)
        )[0][0]

        # Calculate feature-wise comparisons
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
            norm_diff = abs(normalized[user1_idx][i] - normalized[user2_idx][i])
            raw_diff = abs(vectors[user1_idx][i] - vectors[user2_idx][i])
            avg = (vectors[user1_idx][i] + vectors[user2_idx][i]) / 2
            pct_diff = (raw_diff / avg * 100) if avg != 0 else 0

            differences[feature] = {
                'user1': float(vectors[user1_idx][i]),
                'user2': float(vectors[user2_idx][i]),
                'normalized_difference': float(norm_diff),
                'raw_difference': float(raw_diff),
                'percent_difference': float(pct_diff)
            }

        # Get additional information (same as find-similar)
        finances1 = await self.get_three_month_finances(user1_id)
        finances2 = await self.get_three_month_finances(user2_id)
        aims_summary1 = await self.get_aims_summary(user1_id)
        aims_summary2 = await self.get_aims_summary(user2_id)

        return {
            'similarity_score': float(similarity),
            'user1': {
                **user1_profile.__dict__,
                'three_month_summary': {
                    'income': finances1['three_month_income'],
                    'outcome': finances1['three_month_outcome'],
                    'net': finances1['three_month_income'] - finances1['three_month_outcome']
                },
                'aims_summary': aims_summary1
            },
            'user2': {
                **user2_profile.__dict__,
                'three_month_summary': {
                    'income': finances2['three_month_income'],
                    'outcome': finances2['three_month_outcome'],
                    'net': finances2['three_month_income'] - finances2['three_month_outcome']
                },
                'aims_summary': aims_summary2
            },
            'feature_comparison': differences,
            'normalized_vectors': {
                'user1': normalized[user1_idx].tolist(),
                'user2': normalized[user2_idx].tolist()
            }
        }


# FastAPI route example
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/similarity", tags=["similarity"])


# Update the route handler to include new information
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

        # Enhance profile summaries with additional information
        enhanced_results = []
        for profile, score in similar_users:
            # Get additional information
            finances = await service.get_three_month_finances(profile.user_id)
            aims_summary = await service.get_aims_summary(profile.user_id)

            enhanced_results.append({
                "user_id": profile.user_id,
                "similarity_score": score,
                "profile_summary": {
                    "total_balance": profile.total_balance,
                    "num_transactions": profile.total_transactions,
                    "num_aims": profile.num_aims,
                    "savings_rate": profile.savings_rate,
                    "completion_rate": profile.completion_rate,
                    # Add new financial information
                    "three_month_summary": {
                        "income": finances['three_month_income'],
                        "outcome": finances['three_month_outcome'],
                        "net": finances['three_month_income'] - finances['three_month_outcome']
                    },
                    # Add aims information
                    "aims_summary": {
                        "completed_aims": aims_summary['completed_aims'],
                        "in_progress_aims": aims_summary['in_progress_aims'],
                        "total_completed": len(aims_summary['completed_aims']),
                        "total_in_progress": len(aims_summary['in_progress_aims'])
                    }
                }
            })

        return {
            "user_id": user_id,
            "similar_users": enhanced_results
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
