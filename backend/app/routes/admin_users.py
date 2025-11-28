"""
Routes pour la gestion administrative des utilisateurs (Super Admin)
Création, désactivation, réactivation des utilisateurs (Admin, Evaluator, Supplier)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime
import uuid
import bcrypt

from app.database import get_db
from app.routes.auth import get_current_user as get_current_user_from_auth
from app.models.user import User, UserRole, UserStatus, Supplier
from app.schemas.admin import (
    AdminCreate, EvaluatorCreate,
    UserAdminResponse, UserListResponse,
    UserDeactivateRequest, UserDeactivateResponse,
    UserReactivateRequest, UserReactivateResponse,
    ResetPasswordRequest, ResetPasswordResponse
)
from app.services.auth import AuthService

router = APIRouter(prefix="/api/v1/admin/users", tags=["Admin Users"])

def require_superadmin(current_user: User = Depends(get_current_user_from_auth)):
    """Vérifier que l'utilisateur est super-admin"""
    if current_user.role != UserRole.SUPERADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux super-administrateurs"
        )
    return current_user

def hash_password(password: str) -> str:
    """Hacher un mot de passe avec bcrypt"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

# ==================== CRÉATION D'UTILISATEURS ====================

@router.post("/admins", response_model=UserAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_admin(
    admin_data: AdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Créer un nouvel administrateur
    """
    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == admin_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà"
        )
    
    # Vérifier si le username existe déjà
    username = admin_data.username or admin_data.email.split('@')[0]
    existing_username = db.query(User).filter(User.username == username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec ce nom d'utilisateur existe déjà"
        )
    
    # Créer le nouvel administrateur
    hashed_password = hash_password(admin_data.password)
    new_admin = User(
        id=uuid.uuid4(),
        email=admin_data.email,
        username=username,
        hashed_password=hashed_password,
        full_name=admin_data.full_name,
        role=UserRole.ADMIN.value,
        status=UserStatus.ACTIVE.value,
        is_active=True,
        email_verified=True,
        phone_number=admin_data.phone_number,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    return UserAdminResponse.model_validate(new_admin)

@router.post("/evaluators", response_model=UserAdminResponse, status_code=status.HTTP_201_CREATED)
async def create_evaluator(
    evaluator_data: EvaluatorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Créer un nouvel évaluateur
    """
    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == evaluator_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà"
        )
    
    # Vérifier si le username existe déjà
    username = evaluator_data.username or evaluator_data.email.split('@')[0]
    existing_username = db.query(User).filter(User.username == username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec ce nom d'utilisateur existe déjà"
        )
    
    # Créer le nouvel évaluateur
    hashed_password = hash_password(evaluator_data.password)
    new_evaluator = User(
        id=uuid.uuid4(),
        email=evaluator_data.email,
        username=username,
        hashed_password=hashed_password,
        full_name=evaluator_data.full_name,
        role=UserRole.EVALUATOR.value,
        status=UserStatus.ACTIVE.value,
        is_active=True,
        email_verified=True,
        phone_number=evaluator_data.phone_number,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(new_evaluator)
    db.commit()
    db.refresh(new_evaluator)
    
    return UserAdminResponse.model_validate(new_evaluator)

# ==================== LISTE DES UTILISATEURS ====================

@router.get("/", response_model=UserListResponse)
async def list_users(
    role: Optional[str] = None,
    status_filter: Optional[str] = None,
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Lister tous les utilisateurs avec filtres optionnels
    """
    query = db.query(User)
    
    # Filtrer par rôle
    if role:
        query = query.filter(User.role == role)
    
    # Filtrer par statut
    if status_filter:
        query = query.filter(User.status == status_filter)
    
    # Compter le total
    total = query.count()
    
    # Pagination
    skip = (page - 1) * size
    users = query.order_by(User.created_at.desc()).offset(skip).limit(size).all()
    
    return UserListResponse(
        users=[UserAdminResponse.model_validate(user) for user in users],
        total=total,
        page=page,
        size=size,
        has_next=(skip + size) < total,
        has_prev=page > 1
    )

@router.get("/admins", response_model=UserListResponse)
async def list_admins(
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Lister tous les administrateurs
    """
    return await list_users(role=UserRole.ADMIN.value, page=page, size=size, db=db, current_user=current_user)

@router.get("/evaluators", response_model=UserListResponse)
async def list_evaluators(
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Lister tous les évaluateurs
    """
    return await list_users(role=UserRole.EVALUATOR.value, page=page, size=size, db=db, current_user=current_user)

@router.get("/suppliers", response_model=UserListResponse)
async def list_suppliers(
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Lister tous les fournisseurs
    """
    return await list_users(role=UserRole.SUPPLIER.value, page=page, size=size, db=db, current_user=current_user)

# ==================== DÉSACTIVATION D'UTILISATEURS ====================

@router.post("/admins/{user_id}/deactivate", response_model=UserDeactivateResponse)
async def deactivate_admin(
    user_id: str,
    request: UserDeactivateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Désactiver un administrateur
    """
    user = db.query(User).filter(
        and_(User.id == uuid.UUID(user_id), User.role == UserRole.ADMIN.value)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrateur non trouvé"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas désactiver votre propre compte"
        )
    
    user.is_active = False
    user.status = UserStatus.SUSPENDED.value
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return UserDeactivateResponse(
        success=True,
        message=f"Administrateur {user.email} désactivé avec succès",
        user_id=user.id,
        status=user.status
    )

@router.post("/evaluators/{user_id}/deactivate", response_model=UserDeactivateResponse)
async def deactivate_evaluator(
    user_id: str,
    request: UserDeactivateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Désactiver un évaluateur
    """
    user = db.query(User).filter(
        and_(User.id == uuid.UUID(user_id), User.role == UserRole.EVALUATOR.value)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Évaluateur non trouvé"
        )
    
    user.is_active = False
    user.status = UserStatus.SUSPENDED.value
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return UserDeactivateResponse(
        success=True,
        message=f"Évaluateur {user.email} désactivé avec succès",
        user_id=user.id,
        status=user.status
    )

@router.post("/suppliers/{user_id}/deactivate", response_model=UserDeactivateResponse)
async def deactivate_supplier(
    user_id: str,
    request: UserDeactivateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Désactiver un fournisseur
    """
    user = db.query(User).filter(
        and_(User.id == uuid.UUID(user_id), User.role == UserRole.SUPPLIER.value)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fournisseur non trouvé"
        )
    
    user.is_active = False
    user.status = UserStatus.SUSPENDED.value
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return UserDeactivateResponse(
        success=True,
        message=f"Fournisseur {user.email} désactivé avec succès",
        user_id=user.id,
        status=user.status
    )

# ==================== RÉACTIVATION D'UTILISATEURS ====================

@router.post("/admins/{user_id}/reactivate", response_model=UserReactivateResponse)
async def reactivate_admin(
    user_id: str,
    request: UserReactivateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Réactiver un administrateur
    """
    user = db.query(User).filter(
        and_(User.id == uuid.UUID(user_id), User.role == UserRole.ADMIN.value)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrateur non trouvé"
        )
    
    user.is_active = True
    user.status = UserStatus.ACTIVE.value
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return UserReactivateResponse(
        success=True,
        message=f"Administrateur {user.email} réactivé avec succès",
        user_id=user.id,
        status=user.status
    )

@router.post("/evaluators/{user_id}/reactivate", response_model=UserReactivateResponse)
async def reactivate_evaluator(
    user_id: str,
    request: UserReactivateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Réactiver un évaluateur
    """
    user = db.query(User).filter(
        and_(User.id == uuid.UUID(user_id), User.role == UserRole.EVALUATOR.value)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Évaluateur non trouvé"
        )
    
    user.is_active = True
    user.status = UserStatus.ACTIVE.value
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return UserReactivateResponse(
        success=True,
        message=f"Évaluateur {user.email} réactivé avec succès",
        user_id=user.id,
        status=user.status
    )

@router.post("/suppliers/{user_id}/reactivate", response_model=UserReactivateResponse)
async def reactivate_supplier(
    user_id: str,
    request: UserReactivateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Réactiver un fournisseur
    """
    user = db.query(User).filter(
        and_(User.id == uuid.UUID(user_id), User.role == UserRole.SUPPLIER.value)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fournisseur non trouvé"
        )
    
    user.is_active = True
    user.status = UserStatus.ACTIVE.value
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return UserReactivateResponse(
        success=True,
        message=f"Fournisseur {user.email} réactivé avec succès",
        user_id=user.id,
        status=user.status
    )

# ==================== RÉINITIALISATION DE MOT DE PASSE ====================

@router.post("/{user_id}/reset-password", response_model=ResetPasswordResponse)
async def reset_user_password(
    user_id: str,
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Réinitialiser le mot de passe d'un utilisateur (tous rôles confondus).
    """
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Identifiant utilisateur invalide"
        )
    
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Empêcher la réinitialisation du superadmin principal par lui-même
    if user.id == current_user.id and current_user.role == UserRole.SUPERADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas réinitialiser votre propre mot de passe depuis cette interface"
        )
    
    # Hacher le nouveau mot de passe
    hashed_password = AuthService.get_password_hash(request.new_password)
    user.hashed_password = hashed_password
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    
    return ResetPasswordResponse(
        success=True,
        message=f"Mot de passe réinitialisé pour {user.email}",
        user_id=user.id,
        updated_at=user.updated_at or datetime.utcnow()
    )

# ==================== DÉTAILS D'UN UTILISATEUR ====================

@router.get("/{user_id}", response_model=UserAdminResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """
    Obtenir les détails d'un utilisateur
    """
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    return UserAdminResponse.model_validate(user)

