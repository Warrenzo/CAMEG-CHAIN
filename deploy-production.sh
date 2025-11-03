#!/bin/bash

# Script de déploiement en production pour CAMEG-CHAIN
set -e

echo "🚀 Déploiement CAMEG-CHAIN en production"

# Vérifier les variables d'environnement critiques
check_env_vars() {
    echo "🔍 Vérification des variables d'environnement..."
    
    required_vars=(
        "SECRET_KEY"
        "DB_PASSWORD"
        "REDIS_PASSWORD"
        "SENTRY_DSN"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "S3_BACKUP_BUCKET"
    )
    
    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "❌ Variables d'environnement manquantes:"
        printf '%s\n' "${missing_vars[@]}"
        echo "Veuillez les définir dans le fichier .env"
        exit 1
    fi
    
    echo "✅ Variables d'environnement configurées"
}

# Créer les dossiers nécessaires
create_directories() {
    echo "📁 Création des dossiers..."
    
    directories=(
        "logs"
        "backups"
        "nginx/logs"
        "nginx/ssl"
        "monitoring/grafana/dashboards"
        "monitoring/grafana/datasources"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        echo "  ✅ $dir"
    done
}

# Générer les certificats SSL auto-signés (pour le développement)
generate_ssl_certificates() {
    echo "🔐 Génération des certificats SSL..."
    
    if [ ! -f "nginx/ssl/cameg-chain.crt" ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/cameg-chain.key \
            -out nginx/ssl/cameg-chain.crt \
            -subj "/C=TG/ST=Lome/L=Lome/O=CAMEG/OU=DAQP/CN=cameg-chain.com"
        echo "  ✅ Certificats SSL générés"
    else
        echo "  ✅ Certificats SSL existants"
    fi
}

# Construire les images Docker
build_images() {
    echo "🏗️ Construction des images Docker..."
    
    # Backend
    echo "  🔨 Backend..."
    docker build -t cameg-chain-backend ./backend
    
    # Frontend
    echo "  🔨 Frontend..."
    docker build -t cameg-chain-frontend ./frontend
    
    echo "✅ Images construites"
}

# Exécuter les tests
run_tests() {
    echo "🧪 Exécution des tests..."
    
    # Tests backend
    echo "  🔬 Tests backend..."
    cd backend
    python -m pytest tests/ -v --cov=app --cov-report=term-missing
    cd ..
    
    # Tests frontend
    echo "  🔬 Tests frontend..."
    cd frontend
    npm test -- --coverage --watchAll=false
    cd ..
    
    echo "✅ Tests terminés"
}

# Vérifications de sécurité
security_checks() {
    echo "🔒 Vérifications de sécurité..."
    
    # Backend
    echo "  🛡️ Analyse de sécurité backend..."
    cd backend
    bandit -r app/ -f json -o security_report.json
    safety check --json --output safety_report.json
    cd ..
    
    echo "✅ Vérifications de sécurité terminées"
}

# Créer un backup avant déploiement
create_backup() {
    echo "💾 Création d'un backup pré-déploiement..."
    
    if [ -f "docker-compose.production.yml" ]; then
        # Si c'est un redéploiement, créer un backup
        docker-compose -f docker-compose.production.yml exec -T postgres pg_dump -U postgres CAMEG-CHAIN > "backups/pre-deployment-$(date +%Y%m%d_%H%M%S).sql"
        echo "  ✅ Backup créé"
    else
        echo "  ℹ️ Premier déploiement, pas de backup nécessaire"
    fi
}

# Déployer l'application
deploy_application() {
    echo "🚀 Déploiement de l'application..."
    
    # Arrêter les services existants
    echo "  ⏹️ Arrêt des services existants..."
    docker-compose -f docker-compose.production.yml down || true
    
    # Démarrer les services
    echo "  ▶️ Démarrage des services..."
    docker-compose -f docker-compose.production.yml up -d
    
    # Attendre que les services soient prêts
    echo "  ⏳ Attente du démarrage des services..."
    sleep 30
    
    # Vérifier la santé des services
    echo "  🏥 Vérification de la santé des services..."
    
    # Backend
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "    ✅ Backend opérationnel"
    else
        echo "    ❌ Backend non opérationnel"
        exit 1
    fi
    
    # Frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "    ✅ Frontend opérationnel"
    else
        echo "    ❌ Frontend non opérationnel"
        exit 1
    fi
    
    # Nginx
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo "    ✅ Nginx opérationnel"
    else
        echo "    ❌ Nginx non opérationnel"
        exit 1
    fi
    
    echo "✅ Application déployée avec succès"
}

# Configurer le monitoring
setup_monitoring() {
    echo "📊 Configuration du monitoring..."
    
    # Attendre que Prometheus soit prêt
    sleep 10
    
    # Vérifier Prometheus
    if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
        echo "  ✅ Prometheus opérationnel"
    else
        echo "  ❌ Prometheus non opérationnel"
    fi
    
    # Vérifier Grafana
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "  ✅ Grafana opérationnel"
    else
        echo "  ❌ Grafana non opérationnel"
    fi
    
    echo "✅ Monitoring configuré"
}

# Afficher les informations de déploiement
show_deployment_info() {
    echo ""
    echo "🎉 Déploiement terminé avec succès!"
    echo ""
    echo "📋 Informations de déploiement:"
    echo "  🌐 Application: https://cameg-chain.com"
    echo "  📚 API Documentation: https://api.cameg-chain.com/docs"
    echo "  📊 Grafana: https://grafana.cameg-chain.com (admin/admin123)"
    echo "  🔍 Prometheus: https://prometheus.cameg-chain.com"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "  📊 Voir les logs: docker-compose -f docker-compose.production.yml logs -f"
    echo "  🏥 Vérifier la santé: curl https://api.cameg-chain.com/health"
    echo "  💾 Créer un backup: docker-compose -f docker-compose.production.yml exec backup python scripts/backup.py --action backup"
    echo "  🔄 Redémarrer: docker-compose -f docker-compose.production.yml restart"
    echo ""
}

# Fonction principale
main() {
    echo "🎯 Déploiement CAMEG-CHAIN en production"
    echo "========================================"
    
    # Vérifications préliminaires
    check_env_vars
    create_directories
    generate_ssl_certificates
    
    # Tests et sécurité
    if [ "${SKIP_TESTS:-false}" != "true" ]; then
        run_tests
        security_checks
    fi
    
    # Déploiement
    create_backup
    build_images
    deploy_application
    setup_monitoring
    
    # Informations finales
    show_deployment_info
}

# Gestion des arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "test")
        run_tests
        security_checks
        ;;
    "backup")
        create_backup
        ;;
    "logs")
        docker-compose -f docker-compose.production.yml logs -f
        ;;
    "status")
        docker-compose -f docker-compose.production.yml ps
        ;;
    "stop")
        docker-compose -f docker-compose.production.yml down
        ;;
    "restart")
        docker-compose -f docker-compose.production.yml restart
        ;;
    *)
        echo "Usage: $0 {deploy|test|backup|logs|status|stop|restart}"
        echo ""
        echo "  deploy  - Déploiement complet (défaut)"
        echo "  test    - Exécuter les tests uniquement"
        echo "  backup  - Créer un backup"
        echo "  logs    - Afficher les logs"
        echo "  status  - Afficher le statut des services"
        echo "  stop    - Arrêter les services"
        echo "  restart - Redémarrer les services"
        exit 1
        ;;
esac
