"""
Configuration Sentry pour le monitoring d'erreurs
"""
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
import logging
import os
from datetime import datetime

def init_sentry():
    """Initialiser Sentry pour le monitoring d'erreurs"""
    
    # Configuration Sentry
    sentry_dsn = os.getenv('SENTRY_DSN')
    environment = os.getenv('ENVIRONMENT', 'development')
    
    if not sentry_dsn:
        logging.warning("SENTRY_DSN non configuré - monitoring d'erreurs désactivé")
        return
    
    # Configuration des intégrations
    integrations = [
        FastApiIntegration(auto_enabling_instrumentations=True),
        SqlalchemyIntegration(),
        RedisIntegration(),
        LoggingIntegration(
            level=logging.INFO,        # Capture info et plus
            event_level=logging.ERROR  # Envoyer les erreurs comme événements
        ),
    ]
    
    # Initialisation de Sentry
    sentry_sdk.init(
        dsn=sentry_dsn,
        environment=environment,
        integrations=integrations,
        
        # Performance monitoring
        traces_sample_rate=1.0 if environment == 'development' else 0.1,
        profiles_sample_rate=1.0 if environment == 'development' else 0.1,
        
        # Configuration des erreurs
        send_default_pii=False,  # Ne pas envoyer d'informations personnelles
        attach_stacktrace=True,
        release=os.getenv('APP_VERSION', '1.0.0'),
        
        # Filtrage des erreurs
        before_send=filter_sensitive_data,
        before_send_transaction=filter_sensitive_transactions,
        
        # Configuration des tags
        default_integrations=True,
        debug=environment == 'development',
    )
    
    # Ajouter des tags personnalisés
    with sentry_sdk.configure_scope() as scope:
        scope.set_tag("service", "cameg-chain-api")
        scope.set_tag("component", "backend")
        scope.set_context("app", {
            "name": "CAMEG-CHAIN",
            "version": os.getenv('APP_VERSION', '1.0.0'),
            "environment": environment
        })
    
    logging.info("✅ Sentry initialisé pour le monitoring d'erreurs")

def filter_sensitive_data(event, hint):
    """Filtrer les données sensibles des événements Sentry"""
    
    # Supprimer les données sensibles des extra
    if 'extra' in event:
        sensitive_keys = ['password', 'token', 'secret', 'key', 'auth']
        for key in list(event['extra'].keys()):
            if any(sensitive in key.lower() for sensitive in sensitive_keys):
                event['extra'][key] = '[FILTERED]'
    
    # Supprimer les données sensibles des breadcrumbs
    if 'breadcrumbs' in event:
        for breadcrumb in event['breadcrumbs']:
            if 'data' in breadcrumb:
                for key in list(breadcrumb['data'].keys()):
                    if any(sensitive in key.lower() for sensitive in ['password', 'token', 'secret']):
                        breadcrumb['data'][key] = '[FILTERED]'
    
    # Supprimer les données sensibles des contextes
    if 'contexts' in event:
        for context_name, context_data in event['contexts'].items():
            if isinstance(context_data, dict):
                for key in list(context_data.keys()):
                    if any(sensitive in key.lower() for sensitive in ['password', 'token', 'secret']):
                        context_data[key] = '[FILTERED]'
    
    return event

def filter_sensitive_transactions(event, hint):
    """Filtrer les données sensibles des transactions Sentry"""
    
    # Supprimer les paramètres sensibles des URLs
    if 'request' in event and 'url' in event['request']:
        url = event['request']['url']
        # Masquer les tokens dans les URLs
        import re
        event['request']['url'] = re.sub(r'[?&]token=[^&]*', '&token=[FILTERED]', url)
        event['request']['url'] = re.sub(r'[?&]password=[^&]*', '&password=[FILTERED]', url)
    
    return event

def capture_exception(exception, **kwargs):
    """Capturer une exception avec Sentry"""
    with sentry_sdk.push_scope() as scope:
        # Ajouter des tags personnalisés
        for key, value in kwargs.get('tags', {}).items():
            scope.set_tag(key, value)
        
        # Ajouter du contexte
        for key, value in kwargs.get('context', {}).items():
            scope.set_context(key, value)
        
        # Ajouter des données extra
        for key, value in kwargs.get('extra', {}).items():
            scope.set_extra(key, value)
        
        # Capturer l'exception
        sentry_sdk.capture_exception(exception)

def capture_message(message, level='info', **kwargs):
    """Capturer un message avec Sentry"""
    with sentry_sdk.push_scope() as scope:
        # Ajouter des tags personnalisés
        for key, value in kwargs.get('tags', {}).items():
            scope.set_tag(key, value)
        
        # Ajouter du contexte
        for key, value in kwargs.get('context', {}).items():
            scope.set_context(key, value)
        
        # Ajouter des données extra
        for key, value in kwargs.get('extra', {}).items():
            scope.set_extra(key, value)
        
        # Capturer le message
        sentry_sdk.capture_message(message, level=level)

def add_user_context(user_id, email=None, role=None):
    """Ajouter le contexte utilisateur à Sentry"""
    with sentry_sdk.configure_scope() as scope:
        scope.set_user({
            'id': user_id,
            'email': email,
            'role': role
        })

def add_breadcrumb(message, category='custom', level='info', data=None):
    """Ajouter un breadcrumb à Sentry"""
    sentry_sdk.add_breadcrumb(
        message=message,
        category=category,
        level=level,
        data=data or {}
    )

def set_transaction_name(name):
    """Définir le nom de la transaction Sentry"""
    sentry_sdk.set_transaction_name(name)

def start_transaction(name, op='http.server'):
    """Démarrer une transaction Sentry"""
    return sentry_sdk.start_transaction(name=name, op=op)

# Décorateur pour capturer automatiquement les erreurs
def sentry_capture_errors(func):
    """Décorateur pour capturer automatiquement les erreurs"""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            capture_exception(e, tags={
                'function': func.__name__,
                'module': func.__module__
            })
            raise
    return wrapper

# Middleware pour ajouter automatiquement le contexte utilisateur
def sentry_user_middleware(request, call_next):
    """Middleware pour ajouter le contexte utilisateur à Sentry"""
    # Extraire les informations utilisateur du token JWT si disponible
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            from app.services.auth import AuthService
            token = auth_header.split(' ')[1]
            payload = AuthService.verify_token(token)
            user_id = payload.get('sub')
            
            if user_id:
                add_user_context(user_id)
                
        except Exception:
            # Ignorer les erreurs de token pour ne pas polluer les logs
            pass
    
    return call_next(request)
