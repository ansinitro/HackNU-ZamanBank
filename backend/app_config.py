import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/zaman_bank")
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
X_LITELLM_API_KEY = os.getenv("X_LITELLM_API_KEY", "")
X_LITELLM_API_URL = os.getenv("X_LITELLM_API_URL", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
