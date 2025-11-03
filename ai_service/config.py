"""
Configuration du service IA pour CAMEG-CHAIN
"""
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

class AISettings:
    """Configuration du service IA"""
    
    # API
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8001"))
    
    # Modèles
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./model/")
    
    # Base de données (pour récupérer les données d'entraînement)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/CAMEG-CHAIN"
    )
    
    # Communication avec le backend
    BACKEND_API_URL: str = os.getenv("BACKEND_API_URL", "http://localhost:8000")
    BACKEND_TIMEOUT: int = int(os.getenv("BACKEND_TIMEOUT", "30"))
    BACKEND_MAX_RETRIES: int = int(os.getenv("BACKEND_MAX_RETRIES", "3"))
    
    # Configuration des modèles
    RISK_SCORING_MODEL: str = "risk_scoring_model.pkl"
    ANOMALY_DETECTION_MODEL: str = "anomaly_detection_model.pkl"
    FRAUD_DETECTION_MODEL: str = "fraud_detection_model.pkl"
    
    # Paramètres de scoring
    RISK_THRESHOLD_LOW: float = 0.3
    RISK_THRESHOLD_MEDIUM: float = 0.6
    RISK_THRESHOLD_HIGH: float = 0.8
    
    # Environnement
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Logging et monitoring
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    ENABLE_METRICS: bool = os.getenv("ENABLE_METRICS", "True").lower() == "true"
    
    # Sécurité
    MAX_REQUEST_SIZE: int = int(os.getenv("MAX_REQUEST_SIZE", "10485760"))  # 10MB
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))

# Instance globale des paramètres
ai_settings = AISettings()
