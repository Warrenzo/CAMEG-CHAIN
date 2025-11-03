"""
Middleware de métriques Prometheus pour CAMEG-CHAIN
"""
import time
import os
from typing import Callable
from fastapi import Request, Response
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import logging

logger = logging.getLogger(__name__)

# Métriques Prometheus
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_CONNECTIONS = Gauge(
    'http_active_connections',
    'Number of active HTTP connections'
)

DATABASE_CONNECTIONS = Gauge(
    'database_connections_active',
    'Number of active database connections'
)

AUTHENTICATION_ATTEMPTS = Counter(
    'authentication_attempts_total',
    'Total authentication attempts',
    ['result', 'user_type']
)

SUPPLIER_REGISTRATIONS = Counter(
    'supplier_registrations_total',
    'Total supplier registrations',
    ['phase', 'status']
)

API_ERRORS = Counter(
    'api_errors_total',
    'Total API errors',
    ['error_type', 'endpoint']
)

class MetricsMiddleware:
    """Middleware pour collecter les métriques Prometheus"""
    
    def __init__(self):
        self.active_connections = 0
    
    async def __call__(self, request: Request, call_next: Callable) -> Response:
        """Middleware principal pour les métriques"""
        # Incrémenter les connexions actives
        self.active_connections += 1
        ACTIVE_CONNECTIONS.set(self.active_connections)
        
        # Mesurer le temps de réponse
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            # Enregistrer les métriques
            duration = time.time() - start_time
            
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=request.url.path,
                status_code=response.status_code
            ).inc()
            
            REQUEST_DURATION.labels(
                method=request.method,
                endpoint=request.url.path
            ).observe(duration)
            
            # Enregistrer les erreurs
            if response.status_code >= 400:
                API_ERRORS.labels(
                    error_type=f"http_{response.status_code}",
                    endpoint=request.url.path
                ).inc()
            
            return response
            
        except Exception as e:
            # Enregistrer les erreurs d'exception
            API_ERRORS.labels(
                error_type="exception",
                endpoint=request.url.path
            ).inc()
            
            logger.error(f"Erreur dans le middleware de métriques: {e}")
            raise
            
        finally:
            # Décrémenter les connexions actives
            self.active_connections -= 1
            ACTIVE_CONNECTIONS.set(self.active_connections)

# Instance globale du middleware
metrics_middleware = MetricsMiddleware()

def get_metrics():
    """Obtenir les métriques Prometheus"""
    return generate_latest()

def record_auth_attempt(result: str, user_type: str = "supplier"):
    """Enregistrer une tentative d'authentification"""
    AUTHENTICATION_ATTEMPTS.labels(result=result, user_type=user_type).inc()

def record_supplier_registration(phase: str, status: str):
    """Enregistrer une inscription de fournisseur"""
    SUPPLIER_REGISTRATIONS.labels(phase=phase, status=status).inc()

def record_database_connections(count: int):
    """Enregistrer le nombre de connexions à la base de données"""
    DATABASE_CONNECTIONS.set(count)
