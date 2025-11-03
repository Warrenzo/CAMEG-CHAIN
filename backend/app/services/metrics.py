"""
Service de métriques business et techniques pour CAMEG-CHAIN
"""
import time
import psutil
from datetime import datetime, timedelta
from typing import Dict, Any, List
from prometheus_client import Counter, Histogram, Gauge, Summary
import logging

logger = logging.getLogger(__name__)

# Métriques business
SUPPLIER_REGISTRATIONS_TOTAL = Counter(
    'supplier_registrations_total',
    'Total number of supplier registrations',
    ['phase', 'status', 'country']
)

TENDER_CREATIONS_TOTAL = Counter(
    'tender_creations_total',
    'Total number of tenders created',
    ['type', 'status']
)

EVALUATIONS_COMPLETED_TOTAL = Counter(
    'evaluations_completed_total',
    'Total number of evaluations completed',
    ['evaluator_type', 'result']
)

DOCUMENTS_UPLOADED_TOTAL = Counter(
    'documents_uploaded_total',
    'Total number of documents uploaded',
    ['document_type', 'validation_status']
)

# Métriques techniques
API_RESPONSE_TIME = Histogram(
    'api_response_time_seconds',
    'API response time in seconds',
    ['method', 'endpoint', 'status_code']
)

DATABASE_QUERY_TIME = Histogram(
    'database_query_time_seconds',
    'Database query execution time',
    ['query_type', 'table']
)

CACHE_HIT_RATIO = Gauge(
    'cache_hit_ratio',
    'Cache hit ratio (0-1)'
)

ACTIVE_USERS = Gauge(
    'active_users_count',
    'Number of active users',
    ['user_type']
)

SYSTEM_LOAD = Gauge(
    'system_load_average',
    'System load average',
    ['period']
)

MEMORY_USAGE = Gauge(
    'memory_usage_bytes',
    'Memory usage in bytes',
    ['type']
)

# Métriques de sécurité
SECURITY_EVENTS_TOTAL = Counter(
    'security_events_total',
    'Total number of security events',
    ['event_type', 'severity']
)

FAILED_LOGIN_ATTEMPTS = Counter(
    'failed_login_attempts_total',
    'Total number of failed login attempts',
    ['ip_address', 'user_agent']
)

RATE_LIMIT_HITS = Counter(
    'rate_limit_hits_total',
    'Total number of rate limit hits',
    ['endpoint', 'ip_address']
)

class BusinessMetrics:
    """Gestionnaire des métriques business"""
    
    @staticmethod
    def record_supplier_registration(phase: str, status: str, country: str):
        """Enregistrer une inscription de fournisseur"""
        SUPPLIER_REGISTRATIONS_TOTAL.labels(
            phase=phase,
            status=status,
            country=country
        ).inc()
        
        logger.info(f"Métrique business: Inscription fournisseur {phase} {status} depuis {country}")
    
    @staticmethod
    def record_tender_creation(tender_type: str, status: str):
        """Enregistrer la création d'un appel d'offres"""
        TENDER_CREATIONS_TOTAL.labels(
            type=tender_type,
            status=status
        ).inc()
        
        logger.info(f"Métrique business: Création appel d'offres {tender_type} {status}")
    
    @staticmethod
    def record_evaluation_completion(evaluator_type: str, result: str):
        """Enregistrer une évaluation complétée"""
        EVALUATIONS_COMPLETED_TOTAL.labels(
            evaluator_type=evaluator_type,
            result=result
        ).inc()
        
        logger.info(f"Métrique business: Évaluation {evaluator_type} {result}")
    
    @staticmethod
    def record_document_upload(document_type: str, validation_status: str):
        """Enregistrer un upload de document"""
        DOCUMENTS_UPLOADED_TOTAL.labels(
            document_type=document_type,
            validation_status=validation_status
        ).inc()
        
        logger.info(f"Métrique business: Upload document {document_type} {validation_status}")

class TechnicalMetrics:
    """Gestionnaire des métriques techniques"""
    
    @staticmethod
    def record_api_response_time(method: str, endpoint: str, status_code: int, duration: float):
        """Enregistrer le temps de réponse API"""
        API_RESPONSE_TIME.labels(
            method=method,
            endpoint=endpoint,
            status_code=str(status_code)
        ).observe(duration)
    
    @staticmethod
    def record_database_query_time(query_type: str, table: str, duration: float):
        """Enregistrer le temps d'exécution d'une requête DB"""
        DATABASE_QUERY_TIME.labels(
            query_type=query_type,
            table=table
        ).observe(duration)
    
    @staticmethod
    def update_cache_hit_ratio(hit_ratio: float):
        """Mettre à jour le ratio de hit du cache"""
        CACHE_HIT_RATIO.set(hit_ratio)
    
    @staticmethod
    def update_active_users(user_type: str, count: int):
        """Mettre à jour le nombre d'utilisateurs actifs"""
        ACTIVE_USERS.labels(user_type=user_type).set(count)
    
    @staticmethod
    def update_system_metrics():
        """Mettre à jour les métriques système"""
        import psutil
        
        # Load average
        load_avg = psutil.getloadavg()
        SYSTEM_LOAD.labels(period='1m').set(load_avg[0])
        SYSTEM_LOAD.labels(period='5m').set(load_avg[1])
        SYSTEM_LOAD.labels(period='15m').set(load_avg[2])
        
        # Memory usage
        memory = psutil.virtual_memory()
        MEMORY_USAGE.labels(type='used').set(memory.used)
        MEMORY_USAGE.labels(type='available').set(memory.available)
        MEMORY_USAGE.labels(type='percent').set(memory.percent)

class SecurityMetrics:
    """Gestionnaire des métriques de sécurité"""
    
    @staticmethod
    def record_security_event(event_type: str, severity: str):
        """Enregistrer un événement de sécurité"""
        SECURITY_EVENTS_TOTAL.labels(
            event_type=event_type,
            severity=severity
        ).inc()
        
        logger.warning(f"Événement de sécurité: {event_type} ({severity})")
    
    @staticmethod
    def record_failed_login(ip_address: str, user_agent: str):
        """Enregistrer une tentative de connexion échouée"""
        FAILED_LOGIN_ATTEMPTS.labels(
            ip_address=ip_address,
            user_agent=user_agent[:50]  # Limiter la longueur
        ).inc()
    
    @staticmethod
    def record_rate_limit_hit(endpoint: str, ip_address: str):
        """Enregistrer un hit de rate limiting"""
        RATE_LIMIT_HITS.labels(
            endpoint=endpoint,
            ip_address=ip_address
        ).inc()

class MetricsCollector:
    """Collecteur de métriques périodiques"""
    
    def __init__(self):
        self.last_collection = datetime.utcnow()
    
    def collect_business_metrics(self) -> Dict[str, Any]:
        """Collecter les métriques business"""
        # Ici vous pourriez interroger la base de données pour des statistiques
        # Par exemple: nombre de fournisseurs par pays, tendances d'inscription, etc.
        
        return {
            "supplier_registrations_today": 0,  # À implémenter
            "active_tenders": 0,  # À implémenter
            "evaluations_pending": 0,  # À implémenter
            "documents_validated_today": 0  # À implémenter
        }
    
    def collect_technical_metrics(self) -> Dict[str, Any]:
        """Collecter les métriques techniques"""
        TechnicalMetrics.update_system_metrics()
        
        return {
            "system_load": psutil.getloadavg()[0],
            "memory_usage_percent": psutil.virtual_memory().percent,
            "disk_usage_percent": psutil.disk_usage('/').percent,
            "active_connections": 0  # À implémenter
        }
    
    def collect_security_metrics(self) -> Dict[str, Any]:
        """Collecter les métriques de sécurité"""
        return {
            "failed_logins_last_hour": 0,  # À implémenter
            "rate_limit_hits_last_hour": 0,  # À implémenter
            "suspicious_activities": 0  # À implémenter
        }
    
    def get_all_metrics(self) -> Dict[str, Any]:
        """Obtenir toutes les métriques"""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "business": self.collect_business_metrics(),
            "technical": self.collect_technical_metrics(),
            "security": self.collect_security_metrics()
        }

# Instance globale du collecteur
metrics_collector = MetricsCollector()

# Décorateur pour mesurer automatiquement les performances
def measure_performance(metric_name: str):
    """Décorateur pour mesurer les performances d'une fonction"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                
                # Enregistrer la métrique
                if hasattr(TechnicalMetrics, f'record_{metric_name}_time'):
                    getattr(TechnicalMetrics, f'record_{metric_name}_time')(
                        func.__name__, duration
                    )
                
                return result
            except Exception as e:
                duration = time.time() - start_time
                logger.error(f"Erreur dans {func.__name__}: {e}")
                raise
        return wrapper
    return decorator
