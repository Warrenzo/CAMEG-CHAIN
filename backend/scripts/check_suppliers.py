#!/usr/bin/env python3
"""
Vérifie s'il existe des comptes fournisseur dans la base PostgreSQL.

Utilise la variable d'environnement DATABASE_URL, sinon tente une valeur par défaut.
"""
import os
import json
import sys

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError as e:
    print(json.dumps({"error": f"psycopg2 non installé: {e}"}))
    sys.exit(1)


def get_database_url() -> str:
    url = os.environ.get("DATABASE_URL")
    if url and url.strip():
        return url
    # Valeur par défaut locale
    return "postgresql://postgres:123456789@localhost:5432/CAMEG-CHAIN"


def main() -> int:
    url = get_database_url()
    result = {"database_url": url, "count": 0, "examples": []}

    try:
        conn = psycopg2.connect(url)
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Compter les utilisateurs avec rôle supplier
        cur.execute("SELECT COUNT(*) AS c FROM users WHERE role = 'supplier';")
        result["count"] = int(cur.fetchone()["c"])

        # Lister quelques comptes (si la colonne created_at n'existe pas, on ordonne par email)
        try:
            cur.execute(
                """
                SELECT email, status, is_active
                FROM users
                WHERE role = 'supplier'
                ORDER BY created_at DESC NULLS LAST
                LIMIT 10;
                """
            )
        except Exception:
            cur.execute(
                """
                SELECT email, status, is_active
                FROM users
                WHERE role = 'supplier'
                ORDER BY email ASC
                LIMIT 10;
                """
            )
        rows = cur.fetchall()
        result["examples"] = rows

        print(json.dumps(result, ensure_ascii=False))
        return 0
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        return 1
    finally:
        try:
            cur.close()
            conn.close()
        except Exception:
            pass


if __name__ == "__main__":
    raise SystemExit(main())


