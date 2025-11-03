#!/usr/bin/env python3
"""
Script pour créer les utilisateurs admin et super-admin
"""
import os
import sys
import psycopg2
from passlib.context import CryptContext

# Configuration
DATABASE_URL = "postgresql://postgres:123456789@localhost:5432/CAMEG-CHAIN"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    """Hacher un mot de passe avec bcrypt"""
    return pwd_context.hash(plain)

def create_user(email, plain_password, role, username, full_name):
    """Créer un utilisateur dans la base de données"""
    password_hash = hash_password(plain_password)
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Insérer l'utilisateur avec gestion des conflits
        cur.execute("""
            INSERT INTO users (email, username, hashed_password, full_name, role, is_active, status, email_verified)
            VALUES (%s, %s, %s, %s, %s, TRUE, 'actif', TRUE)
            ON CONFLICT (email) DO UPDATE SET
                hashed_password = EXCLUDED.hashed_password,
                role = EXCLUDED.role,
                is_active = EXCLUDED.is_active,
                status = EXCLUDED.status,
                email_verified = EXCLUDED.email_verified
            RETURNING id;
        """, (email, username, password_hash, full_name, role))
        
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return result[0] if result else None
        
    except Exception as e:
        print(f"Erreur lors de la création de {email}: {e}")
        return None

if __name__ == "__main__":
    print("🔐 Création des utilisateurs admin...")
    
    # Super-admin
    print("Création du super-admin...")
    sa_id = create_user(
        email="daviwarren4@gmail.com",
        plain_password="@Obed#91.64.77.53",
        role="admin",  # Utiliser 'admin' car c'est le rôle le plus élevé dans le système
        username="daviwarren4",
        full_name="Super Admin"
    )
    print(f"Super-admin créé: {sa_id}")
    
    # Admin
    print("Création de l'admin...")
    a_id = create_user(
        email="obed11@gmail.com",
        plain_password="Very@Hard//4Me.88",
        role="admin",
        username="obed11",
        full_name="Admin User"
    )
    print(f"Admin créé: {a_id}")
    
    print("\n✅ Utilisateurs créés avec succès!")
    print("📧 Super-admin: daviwarren4@gmail.com")
    print("📧 Admin: obed11@gmail.com")
    print("\n🌐 Vous pouvez maintenant vous connecter sur http://localhost:3002/login")
