"""
Routes pour la gestion des appels d'offres
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

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
from app.routes.auth import get_current_user as get_current_user_from_auth

def require_admin_or_manager(current_user: User = Depends(get_current_user_from_auth)):
    """Vérifier que l'utilisateur est admin ou manager"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé. Droits administrateur ou manager requis."
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
    current_user: Optional[User] = Depends(get_current_user_from_auth)
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
    if current_user.role != UserRole.SUPPLIER:
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
    if current_user.role != UserRole.SUPPLIER:
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
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Créer un appel d'offres (admin/manager)
    """
    tender = TenderService.create_tender(db, tender_data, str(current_user.id))
    return TenderResponse.from_orm(tender)

@router.put("/{tender_id}", response_model=TenderResponse)
async def update_tender(
    tender_id: str,
    tender_data: TenderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager)
):
    """
    Mettre à jour un appel d'offres (admin/manager)
    """
    tender = TenderService.get_tender_by_id(db, tender_id)
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appel d'offres non trouvé"
        )
    
    # Mettre à jour les champs fournis
    update_dict = tender_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(tender, field, value)
    
    tender.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(tender)
    
    return TenderResponse.from_orm(tender)

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
