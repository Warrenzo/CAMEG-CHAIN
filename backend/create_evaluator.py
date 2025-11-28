#!/usr/bin/env python3
"""
Script pour créer un compte évaluateur
"""
import sys
from pathlib import Path

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.services.auth import AuthService
from sqlalchemy import text
import bcrypt
from datetime import datetime, timezone
import uuid

def create_evaluator():
    """Créer le compte évaluateur"""
    db = SessionLocal()
    try:
        email = "evaluateur@gmail.com"
        password = "@jesuis10"
        full_name = "Évaluateur CAMEG"
        
        print("=" * 70)
        print("CREATION DU COMPTE EVALUATEUR")
        print("=" * 70)
        print(f"Email: {email}")
        print(f"Mot de passe: {password}")
        print(f"Nom: {full_name}")
        print()
        
        # Vérifier si l'utilisateur existe déjà
        result = db.execute(text("SELECT id, email, role FROM users WHERE email = :email"), {"email": email})
        existing_user = result.fetchone()
        
        if existing_user:
            print(f"[INFO] Utilisateur existant trouve: {email}")
            print(f"     Role actuel: {existing_user[2]}")
            print()
            
            # Mettre à jour l'utilisateur existant
            password_bytes = password.encode('utf-8')
            if len(password_bytes) > 72:
                password_bytes = password_bytes[:72]
            salt = bcrypt.gensalt(rounds=12)
            hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
            
            db.execute(text("""
                UPDATE users 
                SET hashed_password = :hashed_password,
                    full_name = :full_name,
                    role = :role,
                    status = :status,
                    is_active = :is_active,
                    email_verified = :email_verified,
                    updated_at = :updated_at
                WHERE email = :email
            """), {
                "hashed_password": hashed_password,
                "full_name": full_name,
                "role": "evaluator",
                "status": "actif",
                "is_active": True,
                "email_verified": True,
                "updated_at": datetime.now(timezone.utc),
                "email": email
            })
            
            db.commit()
            
            print("[OK] Utilisateur mis a jour en tant qu'EVALUATEUR")
            print(f"     ID: {existing_user[0]}")
        else:
            # Créer un nouvel utilisateur
            password_bytes = password.encode('utf-8')
            if len(password_bytes) > 72:
                password_bytes = password_bytes[:72]
            salt = bcrypt.gensalt(rounds=12)
            hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
            
            user_id = str(uuid.uuid4())
            username = email.split('@')[0]
            
            db.execute(text("""
                INSERT INTO users (
                    id, username, email, hashed_password, full_name, role, status, 
                    is_active, email_verified, phone_number, created_at, updated_at
                ) VALUES (
                    :id, :username, :email, :hashed_password, :full_name, :role, :status,
                    :is_active, :email_verified, :phone_number, :created_at, :updated_at
                )
            """), {
                "id": user_id,
                "username": username,
                "email": email,
                "hashed_password": hashed_password,
                "full_name": full_name,
                "role": "evaluator",
                "status": "actif",
                "is_active": True,
                "email_verified": True,
                "phone_number": "+228XXXXXXXX",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })
            
            db.commit()
            
            print("[OK] Evaluateur cree avec succes")
            print(f"     ID: {user_id}")
        
        # Vérifier la création
        result = db.execute(text("""
            SELECT id, email, full_name, role, status, is_active, email_verified
            FROM users WHERE email = :email
        """), {"email": email})
        
        user = result.fetchone()
        if user:
            print()
            print("=" * 70)
            print("VERIFICATION")
            print("=" * 70)
            print(f"ID: {user[0]}")
            print(f"Email: {user[1]}")
            print(f"Nom: {user[2]}")
            print(f"Role: {user[3]}")
            print(f"Statut: {user[4]}")
            print(f"Actif: {user[5]}")
            print(f"Email verifie: {user[6]}")
            print()
            print("=" * 70)
            print("INFORMATIONS DE CONNEXION")
            print("=" * 70)
            print(f"Email: {email}")
            print(f"Mot de passe: {password}")
            print(f"Role: EVALUATEUR")
            print()
            print("Vous pouvez maintenant vous connecter sur:")
            print("  http://localhost:3002/login")
            print("=" * 70)
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"[ERREUR] Erreur lors de la creation: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    create_evaluator()

