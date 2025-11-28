"""
Moteur IA pour l'évaluation proactive des fournisseurs
Analyse et préqualification de nouveaux fournisseurs mondiaux
"""
import asyncio
import json
import requests
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.supplier_ai import (
    SupplierAI, ExternalDataSource, AiAnalysisLog, SupplierRecommendation,
    RelationCameg, SourceIdentification, EtatPrequalification, AiRecommendation
)
from app.models.user import Supplier
from app.database import get_db

class SupplierAIEngine:
    """Moteur IA pour l'évaluation des fournisseurs"""
    
    def __init__(self):
        # Poids des critères d'évaluation (selon la grille spécifiée)
        self.evaluation_weights = {
            'certifications': 0.35,  # 35% - Certifications & conformité GMP
            'experience': 0.20,      # 20% - Expérience et réputation
            'documentaire': 0.15,    # 15% - Qualité documentaire
            'capacite': 0.15,        # 15% - Capacité de production
            'prix': 0.10,           # 10% - Prix/compétitivité
            'risque': 0.05          # 5% - Risque géopolitique
        }
        
        # Sources de données externes
        self.external_sources = {
            'who_pq': {
                'name': 'WHO Prequalification',
                'url': 'https://extranet.who.int/prequal/',
                'weight': 0.4
            },
            'fda': {
                'name': 'FDA Registration',
                'url': 'https://www.fda.gov/drugs/drug-approvals-and-databases',
                'weight': 0.3
            },
            'ema': {
                'name': 'EMA Authorization',
                'url': 'https://www.ema.europa.eu/en/medicines',
                'weight': 0.2
            },
            'national_registries': {
                'name': 'National Registries',
                'url': 'various',
                'weight': 0.1
            }
        }
    
    async def analyze_supplier(self, supplier_id: str, db: Session) -> Dict:
        """
        Analyse complète d'un fournisseur avec l'IA
        """
        logger.info("Debut de l'analyse IA pour le fournisseur %s", supplier_id)
        
        # Récupérer ou créer l'évaluation IA
        supplier_ai = db.query(SupplierAI).filter(
            SupplierAI.supplier_id == supplier_id
        ).first()
        
        if not supplier_ai:
            supplier_ai = SupplierAI(supplier_id=supplier_id)
            db.add(supplier_ai)
            db.commit()
        
        # Collecter les données externes
        external_data = await self._collect_external_data(supplier_ai, db)
        
        # Calculer les scores
        scores = await self._calculate_scores(supplier_ai, external_data, db)
        
        # Générer la recommandation
        recommendation = self._generate_recommendation(scores['total'])
        
        # Mettre à jour l'évaluation
        await self._update_supplier_evaluation(supplier_ai, scores, recommendation, db)
        
        # Créer le log d'analyse
        await self._create_analysis_log(supplier_ai, scores, recommendation, db)
        
        logger.info("Analyse IA terminee - Score: %.1f, Recommandation: %s", scores['total'], recommendation)
        
        return {
            'supplier_id': supplier_id,
            'scores': scores,
            'recommendation': recommendation,
            'confidence_level': supplier_ai.ai_confidence_level,
            'analysis_date': supplier_ai.ai_analysis_date
        }
    
    def _collect_external_data(self, supplier_ai: SupplierAI, db: Session) -> Dict:
        """
        Collecte les données externes pour l'évaluation
        """
        logger.info("Collecte des donnees externes pour IA")
        
        external_data = {}
        
        # Simuler la collecte de données (en production, ce serait des appels API réels)
        time.sleep(0.5)  # Simulation du temps de collecte
        
        # WHO Prequalification
        who_data = await self._check_who_prequalification(supplier_ai)
        if who_data:
            external_data['who_pq'] = who_data
            await self._save_external_source(supplier_ai, 'WHO_PQ', who_data, db)
        
        # FDA Registration
        fda_data = await self._check_fda_registration(supplier_ai)
        if fda_data:
            external_data['fda'] = fda_data
            await self._save_external_source(supplier_ai, 'FDA', fda_data, db)
        
        # EMA Authorization
        ema_data = await self._check_ema_authorization(supplier_ai)
        if ema_data:
            external_data['ema'] = ema_data
            await self._save_external_source(supplier_ai, 'EMA', ema_data, db)
        
        # Certificats GMP
        gmp_data = await self._check_gmp_certificates(supplier_ai)
        if gmp_data:
            external_data['gmp'] = gmp_data
            supplier_ai.gmp_certificates = gmp_data
        
        return external_data
    
    async def _check_who_prequalification(self, supplier_ai: SupplierAI) -> Optional[Dict]:
        """Vérifie le statut WHO Prequalification"""
        # Simulation - en production, ce serait un appel API réel
        await asyncio.sleep(0.5)
        
        # Simuler des données WHO PQ
        return {
            'status': 'prequalified',
            'products': ['Amoxicillin 500mg', 'Paracetamol 500mg'],
            'last_inspection': '2024-01-15',
            'expiry_date': '2025-01-15',
            'confidence': 0.95
        }
    
    async def _check_fda_registration(self, supplier_ai: SupplierAI) -> Optional[Dict]:
        """Vérifie l'enregistrement FDA"""
        await asyncio.sleep(0.3)
        
        return {
            'registration_number': 'FDA-123456',
            'status': 'active',
            'products_registered': 15,
            'last_renewal': '2024-03-01',
            'confidence': 0.90
        }
    
    async def _check_ema_authorization(self, supplier_ai: SupplierAI) -> Optional[Dict]:
        """Vérifie l'autorisation EMA"""
        await asyncio.sleep(0.3)
        
        return {
            'authorization_number': 'EMA-789012',
            'status': 'authorized',
            'marketing_authorization': True,
            'valid_until': '2026-12-31',
            'confidence': 0.85
        }
    
    async def _check_gmp_certificates(self, supplier_ai: SupplierAI) -> Optional[Dict]:
        """Vérifie les certificats GMP"""
        await asyncio.sleep(0.4)
        
        return {
            'certificates': [
                {
                    'country': 'India',
                    'authority': 'CDSCO',
                    'valid_until': '2025-06-30',
                    'scope': 'Pharmaceutical manufacturing'
                },
                {
                    'country': 'Germany',
                    'authority': 'BfArM',
                    'valid_until': '2025-09-15',
                    'scope': 'API manufacturing'
                }
            ],
            'total_certificates': 2,
            'confidence': 0.88
        }
    
    async def _calculate_scores(self, supplier_ai: SupplierAI, external_data: Dict, db: Session) -> Dict:
        """
        Calcule les scores d'évaluation selon la grille d'analyse
        """
        logger.info("Calcul des scores d'evaluation IA")
        
        scores = {}
        
        # 1. Score Certifications & conformité GMP (35%)
        scores['certifications'] = self._calculate_certifications_score(external_data)
        
        # 2. Score Expérience et réputation (20%)
        scores['experience'] = self._calculate_experience_score(supplier_ai, external_data)
        
        # 3. Score Qualité documentaire (15%)
        scores['documentaire'] = self._calculate_documentary_score(supplier_ai, db)
        
        # 4. Score Capacité de production (15%)
        scores['capacite'] = self._calculate_capacity_score(supplier_ai, external_data)
        
        # 5. Score Prix/compétitivité (10%)
        scores['prix'] = self._calculate_price_score(supplier_ai, external_data)
        
        # 6. Score Risque géopolitique (5%)
        scores['risque'] = self._calculate_risk_score(supplier_ai)
        
        # Score total pondéré
        total_score = sum(
            scores[criterion] * weight 
            for criterion, weight in self.evaluation_weights.items()
        )
        scores['total'] = total_score
        
        return scores
    
    def _calculate_certifications_score(self, external_data: Dict) -> float:
        """Calcule le score des certifications (35%)"""
        score = 0.0
        
        # WHO Prequalification (poids fort)
        if 'who_pq' in external_data:
            who_data = external_data['who_pq']
            if who_data['status'] == 'prequalified':
                score += 40  # Score maximum pour WHO PQ
        
        # FDA Registration
        if 'fda' in external_data:
            fda_data = external_data['fda']
            if fda_data['status'] == 'active':
                score += 25
        
        # EMA Authorization
        if 'ema' in external_data:
            ema_data = external_data['ema']
            if ema_data['status'] == 'authorized':
                score += 20
        
        # Certificats GMP
        if 'gmp' in external_data:
            gmp_data = external_data['gmp']
            score += min(15, gmp_data['total_certificates'] * 5)
        
        return min(100, score)
    
    def _calculate_experience_score(self, supplier_ai: SupplierAI, external_data: Dict) -> float:
        """Calcule le score d'expérience et réputation (20%)"""
        score = 0.0
        
        # Relation avec CAMEG
        if supplier_ai.relation_cameg == RelationCameg.ANCIEN:
            score += 30  # Bonus pour les partenaires existants
        
        # Présence sur les marchés internationaux
        if external_data.get('who_pq') or external_data.get('fda') or external_data.get('ema'):
            score += 25
        
        # Nombre de produits dans le portefeuille
        if external_data.get('who_pq'):
            products_count = len(external_data['who_pq'].get('products', []))
            score += min(25, products_count * 5)
        
        # Références clients (simulé)
        score += 20  # Score de base pour la réputation
        
        return min(100, score)
    
    def _calculate_documentary_score(self, supplier_ai: SupplierAI, db: Session) -> float:
        """Calcule le score de qualité documentaire (15%)"""
        # Récupérer les documents du fournisseur
        supplier = db.query(Supplier).filter(Supplier.id == supplier_ai.supplier_id).first()
        if not supplier:
            return 0.0
        
        score = 0.0
        documents_count = len(supplier.documents)
        
        # Score basé sur le nombre de documents
        score += min(50, documents_count * 10)
        
        # Score basé sur la validation des documents
        validated_docs = sum(1 for doc in supplier.documents if doc.is_validated)
        if documents_count > 0:
            validation_rate = validated_docs / documents_count
            score += validation_rate * 50
        
        return min(100, score)
    
    def _calculate_capacity_score(self, supplier_ai: SupplierAI, external_data: Dict) -> float:
        """Calcule le score de capacité de production (15%)"""
        score = 0.0
        
        # Capacité estimée basée sur les certifications
        if external_data.get('who_pq'):
            score += 40
        
        if external_data.get('fda'):
            score += 30
        
        if external_data.get('ema'):
            score += 20
        
        # Score de base pour la capacité
        score += 10
        
        return min(100, score)
    
    def _calculate_price_score(self, supplier_ai: SupplierAI, external_data: Dict) -> float:
        """Calcule le score prix/compétitivité (10%)"""
        # Simulation - en production, ce serait basé sur des données de marché
        return 75.0  # Score moyen par défaut
    
    def _calculate_risk_score(self, supplier_ai: SupplierAI) -> float:
        """Calcule le score de risque géopolitique (5%)"""
        # Récupérer le pays du fournisseur
        supplier = supplier_ai.supplier
        if not supplier:
            return 50.0  # Score neutre par défaut
        
        # Scores de risque par pays (simplifié)
        risk_scores = {
            'India': 85,    # Faible risque
            'Germany': 90,  # Très faible risque
            'China': 70,    # Risque modéré
            'Brazil': 75,   # Risque modéré
            'South Africa': 80,  # Risque faible
        }
        
        return risk_scores.get(supplier.country, 60)  # Score par défaut
    
    def _generate_recommendation(self, total_score: float) -> str:
        """Génère la recommandation basée sur le score total"""
        if total_score >= 80:
            return AiRecommendation.PREQUALIFIE
        elif total_score >= 60:
            return AiRecommendation.A_AUDITER
        else:
            return AiRecommendation.RISQUE_ELEVE
    
    async def _update_supplier_evaluation(self, supplier_ai: SupplierAI, scores: Dict, recommendation: str, db: Session):
        """Met à jour l'évaluation du fournisseur"""
        supplier_ai.score_certifications = scores['certifications']
        supplier_ai.score_experience = scores['experience']
        supplier_ai.score_documentaire = scores['documentaire']
        supplier_ai.score_capacite = scores['capacite']
        supplier_ai.score_prix = scores['prix']
        supplier_ai.score_risque = scores['risque']
        supplier_ai.score_predictif_total = scores['total']
        
        supplier_ai.ai_recommendation = recommendation
        supplier_ai.ai_confidence_level = self._calculate_confidence_level(scores, supplier_ai)
        supplier_ai.ai_analysis_date = datetime.utcnow()
        
        # Mettre à jour l'état de préqualification
        if recommendation == AiRecommendation.PREQUALIFIE:
            supplier_ai.etat_prequalification = EtatPrequalification.PREQUALIFIE
        elif recommendation == AiRecommendation.A_AUDITER:
            supplier_ai.etat_prequalification = EtatPrequalification.A_AUDITER
        else:
            supplier_ai.etat_prequalification = EtatPrequalification.REJETE
        
        db.commit()
    
    def _calculate_confidence_level(self, scores: Dict, supplier_ai: SupplierAI) -> float:
        """Calcule le niveau de confiance de l'analyse IA"""
        confidence = 0.0
        
        # Confiance basée sur la disponibilité des données
        data_sources = len(supplier_ai.external_sources) if supplier_ai.external_sources else 0
        confidence += min(0.4, data_sources * 0.1)
        
        # Confiance basée sur la cohérence des scores
        score_variance = self._calculate_score_variance(scores)
        confidence += max(0, 0.3 - score_variance * 0.1)
        
        # Confiance basée sur la relation avec CAMEG
        if supplier_ai.relation_cameg == RelationCameg.ANCIEN:
            confidence += 0.3
        
        return min(1.0, confidence)
    
    def _calculate_score_variance(self, scores: Dict) -> float:
        """Calcule la variance des scores pour évaluer la cohérence"""
        score_values = [scores[key] for key in self.evaluation_weights.keys()]
        mean_score = sum(score_values) / len(score_values)
        variance = sum((score - mean_score) ** 2 for score in score_values) / len(score_values)
        return variance / 100  # Normaliser
    
    async def _save_external_source(self, supplier_ai: SupplierAI, source_name: str, data: Dict, db: Session):
        """Sauvegarde une source de données externe"""
        source = ExternalDataSource(
            supplier_ai_id=supplier_ai.id,
            source_name=source_name,
            source_type='certification',
            data_extracted=data,
            confidence_score=data.get('confidence', 0.8),
            last_updated=datetime.utcnow()
        )
        db.add(source)
        db.commit()
    
    async def _create_analysis_log(self, supplier_ai: SupplierAI, scores: Dict, recommendation: str, db: Session):
        """Crée un log d'analyse pour traçabilité"""
        log = AiAnalysisLog(
            supplier_ai_id=supplier_ai.id,
            analysis_type='full_analysis',
            trigger_source='manual',
            scores_after=scores,
            recommendation_after=recommendation,
            analysis_details={
                'weights_used': self.evaluation_weights,
                'external_sources_checked': list(supplier_ai.external_sources) if supplier_ai.external_sources else []
            },
            processing_time=2.5  # Simulation
        )
        db.add(log)
        db.commit()
    
    async def search_suppliers(self, query: str, filters: Dict, db: Session) -> Dict:
        """
        Recherche de fournisseurs avec filtres avancés
        """
        logger.info("Recherche de fournisseurs IA - terme: %s", query)
        
        # Construire la requête
        query_obj = db.query(SupplierAI).join(Supplier)
        
        # Filtres
        if filters.get('relation_type'):
            query_obj = query_obj.filter(SupplierAI.relation_cameg == filters['relation_type'])
        
        if filters.get('min_score'):
            query_obj = query_obj.filter(SupplierAI.score_predictif_total >= filters['min_score'])
        
        if filters.get('recommendation'):
            query_obj = query_obj.filter(SupplierAI.ai_recommendation == filters['recommendation'])
        
        if filters.get('country'):
            query_obj = query_obj.join(Supplier).filter(Supplier.country == filters['country'])
        
        # Recherche textuelle
        if query:
            query_obj = query_obj.join(Supplier).filter(
                or_(
                    Supplier.company_name.ilike(f"%{query}%"),
                    Supplier.legal_name.ilike(f"%{query}%")
                )
            )
        
        # Exécuter la requête
        suppliers = query_obj.limit(50).all()
        
        # Organiser les résultats par type
        results = {
            'partenaires_actuels': [],
            'nouveaux_prequalifies': [],
            'a_auditer': [],
            'total': len(suppliers)
        }
        
        for supplier_ai in suppliers:
            supplier_data = {
                'id': str(supplier_ai.supplier_id),
                'company_name': supplier_ai.supplier.company_name,
                'country': supplier_ai.supplier.country,
                'score': supplier_ai.score_predictif_total,
                'recommendation': supplier_ai.ai_recommendation,
                'relation_type': supplier_ai.relation_cameg,
                'who_pq_status': supplier_ai.who_pq_status,
                'last_analysis': supplier_ai.ai_analysis_date
            }
            
            if supplier_ai.relation_cameg == RelationCameg.ANCIEN:
                results['partenaires_actuels'].append(supplier_data)
            elif supplier_ai.ai_recommendation == AiRecommendation.PREQUALIFIE:
                results['nouveaux_prequalifies'].append(supplier_data)
            else:
                results['a_auditer'].append(supplier_data)
        
        return results
    
    async def create_recommendation(self, supplier_id: str, user_id: str, recommendation_type: str, justification: str, db: Session) -> Dict:
        """
        Crée une recommandation pour la DAQP
        """
        supplier_ai = db.query(SupplierAI).filter(SupplierAI.supplier_id == supplier_id).first()
        if not supplier_ai:
            raise ValueError("Fournisseur non trouvé")
        
        recommendation = SupplierRecommendation(
            supplier_ai_id=supplier_ai.id,
            recommended_by=user_id,
            recommendation_type=recommendation_type,
            justification=justification,
            priority_level='high' if supplier_ai.score_predictif_total >= 80 else 'medium'
        )
        
        db.add(recommendation)
        db.commit()
        
        return {
            'id': str(recommendation.id),
            'supplier_name': supplier_ai.supplier.company_name,
            'recommendation_type': recommendation_type,
            'priority_level': recommendation.priority_level,
            'status': recommendation.status
        }
