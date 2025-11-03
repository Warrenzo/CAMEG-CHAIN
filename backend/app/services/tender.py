"""
Service de gestion des appels d'offres avec système de permissions
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta
import uuid

from app.models.tender import (
    Tender, ExpressionOfInterest, Bid, TenderDocument, BidDocument,
    TenderStatus, TenderType, BidStatus
)
from app.models.user import User, Supplier, UserStatus, UserRole
from app.schemas.tender import (
    TenderCreate, TenderUpdate, ExpressionOfInterestCreate, BidCreate, BidUpdate
)

class TenderService:
    """Service de gestion des appels d'offres"""
    
    @staticmethod
    def create_tender(db: Session, tender_data: TenderCreate, creator_id: str) -> Tender:
        """Créer un appel d'offres"""
        # Vérifier que le créateur est admin ou manager
        creator = db.query(User).filter(User.id == creator_id).first()
        if not creator or creator.role not in [UserRole.ADMIN, UserRole.MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seuls les administrateurs et managers peuvent créer des appels d'offres"
            )
        
        # Vérifier l'unicité de la référence
        existing = db.query(Tender).filter(Tender.reference == tender_data.reference).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Une référence d'appel d'offres avec ce numéro existe déjà"
            )
        
        tender = Tender(
            reference=tender_data.reference,
            title=tender_data.title,
            description=tender_data.description,
            category=tender_data.category,
            opening_date=tender_data.opening_date,
            closing_date=tender_data.closing_date,
            tender_type=tender_data.tender_type,
            estimated_value=tender_data.estimated_value,
            currency=tender_data.currency,
            eligibility_rules=tender_data.eligibility_rules,
            required_documents=tender_data.required_documents,
            evaluation_criteria=tender_data.evaluation_criteria,
            contact_person=tender_data.contact_person,
            contact_email=tender_data.contact_email,
            contact_phone=tender_data.contact_phone,
            publication_date=datetime.utcnow(),
            created_by=creator_id
        )
        
        db.add(tender)
        db.commit()
        db.refresh(tender)
        
        return tender
    
    @staticmethod
    def get_tender_by_id(db: Session, tender_id: str) -> Optional[Tender]:
        """Récupérer un appel d'offres par ID"""
        return db.query(Tender).filter(Tender.id == tender_id).first()
    
    @staticmethod
    def get_tenders(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        status: Optional[TenderStatus] = None,
        category: Optional[str] = None,
        tender_type: Optional[TenderType] = None
    ) -> List[Tender]:
        """Récupérer la liste des appels d'offres avec filtres"""
        query = db.query(Tender)
        
        if status:
            query = query.filter(Tender.status == status)
        if category:
            query = query.filter(Tender.category == category)
        if tender_type:
            query = query.filter(Tender.tender_type == tender_type)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_tender_permissions(db: Session, tender_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Obtenir les permissions d'un utilisateur sur un appel d'offres"""
        tender = db.query(Tender).filter(Tender.id == tender_id).first()
        if not tender:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appel d'offres non trouvé"
            )
        
        # Permissions par défaut (lecture publique)
        permissions = {
            "can_view": True,
            "can_express_interest": False,
            "can_submit_bid": False,
            "can_download_documents": True,
            "missing_requirements": [],
            "eligibility_status": "not_authenticated"
        }
        
        if not user_id:
            return permissions
        
        # Vérifier l'utilisateur
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return permissions
        
        # Vérifier le fournisseur
        supplier = db.query(Supplier).filter(Supplier.user_id == user_id).first()
        
        # Permissions selon le statut du fournisseur
        if user.role in [UserRole.ADMIN, UserRole.MANAGER]:
            # Administrateurs ont tous les droits
            permissions.update({
                "can_express_interest": True,
                "can_submit_bid": True,
                "eligibility_status": "admin"
            })
        elif supplier:
            # Vérifier l'éligibilité selon les règles
            eligibility = TenderService._check_eligibility(tender, supplier, user)
            permissions.update(eligibility)
        
        return permissions
    
    @staticmethod
    def _check_eligibility(tender: Tender, supplier: Supplier, user: User) -> Dict[str, Any]:
        """Vérifier l'éligibilité d'un fournisseur à un appel d'offres"""
        permissions = {
            "can_express_interest": False,
            "can_submit_bid": False,
            "missing_requirements": [],
            "eligibility_status": "not_eligible"
        }
        
        # Vérifier le statut de l'utilisateur
        if user.status == UserStatus.PENDING_VALIDATION:
            permissions["eligibility_status"] = "pending_validation"
            permissions["missing_requirements"].append("Compte en attente de validation")
            return permissions
        
        if user.status != UserStatus.ACTIVE:
            permissions["eligibility_status"] = "inactive"
            permissions["missing_requirements"].append("Compte inactif")
            return permissions
        
        # Vérifier les règles d'éligibilité
        if tender.eligibility_rules:
            rules = tender.eligibility_rules
            
            # Vérifier le pays
            if "countries" in rules and supplier.country not in rules["countries"]:
                permissions["missing_requirements"].append(f"Pays non éligible: {supplier.country}")
                return permissions
            
            # Vérifier le type de fournisseur
            if "supplier_types" in rules and supplier.supplier_type not in rules["supplier_types"]:
                permissions["missing_requirements"].append(f"Type de fournisseur non éligible: {supplier.supplier_type}")
                return permissions
        
        # Permissions selon le type d'AO et le statut du profil
        if tender.tender_type == TenderType.OPEN:
            # AO ouvert - tous les fournisseurs actifs peuvent participer
            permissions["can_express_interest"] = True
            if supplier.profile_status in ["profile_complete", "profile_partial"]:
                permissions["can_submit_bid"] = True
                permissions["eligibility_status"] = "eligible"
            else:
                permissions["missing_requirements"].append("Profil incomplet")
                permissions["eligibility_status"] = "profile_incomplete"
        
        elif tender.tender_type == TenderType.RESTRICTED:
            # AO restreint - seuls les préqualifiés
            if supplier.profile_status == "profile_complete" and supplier.validated_by_admin:
                permissions["can_express_interest"] = True
                permissions["can_submit_bid"] = True
                permissions["eligibility_status"] = "eligible"
            else:
                permissions["missing_requirements"].append("Profil complet et validation admin requis")
                permissions["eligibility_status"] = "not_prequalified"
        
        return permissions
    
    @staticmethod
    def express_interest(
        db: Session, 
        tender_id: str, 
        supplier_id: str, 
        eoi_data: ExpressionOfInterestCreate
    ) -> ExpressionOfInterest:
        """Manifester son intérêt pour un appel d'offres"""
        # Vérifier que l'AO existe
        tender = db.query(Tender).filter(Tender.id == tender_id).first()
        if not tender:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appel d'offres non trouvé"
            )
        
        # Vérifier que l'AO est ouvert
        if tender.status not in [TenderStatus.PUBLISHED, TenderStatus.OPEN]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet appel d'offres n'accepte plus de manifestations d'intérêt"
            )
        
        # Vérifier que la date de clôture n'est pas passée
        if tender.closing_date < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La date de clôture de cet appel d'offres est dépassée"
            )
        
        # Vérifier qu'il n'y a pas déjà une EOI
        existing_eoi = db.query(ExpressionOfInterest).filter(
            ExpressionOfInterest.tender_id == tender_id,
            ExpressionOfInterest.supplier_id == supplier_id,
            ExpressionOfInterest.status == "active"
        ).first()
        
        if existing_eoi:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous avez déjà manifesté votre intérêt pour cet appel d'offres"
            )
        
        # Créer la manifestation d'intérêt
        eoi = ExpressionOfInterest(
            tender_id=tender_id,
            supplier_id=supplier_id,
            message=eoi_data.message,
            contact_preference=eoi_data.contact_preference
        )
        
        db.add(eoi)
        
        # Mettre à jour le compteur
        tender.eoi_count += 1
        
        db.commit()
        db.refresh(eoi)
        
        return eoi
    
    @staticmethod
    def create_bid(
        db: Session, 
        tender_id: str, 
        supplier_id: str, 
        bid_data: BidCreate
    ) -> Bid:
        """Créer une soumission"""
        # Vérifier que l'AO existe
        tender = db.query(Tender).filter(Tender.id == tender_id).first()
        if not tender:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appel d'offres non trouvé"
            )
        
        # Vérifier que l'AO est ouvert
        if tender.status not in [TenderStatus.PUBLISHED, TenderStatus.OPEN]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet appel d'offres n'accepte plus de soumissions"
            )
        
        # Vérifier que la date de clôture n'est pas passée
        if tender.closing_date < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La date de clôture de cet appel d'offres est dépassée"
            )
        
        # Vérifier qu'il n'y a pas déjà une soumission
        existing_bid = db.query(Bid).filter(
            Bid.tender_id == tender_id,
            Bid.supplier_id == supplier_id
        ).first()
        
        if existing_bid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vous avez déjà soumis une offre pour cet appel d'offres"
            )
        
        # Générer une référence de soumission
        bid_reference = f"BID-{tender.reference}-{str(uuid.uuid4())[:8].upper()}"
        
        # Créer la soumission
        bid = Bid(
            tender_id=tender_id,
            supplier_id=supplier_id,
            bid_reference=bid_reference,
            total_amount=bid_data.total_amount,
            currency=bid_data.currency,
            validity_period=bid_data.validity_period,
            technical_proposal=bid_data.technical_proposal,
            delivery_time=bid_data.delivery_time,
            status=BidStatus.DRAFT
        )
        
        db.add(bid)
        
        # Mettre à jour le compteur
        tender.bids_count += 1
        
        db.commit()
        db.refresh(bid)
        
        return bid
    
    @staticmethod
    def submit_bid(db: Session, bid_id: str) -> Bid:
        """Soumettre une offre (passer de draft à submitted)"""
        bid = db.query(Bid).filter(Bid.id == bid_id).first()
        if not bid:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Soumission non trouvée"
            )
        
        if bid.status != BidStatus.DRAFT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cette soumission a déjà été soumise"
            )
        
        # Vérifier que la date de clôture n'est pas passée
        if bid.tender.closing_date < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La date de clôture de cet appel d'offres est dépassée"
            )
        
        # TODO: Vérifier la complétude des documents requis
        
        # Marquer comme soumis
        bid.status = BidStatus.SUBMITTED
        bid.submitted_at = datetime.utcnow()
        
        db.commit()
        db.refresh(bid)
        
        return bid
    
    @staticmethod
    def get_supplier_bids(db: Session, supplier_id: str) -> List[Bid]:
        """Récupérer les soumissions d'un fournisseur"""
        return db.query(Bid).filter(Bid.supplier_id == supplier_id).all()
    
    @staticmethod
    def get_tender_bids(db: Session, tender_id: str) -> List[Bid]:
        """Récupérer les soumissions d'un appel d'offres"""
        return db.query(Bid).filter(Bid.tender_id == tender_id).all()
    
    @staticmethod
    def get_tender_stats(db: Session) -> Dict[str, Any]:
        """Obtenir les statistiques des appels d'offres"""
        total_tenders = db.query(Tender).count()
        published_tenders = db.query(Tender).filter(Tender.status == TenderStatus.PUBLISHED).count()
        open_tenders = db.query(Tender).filter(Tender.status == TenderStatus.OPEN).count()
        closed_tenders = db.query(Tender).filter(Tender.status == TenderStatus.CLOSED).count()
        
        total_eois = db.query(ExpressionOfInterest).count()
        total_bids = db.query(Bid).count()
        
        avg_bids = total_bids / total_tenders if total_tenders > 0 else 0
        
        return {
            "total_tenders": total_tenders,
            "published_tenders": published_tenders,
            "open_tenders": open_tenders,
            "closed_tenders": closed_tenders,
            "total_eois": total_eois,
            "total_bids": total_bids,
            "average_bids_per_tender": round(avg_bids, 2)
        }
