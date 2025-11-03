"""
Modèles optimisés pour la gestion des utilisateurs et fournisseurs
"""
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base

class UserRole(str, enum.Enum):
    """Rôles des utilisateurs"""
    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"
    SUPPLIER = "supplier"
    EVALUATOR = "evaluator"
    SUPERADMIN = "superadmin"
    USER = "user"

class UserStatus(str, enum.Enum):
    """Statuts des utilisateurs"""
    PENDING_VALIDATION = "en_attente_validation"
    ACTIVE = "actif"
    REJECTED = "rejeté"
    SUSPENDED = "suspendu"

class User(Base):
    """Modèle utilisateur"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(String(20), default='user', nullable=False)
    is_active = Column(Boolean, default=True)
    status = Column(String(50), default='actif')
    email_verified = Column(Boolean, default=True)
    phone_number = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relations
    supplier_profile = relationship("Supplier", back_populates="user", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="user")
    
    # Index pour optimiser les performances
    __table_args__ = (
        Index('idx_user_email', 'email'),
        Index('idx_user_status', 'status'),
        Index('idx_user_role', 'role'),
        Index('idx_user_created_at', 'created_at'),
        Index('idx_user_last_login', 'last_login'),
        Index('idx_user_status_role', 'status', 'role'),
        Index('idx_user_email_status', 'email', 'status'),  # Pour les requêtes de validation
        Index('idx_user_role_status', 'role', 'status'),    # Pour les requêtes par rôle
        Index('idx_user_active_created', 'is_active', 'created_at'),  # Pour les statistiques
    )

class Supplier(Base):
    """Modèle fournisseur - Phase 1 et 2"""
    __tablename__ = "suppliers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Phase 1 - Informations de base
    company_name = Column(String(200), nullable=False)
    country = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=False)
    
    # Phase 2 - Profil complet
    legal_name = Column(String(200))  # Raison sociale
    rccm = Column(String(50))  # Numéro RCCM
    nif = Column(String(50))  # Numéro d'identification fiscale
    address = Column(Text)
    city = Column(String(100))
    postal_code = Column(String(20))
    website = Column(String(200))
    
    # Informations du responsable
    contact_person_name = Column(String(100))
    contact_person_position = Column(String(100))
    contact_person_email = Column(String(100))
    contact_person_phone = Column(String(20))
    
    # Type de fournisseur
    supplier_type = Column(String(50))  # pharmaceutique, medical, etc.
    
    # Statut du profil
    profile_completion_percentage = Column(String(10), default="25")  # 25% après phase 1
    profile_status = Column(String(50), default="phase_1_complete")
    
    # Documents uploadés
    documents_uploaded = Column(String(10), default="0/0")  # "3/5" par exemple
    
    # Références commerciales
    previous_clients = Column(Text)
    countries_of_activity = Column(Text)
    years_of_experience = Column(String(10))
    
    # Validation
    validated_by_admin = Column(Boolean, default=False)
    validation_date = Column(DateTime(timezone=True))
    validation_notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relations
    user = relationship("User", back_populates="supplier_profile")
    documents = relationship("SupplierDocument", back_populates="supplier")

class SupplierDocument(Base):
    """Documents des fournisseurs"""
    __tablename__ = "supplier_documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=False)
    
    document_type = Column(String(100), nullable=False)  # licence_pharmaceutique, certificat_gmp, etc.
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(String(20))
    mime_type = Column(String(100))
    
    # Validation
    is_validated = Column(Boolean, default=False)
    validated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    validation_date = Column(DateTime(timezone=True))
    validation_notes = Column(Text)
    
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    supplier = relationship("Supplier", back_populates="documents")
    validator = relationship("User")

class AuditLog(Base):
    """Logs d'audit pour tracer les actions"""
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    action = Column(String(100), nullable=False)  # user_registered, profile_updated, etc.
    table_name = Column(String(50))
    record_id = Column(UUID(as_uuid=True))
    old_values = Column(Text)  # JSON string
    new_values = Column(Text)  # JSON string
    
    ip_address = Column(String(45))
    user_agent = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    user = relationship("User", back_populates="audit_logs")
