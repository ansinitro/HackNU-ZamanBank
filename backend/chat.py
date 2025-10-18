from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import ChatSession  # твоя модель с полями: id, user_id, session_id, stage, goal_type, goal_cost, monthly_saving, timeline, products

async def get_or_create_chat_session(db: AsyncSession, user_id: int, session_id: str):
    result = await db.execute(
        select(ChatSession).filter(
            ChatSession.user_id == user_id,
            ChatSession.session_id == session_id
        )
    )
    session = result.scalars().first()

    if session is None:
        session = ChatSession(
            user_id=user_id,
            session_id=session_id,
            stage="discovery",
            goal_type=None,
            goal_cost=None,
            monthly_saving=None,
            timeline=None,
            products=None
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)

    return session
