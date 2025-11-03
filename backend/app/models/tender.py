"""
Modèles pour la gestion des appels d'offres et soumissions
"""
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text, ForeignKey, Integer, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base

class TenderStatus(str, enum.Enum):
    """Statuts des appels d'offres"""
    DRAFT = "draft"
    PUBLISHED = "published"
    OPEN = "open"
    CLOSED = "closed"
    EVALUATED = "evaluated"
    AWARDED = "awarded"
    CANCELLED = "cancelled"

class TenderType(str, enum.Enum):
    """Types d'appels d'offres"""
    OPEN = "open"  # Ouvert à tous
    RESTRICTED = "restricted"  # Restreint aux préqualifiés
    NEGOTIATED = "negotiated"  # Négocié

class BidStatus(str, enum.Enum):
    """Statuts des soumissions"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    EVALUATED = "evaluated"
    AWARDED = "awarded"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class Tender(Base):
    """Modèle appel d'offres"""
    __tablename__ = "tenders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    
    # Dates importantes
    publication_date = Column(DateTime(timezone=True), nullable=False)
    opening_date = Column(DateTime(timezone=True), nullable=False)
    closing_date = Column(DateTime(timezone=True), nullable=False)
    
    # Configuration
    tender_type = Column(Enum(TenderType), default=TenderType.OPEN, nullable=False)
    status = Column(Enum(TenderStatus), default=TenderStatus.DRAFT, nullable=False)
    
    # Règles d'éligibilité
    eligibility_rules = Column(JSON)  # {"countries": ["CI", "TG"], "supplier_types": ["pharmaceutical"]}
    required_documents = Column(JSON)  # ["licence_pharmaceutique", "certificat_gmp"]
    
    # Informations financières
    estimated_value = Column(Float)
    currency = Column(String(3), default="XOF")
    
    # Méthode d'évaluation
    evaluation_criteria = Column(JSON)  # {"technical": 70, "financial": 30}
    
    # Contact
    contact_person = Column(String(100))
    contact_email = Column(String(100))
    contact_phone = Column(String(20))
    
    # Documents fournis
    rfp_document_path = Column(String(500))  # Dossier AO
    annexes = Column(JSON)  # Liste des annexes
    
    # Statistiques
    views_count = Column(Integer, default=0)
    eoi_count = Column(Integer, default=0)  # Manifestations d'intérêt
    bids_count = Column(Integer, default=0)  # Soumissions
    
    # Audit
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    creator = relationship("User")
    expressions_of_interest = relationship("ExpressionOfInterest", back_populates="tender")
    bids = relationship("Bid", back_populates="tender")
    documents = relationship("TenderDocument", back_populates="tender")

class ExpressionOfInterest(Base):
    """Manifestation d'intérêt (EOI)"""
    __tablename__ = "expressions_of_interest"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tender_id = Column(UUID(as_uuid=True), ForeignKey("tenders.id"), nullable=False)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=False)
    
    # Informations de la manifestation
    message = Column(Text)
    contact_preference = Column(String(50))  # email, phone, both
    
    # Statut
    status = Column(String(20), default="active")  # active, withdrawn
    
    # Notifications
    rfp_sent = Column(Boolean, default=False)
    reminder_sent = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    tender = relationship("Tender", back_populates="expressions_of_interest")
    supplier = relationship("Supplier")

class Bid(Base):
    """Soumission d'offre"""
    __tablename__ = "bids"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tender_id = Column(UUID(as_uuid=True), ForeignKey("tenders.id"), nullable=False)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=False)
    
    # Informations de la soumission
    bid_reference = Column(String(50), unique=True, nullable=False)
    status = Column(Enum(BidStatus), default=BidStatus.DRAFT, nullable=False)
    
    # Offre financière
    total_amount = Column(Float)
    currency = Column(String(3), default="XOF")
    validity_period = Column(Integer)  # En jours
    
    # Informations techniques
    technical_proposal = Column(Text)
    delivery_time = Column(Integer)  # En jours
    
    # Documents soumis
    documents_submitted = Column(JSON)  # Liste des documents uploadés
    
    # Évaluation
    technical_score = Column(Float)
    financial_score = Column(Float)
    total_score = Column(Float)
    evaluation_notes = Column(Text)
    
    # Validation IA
    ai_compliance_score = Column(Float)  # Score de conformité IA (0-100)
    ai_issues = Column(JSON)  # Problèmes détectés par l'IA
    ai_recommendations = Column(JSON)  # Recommandations IA
    
    # Audit
    submitted_at = Column(DateTime(timezone=True))
    evaluated_at = Column(DateTime(timezone=True))
    evaluated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    tender = relationship("Tender", back_populates="bids")
    supplier = relationship("Supplier")
    evaluator = relationship("User")
    documents = relationship("BidDocument", back_populates="bid")

class TenderDocument(Base):
    """Documents des appels d'offres"""
    __tablename__ = "tender_documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tender_id = Column(UUID(as_uuid=True), ForeignKey("tenders.id"), nullable=False)
    
    document_type = Column(String(100), nullable=False)  # rfp, annex, specification
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    
    # Visibilité
    is_public = Column(Boolean, default=True)
    requires_authentication = Column(Boolean, default=False)
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    tender = relationship("Tender", back_populates="documents")

class BidDocument(Base):
    """Documents des soumissions"""
    __tablename__ = "bid_documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bid_id = Column(UUID(as_uuid=True), ForeignKey("bids.id"), nullable=False)
    
    document_type = Column(String(100), nullable=False)  # technical_proposal, financial_offer, certificate
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    
    # Validation
    is_validated = Column(Boolean, default=False)
    validation_notes = Column(Text)
    validated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    validated_at = Column(DateTime(timezone=True))
    
    # IA
    ai_analysis = Column(JSON)  # Analyse IA du document
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    bid = relationship("Bid", back_populates="documents")
    validator = relationship("User")

class TenderNotification(Base):
    """Notifications liées aux appels d'offres"""
    __tablename__ = "tender_notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tender_id = Column(UUID(as_uuid=True), ForeignKey("tenders.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    notification_type = Column(String(50), nullable=False)  # published, reminder, closed, awarded
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    
    # Statut
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
    
    # Relations
    tender = relationship("Tender")
    user = relationship("User")
