"""
Système de logging sécurisé pour CAMEG-CHAIN
"""
import logging
import sys
import json
from datetime import datetime
from typing import Dict, Any
import structlog
from pathlib import Path

class SecurityFilter(logging.Filter):
    """Filtre pour masquer les informations sensibles dans les logs"""
    
    SENSITIVE_FIELDS = [
        'password', 'token', 'secret', 'key', 'auth', 'credential',
        'ssn', 'social_security', 'credit_card', 'bank_account'
    ]
    
    def filter(self, record):
        """Filtrer les informations sensibles"""
        if hasattr(record, 'msg'):
            record.msg = self._sanitize_message(str(record.msg))
        return True
    
    def _sanitize_message(self, message: str) -> str:
        """Sanitiser un message en masquant les données sensibles"""
        try:
            # Essayer de parser comme JSON
            data = json.loads(message)
            sanitized_data = self._sanitize_dict(data)
            return json.dumps(sanitized_data, ensure_ascii=False)
        except (json.JSONDecodeError, TypeError):
            # Si ce n'est pas du JSON, sanitiser comme string
            return self._sanitize_string(message)
    
    def _sanitize_dict(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitiser un dictionnaire"""
        if not isinstance(data, dict):
            return data
        
        sanitized = {}
        for key, value in data.items():
            key_lower = key.lower()
            if any(sensitive in key_lower for sensitive in self.SENSITIVE_FIELDS):
                sanitized[key] = "***MASKED***"
            elif isinstance(value, dict):
                sanitized[key] = self._sanitize_dict(value)
            elif isinstance(value, list):
                sanitized[key] = [self._sanitize_dict(item) if isinstance(item, dict) else item for item in value]
            else:
                sanitized[key] = value
        
        return sanitized
    
    def _sanitize_string(self, message: str) -> str:
        """Sanitiser une chaîne de caractères"""
        # Masquer les patterns sensibles
        import re
        patterns = [
            (r'password["\']?\s*[:=]\s*["\']?[^"\'\s]+', 'password="***MASKED***"'),
            (r'token["\']?\s*[:=]\s*["\']?[^"\'\s]+', 'token="***MASKED***"'),
            (r'secret["\']?\s*[:=]\s*["\']?[^"\'\s]+', 'secret="***MASKED***"'),
        ]
        
        for pattern, replacement in patterns:
            message = re.sub(pattern, replacement, message, flags=re.IGNORECASE)
        
        return message

class JSONFormatter(logging.Formatter):
    """Formateur JSON pour les logs structurés"""
    
    def format(self, record):
        """Formater un log en JSON"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        # Ajouter les données d'exception si présentes
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)
        
        # Ajouter les données extra si présentes
        if hasattr(record, 'extra_data'):
            log_entry['extra'] = record.extra_data
        
        return json.dumps(log_entry, ensure_ascii=False)

def setup_logging(environment: str = "development", log_level: str = "INFO"):
    """Configurer le système de logging"""
    
    # Créer le dossier de logs
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configuration structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Configuration du logging standard
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_dir / "app.log", encoding='utf-8'),
            logging.FileHandler(log_dir / "security.log", encoding='utf-8'),
            logging.FileHandler(log_dir / "error.log", encoding='utf-8'),
        ]
    )
    
    # Configurer les handlers spécifiques
    security_handler = logging.FileHandler(log_dir / "security.log", encoding='utf-8')
    security_handler.addFilter(SecurityFilter())
    security_handler.setFormatter(JSONFormatter())
    
    error_handler = logging.FileHandler(log_dir / "error.log", encoding='utf-8')
    error_handler.addFilter(SecurityFilter())
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(JSONFormatter())
    
    # Ajouter les handlers aux loggers
    security_logger = logging.getLogger('security')
    security_logger.addHandler(security_handler)
    security_logger.setLevel(logging.INFO)
    
    error_logger = logging.getLogger('error')
    error_logger.addHandler(error_handler)
    error_logger.setLevel(logging.ERROR)
    
    # Logger de démarrage
    logger = logging.getLogger(__name__)
    logger.info("Système de logging initialisé", extra={
        'environment': environment,
        'log_level': log_level,
        'log_dir': str(log_dir.absolute())
    })

def get_logger(name: str) -> logging.Logger:
    """Obtenir un logger configuré"""
    return logging.getLogger(name)

def log_security_event(event_type: str, details: Dict[str, Any], user_id: str = None, ip_address: str = None):
    """Logger un événement de sécurité"""
    security_logger = logging.getLogger('security')
    security_logger.warning(f"Événement de sécurité: {event_type}", extra={
        'event_type': event_type,
        'details': details,
        'user_id': user_id,
        'ip_address': ip_address,
        'timestamp': datetime.utcnow().isoformat()
    })

def log_performance_metric(metric_name: str, value: float, unit: str = "ms", context: Dict[str, Any] = None):
    """Logger une métrique de performance"""
    perf_logger = logging.getLogger('performance')
    perf_logger.info(f"Métrique de performance: {metric_name}", extra={
        'metric_name': metric_name,
        'value': value,
        'unit': unit,
        'context': context or {},
        'timestamp': datetime.utcnow().isoformat()
    })

def log_api_request(method: str, path: str, status_code: int, response_time: float, user_id: str = None):
    """Logger une requête API"""
    api_logger = logging.getLogger('api')
    api_logger.info(f"Requête API: {method} {path}", extra={
        'method': method,
        'path': path,
        'status_code': status_code,
        'response_time_ms': response_time,
        'user_id': user_id,
        'timestamp': datetime.utcnow().isoformat()
    })
