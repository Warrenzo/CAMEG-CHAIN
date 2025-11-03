"""
Schémas Pydantic pour la gestion des appels d'offres
"""
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

from app.models.tender import TenderStatus, TenderType, BidStatus

# Schémas de base
class TenderBase(BaseModel):
    title: str
    description: str
    category: str
    opening_date: datetime
    closing_date: datetime
    tender_type: TenderType
    estimated_value: Optional[float] = None
    currency: str = "XOF"
    eligibility_rules: Optional[Dict[str, Any]] = None
    required_documents: Optional[List[str]] = None
    evaluation_criteria: Optional[Dict[str, Any]] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None

class TenderCreate(TenderBase):
    """Création d'un appel d'offres"""
    reference: str
    
    @validator('closing_date')
    def validate_closing_date(cls, v, values):
        if 'opening_date' in values and v <= values['opening_date']:
            raise ValueError('La date de clôture doit être postérieure à la date d\'ouverture')
        return v

class TenderUpdate(BaseModel):
    """Mise à jour d'un appel d'offres"""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    opening_date: Optional[datetime] = None
    closing_date: Optional[datetime] = None
    tender_type: Optional[TenderType] = None
    estimated_value: Optional[float] = None
    currency: Optional[str] = None
    eligibility_rules: Optional[Dict[str, Any]] = None
    required_documents: Optional[List[str]] = None
    evaluation_criteria: Optional[Dict[str, Any]] = None
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    status: Optional[TenderStatus] = None

class TenderResponse(TenderBase):
    """Réponse d'un appel d'offres"""
    id: UUID
    reference: str
    status: TenderStatus
    publication_date: datetime
    views_count: int
    eoi_count: int
    bids_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Permissions pour l'utilisateur connecté
    can_view: bool = True
    can_express_interest: bool = False
    can_submit_bid: bool = False
    missing_requirements: List[str] = []
    
    class Config:
        from_attributes = True

class TenderListResponse(BaseModel):
    """Liste des appels d'offres"""
    tenders: List[TenderResponse]
    total: int
    page: int
    size: int
    has_next: bool
    has_prev: bool

# Schémas pour les manifestations d'intérêt
class ExpressionOfInterestCreate(BaseModel):
    """Création d'une manifestation d'intérêt"""
    message: Optional[str] = None
    contact_preference: str = "email"

class ExpressionOfInterestResponse(BaseModel):
    """Réponse manifestation d'intérêt"""
    id: UUID
    tender_id: UUID
    supplier_id: UUID
    message: Optional[str] = None
    contact_preference: str
    status: str
    rfp_sent: bool
    reminder_sent: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les soumissions
class BidCreate(BaseModel):
    """Création d'une soumission"""
    total_amount: float
    currency: str = "XOF"
    validity_period: int = 90  # En jours
    technical_proposal: Optional[str] = None
    delivery_time: Optional[int] = None

class BidUpdate(BaseModel):
    """Mise à jour d'une soumission"""
    total_amount: Optional[float] = None
    currency: Optional[str] = None
    validity_period: Optional[int] = None
    technical_proposal: Optional[str] = None
    delivery_time: Optional[int] = None
    status: Optional[BidStatus] = None

class BidResponse(BaseModel):
    """Réponse d'une soumission"""
    id: UUID
    tender_id: UUID
    supplier_id: UUID
    bid_reference: str
    status: BidStatus
    total_amount: Optional[float] = None
    currency: str
    validity_period: Optional[int] = None
    technical_proposal: Optional[str] = None
    delivery_time: Optional[int] = None
    technical_score: Optional[float] = None
    financial_score: Optional[float] = None
    total_score: Optional[float] = None
    ai_compliance_score: Optional[float] = None
    ai_issues: Optional[List[str]] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schémas pour les documents
class DocumentUpload(BaseModel):
    """Upload de document"""
    document_type: str
    file_name: str
    file_size: int
    mime_type: str

class DocumentResponse(BaseModel):
    """Réponse document"""
    id: UUID
    document_type: str
    file_name: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    is_public: bool = True
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les permissions
class TenderPermissions(BaseModel):
    """Permissions d'un utilisateur sur un appel d'offres"""
    can_view: bool
    can_express_interest: bool
    can_submit_bid: bool
    can_download_documents: bool
    missing_requirements: List[str]
    eligibility_status: str  # eligible, not_eligible, pending_validation

# Schémas pour l'évaluation
class BidEvaluation(BaseModel):
    """Évaluation d'une soumission"""
    bid_id: UUID
    technical_score: float
    financial_score: float
    evaluation_notes: Optional[str] = None

class BidEvaluationResponse(BaseModel):
    """Réponse évaluation"""
    bid_id: UUID
    technical_score: float
    financial_score: float
    total_score: float
    evaluation_notes: Optional[str] = None
    evaluated_at: datetime
    evaluated_by: UUID
    
    class Config:
        from_attributes = True

# Schémas pour les notifications
class NotificationResponse(BaseModel):
    """Réponse notification"""
    id: UUID
    tender_id: UUID
    notification_type: str
    title: str
    message: str
    is_read: bool
    sent_at: datetime
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schémas pour les statistiques
class TenderStats(BaseModel):
    """Statistiques des appels d'offres"""
    total_tenders: int
    published_tenders: int
    open_tenders: int
    closed_tenders: int
    total_eois: int
    total_bids: int
    average_bids_per_tender: float

class SupplierTenderStats(BaseModel):
    """Statistiques fournisseur"""
    total_eois: int
    total_bids: int
    awarded_bids: int
    success_rate: float
    active_tenders: List[TenderResponse]
