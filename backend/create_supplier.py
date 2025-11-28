#!/usr/bin/env python3
"""
Script pour créer un compte fournisseur
"""
import sys
from pathlib import Path

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.services.auth import AuthService
from app.services.supplier import SupplierService
from app.schemas.user import SupplierPhase1Create, UserCreate
from sqlalchemy import text
import bcrypt
from datetime import datetime, timezone
import uuid

def create_supplier():
    """Créer un compte fournisseur"""
    db = SessionLocal()
    try:
        email = "fournisseur@gmail.com"
        password = "Fournisseur@123"
        company_name = "Fournisseur Pharmaceutique CAMEG"
        country = "Togo"
        phone_number = "+22890123456"
        
        print("=" * 70)
        print("CREATION DU COMPTE FOURNISSEUR")
        print("=" * 70)
        print(f"Email: {email}")
        print(f"Mot de passe: {password}")
        print(f"Nom de l'entreprise: {company_name}")
        print(f"Pays: {country}")
        print(f"Telephone: {phone_number}")
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
                "full_name": company_name,
                "role": "supplier",
                "status": "actif",
                "is_active": True,
                "email_verified": True,
                "updated_at": datetime.now(timezone.utc),
                "email": email
            })
            
            db.commit()
            user_id = existing_user[0]
            print("[OK] Utilisateur mis a jour en tant que FOURNISSEUR")
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
                "full_name": company_name,
                "role": "supplier",
                "status": "actif",
                "is_active": True,
                "email_verified": True,
                "phone_number": phone_number,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })
            
            db.commit()
            print("[OK] Utilisateur fournisseur cree avec succes")
            print(f"     ID: {user_id}")
        
        # Vérifier si le profil fournisseur existe
        result = db.execute(text("SELECT id FROM suppliers WHERE user_id = :user_id"), {"user_id": user_id})
        existing_supplier = result.fetchone()
        
        if not existing_supplier:
            # Créer le profil fournisseur
            supplier_id = str(uuid.uuid4())
            db.execute(text("""
                INSERT INTO suppliers (
                    id, user_id, company_name, email, country, phone_number,
                    profile_completion_percentage, profile_status, documents_uploaded,
                    validated_by_admin, created_at, updated_at
                ) VALUES (
                    :id, :user_id, :company_name, :email, :country, :phone_number,
                    :profile_completion_percentage, :profile_status, :documents_uploaded,
                    :validated_by_admin, :created_at, :updated_at
                )
            """), {
                "id": supplier_id,
                "user_id": user_id,
                "company_name": company_name,
                "email": email,
                "country": country,
                "phone_number": phone_number,
                "profile_completion_percentage": "25",
                "profile_status": "phase_1_complete",
                "documents_uploaded": "0/0",
                "validated_by_admin": False,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            })
            
            db.commit()
            print("[OK] Profil fournisseur cree avec succes")
            print(f"     ID fournisseur: {supplier_id}")
        else:
            print("[INFO] Profil fournisseur existe deja")
        
        # Vérifier la création
        result = db.execute(text("""
            SELECT u.id, u.email, u.full_name, u.role, u.status, u.is_active, u.email_verified,
                   s.id as supplier_id, s.company_name, s.country
            FROM users u
            LEFT JOIN suppliers s ON s.user_id = u.id
            WHERE u.email = :email
        """), {"email": email})
        
        user = result.fetchone()
        if user:
            print()
            print("=" * 70)
            print("VERIFICATION")
            print("=" * 70)
            print(f"ID utilisateur: {user[0]}")
            print(f"Email: {user[1]}")
            print(f"Nom: {user[2]}")
            print(f"Role: {user[3]}")
            print(f"Statut: {user[4]}")
            print(f"Actif: {user[5]}")
            print(f"Email verifie: {user[6]}")
            if user[7]:
                print(f"ID fournisseur: {user[7]}")
                print(f"Nom entreprise: {user[8]}")
                print(f"Pays: {user[9]}")
            print()
            print("=" * 70)
            print("INFORMATIONS DE CONNEXION")
            print("=" * 70)
            print(f"Email: {email}")
            print(f"Mot de passe: {password}")
            print(f"Role: FOURNISSEUR")
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
    create_supplier()

