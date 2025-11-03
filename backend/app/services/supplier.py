"""
Service de gestion des fournisseurs
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime

from app.models.user import Supplier, User, UserStatus
from app.schemas.user import SupplierPhase1Create, SupplierPhase2Update

class SupplierService:
    """Service de gestion des fournisseurs"""
    
    @staticmethod
    def create_supplier_phase1(db: Session, supplier_data: SupplierPhase1Create, user_id: str) -> Supplier:
        """Créer un fournisseur Phase 1"""
        try:
            # Vérifier si l'utilisateur existe
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Utilisateur non trouvé"
                )
            
            # Créer le profil fournisseur
            supplier = Supplier(
                user_id=user_id,
                company_name=supplier_data.company_name,
                country=supplier_data.country,
                phone_number=supplier_data.phone_number,
                profile_completion_percentage="25",
                profile_status="phase_1_complete",
                documents_uploaded="0/0"
            )
        
            db.add(supplier)
            db.commit()
            db.refresh(supplier)
            
            return supplier
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erreur lors de la création du fournisseur: {str(e)}"
            )
    
    @staticmethod
    def update_supplier_phase2(db: Session, supplier_id: str, update_data: SupplierPhase2Update) -> Supplier:
        """Mettre à jour le profil fournisseur Phase 2"""
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fournisseur non trouvé"
            )
        
        # Vérifier que l'utilisateur est validé
        user = db.query(User).filter(User.id == supplier.user_id).first()
        if user.status != UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Le compte doit être validé avant de compléter le profil"
            )
        
        # Mettre à jour les champs fournis
        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(supplier, field, value)
        
        # Calculer le pourcentage de complétion
        completion_percentage = SupplierService.calculate_completion_percentage(supplier)
        supplier.profile_completion_percentage = str(completion_percentage)
        
        # Mettre à jour le statut du profil
        if completion_percentage >= 90:
            supplier.profile_status = "profile_complete"
        elif completion_percentage >= 50:
            supplier.profile_status = "profile_partial"
        else:
            supplier.profile_status = "profile_incomplete"
        
        supplier.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(supplier)
        
        return supplier
    
    @staticmethod
    def calculate_completion_percentage(supplier: Supplier) -> int:
        """Calculer le pourcentage de complétion du profil"""
        required_fields = [
            'legal_name', 'rccm', 'nif', 'address', 'city',
            'contact_person_name', 'contact_person_position', 
            'contact_person_email', 'supplier_type'
        ]
        
        completed_fields = 0
        total_fields = len(required_fields)
        
        for field in required_fields:
            value = getattr(supplier, field, None)
            if value and str(value).strip():
                completed_fields += 1
        
        # Ajouter les champs de base (toujours présents après Phase 1)
        completed_fields += 3  # company_name, country, phone_number
        
        total_fields += 3
        percentage = int((completed_fields / total_fields) * 100)
        
        return min(percentage, 100)
    
    @staticmethod
    def get_supplier_by_user_id(db: Session, user_id: str) -> Optional[Supplier]:
        """Récupérer un fournisseur par user_id"""
        return db.query(Supplier).filter(Supplier.user_id == user_id).first()
    
    @staticmethod
    def get_supplier_by_id(db: Session, supplier_id: str) -> Optional[Supplier]:
        """Récupérer un fournisseur par ID"""
        return db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    @staticmethod
    def get_all_suppliers(db: Session, skip: int = 0, limit: int = 100) -> List[Supplier]:
        """Récupérer tous les fournisseurs"""
        return db.query(Supplier).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_suppliers_by_status(db: Session, status: str) -> List[Supplier]:
        """Récupérer les fournisseurs par statut"""
        return db.query(Supplier).join(User).filter(User.status == status).all()
    
    @staticmethod
    def validate_supplier(db: Session, supplier_id: str, action: str, notes: Optional[str] = None) -> Supplier:
        """Valider ou rejeter un fournisseur"""
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fournisseur non trouvé"
            )
        
        user = db.query(User).filter(User.id == supplier.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        if action == "approve":
            user.status = UserStatus.ACTIVE
            supplier.validated_by_admin = True
            supplier.validation_date = datetime.utcnow()
            supplier.validation_notes = notes
        elif action == "reject":
            user.status = UserStatus.REJECTED
            supplier.validated_by_admin = False
            supplier.validation_date = datetime.utcnow()
            supplier.validation_notes = notes
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action invalide. Utilisez 'approve' ou 'reject'"
            )
        
        db.commit()
        db.refresh(supplier)
        
        return supplier
    
    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        """Obtenir les statistiques du tableau de bord"""
        total_suppliers = db.query(Supplier).count()
        
        pending_validation = db.query(Supplier).join(User).filter(
            User.status == UserStatus.PENDING_VALIDATION
        ).count()
        
        active_suppliers = db.query(Supplier).join(User).filter(
            User.status == UserStatus.ACTIVE
        ).count()
        
        rejected_suppliers = db.query(Supplier).join(User).filter(
            User.status == UserStatus.REJECTED
        ).count()
        
        return {
            "total_suppliers": total_suppliers,
            "pending_validation": pending_validation,
            "active_suppliers": active_suppliers,
            "rejected_suppliers": rejected_suppliers
        }
