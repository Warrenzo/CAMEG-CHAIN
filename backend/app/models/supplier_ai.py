"""
Modèles pour l'évaluation IA proactive des fournisseurs
Système d'analyse et de préqualification de nouveaux fournisseurs mondiaux
"""
from sqlalchemy import Column, String, Boolean, DateTime, Float, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base

class RelationCameg(str, enum.Enum):
    """Types de relation avec CAMEG"""
    ANCIEN = "ancien"  # Déjà partenaire CAMEG
    NOUVEAU = "nouveau"  # Nouveau fournisseur
    INCONNU = "inconnu"  # Non identifié

class SourceIdentification(str, enum.Enum):
    """Sources d'identification des fournisseurs"""
    OMS_PQ = "OMS_PQ"  # WHO Prequalification
    FDA = "FDA"  # FDA Registration
    EMA = "EMA"  # EMA Authorization
    INSPECTION_NATIONALE = "inspection_nationale"  # Inspection nationale
    RECHERCHE_IA = "recherche_IA"  # Découverte par IA
    SOUMISSION_SPONTANEE = "soumission_spontanee"  # Soumission spontanée

class EtatPrequalification(str, enum.Enum):
    """États de préqualification"""
    PREQUALIFIE = "prequalifie"
    SOUS_EXAMEN = "sous_examen"
    REJETE = "rejete"
    A_AUDITER = "a_auditer"
    NON_EVALUE = "non_evalue"

class AiRecommendation(str, enum.Enum):
    """Recommandations de l'IA"""
    PREQUALIFIE = "prequalifie"  # ≥80 points
    A_AUDITER = "a_auditer"  # 60-79 points
    RISQUE_ELEVE = "risque_eleve"  # <60 points

class SupplierAI(Base):
    """Modèle étendu pour l'évaluation IA des fournisseurs"""
    __tablename__ = "suppliers_ai"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), unique=True, nullable=False)
    
    # Relation avec CAMEG
    relation_cameg = Column(String(20), default=RelationCameg.NOUVEAU)
    source_identification = Column(String(50))
    niveau_confiance = Column(Float, default=0.0)  # Score de fiabilité (0-1)
    etat_prequalification = Column(String(20), default=EtatPrequalification.NON_EVALUE)
    
    # Scores d'évaluation IA (selon la grille d'analyse)
    score_certifications = Column(Float, default=0.0)  # Certifications & conformité GMP (35%)
    score_experience = Column(Float, default=0.0)  # Expérience et réputation (20%)
    score_documentaire = Column(Float, default=0.0)  # Qualité documentaire (15%)
    score_capacite = Column(Float, default=0.0)  # Capacité de production (15%)
    score_prix = Column(Float, default=0.0)  # Prix/compétitivité (10%)
    score_risque = Column(Float, default=0.0)  # Risque géopolitique (5%)
    score_predictif_total = Column(Float, default=0.0)  # Score global prédictif
    
    # Données externes collectées par l'IA
    who_pq_status = Column(String(50))  # Statut WHO Prequalification
    fda_registration = Column(String(50))  # Enregistrement FDA
    ema_authorization = Column(String(50))  # Autorisation EMA
    gmp_certificates = Column(JSON)  # Certificats GMP par pays
    external_references = Column(JSON)  # Références clients externes
    audit_history = Column(JSON)  # Historique d'audits
    product_portfolio = Column(JSON)  # Portefeuille de produits
    market_presence = Column(JSON)  # Présence sur les marchés
    
    # Recommandations IA
    ai_recommendation = Column(String(20))
    ai_confidence_level = Column(Float, default=0.0)  # Niveau de confiance IA
    ai_analysis_date = Column(DateTime(timezone=True))
    ai_analysis_notes = Column(Text)
    
    # Métadonnées
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    supplier = relationship("Supplier", backref="ai_evaluation")

class ExternalDataSource(Base):
    """Sources de données externes utilisées par l'IA"""
    __tablename__ = "external_data_sources"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_ai_id = Column(UUID(as_uuid=True), ForeignKey("suppliers_ai.id"), nullable=False)
    
    source_name = Column(String(100), nullable=False)  # WHO, FDA, EMA, etc.
    source_type = Column(String(50), nullable=False)  # certification, registration, audit, etc.
    source_url = Column(String(500))
    data_extracted = Column(JSON)  # Données extraites
    confidence_score = Column(Float, default=0.0)  # Score de confiance de la source
    last_updated = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    supplier_ai = relationship("SupplierAI", backref="external_sources")

class AiAnalysisLog(Base):
    """Logs des analyses IA pour traçabilité"""
    __tablename__ = "ai_analysis_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_ai_id = Column(UUID(as_uuid=True), ForeignKey("suppliers_ai.id"), nullable=False)
    
    analysis_type = Column(String(50), nullable=False)  # initial, update, re_evaluation
    trigger_source = Column(String(50))  # manual, scheduled, new_data, etc.
    
    # Résultats de l'analyse
    scores_before = Column(JSON)  # Scores avant analyse
    scores_after = Column(JSON)  # Scores après analyse
    recommendation_before = Column(String(20))
    recommendation_after = Column(String(20))
    
    # Détails de l'analyse
    analysis_details = Column(JSON)  # Détails de l'analyse
    data_sources_used = Column(JSON)  # Sources utilisées
    processing_time = Column(Float)  # Temps de traitement en secondes
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    supplier_ai = relationship("SupplierAI", backref="analysis_logs")

class SupplierRecommendation(Base):
    """Recommandations de fournisseurs pour la DAQP"""
    __tablename__ = "supplier_recommendations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_ai_id = Column(UUID(as_uuid=True), ForeignKey("suppliers_ai.id"), nullable=False)
    recommended_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))  # Utilisateur qui recommande
    
    recommendation_type = Column(String(50), nullable=False)  # prequalification, audit, rejection
    priority_level = Column(String(20), default="medium")  # high, medium, low
    justification = Column(Text)
    
    # Statut de la recommandation
    status = Column(String(20), default="pending")  # pending, approved, rejected, under_review
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    review_date = Column(DateTime(timezone=True))
    review_notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    supplier_ai = relationship("SupplierAI", backref="recommendations")
    recommender = relationship("User", foreign_keys=[recommended_by])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
