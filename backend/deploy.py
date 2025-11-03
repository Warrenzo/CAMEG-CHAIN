#!/usr/bin/env python3
"""
Script de déploiement sécurisé pour CAMEG-CHAIN
"""
import os
import sys
import subprocess
import argparse
from pathlib import Path

def run_command(command, description):
    """Exécuter une commande et gérer les erreurs"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} - Succès")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Échec")
        print(f"Erreur: {e.stderr}")
        sys.exit(1)

def check_environment():
    """Vérifier l'environnement de déploiement"""
    print("🔍 Vérification de l'environnement...")
    
    # Vérifier Python
    python_version = sys.version_info
    if python_version < (3, 8):
        print("❌ Python 3.8+ requis")
        sys.exit(1)
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # Vérifier les variables d'environnement critiques
    required_env_vars = [
        "SECRET_KEY",
        "DATABASE_URL",
        "ENVIRONMENT"
    ]
    
    missing_vars = []
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Variables d'environnement manquantes: {', '.join(missing_vars)}")
        sys.exit(1)
    
    print("✅ Variables d'environnement configurées")

def run_security_checks():
    """Exécuter les vérifications de sécurité"""
    print("🔒 Vérifications de sécurité...")
    
    # Vérifier avec bandit
    run_command("bandit -r app/ -f json -o security_report.json", "Analyse de sécurité avec Bandit")
    
    # Vérifier les dépendances vulnérables
    run_command("pip install safety", "Installation de Safety")
    run_command("safety check --json --output safety_report.json", "Vérification des vulnérabilités des dépendances")
    
    print("✅ Vérifications de sécurité terminées")

def run_tests():
    """Exécuter les tests"""
    print("🧪 Exécution des tests...")
    
    # Tests unitaires
    run_command("pytest tests/ -v --cov=app --cov-report=html", "Tests unitaires et couverture")
    
    # Tests de sécurité
    run_command("pytest tests/test_security.py -v -m security", "Tests de sécurité")
    
    print("✅ Tests terminés")

def build_application():
    """Construire l'application"""
    print("🏗️ Construction de l'application...")
    
    # Installer les dépendances
    run_command("pip install -r requirements.txt", "Installation des dépendances")
    
    # Vérifier la syntaxe
    run_command("python -m py_compile app/main.py", "Vérification de la syntaxe")
    
    # Linter
    run_command("flake8 app/ --max-line-length=100", "Vérification du style de code")
    
    print("✅ Application construite")

def deploy_production():
    """Déployer en production"""
    print("🚀 Déploiement en production...")
    
    # Vérifier que nous ne sommes pas en développement
    if os.getenv("ENVIRONMENT") == "development":
        print("❌ Ne pas déployer en production avec ENVIRONMENT=development")
        sys.exit(1)
    
    # Vérifier que DEBUG est False
    if os.getenv("DEBUG", "False").lower() == "true":
        print("❌ Ne pas déployer en production avec DEBUG=True")
        sys.exit(1)
    
    # Créer les migrations
    run_command("alembic upgrade head", "Application des migrations")
    
    # Démarrer avec Gunicorn
    run_command("gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000", "Démarrage de l'application")
    
    print("✅ Déploiement en production terminé")

def main():
    """Fonction principale"""
    parser = argparse.ArgumentParser(description="Script de déploiement CAMEG-CHAIN")
    parser.add_argument("--environment", choices=["development", "staging", "production"], 
                       default="development", help="Environnement de déploiement")
    parser.add_argument("--skip-tests", action="store_true", help="Ignorer les tests")
    parser.add_argument("--skip-security", action="store_true", help="Ignorer les vérifications de sécurité")
    
    args = parser.parse_args()
    
    print("🎯 Déploiement CAMEG-CHAIN")
    print(f"📋 Environnement: {args.environment}")
    
    # Définir l'environnement
    os.environ["ENVIRONMENT"] = args.environment
    
    # Vérifier l'environnement
    check_environment()
    
    # Construire l'application
    build_application()
    
    # Vérifications de sécurité
    if not args.skip_security:
        run_security_checks()
    
    # Tests
    if not args.skip_tests:
        run_tests()
    
    # Déploiement
    if args.environment == "production":
        deploy_production()
    else:
        print("🔄 Démarrage en mode développement...")
        run_command("uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload", "Démarrage du serveur de développement")
    
    print("🎉 Déploiement terminé avec succès!")

if __name__ == "__main__":
    main()
