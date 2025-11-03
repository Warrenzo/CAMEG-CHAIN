"""
Service d'authentification sécurisé et de gestion des utilisateurs
"""
import re
import time
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Set
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import logging

from app.models.user import User, UserRole, UserStatus
from app.schemas.user import UserCreate, LoginRequest
from app.config import settings

# Configuration du logging
logger = logging.getLogger(__name__)

# Configuration du hachage des mots de passe sécurisé
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__rounds=settings.BCRYPT_ROUNDS
)

# Blacklist des tokens (en production, utiliser Redis)
token_blacklist: Set[str] = set()

# Compteur des tentatives de connexion
login_attempts: Dict[str, list] = {}

class AuthService:
    """Service d'authentification sécurisé"""
    
    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """Valider la force d'un mot de passe"""
        if len(password) < 8:
            return False, "Le mot de passe doit contenir au moins 8 caractères"
        
        if not re.search(r"[A-Z]", password):
            return False, "Le mot de passe doit contenir au moins une majuscule"
        
        if not re.search(r"[a-z]", password):
            return False, "Le mot de passe doit contenir au moins une minuscule"
        
        if not re.search(r"\d", password):
            return False, "Le mot de passe doit contenir au moins un chiffre"
        
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            return False, "Le mot de passe doit contenir au moins un caractère spécial"
        
        # Vérifier les mots de passe communs
        common_passwords = [
            "password", "123456", "123456789", "qwerty", "abc123",
            "password123", "admin", "letmein", "welcome", "monkey",
            "12345678", "1234567890", "password1", "qwerty123", "admin123",
            "root", "toor", "pass", "test", "guest", "user", "demo",
            "cameg", "togo", "pharma", "supplier", "evaluator"
        ]
        
        if password.lower() in common_passwords:
            return False, "Ce mot de passe est trop commun"
        
        return True, "Mot de passe valide"
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Vérifier un mot de passe avec protection contre les attaques par timing"""
        try:
            # Utiliser un délai constant pour éviter les attaques par timing
            start_time = time.time()
            result = pwd_context.verify(plain_password, hashed_password)
            
            # Délai minimum pour éviter les attaques par timing
            elapsed = time.time() - start_time
            if elapsed < 0.1:  # 100ms minimum
                time.sleep(0.1 - elapsed)
            
            return result
        except Exception as e:
            logger.error(f"Erreur de vérification du mot de passe: {e}")
            # Délai même en cas d'erreur
            time.sleep(0.1)
            return False
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hacher un mot de passe avec validation"""
        # Valider la force du mot de passe
        is_valid, message = AuthService.validate_password_strength(password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """Créer un token JWT sécurisé"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        # Ajouter des claims de sécurité
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "jti": secrets.token_urlsafe(16),  # JWT ID unique
            "iss": "CAMEG-CHAIN-API",  # Issuer
            "aud": "CAMEG-CHAIN-Frontend"  # Audience
        })
        
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        
        # Logger la création du token (sans les données sensibles)
        logger.info(f"Token créé pour l'utilisateur {data.get('sub', 'unknown')}")
        
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Vérifier un token JWT avec blacklist"""
        # Vérifier si le token est dans la blacklist
        if token in token_blacklist:
            logger.warning("Tentative d'utilisation d'un token blacklisté")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token révoqué",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        try:
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM],
                audience="CAMEG-CHAIN-Frontend",
                issuer="CAMEG-CHAIN-API"
            )
            
            # Vérifier l'expiration
            if datetime.utcnow() > datetime.fromtimestamp(payload["exp"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token expiré",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            return payload
        except JWTError as e:
            logger.warning(f"Token JWT invalide: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def revoke_token(token: str):
        """Révoquer un token (l'ajouter à la blacklist)"""
        token_blacklist.add(token)
        logger.info("Token révoqué et ajouté à la blacklist")
    
    @staticmethod
    def _record_login_attempt(email: str, success: bool, ip_address: str = None):
        """Enregistrer une tentative de connexion"""
        current_time = time.time()
        
        if email not in login_attempts:
            login_attempts[email] = []
        
        login_attempts[email].append({
            "timestamp": current_time,
            "success": success,
            "ip_address": ip_address
        })
        
        # Nettoyer les anciennes tentatives (plus de 24h)
        login_attempts[email] = [
            attempt for attempt in login_attempts[email]
            if current_time - attempt["timestamp"] < 86400  # 24h
        ]
        
        # Logger la tentative
        status = "SUCCESS" if success else "FAILED"
        logger.info(f"Tentative de connexion {status} pour {email} depuis {ip_address}")
    
    @staticmethod
    def _is_account_locked(email: str) -> bool:
        """Vérifier si un compte est verrouillé"""
        if email not in login_attempts:
            return False
        
        current_time = time.time()
        recent_failed_attempts = [
            attempt for attempt in login_attempts[email]
            if not attempt["success"] and 
            current_time - attempt["timestamp"] < settings.LOCKOUT_DURATION_MINUTES * 60
        ]
        
        return len(recent_failed_attempts) >= settings.MAX_LOGIN_ATTEMPTS
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str, ip_address: str = None) -> Optional[User]:
        """Authentifier un utilisateur avec protection contre les attaques"""
        # Vérifier si le compte est verrouillé
        if AuthService._is_account_locked(email):
            logger.warning(f"Tentative de connexion sur compte verrouillé: {email}")
            AuthService._record_login_attempt(email, False, ip_address)
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Compte temporairement verrouillé. Réessayez dans {settings.LOCKOUT_DURATION_MINUTES} minutes."
            )
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Délai même si l'utilisateur n'existe pas (protection contre l'énumération)
            time.sleep(0.5)  # Délai plus long pour une meilleure protection
            AuthService._record_login_attempt(email, False, ip_address)
            return None
        
        if not AuthService.verify_password(password, user.hashed_password):
            AuthService._record_login_attempt(email, False, ip_address)
            return None
        
        # Connexion réussie
        AuthService._record_login_attempt(email, True, ip_address)
        return user
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate, role: UserRole = UserRole.SUPPLIER) -> User:
        """Créer un nouvel utilisateur"""
        # Vérifier si l'email existe déjà
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un utilisateur avec cet email existe déjà"
            )
        
        # Créer l'utilisateur
        hashed_password = AuthService.get_password_hash(user_data.password)
        
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            phone_number=user_data.phone_number,
            role=role.value if hasattr(role, 'value') else str(role),
            status='en_attente_validation'
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Récupérer un utilisateur par email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """Récupérer un utilisateur par ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def update_user_status(db: Session, user_id: str, status: UserStatus) -> User:
        """Mettre à jour le statut d'un utilisateur"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        user.status = status
        db.commit()
        db.refresh(user)
        
        return user
    
    @staticmethod
    def update_last_login(db: Session, user_id: str):
        """Mettre à jour la dernière connexion"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.last_login = datetime.utcnow()
            db.commit()
