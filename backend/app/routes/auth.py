"""
Routes d'authentification et d'inscription
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.services.auth import AuthService
from app.services.supplier import SupplierService
from app.schemas.user import (
    SupplierPhase1Create, 
    SupplierPhase1Response,
    LoginRequest,
    TokenResponse,
    UserResponse
)
from app.models.user import User
from app.config import settings

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
security = HTTPBearer()

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
    payload = AuthService.verify_token(token)
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
    
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.from_orm(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Obtenir les informations de l'utilisateur connecté
    """
    return UserResponse.from_orm(current_user)

@router.post("/logout")
async def logout():
    """
    Déconnexion (côté client - invalider le token)
    """
    return {"message": "Déconnexion réussie"}

@router.get("/verify-email/{token}")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """
    Vérifier l'email avec un token
    """
    # TODO: Implémenter la vérification d'email
    return {"message": "Email vérifié avec succès"}
