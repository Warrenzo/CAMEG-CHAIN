"""
Schémas Pydantic pour l'évaluation IA des fournisseurs
"""
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class RelationCamegEnum(str, Enum):
    ANCIEN = "ancien"
    NOUVEAU = "nouveau"
    INCONNU = "inconnu"

class SourceIdentificationEnum(str, Enum):
    OMS_PQ = "OMS_PQ"
    FDA = "FDA"
    EMA = "EMA"
    INSPECTION_NATIONALE = "inspection_nationale"
    RECHERCHE_IA = "recherche_IA"
    SOUMISSION_SPONTANEE = "soumission_spontanee"

class EtatPrequalificationEnum(str, Enum):
    PREQUALIFIE = "prequalifie"
    SOUS_EXAMEN = "sous_examen"
    REJETE = "rejete"
    A_AUDITER = "a_auditer"
    NON_EVALUE = "non_evalue"

class AiRecommendationEnum(str, Enum):
    PREQUALIFIE = "prequalifie"
    A_AUDITER = "a_auditer"
    RISQUE_ELEVE = "risque_eleve"

class SupplierAnalysisRequest(BaseModel):
    """Requête d'analyse IA d'un fournisseur"""
    force_reanalysis: bool = Field(False, description="Forcer une nouvelle analyse même si une existe déjà")

class SupplierAnalysisResponse(BaseModel):
    """Réponse d'analyse IA d'un fournisseur"""
    supplier_id: str
    status: str
    message: str

class SupplierScores(BaseModel):
    """Scores d'évaluation IA"""
    certifications: float = Field(..., description="Score certifications & conformité GMP (35%)")
    experience: float = Field(..., description="Score expérience et réputation (20%)")
    documentaire: float = Field(..., description="Score qualité documentaire (15%)")
    capacite: float = Field(..., description="Score capacité de production (15%)")
    prix: float = Field(..., description="Score prix/compétitivité (10%)")
    risque: float = Field(..., description="Score risque géopolitique (5%)")
    total: float = Field(..., description="Score total pondéré")

class SupplierAIResponse(BaseModel):
    """Réponse complète d'évaluation IA d'un fournisseur"""
    supplier_id: str
    company_name: str
    country: str
    relation_cameg: Optional[str]
    source_identification: Optional[str]
    niveau_confiance: float
    etat_prequalification: Optional[str]
    scores: SupplierScores
    ai_recommendation: Optional[str]
    ai_confidence_level: float
    ai_analysis_date: Optional[datetime]
    ai_analysis_notes: Optional[str]
    
    # Données externes
    who_pq_status: Optional[str]
    fda_registration: Optional[str]
    ema_authorization: Optional[str]
    gmp_certificates: Optional[Dict[str, Any]]
    external_references: Optional[Dict[str, Any]]
    product_portfolio: Optional[Dict[str, Any]]
    market_presence: Optional[Dict[str, Any]]

class SupplierSearchRequest(BaseModel):
    """Requête de recherche de fournisseurs"""
    query: Optional[str] = Field(None, description="Terme de recherche")
    relation_type: Optional[str] = Field(None, description="Type de relation avec CAMEG")
    min_score: Optional[float] = Field(None, description="Score minimum")
    recommendation: Optional[str] = Field(None, description="Recommandation IA")
    country: Optional[str] = Field(None, description="Pays du fournisseur")
    limit: int = Field(50, description="Nombre maximum de résultats")

class SupplierSearchResult(BaseModel):
    """Résultat de recherche d'un fournisseur"""
    id: str
    company_name: str
    country: str
    score: float
    recommendation: Optional[str]
    relation_type: Optional[str]
    who_pq_status: Optional[str]
    last_analysis: Optional[datetime]

class SupplierSearchResults(BaseModel):
    """Résultats de recherche organisés par catégorie"""
    partenaires_actuels: List[SupplierSearchResult]
    nouveaux_prequalifies: List[SupplierSearchResult]
    a_auditer: List[SupplierSearchResult]
    total: int

class SupplierSearchResponse(BaseModel):
    """Réponse de recherche de fournisseurs"""
    query: Optional[str]
    filters: Dict[str, Any]
    results: SupplierSearchResults
    total_found: int

class RecommendationRequest(BaseModel):
    """Requête de création de recommandation"""
    supplier_id: str
    user_id: str
    recommendation_type: str = Field(..., description="Type de recommandation")
    justification: str = Field(..., description="Justification de la recommandation")
    priority_level: Optional[str] = Field("medium", description="Niveau de priorité")

class RecommendationResponse(BaseModel):
    """Réponse de création de recommandation"""
    id: str
    supplier_name: str
    recommendation_type: str
    priority_level: str
    status: str
    message: str

class ExternalDataSourceResponse(BaseModel):
    """Source de données externe"""
    id: str
    source_name: str
    source_type: str
    source_url: Optional[str]
    confidence_score: float
    last_updated: Optional[datetime]
    data_extracted: Optional[Dict[str, Any]]

class AiDashboardStats(BaseModel):
    """Statistiques du tableau de bord IA"""
    total_suppliers_analyzed: int
    prequalified: int
    to_audit: int
    high_risk: int
    relation_breakdown: Dict[str, int]
    pending_recommendations: int
    analysis_coverage: str

class BatchAnalysisRequest(BaseModel):
    """Requête d'analyse en lot"""
    supplier_ids: List[str] = Field(..., description="Liste des IDs des fournisseurs à analyser")

class BatchAnalysisResult(BaseModel):
    """Résultat d'analyse en lot"""
    supplier_id: str
    status: str
    company_name: Optional[str] = None
    error: Optional[str] = None

class BatchAnalysisResponse(BaseModel):
    """Réponse d'analyse en lot"""
    message: str
    results: List[BatchAnalysisResult]
    total_queued: int

class PendingRecommendation(BaseModel):
    """Recommandation en attente"""
    id: str
    supplier_name: str
    supplier_country: str
    recommendation_type: str
    priority_level: str
    justification: str
    ai_score: float
    ai_recommendation: Optional[str]
    created_at: datetime
    recommended_by: Optional[str]

class PendingRecommendationsResponse(BaseModel):
    """Réponse des recommandations en attente"""
    recommendations: List[PendingRecommendation]
    total: int

class AiAnalysisLogResponse(BaseModel):
    """Log d'analyse IA"""
    id: str
    analysis_type: str
    trigger_source: Optional[str]
    scores_after: Optional[Dict[str, Any]]
    recommendation_after: Optional[str]
    analysis_details: Optional[Dict[str, Any]]
    processing_time: Optional[float]
    created_at: datetime

class SupplierAnalysisHistory(BaseModel):
    """Historique des analyses d'un fournisseur"""
    supplier_id: str
    company_name: str
    analysis_logs: List[AiAnalysisLogResponse]
    current_score: float
    current_recommendation: Optional[str]
    last_analysis_date: Optional[datetime]
