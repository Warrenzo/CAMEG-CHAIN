"""
Script pour corriger la contrainte CHECK sur le statut des appels d'offres
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, text

def fix_tender_status_constraint():
    """Supprimer ou modifier la contrainte CHECK sur le statut"""
    try:
        with engine.connect() as conn:
            # Vérifier si la contrainte existe
            result = conn.execute(text("""
                SELECT conname, pg_get_constraintdef(oid) 
                FROM pg_constraint 
                WHERE conname LIKE '%status%' 
                AND conrelid = 'tenders'::regclass;
            """))
            
            constraints = result.fetchall()
            print("Contraintes CHECK trouvees sur tenders:")
            for constraint in constraints:
                print(f"  - {constraint[0]}: {constraint[1]}")
            
            # Supprimer la contrainte si elle existe
            if constraints:
                for constraint in constraints:
                    constraint_name = constraint[0]
                    print(f"\nSuppression de la contrainte: {constraint_name}")
                    conn.execute(text(f"ALTER TABLE tenders DROP CONSTRAINT IF EXISTS {constraint_name}"))
                    conn.commit()
                    print(f"[OK] Contrainte {constraint_name} supprimee")
            
            # Créer une nouvelle contrainte CHECK avec les bonnes valeurs
            print("\nCreation d'une nouvelle contrainte CHECK avec les valeurs correctes...")
            conn.execute(text("""
                ALTER TABLE tenders 
                ADD CONSTRAINT tenders_status_check 
                CHECK (status IN ('draft', 'published', 'open', 'closed', 'evaluated', 'awarded', 'cancelled'));
            """))
            conn.commit()
            print("[OK] Nouvelle contrainte CHECK creee")
            print("\n[OK] Contrainte CHECK corrigee avec succes!")
        
    except Exception as e:
        print(f"[ERREUR] {e}")
        sys.exit(1)

if __name__ == "__main__":
    fix_tender_status_constraint()

