import requests
from fastapi import HTTPException
from pydantic import BaseModel
import random
import string

# Define your API keys and base URL
API_KEY = "your-api-key"
X_LITELLM_API_KEY = "your-litellm-api-key"
BASE_URL = "https://api.openai.com/v1"

# Define Pydantic schema for ChatMessage
class ChatMessage(BaseModel):
    message: str
    session_id: str | None = None


# Utility function to generate a session ID if not provided
def generate_session_id() -> str:
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))


# Function to send a chat message to ChatGPT API
def send_chat_message_to_chatgpt(chat_message: ChatMessage) -> dict:
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
            "Authorization": f"Bearer {API_KEY}",
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
        
        # Send request to the ChatGPT API
        response = requests.post(
            f"{BASE_URL}/engines/gpt-4o-mini/chat/completions",
            headers=headers,
            json=data
        )
        
        # Handle the response
        if response.status_code == 200:
            result = response.json()
            return {
                "response": result["choices"][0]["message"]["content"],
                "session_id": chat_message.session_id or generate_session_id()
            }
        else:
            # If the API responds with an error
            print(response.json())
            raise HTTPException(status_code=500, detail="AI service error")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
