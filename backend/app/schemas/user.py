"""
Schémas Pydantic sécurisés pour la validation des données utilisateur
"""
import re
import html
from pydantic import BaseModel, EmailStr, validator, Field, constr
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum

from app.models.user import UserRole, UserStatus

# Schémas de base
class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: constr(min_length=8, max_length=128)
    
    @validator('username', pre=True, always=True)
    def generate_username(cls, v, values):
        """Générer automatiquement un username à partir de l'email si non fourni"""
        if not v and 'email' in values:
            return values['email'].split('@')[0]
        return v
    
    @validator('password')
    def validate_password(cls, v):
        """Validation sécurisée du mot de passe"""
        if len(v) < 8:
            raise ValueError('Le mot de passe doit contenir au moins 8 caractères')
        
        if not re.search(r"[A-Z]", v):
            raise ValueError('Le mot de passe doit contenir au moins une majuscule')
        
        if not re.search(r"[a-z]", v):
            raise ValueError('Le mot de passe doit contenir au moins une minuscule')
        
        if not re.search(r"\d", v):
            raise ValueError('Le mot de passe doit contenir au moins un chiffre')
        
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Le mot de passe doit contenir au moins un caractère spécial')
        
        # Vérifier les mots de passe communs
        common_passwords = [
            "password", "123456", "123456789", "qwerty", "abc123",
            "password123", "admin", "letmein", "welcome", "monkey",
            "12345678", "1234567890", "password1", "qwerty123", "admin123",
            "root", "toor", "pass", "test", "guest", "user", "demo",
            "cameg", "togo", "pharma", "supplier", "evaluator"
        ]
        
        if v.lower() in common_passwords:
            raise ValueError('Ce mot de passe est trop commun')
        
        return v
    
    @validator('full_name')
    def sanitize_full_name(cls, v):
        """Sanitiser le nom complet"""
        if v:
            # Échapper les caractères HTML
            v = html.escape(v.strip())
            # Limiter la longueur
            if len(v) > 100:
                raise ValueError('Le nom ne peut pas dépasser 100 caractères')
            # Vérifier les caractères autorisés
            if not re.match(r'^[a-zA-ZÀ-ÿ\s\-\'\.]+$', v):
                raise ValueError('Le nom contient des caractères non autorisés')
        return v

class UserResponse(UserBase):
    id: UUID
    role: UserRole
    status: UserStatus
    is_active: bool
    email_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schémas pour l'inscription Phase 1
class SupplierPhase1Create(BaseModel):
    """Inscription Phase 1 - Informations minimales sécurisées"""
    email: EmailStr
    password: constr(min_length=8, max_length=128)
    company_name: constr(min_length=2, max_length=200)
    country: constr(min_length=2, max_length=100)
    phone_number: constr(min_length=8, max_length=20)
    
    @validator('password')
    def validate_password(cls, v):
        """Validation sécurisée du mot de passe"""
        if len(v) < 8:
            raise ValueError('Le mot de passe doit contenir au moins 8 caractères')
        
        if not re.search(r"[A-Z]", v):
            raise ValueError('Le mot de passe doit contenir au moins une majuscule')
        
        if not re.search(r"[a-z]", v):
            raise ValueError('Le mot de passe doit contenir au moins une minuscule')
        
        if not re.search(r"\d", v):
            raise ValueError('Le mot de passe doit contenir au moins un chiffre')
        
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Le mot de passe doit contenir au moins un caractère spécial')
        
        return v
    
    @validator('company_name')
    def validate_company_name(cls, v):
        """Validation et sanitiser le nom de l'entreprise"""
        v = html.escape(v.strip())
        if len(v) < 2:
            raise ValueError('Le nom de l\'entreprise doit contenir au moins 2 caractères')
        
        # Vérifier les caractères autorisés
        if not re.match(r'^[a-zA-ZÀ-ÿ0-9\s\-\'\.&,()]+$', v):
            raise ValueError('Le nom de l\'entreprise contient des caractères non autorisés')
        
        return v
    
    @validator('country')
    def validate_country(cls, v):
        """Validation du pays"""
        v = html.escape(v.strip())
        if not re.match(r'^[a-zA-ZÀ-ÿ\s\-]+$', v):
            raise ValueError('Le nom du pays contient des caractères non autorisés')
        return v
    
    @validator('phone_number')
    def validate_phone(cls, v):
        """Validation sécurisée du numéro de téléphone"""
        # Nettoyer le numéro
        v = re.sub(r'[^\d\+\-\(\)\s]', '', v.strip())
        
        # Validation du format
        if not re.match(r'^[\+]?[0-9\s\-\(\)]{8,20}$', v):
            raise ValueError('Format de numéro de téléphone invalide')
        
        # Vérifier qu'il y a au moins 8 chiffres
        digits = re.sub(r'[^\d]', '', v)
        if len(digits) < 8:
            raise ValueError('Le numéro de téléphone doit contenir au moins 8 chiffres')
        
        return v

class SupplierPhase1Response(BaseModel):
    """Réponse après inscription Phase 1"""
    message: str
    user_id: UUID
    status: str
    next_steps: str

# Schémas pour le profil complet Phase 2
class SupplierPhase2Update(BaseModel):
    """Mise à jour Phase 2 - Profil complet"""
    legal_name: Optional[str] = None
    rccm: Optional[str] = None
    nif: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    website: Optional[str] = None
    
    # Informations du responsable
    contact_person_name: Optional[str] = None
    contact_person_position: Optional[str] = None
    contact_person_email: Optional[EmailStr] = None
    contact_person_phone: Optional[str] = None
    
    # Type de fournisseur
    supplier_type: Optional[str] = None
    
    # Références commerciales
    previous_clients: Optional[str] = None
    countries_of_activity: Optional[str] = None
    years_of_experience: Optional[str] = None

class SupplierResponse(BaseModel):
    """Réponse complète du fournisseur"""
    id: UUID
    user_id: UUID
    company_name: str
    country: str
    phone_number: str
    legal_name: Optional[str] = None
    rccm: Optional[str] = None
    nif: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    website: Optional[str] = None
    contact_person_name: Optional[str] = None
    contact_person_position: Optional[str] = None
    contact_person_email: Optional[str] = None
    contact_person_phone: Optional[str] = None
    supplier_type: Optional[str] = None
    profile_completion_percentage: str
    profile_status: str
    documents_uploaded: str
    previous_clients: Optional[str] = None
    countries_of_activity: Optional[str] = None
    years_of_experience: Optional[str] = None
    validated_by_admin: bool
    validation_date: Optional[datetime] = None
    validation_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schémas pour les documents
class DocumentUpload(BaseModel):
    """Upload de document"""
    document_type: str
    file_name: str
    file_size: str
    mime_type: str

class DocumentResponse(BaseModel):
    """Réponse document"""
    id: UUID
    document_type: str
    file_name: str
    file_size: Optional[str] = None
    mime_type: Optional[str] = None
    is_validated: bool
    uploaded_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour l'authentification
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

# Schémas pour l'administration
class SupplierValidationRequest(BaseModel):
    """Demande de validation d'un fournisseur"""
    supplier_id: UUID
    action: str  # "approve" ou "reject"
    notes: Optional[str] = None

class AdminDashboardResponse(BaseModel):
    """Tableau de bord administrateur"""
    total_suppliers: int
    pending_validation: int
    active_suppliers: int
    rejected_suppliers: int
    recent_registrations: List[SupplierResponse]
    suppliers_by_status: dict
