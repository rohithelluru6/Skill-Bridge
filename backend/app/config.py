import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./skillbridge.db")
    SQLITE_PATH: str = os.getenv("SQLITE_PATH", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "skillbridge.db"))
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_skill_bridge_jwt_key_change_in_production_2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200")) # 30 days
    
    # AI Services
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")

settings = Settings()
