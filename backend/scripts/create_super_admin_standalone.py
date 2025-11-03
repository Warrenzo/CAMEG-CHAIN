#!/usr/bin/env python3
"""
Script standalone de création du super-administrateur
Version qui contourne les problèmes d'encodage en utilisant une connexion directe
"""
import os
import sys
import logging
import secrets
import hashlib
import base64
from datetime import datetime, timezone
from sqlalchemy import create_engine, text, MetaData, Table, Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import sessionmaker
import uuid

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Valider la force d'un mot de passe"""
    if len(password) < 8:
        return False, "Le mot de passe doit contenir au moins 8 caractères"
    
    if not any(c.isupper() for c in password):
        return False, "Le mot de passe doit contenir au moins une majuscule"
    
    if not any(c.islower() for c in password):
        return False, "Le mot de passe doit contenir au moins une minuscule"
    
    if not any(c.isdigit() for c in password):
        return False, "Le mot de passe doit contenir au moins un chiffre"
    
    special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    if not any(c in special_chars for c in password):
        return False, "Le mot de passe doit contenir au moins un caractère spécial"
    
    return True, "Mot de passe valide"

def hash_password_bcrypt(password: str) -> str:
    """Hacher le mot de passe avec bcrypt (version simplifiée)"""
    try:
        import bcrypt
        # Limiter la longueur du mot de passe pour bcrypt
        if len(password) > 72:
            password = password[:72]
        
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except ImportError:
        # Fallback vers PBKDF2 si bcrypt n'est pas disponible
        return hash_password_pbkdf2(password)

def hash_password_pbkdf2(password: str) -> str:
    """Hacher le mot de passe avec PBKDF2"""
    salt = secrets.token_bytes(32)
    password_bytes = password.encode('utf-8')
    
    # Hacher avec PBKDF2
    hash_bytes = hashlib.pbkdf2_hmac('sha256', password_bytes, salt, 100000)
    
    # Combiner salt et hash
    combined = salt + hash_bytes
    
    # Encoder en base64 pour stockage
    return base64.b64encode(combined).decode('utf-8')

def create_database_connection():
    """Créer une connexion à la base de données avec gestion d'erreurs"""
    try:
        # Essayer différentes configurations de connexion
        connection_configs = [
            "postgresql://postgres:postgres@localhost:5432/CAMEG-CHAIN",
            "postgresql://postgres:postgres@127.0.0.1:5432/CAMEG-CHAIN",
            "postgresql://postgres@localhost:5432/postgres",
            "postgresql://postgres:postgres@127.0.0.1:5432/postgres"
        ]
        
        for config in connection_configs:
            try:
                logger.info(f"🔄 Tentative de connexion: {config}")
                engine = create_engine(config, echo=False)
                
                # Tester la connexion
                with engine.connect() as conn:
                    result = conn.execute(text("SELECT 1"))
                    logger.info(f"✅ Connexion réussie avec: {config}")
                    return engine
                    
            except Exception as e:
                logger.warning(f"❌ Échec de connexion avec {config}: {e}")
                continue
        
        raise Exception("Aucune configuration de connexion n'a fonctionné")
        
    except Exception as e:
        logger.error(f"❌ Erreur de connexion à la base de données: {e}")
        raise

def create_users_table_if_not_exists(engine):
    """Créer la table users si elle n'existe pas"""
    try:
        metadata = MetaData()
        
        # Définir la table users
        users_table = Table(
            'users',
            metadata,
            Column('id', String, primary_key=True, default=lambda: str(uuid.uuid4())),
            Column('email', String, unique=True, nullable=False),
            Column('hashed_password', String, nullable=False),
            Column('full_name', String, nullable=False),
            Column('role', String, nullable=False, default='supplier'),
            Column('status', String, nullable=False, default='pending'),
            Column('is_active', Boolean, default=True),
            Column('email_verified', Boolean, default=False),
            Column('phone_number', String),
            Column('created_at', DateTime, default=datetime.utcnow),
            Column('updated_at', DateTime, default=datetime.utcnow)
        )
        
        # Créer la table si elle n'existe pas
        metadata.create_all(engine, checkfirst=True)
        logger.info("✅ Table users créée ou vérifiée")
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la création de la table: {e}")
        raise

def create_super_admin(email: str, password: str, full_name: str = "Super Administrateur CAMEG"):
    """Créer le compte super-administrateur"""
    
    logger.info("🔐 Début de la création du super-administrateur")
    
    # Valider le mot de passe
    is_valid, message = validate_password_strength(password)
    if not is_valid:
        logger.error(f"❌ Mot de passe invalide: {message}")
        return {"success": False, "message": message}
    
    logger.info("✅ Mot de passe valide")
    
    try:
        # Créer la connexion à la base de données
        engine = create_database_connection()
        
        # Créer la table users si nécessaire
        create_users_table_if_not_exists(engine)
        
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            # Vérifier si l'utilisateur existe déjà
            result = db.execute(text("SELECT id, email, role FROM users WHERE email = :email"), {"email": email})
            existing_user = result.fetchone()
            
            if existing_user:
                logger.info(f"⚠️ Utilisateur existant trouvé: {email}")
                
                # Mettre à jour l'utilisateur existant
                hashed_password = hash_password_bcrypt(password)
                update_query = text("""
                    UPDATE users 
                    SET hashed_password = :hashed_password,
                        full_name = :full_name,
                        role = :role,
                        status = :status,
                        is_active = :is_active,
                        email_verified = :email_verified,
                        updated_at = :updated_at
                    WHERE email = :email
                """)
                
                db.execute(update_query, {
                    "hashed_password": hashed_password,
                    "full_name": full_name,
                    "role": "super_admin",
                    "status": "active",
                    "is_active": True,
                    "email_verified": True,
                    "updated_at": datetime.now(timezone.utc),
                    "email": email
                })
                
                db.commit()
                
                logger.info(f"✅ Utilisateur {email} mis à jour en tant que SUPER_ADMIN")
                return {
                    "success": True, 
                    "message": f"Utilisateur {email} mis à jour en tant que SUPER_ADMIN",
                    "user_id": existing_user[0]
                }
            
            # Créer un nouvel utilisateur
            hashed_password = hash_password_bcrypt(password)
            user_id = str(uuid.uuid4())
            
            insert_query = text("""
                INSERT INTO users (
                    id, email, hashed_password, full_name, role, status, 
                    is_active, email_verified, phone_number, created_at, updated_at
                ) VALUES (
                    :id, :email, :hashed_password, :full_name, :role, :status,
                    :is_active, :email_verified, :phone_number, :created_at, :updated_at
                )
            """)
            
            db.execute(insert_query, {
                "id": user_id,
                "email": email,
                "hashed_password": hashed_password,
                "full_name": full_name,
                "role": "super_admin",
                "status": "active",
                "is_active": True,
                "email_verified": True,
                "phone_number": "+228XXXXXXXX",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })
            
            db.commit()
            
            logger.info(f"✅ Super-administrateur {email} créé avec succès")
            return {
                "success": True, 
                "message": f"Super-administrateur {email} créé avec succès",
                "user_id": user_id
            }
            
        except Exception as e:
            db.rollback()
            logger.error(f"❌ Erreur lors de la création/mise à jour: {e}")
            return {"success": False, "message": f"Erreur lors de la création: {e}"}
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Erreur de connexion à la base de données: {e}")
        return {"success": False, "message": f"Erreur de connexion: {e}"}

def verify_super_admin(email: str):
    """Vérifier que le super-administrateur a été créé correctement"""
    try:
        engine = create_database_connection()
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            result = db.execute(text("""
                SELECT id, email, full_name, role, status, is_active, email_verified, created_at
                FROM users WHERE email = :email
            """), {"email": email})
            
            user = result.fetchone()
            if user:
                logger.info(f"✅ Vérification réussie pour {email}")
                logger.info(f"   - ID: {user[0]}")
                logger.info(f"   - Email: {user[1]}")
                logger.info(f"   - Nom: {user[2]}")
                logger.info(f"   - Rôle: {user[3]}")
                logger.info(f"   - Statut: {user[4]}")
                logger.info(f"   - Actif: {user[5]}")
                logger.info(f"   - Email vérifié: {user[6]}")
                logger.info(f"   - Créé le: {user[7]}")
                return True
            else:
                logger.error(f"❌ Utilisateur {email} non trouvé")
                return False
                
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Erreur lors de la vérification: {e}")
        return False

def main():
    """Fonction principale"""
    print("=" * 70)
    print("🔐 CRÉATION DU SUPER-ADMINISTRATEUR (VERSION STANDALONE)")
    print("=" * 70)
    
    # Informations fournies
    email = "daviwarren4@gmail.com"
    password = "@Obed#91.64.77.53"
    full_name = "Super Administrateur CAMEG"
    
    print(f"📧 Email: {email}")
    print(f"🔐 Mot de passe: {password}")
    print(f"👤 Nom: {full_name}")
    print()
    
    # Créer le super-administrateur
    result = create_super_admin(email, password, full_name)
    
    if result["success"]:
        print("\n" + "=" * 70)
        print("🎉 SUPER-ADMINISTRATEUR CRÉÉ AVEC SUCCÈS!")
        print("=" * 70)
        print(f"✅ {result['message']}")
        print(f"🆔 ID utilisateur: {result.get('user_id', 'N/A')}")
        print()
        
        # Vérifier la création
        print("🔍 Vérification de la création...")
        if verify_super_admin(email):
            print("✅ Vérification réussie!")
            print()
            print("🌐 Vous pouvez maintenant vous connecter sur:")
            print("   • Frontend: http://localhost:3000/login")
            print("   • API: http://localhost:8000/docs")
            print()
            print("📋 INFORMATIONS DE CONNEXION:")
            print(f"   • Email: {email}")
            print(f"   • Mot de passe: {password}")
            print(f"   • Rôle: SUPER_ADMIN")
            print()
            print("🎯 PERMISSIONS SUPER-ADMIN:")
            print("   • Gestion complète des utilisateurs")
            print("   • Gestion des fournisseurs et préqualifications")
            print("   • Gestion des appels d'offres")
            print("   • Configuration système")
            print("   • Monitoring et métriques")
            print("   • Audit et logs")
        else:
            print("❌ Problème lors de la vérification")
            
    else:
        print("\n" + "=" * 70)
        print("❌ ÉCHEC DE LA CRÉATION")
        print("=" * 70)
        print(f"Message: {result['message']}")
        print()
        print("🔧 SOLUTIONS POSSIBLES:")
        print("   1. Vérifiez que PostgreSQL est démarré")
        print("   2. Vérifiez les paramètres de connexion")
        print("   3. Vérifiez que la base de données existe")
        print("   4. Vérifiez les permissions de l'utilisateur postgres")
        print("   5. Essayez de créer la base de données manuellement:")
        print("      CREATE DATABASE \"CAMEG-CHAIN\";")

if __name__ == "__main__":
    main()
