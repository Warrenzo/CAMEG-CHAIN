"""
Application principale FastAPI pour CAMEG-CHAIN
"""
from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
from datetime import datetime
import uvicorn

from app.config import settings
from app.database import test_connection, init_db, get_db_stats
from app.routes.auth import router as auth_router
from app.routes.supplier import router as supplier_router
from app.routes.tender import router as tender_router
from app.routes.ai_supplier import router as ai_supplier_router
from app.middleware.security import security_middleware
from app.middleware.sentry import init_sentry
from app.utils.logger import setup_logging, get_logger, log_api_request

# Créer l'application FastAPI avec documentation complète
app = FastAPI(
    title="CAMEG-CHAIN API",
    description="""
    ## API CAMEG-CHAIN - Plateforme de gestion des fournisseurs pharmaceutiques
    
    Cette API permet de gérer l'ensemble du processus de préqualification des fournisseurs pharmaceutiques pour la DAQP du Togo.
    
    ### Fonctionnalités principales :
    - **Authentification sécurisée** : JWT avec refresh tokens
    - **Gestion des fournisseurs** : Inscription en 2 phases
    - **Évaluation IA** : Scoring automatique des fournisseurs
    - **Gestion des appels d'offres** : Création et suivi
    - **Monitoring** : Métriques et alertes en temps réel
    
    ### Sécurité :
    - Rate limiting par IP et utilisateur
    - Validation stricte des données
    - Chiffrement des données sensibles
    - Audit trail complet
    
    ### Support :
    - Documentation interactive (Swagger UI)
    - Documentation alternative (ReDoc)
    - Endpoints de santé et monitoring
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "Équipe CAMEG-CHAIN",
        "email": "support@cameg-chain.com",
        "url": "https://cameg-chain.com/support"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    },
    servers=[
        {
            "url": "https://api.cameg-chain.com",
            "description": "Serveur de production"
        },
        {
            "url": "https://staging-api.cameg-chain.com",
            "description": "Serveur de staging"
        },
        {
            "url": "http://localhost:8000",
            "description": "Serveur de développement"
        }
    ],
    tags_metadata=[
        {
            "name": "Authentication",
            "description": "Authentification et gestion des utilisateurs",
            "externalDocs": {
                "description": "Guide d'authentification",
                "url": "https://docs.cameg-chain.com/auth"
            }
        },
        {
            "name": "Suppliers",
            "description": "Gestion des fournisseurs pharmaceutiques",
            "externalDocs": {
                "description": "Guide des fournisseurs",
                "url": "https://docs.cameg-chain.com/suppliers"
            }
        },
        {
            "name": "Tenders",
            "description": "Gestion des appels d'offres",
            "externalDocs": {
                "description": "Guide des appels d'offres",
                "url": "https://docs.cameg-chain.com/tenders"
            }
        },
        {
            "name": "AI Analysis",
            "description": "Analyse IA des fournisseurs",
            "externalDocs": {
                "description": "Guide de l'IA",
                "url": "https://docs.cameg-chain.com/ai"
            }
        },
        {
            "name": "Monitoring",
            "description": "Monitoring et métriques",
            "externalDocs": {
                "description": "Guide de monitoring",
                "url": "https://docs.cameg-chain.com/monitoring"
            }
        }
    ]
)

# Configuration CORS sécurisée (DOIT être ajouté en premier pour que les headers CORS soient présents)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
    expose_headers=["*"],
)

# Gestionnaire d'erreurs global pour les HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Gestionnaire d'erreurs HTTP avec headers CORS"""
    origin = request.headers.get("origin")
    headers = {}
    if origin and origin in settings.ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = ", ".join(settings.ALLOWED_METHODS)
        headers["Access-Control-Allow-Headers"] = ", ".join(settings.ALLOWED_HEADERS)
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail
        },
        headers=headers
    )

# Gestionnaire d'erreurs global pour les erreurs de validation Pydantic avec CORS
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Gestionnaire d'erreurs de validation Pydantic avec headers CORS"""
    origin = request.headers.get("origin")
    headers = {}
    if origin and origin in settings.ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = ", ".join(settings.ALLOWED_METHODS)
        headers["Access-Control-Allow-Headers"] = ", ".join(settings.ALLOWED_HEADERS)
    
    raw_errors = exc.errors()
    errors = []
    for error in raw_errors:
        field = " -> ".join(str(loc) for loc in error["loc"])
        message = error["msg"]
        errors.append(f"{field}: {message}")
    serializable_errors = jsonable_encoder(raw_errors)
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": "; ".join(errors),
            "errors": serializable_errors
        },
        headers=headers
    )

# Gestionnaire d'erreurs global pour toutes les exceptions non gérées (500) avec CORS
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Gestionnaire d'erreurs global pour toutes les exceptions avec headers CORS"""
    logger = get_logger(__name__)
    logger.error(f"Erreur non gérée: {exc}", exc_info=True)
    
    origin = request.headers.get("origin")
    headers = {}
    if origin and origin in settings.ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = ", ".join(settings.ALLOWED_METHODS)
        headers["Access-Control-Allow-Headers"] = ", ".join(settings.ALLOWED_HEADERS)
    
    # En développement, afficher le détail de l'erreur
    detail = str(exc) if settings.DEBUG else "Une erreur interne du serveur s'est produite"
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": detail,
            "type": type(exc).__name__
        },
        headers=headers
    )

# Middleware de sécurité (doit être ajouté après CORS)
@app.middleware("http")
async def security_middleware_handler(request: Request, call_next):
    return await security_middleware(request, call_next)

# Middleware de métriques
from app.middleware.metrics import metrics_middleware
@app.middleware("http")
async def metrics_middleware_handler(request: Request, call_next):
    return await metrics_middleware(request, call_next)

# Inclure les routes
from app.routes.admin_system import router as admin_system_router
from app.routes.admin_users import router as admin_users_router

app.include_router(auth_router)
app.include_router(supplier_router)
app.include_router(tender_router)
app.include_router(ai_supplier_router)
app.include_router(admin_system_router)
app.include_router(admin_users_router)

@app.on_event("startup")
async def startup_event():
    """Événement de démarrage de l'application"""
    # Initialiser le système de logging
    setup_logging(settings.ENVIRONMENT, "INFO")
    logger = get_logger(__name__)
    
    logger.info("Demarrage de l'API CAMEG-CHAIN...")
    
    # Initialiser Sentry
    try:
        init_sentry()
        logger.info("Sentry initialise")
    except Exception as e:
        logger.warning(f"Erreur initialisation Sentry: {e}")
    
    # Tester la connexion à la base de données
    if test_connection():
        # Initialiser la base de données
        init_db()
        logger.info("Base de donnees initialisee")
    else:
        logger.error("Probleme de connexion a la base de donnees")
    
    logger.info(f"API disponible sur http://{settings.API_HOST}:{settings.API_PORT}")

@app.get("/")
async def root():
    """Point d'entrée principal de l'API"""
    return {
        "message": "Bienvenue sur l'API CAMEG-CHAIN",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs"
    }

@app.get("/health", tags=["Monitoring"])
async def health_check():
    """
    Vérification de l'état de l'API avec diagnostics détaillés
    
    Cet endpoint fournit un état de santé complet de l'application,
    incluant la base de données, les services externes et les métriques.
    """
    import time
    from app.services.cache import get_cache
    
    start_time = time.time()
    
    # Vérifier la base de données
    db_status = test_connection()
    db_stats = get_db_stats() if db_status else {"status": "error"}
    
    # Vérifier Redis
    redis_status = False
    redis_stats = {}
    try:
        redis_stats = get_cache().get_stats()
        redis_status = True
    except Exception as e:
        redis_stats = {"error": str(e)}
    
    # Vérifier les services externes
    ai_service_status = False
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.AI_SERVICE_URL}/health", timeout=5.0)
            ai_service_status = response.status_code == 200
    except Exception:
        ai_service_status = False
    
    # Calculer le temps de réponse
    response_time = (time.time() - start_time) * 1000  # en ms
    
    # Déterminer le statut global
    overall_status = "healthy" if all([db_status, redis_status]) else "unhealthy"
    
    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "response_time_ms": round(response_time, 2),
        "database": {
            "connected": db_status,
            "stats": db_stats
        },
        "cache": {
            "connected": redis_status,
            "stats": redis_stats
        },
        "ai_service": {
            "connected": ai_service_status,
            "url": settings.AI_SERVICE_URL
        },
        "security": {
            "middleware": "active",
            "rate_limiting": "enabled",
            "cors": "configured"
        },
        "uptime": "running"
    }

@app.get("/health/ready", tags=["Monitoring"])
async def readiness_check():
    """
    Vérification de disponibilité (Readiness Probe)
    
    Utilisé par Kubernetes pour vérifier si l'application est prête
    à recevoir du trafic.
    """
    db_status = test_connection()
    
    if not db_status:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "reason": "database_unavailable"}
        )
    
    return {"status": "ready"}

@app.get("/health/live", tags=["Monitoring"])
async def liveness_check():
    """
    Vérification de vivacité (Liveness Probe)
    
    Utilisé par Kubernetes pour vérifier si l'application est vivante.
    """
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}

@app.get("/metrics", tags=["Monitoring"])
async def prometheus_metrics():
    """
    Métriques Prometheus
    
    Endpoint pour la collecte des métriques par Prometheus.
    Accessible uniquement depuis les réseaux internes.
    """
    from app.middleware.metrics import get_metrics
    from fastapi import Response
    
    metrics_data = get_metrics()
    return Response(content=metrics_data, media_type=CONTENT_TYPE_LATEST)

@app.get("/api/v1/status")
async def api_status():
    """Statut détaillé de l'API (sécurisé)"""
    return {
        "api": "CAMEG-CHAIN",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG if settings.ENVIRONMENT == "development" else False,
        "database": {
            "connected": test_connection(),
            "host": settings.DB_HOST if settings.ENVIRONMENT == "development" else "***",
            "port": settings.DB_PORT if settings.ENVIRONMENT == "development" else "***",
            "name": settings.DB_NAME if settings.ENVIRONMENT == "development" else "***"
        },
        "ai_service": {
            "url": settings.AI_SERVICE_URL if settings.ENVIRONMENT == "development" else "***",
            "model_path": settings.AI_MODEL_PATH if settings.ENVIRONMENT == "development" else "***"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
