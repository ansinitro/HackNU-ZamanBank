from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from sqlalchemy import select
from routes import auth_routes, user_routes, financial_aim_routes, transaction, financial_transaction, chat_routes
from typing import List, Optional
import requests
from database import Base, engine, get_db
from models import FinancialAim
import os
from datetime import datetime
from fastapi import UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from routes.user_routes import get_current_user
from chat import get_or_create_chat_session

app = FastAPI(title="Zaman Bank AI Assistant", version="1.0.0")
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(financial_aim_routes.router)
app.include_router(transaction.router)
app.include_router(financial_transaction.router)
app.include_router(chat_routes.router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
X_LITELLM_API_KEY = "sk-roG3OusRr0TLCHAADks6lw"
# API_KEY = "sk-1234"
BASE_URL = "https://openai-hub.neuraldeep.tech"
security = HTTPBearer()


# Pydantic models
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None


class FinancialGoal(BaseModel):
    goal_name: str
    target_amount: float
    current_amount: float = 0
    timeline_months: int
    goal_type: str  # apartment, education, purchase, travel, operation

class UserProfile(BaseModel):
    monthly_income: float
    monthly_expenses: float
    savings: float
    financial_goals: List[FinancialGoal] = []

class ProductRecommendationRequest(BaseModel):
    user_profile: UserProfile
    goal_type: str

# Bank products data (simplified)
BANK_PRODUCTS = {
    "deposits": [
        {
            "name": "Депозиты",
            "rate": "до 20%",
            "min_amount": 0,
            "term": "Без срока",
            "description": "Надёжный способ накоплений по исламским принципам",
            "image": "https://zamanbank.kz/storage/app/media/maing2m/deposit_p%402x.png",
            "link": "https://zamanbank.kz/ru/personal/agentskij-depozit-vakala"
        }
    ],
    "credits": [
        {
            "name": "Финансирование",
            "rate": "до 3 млн ₸",
            "min_amount": 0,
            "term": "Без залога",
            "description": "Одобрено Шариатским Советом",
            "image": "https://zamanbank.kz/storage/app/media/mai    ng2m/pic-tw-02.png",
            "link": "https://zamanbank.kz/ru/personal/onlajn-finansirovanie-bez-zaloga"
        }
    ],
    "transfers": [
        {
            "name": "Переводы без комиссии",
            "description": "В любые банки Казахстана без дополнительной комиссии",
            "image": "https://zamanbank.kz/storage/app/media/maing2m/pic-tw-04.png",
            "link": "https://zaman.onelink.me/OAIU/4eqyn2hq"
        }
    ],
    "islamic": [
        {
            "name": "Мурабаха",
            "type": "Торговая маржа",
            "description": "Покупка и продажа товара с согласованной наценкой"
        },
        {
            "name": "Иджара",
            "type": "Аренда",
            "description": "Аренда имущества с последующим выкупом"
        }
    ]
}

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "Zaman Bank AI Assistant API"}


@app.post("/api/chat")
async def chat_with_assistant(
    chat_message: ChatMessage,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Multi-stage financial assistant:
    1️⃣ Goal Discovery
    2️⃣ Clarification
    3️⃣ Recommendation
    4️⃣ Confirmation (NEW!)
    5️⃣ Call to Action
    """
    session_id = chat_message.session_id or generate_session_id()
    user_session = await get_or_create_chat_session(db, current_user.id, session_id)

    stage = user_session.stage or "discovery"

    # Промпты по стадиям
    prompts = {
        "discovery": """
        You are a friendly financial planner.
        Ask open-ended questions to understand what financial goals the user has
        (e.g., buy a car, save for Hajj, start a business).
        Keep the tone personal and conversational.
        Return JSON only:
        {
          "response": "your message to the user",
          "intent": "next_stage_when_ready_or_none",
          "goal_type": "string or null"
        }
        """,
        "clarification": """
        You are an assistant helping calculate goal feasibility.
        Ask for approximate cost, current savings, and preferred timeline.
        Then summarize their target.
        Return JSON only:
        {
          "response": "your message",
          "intent": "next_stage_when_ready_or_none",
          "goal_cost": "float or null",
          "monthly_saving": "float or null",
          "timeline": "string or null"
        }
        """,
        "recommendation": """
        You are an expert financial advisor from Zaman Bank.
        Based on user info, recommend relevant bank products
        (deposits, financing, halal programs, cards)
        and explain why each helps reach the goal.
        Be realistic and Shariah-compliant.
        Return JSON only:
        {
          "response": "your recommendations text",
          "intent": "next_stage_when_ready_or_none",
          "products": ["list", "of", "products"]
        }
        """,
        "confirmation": """
        You are a helpful assistant confirming the user's choice.
        The user has expressed interest in specific products.
        Ask them to confirm if they want to create a financial goal with the selected product(s).
        Be clear and concise.
        Return JSON only:
        {
          "response": "your confirmation request message",
          "intent": "confirmed_or_declined_or_none",
          "selected_products": ["list", "of", "selected", "products"]
        }
        If user confirms (says yes, давай, хорошо, согласен, etc.), set intent to "confirmed".
        If user declines, set intent to "declined".
        """,
        "action": """
        Now invite the user to explore these offers via clickable links
        (formatted JSON for frontend rendering). Keep it concise and motivating.
        Return JSON only:
        {
          "response": "your final message",
          "cta": [{"label": "string", "url": "string"}]
        }
        """
    }

    system_prompt = prompts[stage]

    headers = {
        "x-litellm-api-key": f"{X_LITELLM_API_KEY}",
        "accept": "application/json",
        "Content-Type": "application/json"
    }

    data = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": chat_message.message}
        ],
        "temperature": 0.4,
        "response_format": {"type": "json_object"}
    }

    response = requests.post(
        f"{BASE_URL}/chat/completions",
        headers=headers,
        json=data,
        timeout=30
    )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail=f"AI service error: {response.text}")

    result = response.json()
    content = result["choices"][0]["message"]["content"]

    import json
    try:
        ai_result = json.loads(content)
    except json.JSONDecodeError:
        return {"response": content, "session_id": session_id}

    ai_response = ai_result.get("response", "")
    intent = ai_result.get("intent")

    # ⏩ Переход по стадиям
    if stage == "discovery" and intent == "next_stage_when_ready_or_none":
        user_session.stage = "clarification"
    elif stage == "clarification" and intent == "next_stage_when_ready_or_none":
        user_session.stage = "recommendation"
    elif stage == "recommendation" and intent == "next_stage_when_ready_or_none":
        user_session.stage = "confirmation"
    elif stage == "confirmation":
        if intent == "confirmed":
            user_session.stage = "action"
        elif intent == "declined":
            # Вернуться к рекомендациям или завершить
            user_session.stage = "recommendation"
            ai_response += "\n\nДавайте рассмотрим другие варианты."
    elif stage == "action":
        user_session.stage = "complete"

    # 💾 Сохранение контекста (цель, сумма, и т.д.)
    for key in ["goal_type", "goal_cost", "monthly_saving", "timeline", "products", "selected_products"]:
        if key in ai_result and ai_result[key] is not None:
            setattr(user_session, key, ai_result[key])

    await db.commit()

    # ✅ Создаём цель только после подтверждения на стадии action
    if user_session.stage == "complete":
        new_aim = FinancialAim(
            user_id=current_user.id,
            title=user_session.goal_type or "Моя финансовая цель",
            target_amount=float(user_session.goal_cost or 0),
            current_amount=0.0,
        )
        db.add(new_aim)
        await db.commit()
        ai_response += f"\n\n✅ Цель '{new_aim.title}' создана. Сумма: {new_aim.target_amount:,.0f} ₸"

    return {
        "response": ai_response,
        "stage": user_session.stage,
        "session_id": session_id
    }

@app.post("/api/speech-to-text")
async def speech_to_text(audio_file: UploadFile = File(...)):
    try:
        # Read the file content
        audio_bytes = await audio_file.read()

        headers = {
            "x-litellm-api-key": f"{X_LITELLM_API_KEY}",
        }

        files = {
            "file": (audio_file.filename or "audio.wav", audio_bytes, "audio/wav"),
            "model": (None, "whisper-1")
        }

        response = requests.post(
            f"{BASE_URL}/v1/audio/transcriptions",
            headers=headers,
            files=files
        )
        print(response.json())
        if response.status_code == 200:
            result = response.json()
            return {"text": result["text"]}
        else:
            raise HTTPException(status_code=500, detail="Speech recognition error")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/api/calculate-goal")
async def calculate_financial_goal(goal: FinancialGoal):
    try:
        monthly_saving = (goal.target_amount - goal.current_amount) / goal.timeline_months
        progress_percentage = (goal.current_amount / goal.target_amount) * 100
        
        return {
            "monthly_saving": round(monthly_saving, 2),
            "progress_percentage": round(progress_percentage, 2),
            "timeline_months": goal.timeline_months,
            "recommendations": generate_saving_recommendations(goal)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend-products")
async def recommend_products(request: ProductRecommendationRequest):
    try:
        user_profile = request.user_profile
        goal_type = request.goal_type
        
        recommendations = []
        
        # Logic for product recommendations based on goal type and user profile
        if goal_type == "apartment":
            recommendations.extend([
                product for product in BANK_PRODUCTS["credits"] 
                if product["name"] == "Ипотечный кредит"
            ])
            recommendations.extend(BANK_PRODUCTS["deposits"][:1])
            
        elif goal_type == "education":
            recommendations.extend([
                product for product in BANK_PRODUCTS["credits"] 
                if "Потребительский" in product["name"]
            ])
            recommendations.extend(BANK_PRODUCTS["deposits"])
            
        # Add Islamic finance options
        recommendations.extend(BANK_PRODUCTS["islamic"][:1])
        
        return {
            "recommendations": recommendations,
            "financial_advice": generate_financial_advice(user_profile, goal_type)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stress-relief-tips")
async def get_stress_relief_tips():
    tips = [
        "Глубокое дыхание: 5 минут медитации в день",
        "Прогулка на свежем воздухе вместо шопинга",
        "Бесплатные онлайн-курсы по хобби",
        "Ведение дневника благодарности",
        "Физические упражнения дома",
        "Чтение книг из библиотеки",
        "Встречи с друзьями на природе"
    ]
    return {"tips": tips}

def generate_session_id():
    return f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(4).hex()}"

def generate_saving_recommendations(goal: FinancialGoal):
    recommendations = []
    
    if goal.goal_type == "apartment":
        recommendations = [
            "Рассмотрите ипотечную программу банка",
            "Откладывайте 20% от ежемесячного дохода",
            "Используйте накопительный счет для первоначального взноса"
        ]
    elif goal.goal_type == "travel":
        recommendations = [
            "Планируйте путешествие заранее для лучших цен",
            "Используйте кэшбэк-программы",
            "Рассмотрите travel-вклады для накоплений"
        ]
    
    return recommendations

def generate_financial_advice(user_profile: UserProfile, goal_type: str):
    savings_ratio = user_profile.savings / user_profile.monthly_income if user_profile.monthly_income > 0 else 0
    
    advice = []
    
    if savings_ratio < 3:
        advice.append("Рекомендуем создать финансовую подушку безопасности на 3-6 месяцев")
    
    if user_profile.monthly_expenses / user_profile.monthly_income > 0.6:
        advice.append("Рассмотрите оптимизацию регулярных расходов")
    
    return advice

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)