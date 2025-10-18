from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any

from database import get_db
from models import Transaction
from routes.user_routes import get_current_user
from services.chat_service import send_chat_message_to_chatgpt, ChatMessage

router = APIRouter(prefix="/chat", tags=["Chat"])


def _format_transactions_for_prompt(transactions: List[Transaction]) -> str:
    if not transactions:
        return "У пользователя пока нет транзакций. Дайте 3 универсальных совета по улучшению личных финансов."

    lines = []
    for t in transactions[:50]:  # keep prompt short if too many
        # created_at can be None or not ISO-serializable directly; format defensively
        created = None
        try:
            created = t.created_at.isoformat() if getattr(t, "created_at", None) else ""
        except Exception:
            created = ""
        lines.append(f"- id - {t.id} {created} | {t.transaction_type.value if hasattr(t.transaction_type, 'value') else t.transaction_type} | {t.amount:.2f} | {t.description}")

    header = (
        "Ниже список последних транзакций пользователя (дата | тип | сумма | описание).\n"
        "Проанализируй их и предложи РОВНО 3 конкретных совета, как улучшить личные финансы. В ответе разбирай по сделанным транзакциям, указывай id транзакции \n"
        "Формат ответа: пронумерованный список 1..3, кратко и по делу. Учти исламские финансовые принципы, где уместно.\n" 
        "Не пиши На основе ваших последних транзакций, вот три совета по улучшению личных финансов: просто сами советы отправь"
    )
    return header + "\n".join(lines)


def _extract_top3_advice(text: str) -> List[str]:
    if not text:
        return []
    # Naive parse: split by lines and pick first 3 non-empty bullets/numbers
    print(text)
    advices: List[str] = []
    for line in text.splitlines():
        stripped = line.strip(" -*\t")
        if not stripped:
            continue
        # remove leading numbering like "1.", "1)"
        if len(stripped) > 2 and (stripped[1] in ".)" and stripped[0].isdigit()):
            stripped = stripped[2:].strip()
        advices.append(stripped)
        if len(advices) == 3:
            break
    # Fallback: if the model returned a single paragraph, split by sentences
    if len(advices) == 0:
        parts = [p.strip() for p in text.split(".") if p.strip()]
        advices = parts[:3]
    return advices


@router.get("/advice")
async def get_finance_advice(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
) -> Dict[str, Any]:
    try:
        # Fetch current user's transactions
        result = await db.execute(
            select(Transaction).filter(Transaction.user_id == current_user.id)
        )
        transactions = result.scalars().all()

        # Build prompt
        prompt = _format_transactions_for_prompt(transactions)

        # Send to AI
        ai_result = send_chat_message_to_chatgpt(ChatMessage(message=prompt))
        ai_text = ai_result.get("response", "")
        session_id = ai_result.get("session_id")

        # Try to extract exactly 3 advice items
        advices = _extract_top3_advice(ai_text)

        return {
            "advices": advices,
            "raw_response": ai_text,
            "session_id": session_id,
            "transactions_count": len(transactions)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
