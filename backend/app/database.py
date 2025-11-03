"""
Configuration sécurisée de la connexion à la base de données PostgreSQL
"""
import os
import ssl
from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from dotenv import load_dotenv
import logging

# Charger les variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration de la base de données sécurisée
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:123456789@localhost:5432/CAMEG-CHAIN"
)

# Configuration SSL pour PostgreSQL
def get_ssl_context():
    """Créer un contexte SSL sécurisé"""
    if os.getenv("DB_SSL", "false").lower() == "true":
        ssl_context = ssl.create_default_context()
        # En production, vérifier le certificat
        if os.getenv("ENVIRONMENT", "development") == "production":
            ssl_context.check_hostname = True
            ssl_context.verify_mode = ssl.CERT_REQUIRED
        else:
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
        return ssl_context
    return None

# Créer le moteur de base de données sécurisé
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_timeout=30,
    connect_args={
        "sslmode": "require" if os.getenv("DB_SSL", "false").lower() == "true" else "prefer",
        "connect_timeout": 10,
        "application_name": "CAMEG-CHAIN-API"
    },
    echo=os.getenv("DEBUG", "False").lower() == "true"
)

# Event listeners pour la sécurité
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Configurer les paramètres de sécurité PostgreSQL"""
    if "postgresql" in DATABASE_URL:
        with dbapi_connection.cursor() as cursor:
            # Désactiver les requêtes dangereuses
            cursor.execute("SET statement_timeout = '30s'")
            cursor.execute("SET lock_timeout = '10s'")
            cursor.execute("SET idle_in_transaction_session_timeout = '60s'")
            logger.info("✅ Paramètres de sécurité PostgreSQL configurés")

# Créer la session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base pour les modèles
Base = declarative_base()

def get_db():
    """
    Dépendance sécurisée pour obtenir une session de base de données
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"❌ Erreur de session DB: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    """
    Initialiser la base de données (créer les tables) avec vérifications
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Base de données initialisée avec succès")
    except Exception as e:
        logger.error(f"❌ Erreur d'initialisation DB: {e}")
        raise

def test_connection():
    """
    Tester la connexion à la base de données avec diagnostics
    """
    try:
        with engine.connect() as connection:
            # Test de base
            result = connection.execute(text("SELECT 1 as test"))
            test_value = result.fetchone()[0]
            
            if test_value == 1:
                logger.info("✅ Connexion à PostgreSQL réussie!")
                
                # Test de performance
                import time
                start_time = time.time()
                connection.execute(text("SELECT version()"))
                response_time = time.time() - start_time
                
                if response_time < 1.0:
                    logger.info(f"✅ Performance DB: {response_time:.3f}s")
                else:
                    logger.warning(f"⚠️ Performance DB lente: {response_time:.3f}s")
                
                return True
            else:
                logger.error("❌ Test de connexion DB échoué")
                return False
                
    except Exception as e:
        logger.error(f"❌ Erreur de connexion à PostgreSQL: {e}")
        return False

def get_db_stats():
    """
    Obtenir les statistiques de la base de données
    """
    try:
        with engine.connect() as connection:
            # Nombre de connexions actives
            result = connection.execute(text("""
                SELECT count(*) as active_connections 
                FROM pg_stat_activity 
                WHERE state = 'active'
            """))
            active_connections = result.fetchone()[0]
            
            # Taille de la base de données
            result = connection.execute(text("""
                SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
            """))
            db_size = result.fetchone()[0]
            
            return {
                "active_connections": active_connections,
                "database_size": db_size,
                "status": "healthy"
            }
    except Exception as e:
        logger.error(f"❌ Erreur stats DB: {e}")
        return {"status": "error", "message": str(e)}
