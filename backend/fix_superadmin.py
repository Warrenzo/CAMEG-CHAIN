#!/usr/bin/env python3
"""
Script pour corriger le mot de passe du super-admin
"""
import psycopg2
from passlib.context import CryptContext

# Configuration
DATABASE_URL = "postgresql://postgres:123456789@localhost:5432/CAMEG-CHAIN"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    """Hacher un mot de passe avec bcrypt"""
    return pwd_context.hash(plain)

def update_superadmin_password():
    """Mettre à jour le mot de passe du super-admin"""
    password = "@Obed#91.64.77.53"
    password_hash = hash_password(password)
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Mettre à jour le mot de passe du super-admin
        cur.execute("""
            UPDATE users 
            SET hashed_password = %s
            WHERE email = 'daviwarren4@gmail.com'
        """, (password_hash,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"✅ Mot de passe du super-admin mis à jour avec succès")
        print(f"📧 Email: daviwarren4@gmail.com")
        print(f"🔐 Mot de passe: {password}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Correction du mot de passe du super-admin...")
    update_superadmin_password()
