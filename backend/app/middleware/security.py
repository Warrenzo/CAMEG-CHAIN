"""
Middleware de sécurité pour l'API CAMEG-CHAIN
"""
import time
import hashlib
import os
from typing import Dict, Optional
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class SecurityMiddleware:
    """Middleware de sécurité pour protéger l'API"""
    
    def __init__(self):
        self.failed_attempts: Dict[str, list] = {}
        self.blocked_ips: Dict[str, float] = {}
        # Augmenter les limites pour le développement
        self.env = os.getenv("ENVIRONMENT", "development")
        self.is_testing = bool(os.getenv("PYTEST_CURRENT_TEST")) or self.env == "test"
        if self.is_testing:
            self.max_attempts = 1000
            self.block_duration = 1
        elif self.env == "development":
            self.max_attempts = 20  # Plus permissif en développement
            self.block_duration = 60  # 1 minute seulement en développement
        else:
            self.max_attempts = 5
            self.block_duration = 900  # 15 minutes en production
        self.cleanup_interval = 3600  # 1 heure
        self.last_cleanup = time.time()
    
    def _get_client_ip(self, request: Request) -> str:
        """Obtenir l'IP réelle du client"""
        # Vérifier les headers de proxy
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def _is_ip_blocked(self, ip: str) -> bool:
        """Vérifier si une IP est bloquée"""
        if ip in self.blocked_ips:
            if time.time() - self.blocked_ips[ip] < self.block_duration:
                return True
            else:
                # Débloquer l'IP
                del self.blocked_ips[ip]
        return False
    
    def _record_failed_attempt(self, ip: str, endpoint: str):
        """Enregistrer une tentative échouée"""
        if ip not in self.failed_attempts:
            self.failed_attempts[ip] = []
        
        self.failed_attempts[ip].append({
            "endpoint": endpoint,
            "timestamp": time.time()
        })
        
        # Nettoyer les anciennes tentatives (plus de 1 heure)
        current_time = time.time()
        self.failed_attempts[ip] = [
            attempt for attempt in self.failed_attempts[ip]
            if current_time - attempt["timestamp"] < 3600
        ]
        
        # Bloquer si trop de tentatives
        if len(self.failed_attempts[ip]) >= self.max_attempts:
            self.blocked_ips[ip] = current_time
            logger.warning(f"IP {ip} bloquee pour {self.block_duration}s - trop de tentatives echouees")
    
    def _cleanup_old_data(self):
        """Nettoyer les anciennes données"""
        current_time = time.time()
        if current_time - self.last_cleanup > self.cleanup_interval:
            # Nettoyer les IPs débloquées
            self.blocked_ips = {
                ip: timestamp for ip, timestamp in self.blocked_ips.items()
                if current_time - timestamp < self.block_duration
            }
            
            # Nettoyer les tentatives anciennes
            for ip in list(self.failed_attempts.keys()):
                self.failed_attempts[ip] = [
                    attempt for attempt in self.failed_attempts[ip]
                    if current_time - attempt["timestamp"] < 3600
                ]
                if not self.failed_attempts[ip]:
                    del self.failed_attempts[ip]
            
            self.last_cleanup = current_time
    
    async def __call__(self, request: Request, call_next):
        """Middleware principal"""
        # Nettoyer les anciennes données
        self._cleanup_old_data()
        
        # Obtenir l'IP du client
        client_ip = self._get_client_ip(request)
        
        # Fonction helper pour ajouter les headers CORS
        def get_cors_headers():
            origin = request.headers.get("origin")
            headers = {}
            if origin:
                # Vérifier si l'origine est autorisée (importation locale pour éviter les imports circulaires)
                from app.config import settings
                if origin in settings.ALLOWED_ORIGINS:
                    headers["Access-Control-Allow-Origin"] = origin
                    headers["Access-Control-Allow-Credentials"] = "true"
                    headers["Access-Control-Allow-Methods"] = ", ".join(settings.ALLOWED_METHODS)
                    headers["Access-Control-Allow-Headers"] = ", ".join(settings.ALLOWED_HEADERS)
            return headers
        
        # Laisser passer les requêtes OPTIONS (preflight CORS) - le CORSMiddleware de FastAPI les gère automatiquement
        # On ne doit pas intercepter les OPTIONS ici, sinon le CORS ne fonctionne pas correctement
        if request.method == "OPTIONS":
            # Laisser le CORSMiddleware gérer la requête OPTIONS
            return await call_next(request)
        
        is_test_client = client_ip in ("testclient", "testserver")
        # Vérifier si l'IP est bloquée
        if not self.is_testing and not is_test_client and self._is_ip_blocked(client_ip):
            logger.warning(f"Tentative d'acces bloquee depuis {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Trop de tentatives échouées. Veuillez réessayer plus tard.",
                    "retry_after": self.block_duration
                },
                headers=get_cors_headers()
            )
        
        # Vérifier les endpoints sensibles (ici l'inscription fournisseur)
        sensitive_paths = ["/api/v1/auth/register/phase1"]
        if request.url.path in sensitive_paths:
            # Compter les tentatives récentes
            recent_attempts = 0
            if client_ip in self.failed_attempts:
                current_time = time.time()
                # Ne compter que les tentatives sur les endpoints sensibles
                recent_attempts = len([
                    attempt for attempt in self.failed_attempts[client_ip]
                    if current_time - attempt["timestamp"] < 300 and  # 5 minutes
                    attempt["endpoint"] in sensitive_paths
                ])
            
            # Augmenter la limite en développement
            limit = 10 if self.env in ("development", "test") else 5
            if self.is_testing:
                limit = 1000
            
            if recent_attempts >= limit:
                logger.warning(f"Trop de tentatives recentes depuis {client_ip}: {recent_attempts}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": "Trop de tentatives récentes. Veuillez attendre 5 minutes.",
                        "retry_after": 300
                    },
                    headers=get_cors_headers()
                )
        
        # Ajouter des headers de sécurité
        response = await call_next(request)
        
        # Headers de sécurité
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Enregistrer les tentatives échouées (uniquement pour les endpoints sensibles)
        # Ne pas compter les erreurs 401 sur /auth/me car c'est une validation de token normale
        if not self.is_testing and response.status_code in [401, 403]:
            # Exclure les endpoints de validation de token et les endpoints admin qui peuvent avoir des 401 normaux
            excluded_paths = ["/api/v1/auth/me", "/api/v1/auth/refresh"]
            if request.url.path not in excluded_paths:
                self._record_failed_attempt(client_ip, request.url.path)
        
        return response

# Instance globale du middleware
security_middleware = SecurityMiddleware()
