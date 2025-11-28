"""
Routes d'authentification et d'inscription
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from datetime import timedelta

from app.database import get_db
from app.services.auth import AuthService
from app.services.supplier import SupplierService
from app.schemas.user import (
    SupplierPhase1Create, 
    SupplierPhase1Response,
    LoginRequest,
    TokenResponse,
    UserResponse,
    RefreshTokenRequest
)
from app.models.user import User
from app.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
security = HTTPBearer()
# Variante optionnelle qui n'impose pas la présence d'un header Authorization
security_optional = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Obtenir l'utilisateur actuel à partir du token JWT"""
    token = credentials.credentials
    
    # Validation basique du format du token
    if not token or len(token.split('.')) != 3:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Format de token invalide"
        )
    payload = AuthService.verify_token(token, token_type="access")
    user_id = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    user = AuthService.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé"
        )
    
    return user

def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
    db: Session = Depends(get_db)
):
    """
    Variante de get_current_user qui renvoie None si aucun token n'est fourni.
    Permet d'exposer des routes publiques tout en autorisant des infos personnalisées
    lorsque l'utilisateur est authentifié.
    """
    if credentials is None:
        return None
    return get_current_user(credentials, db)

@router.post("/register/phase1", response_model=SupplierPhase1Response)
async def register_supplier_phase1(
    supplier_data: SupplierPhase1Create,
    db: Session = Depends(get_db)
):
    """
    Inscription Phase 1 - Informations minimales
    Permet à un fournisseur de créer un compte rapidement
    """
    try:
        # Créer l'utilisateur
        from app.schemas.user import UserCreate
        user_data = UserCreate(
            email=supplier_data.email,
            password=supplier_data.password,
            full_name=supplier_data.company_name
        )
        
        user = AuthService.create_user(db, user_data)
        
        # Créer le profil fournisseur
        supplier = SupplierService.create_supplier_phase1(
            db, supplier_data, str(user.id)
        )
        
        # TODO: Envoyer un email de confirmation
        # TODO: Notifier les administrateurs
        
        return SupplierPhase1Response(
            message="Votre compte a été créé avec succès. Il doit être validé avant activation.",
            user_id=user.id,
            status="en_attente_validation",
            next_steps="Un administrateur va examiner votre demande. Vous recevrez un email une fois validé."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création du compte: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Connexion utilisateur
    """
    user = AuthService.authenticate_user(db, login_data.email, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Compte désactivé"
        )
    
    # Mettre à jour la dernière connexion
    AuthService.update_last_login(db, str(user.id))
    
    # Créer le token d'accès
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    # Créer le refresh token
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = AuthService.create_refresh_token(
        data={"sub": str(user.id)}, expires_delta=refresh_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Obtenir les informations de l'utilisateur connecté
    """
    return UserResponse.model_validate(current_user)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Renouveler le token d'accès avec un refresh token
    """
    try:
        # Vérifier le refresh token
        payload = AuthService.verify_token(refresh_data.refresh_token, token_type="refresh")
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token invalide"
            )
        
        # Vérifier que l'utilisateur existe toujours
        user = AuthService.get_user_by_id(db, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur non trouvé ou désactivé"
            )
        
        # Créer un nouveau token d'accès
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        # Créer un nouveau refresh token (rotation)
        refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_token = AuthService.create_refresh_token(
            data={"sub": str(user.id)}, expires_delta=refresh_token_expires
        )
        
        # Révoquer l'ancien refresh token
        AuthService.revoke_token(refresh_data.refresh_token)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors du renouvellement du token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Impossible de renouveler le token"
        )

@router.post("/logout")
async def logout(refresh_data: RefreshTokenRequest = None):
    """
    Déconnexion - Révoquer les tokens
    """
    # Si un refresh token est fourni, le révoquer
    if refresh_data and refresh_data.refresh_token:
        AuthService.revoke_token(refresh_data.refresh_token)
    
    return {"message": "Déconnexion réussie"}

@router.get("/verify-email/{token}")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """
    Vérifier l'email avec un token
    """
    # TODO: Implémenter la vérification d'email
    return {"message": "Email vérifié avec succès"}
