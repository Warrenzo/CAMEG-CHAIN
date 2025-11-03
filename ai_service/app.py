"""
Service IA pour CAMEG-CHAIN - Scoring et détection automatique des risques
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional
import uvicorn
import os
import sys
import logging
from datetime import datetime

# Ajouter le dossier parent au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import ai_settings

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Créer l'application FastAPI
app = FastAPI(
    title="CAMEG-CHAIN AI Service",
    description="Service IA pour le scoring et la détection automatique des risques",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS sécurisée
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Modèles Pydantic pour les requêtes
class TransactionData(BaseModel):
    """Données d'une transaction pour l'analyse"""
    amount: float = Field(..., gt=0, description="Montant de la transaction (doit être positif)")
    currency: str = Field(default="XOF", description="Devise de la transaction")
    transaction_type: str = Field(..., min_length=1, description="Type de transaction")
    entity_id: str = Field(..., min_length=1, description="ID de l'entité")
    description: str = Field(default="", max_length=500, description="Description de la transaction")
    
    @validator('currency')
    def validate_currency(cls, v):
        allowed_currencies = ['XOF', 'USD', 'EUR', 'GBP', 'CAD']
        if v not in allowed_currencies:
            raise ValueError(f'Devise non supportée. Devises autorisées: {allowed_currencies}')
        return v
    
    @validator('transaction_type')
    def validate_transaction_type(cls, v):
        allowed_types = ['purchase', 'payment', 'transfer', 'international_transfer', 'cryptocurrency']
        if v not in allowed_types:
            raise ValueError(f'Type de transaction non supporté. Types autorisés: {allowed_types}')
        return v

class RiskAssessmentRequest(BaseModel):
    """Requête d'évaluation de risque"""
    transaction: TransactionData
    entity_data: Dict = Field(default_factory=dict, description="Données supplémentaires sur l'entité")

class RiskAssessmentResponse(BaseModel):
    """Réponse d'évaluation de risque"""
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Score de risque entre 0 et 1")
    risk_level: str = Field(..., description="Niveau de risque")
    risk_factors: List[str] = Field(..., description="Facteurs de risque identifiés")
    recommendations: List[str] = Field(..., description="Recommandations basées sur l'analyse")
    
    @validator('risk_level')
    def validate_risk_level(cls, v):
        allowed_levels = ['low', 'medium', 'high', 'critical']
        if v not in allowed_levels:
            raise ValueError(f'Niveau de risque invalide. Niveaux autorisés: {allowed_levels}')
        return v

@app.on_event("startup")
async def startup_event():
    """Événement de démarrage du service IA"""
    print("🤖 Démarrage du service IA CAMEG-CHAIN...")
    print(f"🌐 Service disponible sur http://{ai_settings.API_HOST}:{ai_settings.API_PORT}")
    
    # Créer le dossier des modèles s'il n'existe pas
    os.makedirs(ai_settings.MODEL_PATH, exist_ok=True)
    print(f"📁 Dossier des modèles: {ai_settings.MODEL_PATH}")

@app.get("/")
async def root():
    """Point d'entrée principal du service IA"""
    return {
        "service": "CAMEG-CHAIN AI Service",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Vérification de l'état du service IA"""
    return {
        "status": "healthy",
        "service": "ai",
        "models_loaded": False,  # À implémenter
        "version": "1.0.0"
    }

@app.post("/api/v1/risk-assessment", response_model=RiskAssessmentResponse)
async def assess_risk(request: RiskAssessmentRequest):
    """
    Évaluer le risque d'une transaction
    """
    start_time = datetime.utcnow()
    request_id = f"req_{int(start_time.timestamp() * 1000)}"
    
    try:
        # Log de la requête (sans données sensibles)
        logger.info(f"Risk assessment request {request_id} - Entity: {request.transaction.entity_id}, Amount: {request.transaction.amount}, Type: {request.transaction.transaction_type}")
        
        # Validation des données d'entrée
        if not request.transaction or not request.transaction.amount:
            logger.warning(f"Invalid request {request_id} - Missing transaction data")
            raise HTTPException(status_code=400, detail="Données de transaction manquantes")
        
        if request.transaction.amount < 0:
            logger.warning(f"Invalid request {request_id} - Negative amount: {request.transaction.amount}")
            raise HTTPException(status_code=400, detail="Montant de transaction invalide")
        
        if not request.transaction.entity_id:
            logger.warning(f"Invalid request {request_id} - Missing entity ID")
            raise HTTPException(status_code=400, detail="ID d'entité manquant")
        # Simulation d'un scoring de risque (à remplacer par un vrai modèle)
        risk_score = simulate_risk_scoring(request.transaction)
        
        # Déterminer le niveau de risque
        if risk_score < ai_settings.RISK_THRESHOLD_LOW:
            risk_level = "low"
        elif risk_score < ai_settings.RISK_THRESHOLD_MEDIUM:
            risk_level = "medium"
        elif risk_score < ai_settings.RISK_THRESHOLD_HIGH:
            risk_level = "high"
        else:
            risk_level = "critical"
        
        # Facteurs de risque identifiés
        risk_factors = identify_risk_factors(request.transaction)
        
        # Recommandations
        recommendations = generate_recommendations(risk_level, risk_factors)
        
        response = RiskAssessmentResponse(
            risk_score=risk_score,
            risk_level=risk_level,
            risk_factors=risk_factors,
            recommendations=recommendations
        )
        
        # Log de la réponse
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"Risk assessment completed {request_id} - Score: {risk_score}, Level: {risk_level}, Processing time: {processing_time:.3f}s")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Risk assessment error {request_id} - {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'évaluation: {str(e)}")

@app.post("/api/v1/anomaly-detection")
async def detect_anomalies(transaction_data: list):
    """
    Détecter les anomalies dans un ensemble de transactions
    """
    try:
        # Simulation de détection d'anomalies
        anomalies = []
        
        for i, transaction in enumerate(transaction_data):
            if transaction.get("amount", 0) > 1000000:  # Montant suspect
                anomalies.append({
                    "index": i,
                    "type": "high_amount",
                    "severity": "high",
                    "description": "Transaction avec montant élevé"
                })
        
        return {
            "anomalies_detected": len(anomalies),
            "anomalies": anomalies
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la détection: {str(e)}")

def simulate_risk_scoring(transaction: TransactionData) -> float:
    """
    Simulation d'un scoring de risque (à remplacer par un vrai modèle ML)
    """
    base_score = 0.5
    
    # Facteurs basés sur le montant
    if transaction.amount > 1000000:
        base_score += 0.3
    elif transaction.amount > 500000:
        base_score += 0.2
    elif transaction.amount > 100000:
        base_score += 0.1
    
    # Facteurs basés sur le type de transaction
    if transaction.transaction_type in ["international_transfer", "cryptocurrency"]:
        base_score += 0.2
    
    # Limiter entre 0 et 1
    return min(max(base_score, 0.0), 1.0)

def identify_risk_factors(transaction: TransactionData) -> list:
    """
    Identifier les facteurs de risque
    """
    factors = []
    
    if transaction.amount > 1000000:
        factors.append("Montant élevé")
    
    if transaction.transaction_type in ["international_transfer", "cryptocurrency"]:
        factors.append("Type de transaction à risque")
    
    if not transaction.description:
        factors.append("Description manquante")
    
    return factors

def generate_recommendations(risk_level: str, risk_factors: list) -> list:
    """
    Générer des recommandations basées sur le niveau de risque
    """
    recommendations = []
    
    if risk_level == "high" or risk_level == "critical":
        recommendations.append("Révision manuelle requise")
        recommendations.append("Vérification des documents")
    
    if "Montant élevé" in risk_factors:
        recommendations.append("Vérification de la source des fonds")
    
    if "Type de transaction à risque" in risk_factors:
        recommendations.append("Validation des autorisations")
    
    return recommendations

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=ai_settings.API_HOST,
        port=ai_settings.API_PORT,
        reload=ai_settings.DEBUG
    )
