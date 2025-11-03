"""
Service de cache Redis pour CAMEG-CHAIN
"""
import json
import pickle
import os
from typing import Any, Optional, Union
import redis
from redis.exceptions import RedisError
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class RedisCache:
    """Service de cache Redis sécurisé"""
    
    def __init__(self):
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', '6379')),
            password=os.getenv('REDIS_PASSWORD'),
            db=int(os.getenv('REDIS_DB', '0')),
            decode_responses=False,  # Pour la compatibilité avec pickle
            socket_connect_timeout=5,
            socket_timeout=5,
            retry_on_timeout=True,
            health_check_interval=30
        )
        
        # Test de connexion
        try:
            self.redis_client.ping()
            logger.info("✅ Connexion Redis établie")
        except RedisError as e:
            logger.error(f"❌ Erreur connexion Redis: {e}")
            raise
    
    def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """Stocker une valeur dans le cache"""
        try:
            # Sérialiser la valeur
            serialized_value = pickle.dumps(value)
            
            # Stocker avec expiration optionnelle
            if expire:
                result = self.redis_client.setex(key, expire, serialized_value)
            else:
                result = self.redis_client.set(key, serialized_value)
            
            return bool(result)
            
        except RedisError as e:
            logger.error(f"Erreur Redis SET {key}: {e}")
            return False
    
    def get(self, key: str) -> Optional[Any]:
        """Récupérer une valeur du cache"""
        try:
            serialized_value = self.redis_client.get(key)
            if serialized_value is None:
                return None
            
            return pickle.loads(serialized_value)
            
        except RedisError as e:
            logger.error(f"Erreur Redis GET {key}: {e}")
            return None
        except (pickle.PickleError, TypeError) as e:
            logger.error(f"Erreur désérialisation {key}: {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """Supprimer une clé du cache"""
        try:
            result = self.redis_client.delete(key)
            return bool(result)
            
        except RedisError as e:
            logger.error(f"Erreur Redis DELETE {key}: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Vérifier si une clé existe"""
        try:
            return bool(self.redis_client.exists(key))
            
        except RedisError as e:
            logger.error(f"Erreur Redis EXISTS {key}: {e}")
            return False
    
    def expire(self, key: str, seconds: int) -> bool:
        """Définir l'expiration d'une clé"""
        try:
            return bool(self.redis_client.expire(key, seconds))
            
        except RedisError as e:
            logger.error(f"Erreur Redis EXPIRE {key}: {e}")
            return False
    
    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Incrémenter une valeur numérique"""
        try:
            return self.redis_client.incrby(key, amount)
            
        except RedisError as e:
            logger.error(f"Erreur Redis INCRBY {key}: {e}")
            return None
    
    def get_stats(self) -> dict:
        """Obtenir les statistiques Redis"""
        try:
            info = self.redis_client.info()
            return {
                'connected_clients': info.get('connected_clients', 0),
                'used_memory': info.get('used_memory_human', '0B'),
                'keyspace_hits': info.get('keyspace_hits', 0),
                'keyspace_misses': info.get('keyspace_misses', 0),
                'uptime_in_seconds': info.get('uptime_in_seconds', 0)
            }
            
        except RedisError as e:
            logger.error(f"Erreur Redis INFO: {e}")
            return {}

# Instance globale du cache (initialisée paresseusement)
cache = None

def get_cache():
    """Obtenir l'instance du cache (initialisation paresseuse)"""
    global cache
    if cache is None:
        try:
            cache = RedisCache()
        except Exception as e:
            logger.warning(f"Redis non disponible, utilisation du cache mémoire: {e}")
            cache = MemoryCache()
    return cache

class MemoryCache:
    """Cache en mémoire pour le développement (fallback)"""
    
    def __init__(self):
        self._cache = {}
        logger.info("✅ Cache mémoire initialisé (fallback)")
    
    def set(self, key: str, value: Any, expire: Optional[int] = None) -> bool:
        """Stocker une valeur dans le cache mémoire"""
        self._cache[key] = value
        return True
    
    def get(self, key: str) -> Optional[Any]:
        """Récupérer une valeur du cache mémoire"""
        return self._cache.get(key)
    
    def delete(self, key: str) -> bool:
        """Supprimer une clé du cache mémoire"""
        return self._cache.pop(key, None) is not None
    
    def exists(self, key: str) -> bool:
        """Vérifier si une clé existe"""
        return key in self._cache
    
    def expire(self, key: str, seconds: int) -> bool:
        """Définir l'expiration d'une clé (non implémenté en mémoire)"""
        return True
    
    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Incrémenter une valeur numérique"""
        current = self._cache.get(key, 0)
        if isinstance(current, int):
            new_value = current + amount
            self._cache[key] = new_value
            return new_value
        return None
    
    def get_stats(self) -> dict:
        """Obtenir les statistiques du cache mémoire"""
        return {
            'connected_clients': 1,
            'used_memory': f"{len(str(self._cache))}B",
            'keyspace_hits': 0,
            'keyspace_misses': 0,
            'uptime_in_seconds': 0,
            'type': 'memory'
        }

class SessionManager:
    """Gestionnaire de sessions utilisateur"""
    
    SESSION_PREFIX = "session:"
    SESSION_EXPIRE = 3600  # 1 heure
    
    @classmethod
    def create_session(cls, user_id: str, session_data: dict) -> str:
        """Créer une nouvelle session"""
        import secrets
        session_id = secrets.token_urlsafe(32)
        session_key = f"{cls.SESSION_PREFIX}{session_id}"
        
        session_data.update({
            'user_id': user_id,
            'created_at': datetime.utcnow().isoformat(),
            'last_activity': datetime.utcnow().isoformat()
        })
        
        get_cache().set(session_key, session_data, cls.SESSION_EXPIRE)
        return session_id
    
    @classmethod
    def get_session(cls, session_id: str) -> Optional[dict]:
        """Récupérer une session"""
        session_key = f"{cls.SESSION_PREFIX}{session_id}"
        session_data = get_cache().get(session_key)
        
        if session_data:
            # Mettre à jour la dernière activité
            session_data['last_activity'] = datetime.utcnow().isoformat()
            get_cache().set(session_key, session_data, cls.SESSION_EXPIRE)
        
        return session_data
    
    @classmethod
    def delete_session(cls, session_id: str) -> bool:
        """Supprimer une session"""
        session_key = f"{cls.SESSION_PREFIX}{session_id}"
        return get_cache().delete(session_key)
    
    @classmethod
    def extend_session(cls, session_id: str) -> bool:
        """Prolonger une session"""
        session_key = f"{cls.SESSION_PREFIX}{session_id}"
        return get_cache().expire(session_key, cls.SESSION_EXPIRE)

class RateLimiter:
    """Gestionnaire de rate limiting"""
    
    RATE_LIMIT_PREFIX = "rate_limit:"
    
    @classmethod
    def is_allowed(cls, identifier: str, limit: int, window: int) -> tuple[bool, dict]:
        """Vérifier si une requête est autorisée"""
        key = f"{cls.RATE_LIMIT_PREFIX}{identifier}"
        
        # Incrémenter le compteur
        current_count = get_cache().increment(key, 1)
        
        if current_count == 1:
            # Première requête dans la fenêtre
            get_cache().expire(key, window)
            return True, {
                'limit': limit,
                'remaining': limit - 1,
                'reset_time': datetime.utcnow() + timedelta(seconds=window)
            }
        
        if current_count <= limit:
            # Dans la limite
            return True, {
                'limit': limit,
                'remaining': limit - current_count,
                'reset_time': datetime.utcnow() + timedelta(seconds=get_cache().redis_client.ttl(key))
            }
        
        # Limite dépassée
        return False, {
            'limit': limit,
            'remaining': 0,
            'reset_time': datetime.utcnow() + timedelta(seconds=cache.redis_client.ttl(key))
        }

class CacheDecorator:
    """Décorateur pour mettre en cache les résultats de fonctions"""
    
    @staticmethod
    def cached(key_prefix: str, expire: int = 300):
        """Décorateur pour mettre en cache une fonction"""
        def decorator(func):
            def wrapper(*args, **kwargs):
                # Générer une clé de cache basée sur les arguments
                cache_key = f"{key_prefix}:{hash(str(args) + str(kwargs))}"
                
                # Vérifier le cache
                cached_result = get_cache().get(cache_key)
                if cached_result is not None:
                    logger.debug(f"Cache hit: {cache_key}")
                    return cached_result
                
                # Exécuter la fonction et mettre en cache
                result = func(*args, **kwargs)
                get_cache().set(cache_key, result, expire)
                logger.debug(f"Cache set: {cache_key}")
                
                return result
            
            return wrapper
        return decorator
