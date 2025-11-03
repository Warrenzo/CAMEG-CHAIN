"""
Middleware de sécurité pour l'API CAMEG-CHAIN
"""
import time
import hashlib
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
        self.max_attempts = 5
        self.block_duration = 900  # 15 minutes
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
            logger.warning(f"🚨 IP {ip} bloquée pour {self.block_duration}s - Trop de tentatives échouées")
    
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
        
        # Vérifier si l'IP est bloquée
        if self._is_ip_blocked(client_ip):
            logger.warning(f"🚨 Tentative d'accès bloquée depuis {client_ip}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Trop de tentatives échouées. Veuillez réessayer plus tard.",
                    "retry_after": self.block_duration
                }
            )
        
        # Vérifier les endpoints sensibles
        if request.url.path in ["/api/v1/auth/login", "/api/v1/auth/register/phase1"]:
            # Compter les tentatives récentes
            recent_attempts = 0
            if client_ip in self.failed_attempts:
                current_time = time.time()
                recent_attempts = len([
                    attempt for attempt in self.failed_attempts[client_ip]
                    if current_time - attempt["timestamp"] < 300  # 5 minutes
                ])
            
            if recent_attempts >= 3:
                logger.warning(f"🚨 Trop de tentatives récentes depuis {client_ip}: {recent_attempts}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": "Trop de tentatives récentes. Veuillez attendre 5 minutes.",
                        "retry_after": 300
                    }
                )
        
        # Ajouter des headers de sécurité
        response = await call_next(request)
        
        # Headers de sécurité
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Enregistrer les tentatives échouées
        if response.status_code in [401, 403, 422]:
            self._record_failed_attempt(client_ip, request.url.path)
        
        return response

# Instance globale du middleware
security_middleware = SecurityMiddleware()
