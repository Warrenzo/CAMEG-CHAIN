"""
Schémas Pydantic pour la gestion administrative des utilisateurs
"""
from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from app.models.user import UserRole, UserStatus

# Schémas pour la création d'utilisateurs
class AdminCreate(BaseModel):
    """Création d'un administrateur"""
    email: EmailStr
    password: str
    full_name: str
    username: Optional[str] = None
    phone_number: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Le mot de passe doit contenir au moins 8 caractères')
        if not any(c.isupper() for c in v):
            raise ValueError('Le mot de passe doit contenir au moins une majuscule')
        if not any(c.islower() for c in v):
            raise ValueError('Le mot de passe doit contenir au moins une minuscule')
        if not any(c.isdigit() for c in v):
            raise ValueError('Le mot de passe doit contenir au moins un chiffre')
        if not any(c in '!@#$%^&*(),.?":{}|<>' for c in v):
            raise ValueError('Le mot de passe doit contenir au moins un caractère spécial')
        return v
    
    @validator('username', pre=True, always=True)
    def generate_username(cls, v, values):
        if not v and 'email' in values:
            return values['email'].split('@')[0]
        return v

class EvaluatorCreate(BaseModel):
    """Création d'un évaluateur"""
    email: EmailStr
    password: str
    full_name: str
    username: Optional[str] = None
    phone_number: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Le mot de passe doit contenir au moins 8 caractères')
        if not any(c.isupper() for c in v):
            raise ValueError('Le mot de passe doit contenir au moins une majuscule')
        if not any(c.islower() for c in v):
            raise ValueError('Le mot de passe doit contenir au moins une minuscule')
        if not any(c.isdigit() for c in v):
            raise ValueError('Le mot de passe doit contenir au moins un chiffre')
        if not any(c in '!@#$%^&*(),.?":{}|<>' for c in v):
            raise ValueError('Le mot de passe doit contenir au moins un caractère spécial')
        return v
    
    @validator('username', pre=True, always=True)
    def generate_username(cls, v, values):
        if not v and 'email' in values:
            return values['email'].split('@')[0]
        return v

# Schémas pour la réponse
class UserAdminResponse(BaseModel):
    """Réponse pour un utilisateur administrateur"""
    id: UUID
    email: str
    username: str
    full_name: Optional[str] = None
    role: str
    status: str
    is_active: bool
    phone_number: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    """Liste des utilisateurs"""
    users: List[UserAdminResponse]
    total: int
    page: int
    size: int
    has_next: bool
    has_prev: bool

# Schémas pour la désactivation
class UserDeactivateRequest(BaseModel):
    """Requête pour désactiver un utilisateur"""
    reason: Optional[str] = None

class UserDeactivateResponse(BaseModel):
    """Réponse de désactivation"""
    success: bool
    message: str
    user_id: UUID
    status: str

# Schémas pour la réactivation
class UserReactivateRequest(BaseModel):
    """Requête pour réactiver un utilisateur"""
    reason: Optional[str] = None

class UserReactivateResponse(BaseModel):
    """Réponse de réactivation"""
    success: bool
    message: str
    user_id: UUID
    status: str

# Schéma pour la réinitialisation de mot de passe
class ResetPasswordRequest(BaseModel):
    """Payload pour réinitialiser le mot de passe d'un utilisateur"""
    new_password: str = Field(..., min_length=8, description="Nouveau mot de passe")
    confirm_password: str = Field(..., min_length=8, description="Confirmation du mot de passe")
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Le mot de passe doit contenir au moins 8 caractères')
        if not any(c.isupper() for c in v):
            raise ValueError('Le mot de passe doit contenir au moins une majuscule')
        if not any(c.islower() for c in v):
            raise ValueError('Le mot de passe doit contenir au moins une minuscule')
        if not any(c.isdigit() for c in v):
            raise ValueError('Le mot de passe doit contenir au moins un chiffre')
        if not any(c in '!@#$%^&*(),.?":{}|<>' for c in v):
            raise ValueError('Le mot de passe doit contenir au moins un caractère spécial')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Les mots de passe ne correspondent pas')
        return v

class ResetPasswordResponse(BaseModel):
    """Réponse après réinitialisation du mot de passe"""
    success: bool
    message: str
    user_id: UUID
    updated_at: datetime

