"""
Routes pour l'administration système (Super Admin)
Gestion de la base de données, sauvegardes, monitoring
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any
from datetime import datetime
import subprocess
import os
from pathlib import Path
import httpx

from app.database import get_db, get_db_stats, test_connection
from app.routes.auth import get_current_user as get_current_user_from_auth
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/v1/admin/system", tags=["Admin System"])

def require_superadmin(current_user: User = Depends(get_current_user_from_auth)):
    """Vérifier que l'utilisateur est super-admin"""
    if current_user.role != UserRole.SUPERADMIN.value:
        raise HTTPException(status_code=403, detail="Accès réservé aux super-administrateurs")
    return current_user

@router.get("/status")
async def get_system_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """Obtenir le statut global du système"""
    db_status = test_connection()
    db_stats = get_db_stats() if db_status else {}
    
    # Vérifier le service IA
    ai_service_status = False
    try:
        import httpx
        from app.config import settings
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.AI_SERVICE_URL}/health", timeout=2.0)
            ai_service_status = response.status_code == 200
    except:
        ai_service_status = False
    
    return {
        "overall": "stable" if db_status else "unstable",
        "uptime": "99.99%",  # À calculer depuis le démarrage
        "active_modules": 4 if db_status and ai_service_status else 2,
        "critical_errors": 0,
        "modules": {
            "backend": {
                "status": "active",
                "uptime": "99.99%",
                "response_time": "120ms"
            },
            "ai_service": {
                "status": "active" if ai_service_status else "inactive",
                "uptime": "99.90%" if ai_service_status else "0%",
                "response_time": "220ms" if ai_service_status else "N/A"
            },
            "frontend": {
                "status": "online",
                "uptime": "100%",
                "response_time": "45ms"
            },
            "database": {
                "status": "connected" if db_status else "disconnected",
                "uptime": db_stats.get("status", "unknown"),
                "response_time": "15ms",
                "stats": db_stats
            }
        }
    }

@router.get("/database/tables")
async def get_database_tables(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """Obtenir la liste des tables et leurs statistiques"""
    try:
        # Requête pour obtenir les informations sur les tables
        query = text("""
            SELECT 
                schemaname,
                tablename as name,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
                (SELECT count(*) FROM information_schema.tables WHERE table_schema = schemaname) as total_tables
            FROM pg_tables
            WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        """)
        
        result = db.execute(query)
        tables = []
        
        for row in result:
            # Obtenir le nombre d'enregistrements pour chaque table
            count_query = text(f'SELECT COUNT(*) FROM "{row.schemaname}"."{row.name}"')
            count_result = db.execute(count_query)
            records = count_result.scalar() or 0
            
            tables.append({
                "name": row.name,
                "status": "ok",
                "size": row.size,
                "records": records,
                "health": 95,  # À calculer selon les critères
                "last_backup": "02:00"  # À récupérer depuis les logs
            })
        
        return {"tables": tables}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des tables: {str(e)}")

@router.get("/database/stats")
async def get_database_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """Obtenir les statistiques globales de la base de données"""
    try:
        stats = get_db_stats()
        
        # Obtenir la taille totale
        size_query = text("SELECT pg_size_pretty(pg_database_size(current_database()))")
        size_result = db.execute(size_query)
        total_size = size_result.scalar() or "0 MB"
        
        # Compter le nombre de tables
        tables_query = text("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        """)
        tables_result = db.execute(tables_query)
        total_tables = tables_result.scalar() or 0
        
        return {
            "total_size": total_size,
            "total_tables": total_tables,
            "active_connections": stats.get("active_connections", 0),
            "uptime": "99.98%",
            "last_maintenance": datetime.now().strftime("%Y-%m-%d %H:%M")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des statistiques: {str(e)}")

@router.post("/database/backup")
async def create_backup(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_superadmin)
):
    """Créer une sauvegarde manuelle de la base de données"""
    try:
        from app.config import settings
        
        # Lancer le script de backup en arrière-plan
        backup_script = Path("scripts/backup.py")
        if not backup_script.exists():
            backup_script = Path("backend/scripts/backup.py")
        
        if backup_script.exists():
            def run_backup():
                import subprocess
                subprocess.run([
                    "python", 
                    str(backup_script),
                    "--action", "backup"
                ], cwd=backup_script.parent.parent)
            
            background_tasks.add_task(run_backup)
            return {
                "status": "started",
                "message": "Sauvegarde en cours de création",
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail="Script de backup non trouvé")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de la sauvegarde: {str(e)}")

@router.post("/database/restore")
async def restore_database(
    backup_file: str,
    current_user: User = Depends(require_superadmin)
):
    """Restaurer la base de données depuis un backup"""
    # Cette fonction doit être sécurisée et validée
    raise HTTPException(status_code=501, detail="Fonctionnalité de restauration à implémenter avec validation")

@router.get("/database/inspect/{table_name}")
async def inspect_table(
    table_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    """Inspecter une table spécifique"""
    try:
        # Vérifier que la table existe
        check_query = text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
                AND table_name = :table_name
            )
        """)
        exists = db.execute(check_query, {"table_name": table_name}).scalar()
        
        if not exists:
            raise HTTPException(status_code=404, detail=f"Table {table_name} non trouvée")
        
        # Obtenir les informations sur la table
        info_query = text(f"""
            SELECT 
                pg_size_pretty(pg_total_relation_size('{table_name}')) as size,
                (SELECT COUNT(*) FROM "{table_name}") as records,
                (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = '{table_name}') as columns
        """)
        
        result = db.execute(info_query).fetchone()
        
        return {
            "table_name": table_name,
            "size": result[0] if result else "0 MB",
            "records": result[1] if result else 0,
            "columns": result[2] if result else 0,
            "status": "ok",
            "health": 95
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'inspection: {str(e)}")

@router.get("/api/metrics")
async def get_api_metrics(
    current_user: User = Depends(require_superadmin)
):
    """Obtenir les métriques des endpoints API"""
    # À implémenter avec le système de métriques
    return {
        "endpoints": [
            {
                "route": "/api/login",
                "response_time": "120ms",
                "status": "success",
                "last_call": datetime.now().isoformat(),
                "errors_24h": 0
            }
        ]
    }

@router.get("/logs/export")
async def export_logs(
    current_user: User = Depends(require_superadmin)
):
    """Exporter les logs au format CSV"""
    from fastapi.responses import StreamingResponse
    import io
    import csv
    
    try:
        # Lire les logs depuis les fichiers
        log_files = [
            "backend/logs/app.log",
            "backend/logs/error.log",
            "backend/logs/security.log"
        ]
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Timestamp', 'Level', 'Message', 'Source'])
        
        for log_file in log_files:
            log_path = Path(log_file)
            if log_path.exists():
                with open(log_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        # Parser les lignes de log (format simplifié)
                        parts = line.strip().split(' - ', 2)
                        if len(parts) >= 3:
                            writer.writerow([
                                parts[0] if len(parts) > 0 else '',
                                parts[1] if len(parts) > 1 else '',
                                parts[2] if len(parts) > 2 else '',
                                log_path.name
                            ])
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=cameg-chain-logs-{datetime.now().strftime('%Y%m%d')}.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'export: {str(e)}")

@router.post("/restart")
async def restart_modules(
    current_user: User = Depends(require_superadmin)
):
    """Redémarrer les modules système"""
    # En production, cela devrait être géré par un système de gestion de processus
    # Pour l'instant, on retourne un succès simulé
    return {
        "status": "initiated",
        "message": "Redémarrage des modules en cours",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/endpoints/{route:path}/restart")
async def restart_endpoint(
    route: str,
    current_user: User = Depends(require_superadmin)
):
    """Redémarrer un endpoint spécifique"""
    # Simulation - à implémenter avec un vrai système de gestion
    return {
        "status": "restarted",
        "route": route,
        "message": f"Endpoint {route} redémarré",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/endpoints/test")
async def test_endpoints(
    current_user: User = Depends(require_superadmin)
):
    """Tester tous les endpoints API"""
    import httpx
    from app.config import settings
    
    endpoints_to_test = [
        "/health",
        "/api/v1/status",
        "/api/v1/admin/system/status"
    ]
    
    results = {
        "success": 0,
        "failed": 0,
        "details": []
    }
    
    api_url = settings.API_URL if hasattr(settings, 'API_URL') else "http://localhost:8000"
    
    for endpoint in endpoints_to_test:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{api_url}{endpoint}", timeout=5.0)
                if response.status_code < 400:
                    results["success"] += 1
                    results["details"].append({
                        "endpoint": endpoint,
                        "status": "success",
                        "response_time": "N/A"
                    })
                else:
                    results["failed"] += 1
                    results["details"].append({
                        "endpoint": endpoint,
                        "status": "failed",
                        "error": f"Status {response.status_code}"
                    })
        except Exception as e:
            results["failed"] += 1
            results["details"].append({
                "endpoint": endpoint,
                "status": "failed",
                "error": str(e)
            })
    
    return results

