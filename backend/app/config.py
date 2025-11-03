"""
Configuration sécurisée de l'application backend
"""
import os
import secrets
from typing import List
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

class Settings:
    """Configuration sécurisée de l'application"""
    
    def __init__(self):
        """Initialisation avec validation de sécurité"""
        self._validate_environment()
    
    def _validate_environment(self):
        """Valider la configuration de sécurité"""
        if self.ENVIRONMENT == "production":
            if self.SECRET_KEY == "your-secret-key-change-in-production":
                raise ValueError("❌ SECRET_KEY doit être changé en production!")
            if self.DEBUG:
                raise ValueError("❌ DEBUG doit être False en production!")
            if "localhost" in self.ALLOWED_ORIGINS:
                raise ValueError("❌ localhost ne doit pas être dans ALLOWED_ORIGINS en production!")
    
    # Base de données
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/CAMEG-CHAIN"
    )
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "CAMEG-CHAIN")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "123456789")
    
    # API
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    
    # Service IA
    AI_SERVICE_URL: str = os.getenv("AI_SERVICE_URL", "http://localhost:8001")
    AI_MODEL_PATH: str = os.getenv("AI_MODEL_PATH", "./ai_service/model/")
    
    # Frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Environnement
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # CORS - Configuration sécurisée
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3003",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ]
    
    # Méthodes HTTP autorisées (sécurisé)
    ALLOWED_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "PATCH"]
    
    # Headers autorisés (sécurisé)
    ALLOWED_HEADERS: List[str] = [
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With"
    ]
    
    # JWT - Configuration sécurisée
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    ALGORITHM: str = "HS256"
    
    # Sécurité
    BCRYPT_ROUNDS: int = int(os.getenv("BCRYPT_ROUNDS", "12"))
    MAX_LOGIN_ATTEMPTS: int = int(os.getenv("MAX_LOGIN_ATTEMPTS", "5"))
    LOCKOUT_DURATION_MINUTES: int = int(os.getenv("LOCKOUT_DURATION_MINUTES", "15"))
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))

# Instance globale des paramètres
settings = Settings()
