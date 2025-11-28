"""
Routes pour l'évaluation IA des fournisseurs
Système d'analyse et de préqualification proactive
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Iterable
import asyncio
import uuid
import logging
import io
import csv
from datetime import datetime, timezone

from app.database import get_db
from app.services.ai_supplier_engine_simple import SupplierAIEngineSimple
from app.models.supplier_ai import SupplierAI, SupplierRecommendation, AiAnalysisLog, AiRecommendation
from app.models.user import Supplier
from app.schemas.ai_supplier import (
    SupplierAnalysisRequest, SupplierAnalysisResponse,
    SupplierSearchRequest, SupplierSearchResponse,
    RecommendationRequest, RecommendationResponse,
    SupplierAIResponse, ExternalDataSourceResponse,
    SupplierExportRequest, AiMonitoringResponse
)

router = APIRouter(prefix="/api/v1/ai/suppliers", tags=["AI Supplier Evaluation"])
logger = logging.getLogger(__name__)

# Instance du moteur IA
ai_engine = SupplierAIEngineSimple()

def validate_uuid(uuid_string: str) -> bool:
    """Valider qu'une chaîne est un UUID valide"""
    try:
        uuid.UUID(uuid_string)
        return True
    except ValueError:
        return False

@router.post("/analyze/{supplier_id}", response_model=SupplierAnalysisResponse)
async def analyze_supplier(
    supplier_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Lance l'analyse IA complète d'un fournisseur
    """
    try:
        # Validation de l'UUID
        if not validate_uuid(supplier_id):
            logger.warning(f"Invalid UUID provided: {supplier_id}")
            raise HTTPException(status_code=400, detail="Format d'ID fournisseur invalide")
        
        # Vérifier que le fournisseur existe
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            logger.warning(f"Supplier not found: {supplier_id}")
            raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
        
        # Lancer l'analyse
        ai_engine.analyze_supplier(supplier_id, db)
        
        return SupplierAnalysisResponse(
            supplier_id=supplier_id,
            status="analysis_started",
            message="Analyse IA lancée en arrière-plan. Les résultats seront disponibles dans quelques minutes."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du lancement de l'analyse: {str(e)}")

@router.get("/analysis/{supplier_id}", response_model=SupplierAIResponse)
async def get_supplier_analysis(
    supplier_id: str,
    db: Session = Depends(get_db)
):
    """
    Récupère les résultats de l'analyse IA d'un fournisseur
    """
    try:
        supplier_ai = db.query(SupplierAI).filter(SupplierAI.supplier_id == supplier_id).first()
        if not supplier_ai:
            raise HTTPException(status_code=404, detail="Analyse IA non trouvée")
        
        supplier = supplier_ai.supplier
        if not supplier:
            raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
        
        return SupplierAIResponse(
            supplier_id=str(supplier_ai.supplier_id),
            company_name=supplier.company_name,
            country=supplier.country,
            relation_cameg=supplier_ai.relation_cameg,
            source_identification=supplier_ai.source_identification,
            niveau_confiance=supplier_ai.niveau_confiance,
            etat_prequalification=supplier_ai.etat_prequalification,
            scores={
                'certifications': supplier_ai.score_certifications,
                'experience': supplier_ai.score_experience,
                'documentaire': supplier_ai.score_documentaire,
                'capacite': supplier_ai.score_capacite,
                'prix': supplier_ai.score_prix,
                'risque': supplier_ai.score_risque,
                'total': supplier_ai.score_predictif_total
            },
            ai_recommendation=supplier_ai.ai_recommendation,
            ai_confidence_level=supplier_ai.ai_confidence_level,
            ai_analysis_date=supplier_ai.ai_analysis_date,
            ai_analysis_notes=supplier_ai.ai_analysis_notes,
            who_pq_status=supplier_ai.who_pq_status,
            fda_registration=supplier_ai.fda_registration,
            ema_authorization=supplier_ai.ema_authorization,
            gmp_certificates=supplier_ai.gmp_certificates,
            external_references=supplier_ai.external_references,
            product_portfolio=supplier_ai.product_portfolio,
            market_presence=supplier_ai.market_presence
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de l'analyse: {str(e)}")

@router.post("/search", response_model=SupplierSearchResponse)
async def search_suppliers(
    request: SupplierSearchRequest,
    db: Session = Depends(get_db)
):
    """
    Recherche de fournisseurs avec filtres avancés
    """
    try:
        filters = {
            'relation_type': request.relation_type,
            'min_score': request.min_score,
            'recommendation': request.recommendation,
            'country': request.country,
            'limit': request.limit,
            'skip': request.skip
        }
        
        results = ai_engine.search_suppliers(request.query, filters, db)
        
        # Construire la réponse avec les résultats
        from app.schemas.ai_supplier import SupplierSearchResults, SupplierSearchResult
        
        # Convertir les dictionnaires en objets SupplierSearchResult
        def convert_to_search_result(item: dict) -> SupplierSearchResult:
            return SupplierSearchResult(
                id=item.get('id', ''),
                company_name=item.get('company_name', ''),
                country=item.get('country', ''),
                score=item.get('score', 0.0),
                recommendation=item.get('recommendation'),
                relation_type=item.get('relation_type'),
                who_pq_status=item.get('who_pq_status'),
                last_analysis=item.get('last_analysis')
            )
        
        search_results = SupplierSearchResults(
            partenaires_actuels=[convert_to_search_result(item) for item in results.get('partenaires_actuels', [])],
            nouveaux_prequalifies=[convert_to_search_result(item) for item in results.get('nouveaux_prequalifies', [])],
            a_auditer=[convert_to_search_result(item) for item in results.get('a_auditer', [])],
            total=results.get('total', 0)
        )
        
        return SupplierSearchResponse(
            query=request.query,
            filters=filters,
            results=search_results,
            total_found=results.get('total', 0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erreur lors de la recherche de fournisseurs IA: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la recherche: {str(e)}"
        )

@router.get("/search/filters")
async def get_search_filters():
    """
    Récupère les filtres disponibles pour la recherche
    """
    return {
        "relation_types": [
            {"value": "ancien", "label": "Partenaires actuels CAMEG"},
            {"value": "nouveau", "label": "Nouveaux fournisseurs"},
            {"value": "inconnu", "label": "Non identifiés"}
        ],
        "recommendations": [
            {"value": "prequalifie", "label": "Préqualifiés (≥80 points)"},
            {"value": "a_auditer", "label": "À auditer (60-79 points)"},
            {"value": "risque_eleve", "label": "Risque élevé (<60 points)"}
        ],
        "countries": [
            {"value": "India", "label": "Inde"},
            {"value": "Germany", "label": "Allemagne"},
            {"value": "China", "label": "Chine"},
            {"value": "Brazil", "label": "Brésil"},
            {"value": "South Africa", "label": "Afrique du Sud"}
        ]
    }

@router.post("/recommend", response_model=RecommendationResponse)
async def create_recommendation(
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Crée une recommandation pour la DAQP
    """
    try:
        result = ai_engine.create_recommendation(
            request.supplier_id,
            request.user_id,
            request.recommendation_type,
            request.justification,
            db
        )
        
        return RecommendationResponse(
            id=result['id'],
            supplier_name=result['supplier_name'],
            recommendation_type=result['recommendation_type'],
            priority_level=result['priority_level'],
            status=result['status'],
            message="Recommandation créée avec succès"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de la recommandation: {str(e)}")

@router.get("/recommendations/pending")
async def get_pending_recommendations(
    db: Session = Depends(get_db)
):
    """
    Récupère les recommandations en attente pour la DAQP
    """
    try:
        recommendations = db.query(SupplierRecommendation).filter(
            SupplierRecommendation.status == "pending"
        ).all()
        
        results = []
        for rec in recommendations:
            supplier_ai = rec.supplier_ai
            supplier = supplier_ai.supplier
            
            results.append({
                'id': str(rec.id),
                'supplier_name': supplier.company_name,
                'supplier_country': supplier.country,
                'recommendation_type': rec.recommendation_type,
                'priority_level': rec.priority_level,
                'justification': rec.justification,
                'ai_score': supplier_ai.score_predictif_total,
                'ai_recommendation': supplier_ai.ai_recommendation,
                'created_at': rec.created_at,
                'recommended_by': rec.recommender.full_name if rec.recommender else None
            })
        
        return {
            'recommendations': results,
            'total': len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des recommandations: {str(e)}")

@router.get("/dashboard/stats")
async def get_ai_dashboard_stats(
    db: Session = Depends(get_db)
):
    """
    Statistiques du tableau de bord IA
    """
    try:
        # Statistiques générales
        total_suppliers = db.query(SupplierAI).count()
        prequalified = db.query(SupplierAI).filter(
            SupplierAI.ai_recommendation == "prequalifie"
        ).count()
        to_audit = db.query(SupplierAI).filter(
            SupplierAI.ai_recommendation == "a_auditer"
        ).count()
        high_risk = db.query(SupplierAI).filter(
            SupplierAI.ai_recommendation == "risque_eleve"
        ).count()
        
        # Répartition par relation CAMEG
        ancien_count = db.query(SupplierAI).filter(
            SupplierAI.relation_cameg == "ancien"
        ).count()
        nouveau_count = db.query(SupplierAI).filter(
            SupplierAI.relation_cameg == "nouveau"
        ).count()
        
        # Recommandations en attente
        pending_recommendations = db.query(SupplierRecommendation).filter(
            SupplierRecommendation.status == "pending"
        ).count()
        
        return {
            'total_suppliers_analyzed': total_suppliers,
            'prequalified': prequalified,
            'to_audit': to_audit,
            'high_risk': high_risk,
            'relation_breakdown': {
                'ancien': ancien_count,
                'nouveau': nouveau_count
            },
            'pending_recommendations': pending_recommendations,
            'analysis_coverage': f"{(total_suppliers / max(1, db.query(Supplier).count())) * 100:.1f}%"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des statistiques: {str(e)}")

@router.get("/external-sources/{supplier_id}")
async def get_external_sources(
    supplier_id: str,
    db: Session = Depends(get_db)
):
    """
    Récupère les sources de données externes pour un fournisseur
    """
    try:
        supplier_ai = db.query(SupplierAI).filter(SupplierAI.supplier_id == supplier_id).first()
        if not supplier_ai:
            raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
        
        sources = []
        for source in supplier_ai.external_sources:
            sources.append(ExternalDataSourceResponse(
                id=str(source.id),
                source_name=source.source_name,
                source_type=source.source_type,
                source_url=source.source_url,
                confidence_score=source.confidence_score,
                last_updated=source.last_updated,
                data_extracted=source.data_extracted
            ))
        
        return {
            'supplier_id': supplier_id,
            'sources': sources,
            'total_sources': len(sources)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des sources: {str(e)}")

@router.get("/export")
async def export_suppliers(
    query: Optional[str] = Query(None),
    relation_type: Optional[str] = Query(None),
    recommendation: Optional[str] = Query(None),
    min_score: Optional[float] = Query(None),
    country: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Export CSV des fournisseurs IA correspondant aux filtres.
    """
    try:
        filters = {
            'relation_type': relation_type,
            'min_score': min_score,
            'recommendation': recommendation,
            'country': country,
            'limit': 10000,
            'skip': 0
        }
        results = ai_engine.search_suppliers(query, filters, db)

        def flatten(result_dict: Dict[str, List[Dict]]) -> Iterable[Dict]:
            for category in ('partenaires_actuels', 'nouveaux_prequalifies', 'a_auditer'):
                for item in result_dict.get(category, []):
                    yield item

        def generate_csv():
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow([
                "Fournisseur",
                "Pays",
                "Score",
                "Recommandation IA",
                "Relation CAMEG",
                "Statut WHO PQ",
                "Dernière analyse"
            ])
            yield output.getvalue()
            output.seek(0)
            output.truncate(0)

            for supplier in flatten(results):
                writer.writerow([
                    supplier.get('company_name', ''),
                    supplier.get('country', ''),
                    f"{supplier.get('score', 0):.2f}",
                    supplier.get('recommendation', ''),
                    supplier.get('relation_type', ''),
                    supplier.get('who_pq_status', ''),
                    supplier.get('last_analysis').isoformat() if supplier.get('last_analysis') else ''
                ])
                yield output.getvalue()
                output.seek(0)
                output.truncate(0)

        filename = f"ai_suppliers_export_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"
        headers = {"Content-Disposition": f"attachment; filename={filename}"}
        return StreamingResponse(generate_csv(), media_type="text/csv", headers=headers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'export CSV: {str(e)}")

@router.get("/monitoring/live", response_model=AiMonitoringResponse)
async def live_monitoring(
    db: Session = Depends(get_db)
):
    """
    Monitoring temps réel : dernières analyses IA et files d'attente.
    """
    try:
        recent_logs = db.query(AiAnalysisLog, SupplierAI, Supplier)\
            .join(SupplierAI, AiAnalysisLog.supplier_ai_id == SupplierAI.id)\
            .join(Supplier, SupplierAI.supplier_id == Supplier.id)\
            .order_by(AiAnalysisLog.created_at.desc())\
            .limit(5)\
            .all()

        recent_analyses = []
        for log, supplier_ai, supplier in recent_logs:
            recent_analyses.append({
                "id": str(log.id),
                "supplier_id": str(supplier_ai.supplier_id),
                "supplier_name": supplier.company_name,
                "supplier_country": supplier.country,
                "score_after": (log.scores_after or {}).get('total') if log.scores_after else supplier_ai.score_predictif_total,
                "recommendation_after": log.recommendation_after or supplier_ai.ai_recommendation,
                "analysis_type": log.analysis_type,
                "trigger_source": log.trigger_source,
                "created_at": log.created_at,
                "processing_time": log.processing_time
            })

        pending_recommendations = db.query(SupplierRecommendation)\
            .filter(SupplierRecommendation.status == "pending").count()

        high_risk = db.query(SupplierAI).filter(SupplierAI.ai_recommendation == AiRecommendation.RISQUE_ELEVE.value).count()

        total_logs = db.query(AiAnalysisLog).count()

        return AiMonitoringResponse(
            recent_analyses=recent_analyses,
            pending_recommendations=pending_recommendations,
            high_risk_suppliers=high_risk,
            total_logs=total_logs,
            last_refresh=datetime.now(timezone.utc)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du monitoring IA: {str(e)}")

@router.post("/batch-analyze")
async def batch_analyze_suppliers(
    supplier_ids: List[str],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Lance l'analyse IA pour plusieurs fournisseurs en lot
    """
    try:
        results = []
        for supplier_id in supplier_ids:
            # Vérifier que le fournisseur existe
            supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
            if supplier:
                background_tasks.add_task(ai_engine.analyze_supplier, supplier_id, db)
                results.append({
                    'supplier_id': supplier_id,
                    'status': 'queued',
                    'company_name': supplier.company_name
                })
            else:
                results.append({
                    'supplier_id': supplier_id,
                    'status': 'error',
                    'error': 'Fournisseur non trouvé'
                })
        
        return {
            'message': f"Analyse IA lancée pour {len(supplier_ids)} fournisseurs",
            'results': results,
            'total_queued': len([r for r in results if r['status'] == 'queued'])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du lancement de l'analyse en lot: {str(e)}")
