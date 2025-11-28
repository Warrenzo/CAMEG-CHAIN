"""
Routes pour la gestion des appels d'offres
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.services.tender import TenderService
from app.services.auth import AuthService
from app.schemas.tender import (
    TenderCreate, TenderUpdate, TenderResponse, TenderListResponse,
    ExpressionOfInterestCreate, ExpressionOfInterestResponse,
    BidCreate, BidUpdate, BidResponse, TenderPermissions,
    TenderStats, SupplierTenderStats
)
from app.models.user import User, UserRole
from app.models.tender import TenderStatus, TenderType

router = APIRouter(prefix="/api/v1/tenders", tags=["Tenders"])

# Import de la fonction d'authentification depuis auth.py
from app.routes.auth import (
    get_current_user as get_current_user_from_auth,
    get_optional_user as get_optional_user_from_auth
)

def require_admin_or_manager(current_user: User = Depends(get_current_user_from_auth)):
    """Vérifier que l'utilisateur est admin ou manager"""
    if current_user.role not in [UserRole.ADMIN.value, UserRole.MANAGER.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé. Droits administrateur ou manager requis."
        )
    return current_user

def require_superadmin_or_admin(current_user: User = Depends(get_current_user_from_auth)):
    """Vérifier que l'utilisateur est superadmin ou admin"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Normaliser le rôle (enlever les espaces, mettre en minuscules)
    user_role = str(current_user.role).strip().lower() if current_user.role else ""
    allowed_roles = [UserRole.SUPERADMIN.value, UserRole.ADMIN.value]
    
    logger.info(
        "Verification des permissions - Email: %s, Role DB: '%s', Role normalise: '%s', Roles autorises: %s",
        current_user.email,
        current_user.role,
        user_role,
        allowed_roles
    )
    
    # Vérifier avec le rôle normalisé
    if user_role not in allowed_roles:
        logger.warning(
            "Acces refuse pour %s - Role: '%s' (attendu: %s)",
            current_user.email,
            user_role,
            allowed_roles
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Accès refusé. Droits super-administrateur ou administrateur requis. Rôle actuel: '{current_user.role}'"
        )
    
    logger.info("Acces autorise pour %s avec le role %s", current_user.email, user_role)
    return current_user

def require_admin(current_user: User = Depends(get_current_user_from_auth)):
    """Vérifier que l'utilisateur est admin (pas superadmin)"""
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé. Droits administrateur requis."
        )
    return current_user

# Routes publiques (lecture seule)
@router.get("/", response_model=TenderListResponse)
async def get_tenders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[TenderStatus] = Query(None),
    category: Optional[str] = Query(None),
    tender_type: Optional[TenderType] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user_from_auth)
):
    """
    Obtenir la liste des appels d'offres (public)
    """
    tenders = TenderService.get_tenders(db, skip, limit, status, category, tender_type)
    
    # Ajouter les permissions pour chaque AO
    tender_responses = []
    user_id = str(current_user.id) if current_user else None
    
    for tender in tenders:
        permissions = TenderService.get_tender_permissions(db, str(tender.id), user_id)
        tender_dict = tender.__dict__.copy()
        tender_dict.update(permissions)
        tender_responses.append(TenderResponse(**tender_dict))
    
    total = len(tenders)  # TODO: Implémenter le count total
    
    return TenderListResponse(
        tenders=tender_responses,
        total=total,
        page=skip // limit + 1,
        size=limit,
        has_next=len(tenders) == limit,
        has_prev=skip > 0
    )

@router.get("/{tender_id}", response_model=TenderResponse)
async def get_tender(
    tender_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_from_auth)
):
    """
    Obtenir un appel d'offres par ID (public)
    """
    tender = TenderService.get_tender_by_id(db, tender_id)
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appel d'offres non trouvé"
        )
    
    # Incrémenter le compteur de vues
    tender.views_count += 1
    db.commit()
    
    # Ajouter les permissions
    user_id = str(current_user.id) if current_user else None
    permissions = TenderService.get_tender_permissions(db, tender_id, user_id)
    
    tender_dict = tender.__dict__.copy()
    tender_dict.update(permissions)
    
    return TenderResponse(**tender_dict)

@router.get("/{tender_id}/permissions", response_model=TenderPermissions)
async def get_tender_permissions(
    tender_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_from_auth)
):
    """
    Obtenir les permissions d'un utilisateur sur un appel d'offres
    """
    user_id = str(current_user.id) if current_user else None
    permissions = TenderService.get_tender_permissions(db, tender_id, user_id)
    return TenderPermissions(**permissions)

# Routes pour les manifestations d'intérêt
@router.post("/{tender_id}/interest", response_model=ExpressionOfInterestResponse)
async def express_interest(
    tender_id: str,
    eoi_data: ExpressionOfInterestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_auth)
):
    """
    Manifester son intérêt pour un appel d'offres
    """
    # Vérifier que l'utilisateur est un fournisseur
    if current_user.role != UserRole.SUPPLIER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les fournisseurs peuvent manifester leur intérêt"
        )
    
    # Récupérer le fournisseur
    from app.services.supplier import SupplierService
    supplier = SupplierService.get_supplier_by_user_id(db, str(current_user.id))
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil fournisseur non trouvé"
        )
    
    # Vérifier les permissions
    permissions = TenderService.get_tender_permissions(db, tender_id, str(current_user.id))
    if not permissions["can_express_interest"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Vous n'êtes pas éligible pour cet appel d'offres. {', '.join(permissions['missing_requirements'])}"
        )
    
    eoi = TenderService.express_interest(db, tender_id, str(supplier.id), eoi_data)
    return ExpressionOfInterestResponse.from_orm(eoi)

# Routes pour les soumissions
@router.post("/{tender_id}/bids", response_model=BidResponse)
async def create_bid(
    tender_id: str,
    bid_data: BidCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_auth)
):
    """
    Créer une soumission pour un appel d'offres
    """
    # Vérifier que l'utilisateur est un fournisseur
    if current_user.role != UserRole.SUPPLIER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les fournisseurs peuvent soumettre des offres"
        )
    
    # Récupérer le fournisseur
    from app.services.supplier import SupplierService
    supplier = SupplierService.get_supplier_by_user_id(db, str(current_user.id))
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil fournisseur non trouvé"
        )
    
    # Vérifier les permissions
    permissions = TenderService.get_tender_permissions(db, tender_id, str(current_user.id))
    if not permissions["can_submit_bid"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Vous n'êtes pas éligible pour soumettre une offre. {', '.join(permissions['missing_requirements'])}"
        )
    
    bid = TenderService.create_bid(db, tender_id, str(supplier.id), bid_data)
    return BidResponse.from_orm(bid)

@router.put("/bids/{bid_id}/submit", response_model=BidResponse)
async def submit_bid(
    bid_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_auth)
):
    """
    Soumettre une offre (passer de draft à submitted)
    """
    # Vérifier que l'utilisateur est le propriétaire de la soumission
    from app.models.tender import Bid
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Soumission non trouvée"
        )
    
    # Vérifier la propriété
    from app.services.supplier import SupplierService
    supplier = SupplierService.get_supplier_by_user_id(db, str(current_user.id))
    if not supplier or str(supplier.id) != str(bid.supplier_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez pas soumettre cette offre"
        )
    
    bid = TenderService.submit_bid(db, bid_id)
    return BidResponse.from_orm(bid)

@router.get("/bids/my-bids", response_model=List[BidResponse])
async def get_my_bids(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_auth)
):
    """
    Obtenir mes soumissions
    """
    # Récupérer le fournisseur
    from app.services.supplier import SupplierService
    supplier = SupplierService.get_supplier_by_user_id(db, str(current_user.id))
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil fournisseur non trouvé"
        )
    
    bids = TenderService.get_supplier_bids(db, str(supplier.id))
    return [BidResponse.from_orm(bid) for bid in bids]

# Routes administrateur
@router.post("/", response_model=TenderResponse)
async def create_tender(
    tender_data: TenderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin_or_admin)
):
    """
    Créer un appel d'offres (superadmin ou admin)
    Le statut est toujours DRAFT lors de la création
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(
        "Creation d'appel d'offres autorisee pour %s (role: %s)",
        current_user.email,
        current_user.role
    )
    
    try:
        # Logger les données reçues pour le débogage
        logger.info(f"📝 Données reçues pour création: reference={tender_data.reference}, title={tender_data.title[:50]}...")
        logger.info(f"📅 Dates: opening={tender_data.opening_date}, closing={tender_data.closing_date}")
        logger.info(f"🔧 Type: {tender_data.tender_type}, Category: {tender_data.category}")
        
        # Créer l'appel d'offres (le statut sera automatiquement DRAFT dans le service)
        tender = TenderService.create_tender(db, tender_data, str(current_user.id))
        logger.info("Appel d'offres cree avec succes: %s", tender.id)
        return TenderResponse.model_validate(tender)
    except HTTPException:
        # Re-lancer les HTTPException telles quelles
        raise
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error("Erreur lors de la creation de l'appel d'offres: %s", str(e))
        logger.error("Traceback complet:\n%s", error_trace)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'appel d'offres: {str(e)}"
        )

@router.put("/{tender_id}", response_model=TenderResponse)
async def update_tender(
    tender_id: str,
    tender_data: TenderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Mettre à jour un appel d'offres (admin/manager)
    Permet de modifier les conditions, critères ou documents associés à un appel d'offre existant
    """
    tender = TenderService.get_tender_by_id(db, tender_id)
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appel d'offres non trouvé"
        )
    
    # Vérifier que l'appel d'offres n'est pas déjà clôturé
    if tender.status in [TenderStatus.CLOSED, TenderStatus.AWARDED, TenderStatus.CANCELLED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de modifier un appel d'offres clôturé, attribué ou annulé"
        )
    
    # Mettre à jour les champs fournis
    update_dict = tender_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(tender, field, value)
    
    tender.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(tender)
    
    return TenderResponse.model_validate(tender)

@router.post("/{tender_id}/publish", response_model=TenderResponse)
async def publish_tender(
    tender_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Publier un appel d'offres (admin uniquement)
    Change le statut de DRAFT à PUBLISHED
    Seuls les administrateurs peuvent publier les appels d'offres créés par le superadmin
    """
    tender = TenderService.get_tender_by_id(db, tender_id)
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appel d'offres non trouvé"
        )
    
    # Vérifier que l'appel d'offres est en statut DRAFT
    if tender.status != TenderStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Impossible de publier un appel d'offres avec le statut {tender.status.value}. Seuls les appels d'offres en brouillon peuvent être publiés."
        )
    
    # Publier l'appel d'offres
    tender.status = TenderStatus.PUBLISHED.value  # Utiliser la valeur string directement
    tender.publication_date = datetime.now(timezone.utc)
    tender.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(tender)
    
    return TenderResponse.model_validate(tender)

@router.post("/{tender_id}/close", response_model=TenderResponse)
async def close_tender(
    tender_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Clôturer un appel d'offres (admin/manager)
    Met fin à un appel d'offre et passe à l'étape d'évaluation ou d'attribution
    """
    tender = TenderService.get_tender_by_id(db, tender_id)
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appel d'offres non trouvé"
        )
    
    # Vérifier que l'appel d'offres peut être clôturé
    if tender.status == TenderStatus.CLOSED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet appel d'offres est déjà clôturé"
        )
    
    if tender.status == TenderStatus.CANCELLED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de clôturer un appel d'offres annulé"
        )
    
    if tender.status == TenderStatus.AWARDED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet appel d'offres a déjà été attribué"
        )
    
    # Vérifier que la date de clôture est passée ou forcer la clôture
    if tender.closing_date > datetime.now(timezone.utc):
        # Permettre la clôture anticipée par un admin
        pass
    
    # Clôturer l'appel d'offres
    tender.status = TenderStatus.CLOSED.value  # Utiliser la valeur string directement
    tender.updated_at = datetime.now(timezone.utc)  # Utiliser timezone-aware datetime
    
    db.commit()
    db.refresh(tender)
    
    return TenderResponse.model_validate(tender)

@router.get("/admin/stats", response_model=TenderStats)
async def get_tender_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Obtenir les statistiques des appels d'offres (admin/manager)
    """
    stats = TenderService.get_tender_stats(db)
    return TenderStats(**stats)

@router.get("/{tender_id}/bids", response_model=List[BidResponse])
async def get_tender_bids(
    tender_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Obtenir les soumissions d'un appel d'offres (admin/manager)
    """
    bids = TenderService.get_tender_bids(db, tender_id)
    return [BidResponse.from_orm(bid) for bid in bids]
