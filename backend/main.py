from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from routes import auth_routes, user_routes, financial_aim_routes, transaction, financial_transaction
from typing import List, Optional
import requests
from database import Base, engine
import os
from datetime import datetime
from fastapi import UploadFile, File

app = FastAPI(title="Zaman Bank AI Assistant", version="1.0.0")
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(financial_aim_routes.router)
app.include_router(transaction.router)
app.include_router(financial_transaction.router)

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
            "image": "https://zamanbank.kz/storage/app/media/maing2m/pic-tw-02.png",
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
async def chat_with_assistant(chat_message: ChatMessage):
    try:
        # Prepare system prompt with bank context
        system_prompt = """
        Ты - AI-ассистент банка Zaman. Ты помогаешь клиентам с:
        1. Постановкой и достижением финансовых целей (квартира, обучение, покупки, путешествия)
        2. Оптимизацией финансовых привычек
        3. Подбором банковских продуктов
        4. Борьбой со стрессом без лишних трат
        
        Будь дружелюбным, empathetic и профессиональным. Используй исламские финансовые принципы когда уместно.
        """
        
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
            "temperature": 0.7
        }
        
        response = requests.post(
            f"{BASE_URL}/engines/gpt-4o-mini/chat/completions",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                "response": result["choices"][0]["message"]["content"],
                "session_id": chat_message.session_id or generate_session_id()
            }
        else:
            print(response.json())
            raise HTTPException(status_code=500, detail="AI service error")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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