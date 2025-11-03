"""
Routes pour la gestion des fournisseurs
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.services.supplier import SupplierService
from app.services.auth import AuthService
from app.schemas.user import (
    SupplierResponse,
    SupplierPhase2Update,
    AdminDashboardResponse
)
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/v1/suppliers", tags=["Suppliers"])

# Import de la fonction d'authentification depuis auth.py
from app.routes.auth import get_current_user as get_current_user_from_auth

def get_current_user_supplier(
    current_user: User = Depends(get_current_user_from_auth),
    db: Session = Depends(get_db)
):
    """Obtenir le fournisseur de l'utilisateur connecté"""
    supplier = SupplierService.get_supplier_by_user_id(db, str(current_user.id))
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil fournisseur non trouvé"
        )
    return supplier

def require_admin(current_user: User = Depends(get_current_user_from_auth)):
    """Vérifier que l'utilisateur est administrateur"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé. Droits administrateur requis."
        )
    return current_user

@router.get("/profile", response_model=SupplierResponse)
async def get_supplier_profile(
    supplier = Depends(get_current_user_supplier)
):
    """
    Obtenir le profil du fournisseur connecté
    """
    return SupplierResponse.from_orm(supplier)

@router.put("/profile/phase2", response_model=SupplierResponse)
async def update_supplier_phase2(
    update_data: SupplierPhase2Update,
    db: Session = Depends(get_db),
    supplier = Depends(get_current_user_supplier)
):
    """
    Mettre à jour le profil fournisseur Phase 2
    Compléter les informations professionnelles
    """
    try:
        updated_supplier = SupplierService.update_supplier_phase2(
            db, str(supplier.id), update_data
        )
        
        return SupplierResponse.from_orm(updated_supplier)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour: {str(e)}"
        )

@router.get("/dashboard")
async def get_supplier_dashboard(
    supplier = Depends(get_current_user_supplier)
):
    """
    Obtenir le tableau de bord du fournisseur
    """
    return {
        "profile_completion": supplier.profile_completion_percentage,
        "profile_status": supplier.profile_status,
        "documents_uploaded": supplier.documents_uploaded,
        "validation_status": supplier.validated_by_admin,
        "next_steps": get_next_steps(supplier)
    }

def get_next_steps(supplier):
    """Déterminer les prochaines étapes pour le fournisseur"""
    if supplier.profile_status == "phase_1_complete":
        return "Votre compte est en attente de validation par un administrateur"
    elif supplier.profile_status == "profile_incomplete":
        return "Complétez votre profil professionnel"
    elif supplier.profile_status == "profile_partial":
        return "Continuez à compléter votre profil"
    elif supplier.profile_status == "profile_complete":
        return "Votre profil est complet. Vous pouvez maintenant uploader vos documents"
    else:
        return "Contactez l'administrateur pour plus d'informations"

# Routes administrateur
@router.get("/admin/dashboard", response_model=AdminDashboardResponse)
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Tableau de bord administrateur
    """
    stats = SupplierService.get_dashboard_stats(db)
    
    # Récupérer les inscriptions récentes
    recent_suppliers = SupplierService.get_all_suppliers(db, limit=10)
    
    return AdminDashboardResponse(
        total_suppliers=stats["total_suppliers"],
        pending_validation=stats["pending_validation"],
        active_suppliers=stats["active_suppliers"],
        rejected_suppliers=stats["rejected_suppliers"],
        recent_registrations=[SupplierResponse.from_orm(s) for s in recent_suppliers],
        suppliers_by_status=stats
    )

@router.get("/admin/pending", response_model=List[SupplierResponse])
async def get_pending_suppliers(
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Obtenir la liste des fournisseurs en attente de validation
    """
    pending_suppliers = SupplierService.get_suppliers_by_status(db, "en_attente_validation")
    return [SupplierResponse.from_orm(s) for s in pending_suppliers]

@router.post("/admin/validate/{supplier_id}")
async def validate_supplier(
    supplier_id: str,
    action: str,
    notes: str = None,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Valider ou rejeter un fournisseur
    """
    try:
        supplier = SupplierService.validate_supplier(db, supplier_id, action, notes)
        
        # TODO: Envoyer un email au fournisseur
        
        return {
            "message": f"Fournisseur {action} avec succès",
            "supplier": SupplierResponse.from_orm(supplier)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la validation: {str(e)}"
        )

@router.get("/admin/all", response_model=List[SupplierResponse])
async def get_all_suppliers_admin(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    """
    Obtenir tous les fournisseurs (admin)
    """
    suppliers = SupplierService.get_all_suppliers(db, skip, limit)
    return [SupplierResponse.from_orm(s) for s in suppliers]
