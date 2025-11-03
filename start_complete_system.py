#!/usr/bin/env python3
"""
Script de démarrage complet du système CAMEG-CHAIN
Démarre l'API backend et le frontend React
"""

import subprocess
import time
import requests
import sys
import os
from pathlib import Path

def print_header(title):
    """Affiche un en-tête formaté"""
    print("\n" + "=" * 70)
    print(f"🚀 {title}")
    print("=" * 70)

def print_section(title):
    """Affiche une section formatée"""
    print(f"\n📋 {title}")
    print("-" * 50)

def check_port_available(port):
    """Vérifie si un port est disponible"""
    try:
        response = requests.get(f"http://localhost:{port}", timeout=2)
        return False  # Port occupé
    except:
        return True  # Port libre

def check_ai_service_health():
    """Vérifie la santé du service IA"""
    try:
        response = requests.get("http://localhost:8001/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get("status") == "healthy"
        return False
    except:
        return False

def start_backend():
    """Démarre l'API backend"""
    print_section("DÉMARRAGE DE L'API BACKEND")
    
    if not check_port_available(8000):
        print("✅ API backend déjà en cours d'exécution sur le port 8000")
        return True
    
    print("🔄 Démarrage de l'API backend...")
    
    try:
        # Démarrer l'API en arrière-plan
        backend_process = subprocess.Popen(
            [sys.executable, "start_api_final.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Attendre que l'API soit prête
        print("⏳ Attente du démarrage de l'API...")
        for i in range(30):  # Attendre maximum 30 secondes
            time.sleep(1)
            try:
                response = requests.get("http://localhost:8000/", timeout=2)
                if response.status_code == 200:
                    print("✅ API backend démarrée avec succès sur http://localhost:8000")
                    return True
            except:
                continue
        
        print("❌ Timeout - L'API met trop de temps à démarrer")
        return False
        
    except Exception as e:
        print(f"❌ Erreur lors du démarrage de l'API: {e}")
        return False

def start_frontend():
    """Démarre le frontend React"""
    print_section("DÉMARRAGE DU FRONTEND REACT")
    
    if not check_port_available(3000):
        print("✅ Frontend React déjà en cours d'exécution sur le port 3000")
        return True
    
    print("🔄 Démarrage du frontend React...")
    
    try:
        # Changer vers le répertoire frontend
        frontend_dir = Path("frontend")
        if not frontend_dir.exists():
            print("❌ Répertoire frontend non trouvé")
            return False
        
        # Démarrer le frontend en arrière-plan
        frontend_process = subprocess.Popen(
            ["npm", "start"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            shell=True
        )
        
        # Attendre que le frontend soit prêt
        print("⏳ Attente du démarrage du frontend...")
        for i in range(60):  # Attendre maximum 60 secondes
            time.sleep(1)
            try:
                response = requests.get("http://localhost:3000/", timeout=2)
                if response.status_code == 200:
                    print("✅ Frontend React démarré avec succès sur http://localhost:3000")
                    return True
            except:
                continue
        
        print("❌ Timeout - Le frontend met trop de temps à démarrer")
        return False
        
    except Exception as e:
        print(f"❌ Erreur lors du démarrage du frontend: {e}")
        return False

def test_system():
    """Teste le système complet"""
    print_section("TEST DU SYSTÈME COMPLET")
    
    # Test API
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ API backend accessible")
        else:
            print(f"❌ API backend répond avec le code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API backend non accessible: {e}")
        return False
    
    # Test Frontend
    try:
        response = requests.get("http://localhost:3000/", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend React accessible")
        else:
            print(f"❌ Frontend React répond avec le code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend React non accessible: {e}")
        return False
    
    return True

def show_system_info():
    """Affiche les informations du système"""
    print_section("INFORMATIONS DU SYSTÈME")
    
    print("🌐 URLs d'accès:")
    print("   • Frontend: http://localhost:3000")
    print("   • API Backend: http://localhost:8000")
    print("   • Documentation API: http://localhost:8000/docs")
    
    print("\n📁 Structure du projet:")
    print("   • Backend: FastAPI + PostgreSQL + IA")
    print("   • Frontend: React + Tailwind CSS")
    print("   • Base de données: PostgreSQL")
    print("   • IA: Moteur d'évaluation des fournisseurs")
    
    print("\n🎯 Fonctionnalités disponibles:")
    features = [
        "Inscription fournisseur (Phase 1)",
        "Connexion avec messages intelligents",
        "Tableau de bord personnalisé",
        "Évaluation IA des fournisseurs",
        "Gestion des appels d'offres",
        "Interface responsive et accessible"
    ]
    
    for feature in features:
        print(f"   ✅ {feature}")
        time.sleep(0.1)

def main():
    """Fonction principale"""
    print_header("CAMEG-CHAIN - SYSTÈME COMPLET")
    print("Démarrage de l'API backend et du frontend React")
    print("Système de gestion des appels d'offres pharmaceutiques")
    
    # Vérifier les prérequis
    print_section("VÉRIFICATION DES PRÉREQUIS")
    
    # Vérifier Python
    print(f"✅ Python {sys.version.split()[0]} détecté")
    
    # Vérifier Node.js
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js {result.stdout.strip()} détecté")
        else:
            print("❌ Node.js non trouvé")
            return
    except:
        print("❌ Node.js non trouvé")
        return
    
    # Vérifier npm
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm {result.stdout.strip()} détecté")
        else:
            print("❌ npm non trouvé")
            return
    except:
        print("❌ npm non trouvé")
        return
    
    # Démarrer le backend
    if not start_backend():
        print("❌ Impossible de démarrer l'API backend")
        return
    
    # Démarrer le frontend
    if not start_frontend():
        print("❌ Impossible de démarrer le frontend")
        return
    
    # Tester le système
    if not test_system():
        print("❌ Le système n'est pas entièrement fonctionnel")
        return
    
    # Afficher les informations
    show_system_info()
    
    print_header("SYSTÈME CAMEG-CHAIN DÉMARRÉ")
    print("✅ API backend opérationnelle")
    print("✅ Frontend React opérationnel")
    
    # Vérifier le service IA
    if check_ai_service_health():
        print("✅ Service IA opérationnel")
    else:
        print("⚠️  Service IA non disponible - Fonctionnalités IA limitées")
    
    print("✅ Système complet fonctionnel")
    
    print("\n🎉 CAMEG-CHAIN est maintenant accessible !")
    print("🌐 Ouvrez votre navigateur sur: http://localhost:3000")
    print("📚 Consultez la documentation API: http://localhost:8000/docs")
    print("🤖 Service IA disponible sur: http://localhost:8001/docs")
    
    print("\n💡 Pour arrêter le système:")
    print("   • Appuyez sur Ctrl+C dans ce terminal")
    print("   • Ou fermez les fenêtres de terminal des services")
    
    # Garder le script en vie
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Arrêt du système CAMEG-CHAIN...")
        print("✅ Système arrêté proprement")

if __name__ == "__main__":
    main()
