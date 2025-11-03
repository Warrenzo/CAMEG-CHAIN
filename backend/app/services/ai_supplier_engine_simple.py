"""
Moteur IA simplifié pour l'évaluation proactive des fournisseurs
Version sans async pour éviter les problèmes de performance
"""
import json
import time
import httpx
import asyncio
import logging
from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.config import settings

logger = logging.getLogger(__name__)

from app.models.supplier_ai import (
    SupplierAI, ExternalDataSource, AiAnalysisLog, SupplierRecommendation,
    RelationCameg, SourceIdentification, EtatPrequalification, AiRecommendation
)
from app.models.user import Supplier
from app.database import get_db

class SupplierAIEngineSimple:
    """Moteur IA simplifié pour l'évaluation des fournisseurs"""
    
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
        
        # Configuration du client HTTP pour le service IA
        self.ai_service_url = settings.AI_SERVICE_URL
        self.http_timeout = 30.0
        self.max_retries = 3
    
    async def _call_ai_service(self, endpoint: str, data: dict) -> dict:
        """
        Appel sécurisé au service IA avec retry et gestion d'erreurs
        """
        request_id = f"ai_call_{int(time.time() * 1000)}"
        logger.info(f"AI service call {request_id} - Endpoint: {endpoint}")
        
        for attempt in range(self.max_retries):
            try:
                start_time = time.time()
                async with httpx.AsyncClient(timeout=self.http_timeout) as client:
                    response = await client.post(
                        f"{self.ai_service_url}{endpoint}",
                        json=data
                    )
                    response.raise_for_status()
                    result = response.json()
                    
                    processing_time = time.time() - start_time
                    logger.info(f"AI service call {request_id} - Success - Attempt: {attempt + 1}, Time: {processing_time:.3f}s")
                    return result
                    
            except httpx.TimeoutException:
                logger.warning(f"AI service call {request_id} - Timeout - Attempt: {attempt + 1}")
                if attempt == self.max_retries - 1:
                    logger.error(f"AI service call {request_id} - Max retries exceeded")
                    raise Exception(f"Timeout lors de l'appel au service IA: {endpoint}")
                await asyncio.sleep(2 ** attempt)  # Backoff exponentiel
            except httpx.HTTPStatusError as e:
                logger.warning(f"AI service call {request_id} - HTTP Error {e.response.status_code} - Attempt: {attempt + 1}")
                if e.response.status_code >= 500 and attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                    continue
                raise Exception(f"Erreur HTTP du service IA: {e.response.status_code}")
            except Exception as e:
                logger.warning(f"AI service call {request_id} - Exception: {str(e)} - Attempt: {attempt + 1}")
                if attempt == self.max_retries - 1:
                    logger.error(f"AI service call {request_id} - Max retries exceeded")
                    raise Exception(f"Erreur lors de l'appel au service IA: {str(e)}")
                await asyncio.sleep(2 ** attempt)
    
    def analyze_supplier(self, supplier_id: str, db: Session) -> Dict:
        """
        Analyse complète d'un fournisseur avec l'IA
        """
        print(f"🤖 Début de l'analyse IA pour le fournisseur {supplier_id}")
        
        # Récupérer ou créer l'évaluation IA
        supplier_ai = db.query(SupplierAI).filter(
            SupplierAI.supplier_id == supplier_id
        ).first()
        
        if not supplier_ai:
            supplier_ai = SupplierAI(supplier_id=supplier_id)
            db.add(supplier_ai)
            db.commit()
        
        # Collecter les données externes
        external_data = self._collect_external_data(supplier_ai, db)
        
        # Calculer les scores
        scores = self._calculate_scores(supplier_ai, external_data, db)
        
        # Générer la recommandation
        recommendation = self._generate_recommendation(scores['total'])
        
        # Mettre à jour l'évaluation
        self._update_supplier_evaluation(supplier_ai, scores, recommendation, db)
        
        # Créer le log d'analyse
        self._create_analysis_log(supplier_ai, scores, recommendation, db)
        
        print(f"✅ Analyse IA terminée - Score: {scores['total']:.1f}, Recommandation: {recommendation}")
        
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
        print("🔍 Collecte des données externes...")
        
        external_data = {}
        
        # Simuler la collecte de données
        time.sleep(0.2)
        
        # WHO Prequalification
        who_data = self._check_who_prequalification(supplier_ai)
        if who_data:
            external_data['who_pq'] = who_data
            self._save_external_source(supplier_ai, 'WHO_PQ', who_data, db)
        
        # FDA Registration
        fda_data = self._check_fda_registration(supplier_ai)
        if fda_data:
            external_data['fda'] = fda_data
            self._save_external_source(supplier_ai, 'FDA', fda_data, db)
        
        # EMA Authorization
        ema_data = self._check_ema_authorization(supplier_ai)
        if ema_data:
            external_data['ema'] = ema_data
            self._save_external_source(supplier_ai, 'EMA', ema_data, db)
        
        # Certificats GMP
        gmp_data = self._check_gmp_certificates(supplier_ai)
        if gmp_data:
            external_data['gmp'] = gmp_data
            supplier_ai.gmp_certificates = gmp_data
        
        return external_data
    
    def _check_who_prequalification(self, supplier_ai: SupplierAI) -> Optional[Dict]:
        """Vérifie le statut WHO Prequalification"""
        # Simulation - en production, ce serait un appel API réel
        time.sleep(0.1)
        
        return {
            'status': 'prequalified',
            'products': ['Amoxicillin 500mg', 'Paracetamol 500mg'],
            'last_inspection': '2024-01-15',
            'expiry_date': '2025-01-15',
            'confidence': 0.95
        }
    
    def _check_fda_registration(self, supplier_ai: SupplierAI) -> Optional[Dict]:
        """Vérifie l'enregistrement FDA"""
        time.sleep(0.1)
        
        return {
            'registration_number': 'FDA-123456',
            'status': 'active',
            'products_registered': 15,
            'last_renewal': '2024-03-01',
            'confidence': 0.90
        }
    
    def _check_ema_authorization(self, supplier_ai: SupplierAI) -> Optional[Dict]:
        """Vérifie l'autorisation EMA"""
        time.sleep(0.1)
        
        return {
            'authorization_number': 'EMA-789012',
            'status': 'authorized',
            'marketing_authorization': True,
            'valid_until': '2026-12-31',
            'confidence': 0.85
        }
    
    def _check_gmp_certificates(self, supplier_ai: SupplierAI) -> Optional[Dict]:
        """Vérifie les certificats GMP"""
        time.sleep(0.1)
        
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
    
    def _calculate_scores(self, supplier_ai: SupplierAI, external_data: Dict, db: Session) -> Dict:
        """
        Calcule les scores d'évaluation selon la grille d'analyse
        """
        print("📊 Calcul des scores d'évaluation...")
        
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
        """
        Calcule le score d'expérience et réputation (20%)
        Évaluation mondiale : crédibilité globale du fournisseur sur tous les marchés
        """
        score = 0.0
        
        # 1. Ancienneté de l'entreprise (10%)
        company_age_score = self._calculate_company_age_score(supplier_ai)
        score += company_age_score * 0.10
        
        # 2. Clients/marchés déjà desservis (30%)
        markets_score = self._calculate_markets_served_score(external_data)
        score += markets_score * 0.30
        
        # 3. Références institutionnelles (25%)
        institutional_score = self._calculate_institutional_references_score(external_data)
        score += institutional_score * 0.25
        
        # 4. Historique de conformité (25%)
        compliance_score = self._calculate_compliance_history_score(external_data)
        score += compliance_score * 0.25
        
        # 5. Réputation publique/image (10%)
        reputation_score = self._calculate_public_reputation_score(external_data)
        score += reputation_score * 0.10
        
        return min(100, score)
    
    def _calculate_company_age_score(self, supplier_ai: SupplierAI) -> float:
        """Calcule le score d'ancienneté de l'entreprise (10%)"""
        # Simulation basée sur la date de création
        # En production, ce serait basé sur des données réelles
        supplier = supplier_ai.supplier
        if not supplier:
            return 50.0  # Score neutre par défaut
        
        # Simulation d'ancienneté basée sur le nom de l'entreprise
        company_name = supplier.company_name.lower()
        
        # Logique simplifiée pour la démonstration
        if any(keyword in company_name for keyword in ['pharma', 'laboratories', 'industries']):
            return 85.0  # Entreprise établie
        elif any(keyword in company_name for keyword in ['bio', 'med', 'health']):
            return 70.0  # Entreprise récente mais spécialisée
        else:
            return 60.0  # Score par défaut
    
    def _calculate_markets_served_score(self, external_data: Dict) -> float:
        """Calcule le score des marchés desservis (30%)"""
        score = 0.0
        
        # WHO Prequalification = présence mondiale
        if external_data.get('who_pq'):
            who_data = external_data['who_pq']
            if who_data.get('status') == 'prequalified':
                score += 40  # Forte présence internationale
        
        # FDA = marché américain
        if external_data.get('fda'):
            fda_data = external_data['fda']
            if fda_data.get('status') == 'active':
                score += 25  # Marché américain
        
        # EMA = marché européen
        if external_data.get('ema'):
            ema_data = external_data['ema']
            if ema_data.get('status') == 'authorized':
                score += 20  # Marché européen
        
        # Certificats GMP = présence multi-pays
        if external_data.get('gmp'):
            gmp_data = external_data['gmp']
            certificates_count = gmp_data.get('total_certificates', 0)
            score += min(15, certificates_count * 3)  # Bonus pour multi-pays
        
        return min(100, score)
    
    def _calculate_institutional_references_score(self, external_data: Dict) -> float:
        """Calcule le score des références institutionnelles (25%)"""
        score = 0.0
        
        # WHO Prequalification = référence institutionnelle majeure
        if external_data.get('who_pq'):
            who_data = external_data['who_pq']
            if who_data.get('status') == 'prequalified':
                score += 50  # Référence institutionnelle majeure
        
        # FDA = autorité réglementaire reconnue
        if external_data.get('fda'):
            fda_data = external_data['fda']
            if fda_data.get('status') == 'active':
                score += 30  # Autorité réglementaire
        
        # EMA = autorité européenne
        if external_data.get('ema'):
            ema_data = external_data['ema']
            if ema_data.get('status') == 'authorized':
                score += 25  # Autorité européenne
        
        # Bonus pour multiple références
        reference_count = sum(1 for source in ['who_pq', 'fda', 'ema'] 
                            if external_data.get(source))
        if reference_count >= 2:
            score += 15  # Bonus multi-références
        
        return min(100, score)
    
    def _calculate_compliance_history_score(self, external_data: Dict) -> float:
        """Calcule le score de l'historique de conformité (25%)"""
        score = 80.0  # Score de base (bonne conformité présumée)
        
        # WHO Prequalification = conformité vérifiée
        if external_data.get('who_pq'):
            who_data = external_data['who_pq']
            if who_data.get('status') == 'prequalified':
                score += 15  # Conformité vérifiée par l'OMS
        
        # FDA = conformité réglementaire américaine
        if external_data.get('fda'):
            fda_data = external_data['fda']
            if fda_data.get('status') == 'active':
                score += 10  # Conformité FDA
        
        # EMA = conformité européenne
        if external_data.get('ema'):
            ema_data = external_data['ema']
            if ema_data.get('status') == 'authorized':
                score += 10  # Conformité EMA
        
        # En production, on vérifierait les rappels, suspensions, sanctions
        # Pour la démonstration, on assume une bonne conformité
        
        return min(100, score)
    
    def _calculate_public_reputation_score(self, external_data: Dict) -> float:
        """Calcule le score de réputation publique (10%)"""
        score = 70.0  # Score de base
        
        # WHO Prequalification = réputation internationale
        if external_data.get('who_pq'):
            who_data = external_data['who_pq']
            if who_data.get('status') == 'prequalified':
                score += 20  # Réputation internationale
        
        # FDA = réputation réglementaire
        if external_data.get('fda'):
            score += 15  # Réputation réglementaire
        
        # EMA = réputation européenne
        if external_data.get('ema'):
            score += 10  # Réputation européenne
        
        # En production, on analyserait :
        # - Mentions dans les médias
        # - Évaluations clients
        # - Stabilité commerciale
        # - Présence dans les bases professionnelles
        
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
    
    def _update_supplier_evaluation(self, supplier_ai: SupplierAI, scores: Dict, recommendation: str, db: Session):
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
    
    def _save_external_source(self, supplier_ai: SupplierAI, source_name: str, data: Dict, db: Session):
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
    
    def _create_analysis_log(self, supplier_ai: SupplierAI, scores: Dict, recommendation: str, db: Session):
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
            processing_time=1.5  # Simulation
        )
        db.add(log)
        db.commit()
    
    def search_suppliers(self, query: str, filters: Dict, db: Session) -> Dict:
        """
        Recherche de fournisseurs avec filtres avancés
        """
        print(f"🔍 Recherche de fournisseurs: {query}")
        
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
    
    def create_recommendation(self, supplier_id: str, user_id: str, recommendation_type: str, justification: str, db: Session) -> Dict:
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
