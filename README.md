# 🏥 CAMEG-CHAIN - Système de Gestion des Appels d'Offres Pharmaceutiques

## 📋 Vue d'ensemble

CAMEG-CHAIN est une plateforme complète de gestion des appels d'offres pharmaceutiques développée pour la CAMEG (Centrale d'Achat des Médicaments Essentiels et Génériques). Le système intègre l'intelligence artificielle pour l'évaluation automatique des fournisseurs et la détection des risques.

## 🏗️ Architecture

### **Frontend (React + TypeScript)**
- **Interface utilisateur moderne** avec React 19 et TypeScript
- **Design responsive** avec Tailwind CSS
- **Authentification sécurisée** avec JWT
- **Dashboards spécialisés** par rôle utilisateur

### **Backend (FastAPI + Python)**
- **API REST moderne** avec FastAPI
- **Base de données PostgreSQL** avec SQLAlchemy ORM
- **Authentification JWT** sécurisée
- **Middleware de sécurité** et monitoring

### **Service IA (FastAPI + Python)**
- **Évaluation automatique** des fournisseurs
- **Détection d'anomalies** et risques
- **Scoring prédictif** basé sur l'IA
- **Intégration de sources externes**

## 🚀 Démarrage rapide

### **Prérequis**
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

### **Installation**

1. **Cloner le projet**
```bash
git clone <repository-url>
cd CAMEG-CHAIN
```

2. **Installer les dépendances**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install

# Service IA
cd ../ai_service
pip install -r requirements.txt
```

3. **Configuration de la base de données**
```bash
# Créer la base de données PostgreSQL
createdb CAMEG-CHAIN

# Configurer les variables d'environnement
cp env.example .env
# Éditer .env avec vos paramètres
```

4. **Créer les comptes administrateurs**
```bash
cd backend
python scripts/create_super_admin_standalone.py
python scripts/create_admin.py
```

5. **Lancer le système complet**
```bash
python start_complete_system.py
```

## 🌐 Accès au système

- **Frontend :** http://localhost:3000
- **API Backend :** http://localhost:8000/docs
- **Service IA :** http://localhost:8001/docs

## 👥 Rôles utilisateur

### **🔐 Super-Administrateur**
- **Email :** `daviwarren4@gmail.com`
- **Permissions :** Contrôle total du système
- **Fonctionnalités :** Gestion des utilisateurs, configuration système, audit

### **👨‍💼 Administrateur**
- **Email :** `obed11@gmail.com`
- **Permissions :** Gestion des fournisseurs et appels d'offres
- **Fonctionnalités :** Validation, préqualification, monitoring

### **📊 Évaluateur**
- **Permissions :** Évaluation des fournisseurs
- **Fonctionnalités :** Grille d'évaluation, rapports, suivi

### **🏢 Fournisseur**
- **Permissions :** Gestion du profil et soumissions
- **Fonctionnalités :** Inscription, documents, offres

## 🎯 Fonctionnalités principales

### **📋 Gestion des fournisseurs**
- Inscription en 2 phases (simple → complète)
- Validation automatique avec l'IA
- Préqualification basée sur des critères
- Suivi des performances

### **📋 Gestion des appels d'offres**
- Création et configuration des appels d'offres
- Suivi des soumissions en temps réel
- Évaluation automatisée des offres
- Attribution des contrats

### **🤖 Intelligence artificielle**
- Scoring automatique des fournisseurs
- Détection d'anomalies et risques
- Recommandations prédictives
- Intégration de sources externes

### **📊 Monitoring et rapports**
- Tableaux de bord en temps réel
- Métriques de performance
- Rapports d'audit
- Analytics avancées

## 🛠️ Technologies utilisées

### **Frontend**
- React 19 + TypeScript
- Tailwind CSS
- React Router
- Axios
- React Hook Form

### **Backend**
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Pydantic

### **Service IA**
- FastAPI
- Pydantic
- HTTPX
- Structured Logging

### **Infrastructure**
- Docker & Docker Compose
- Nginx
- Prometheus & Grafana
- Redis (cache)

## 📁 Structure du projet

```
CAMEG-CHAIN/
├── frontend/                 # Application React
│   ├── src/
│   │   ├── components/       # Composants React
│   │   ├── pages/           # Pages de l'application
│   │   ├── services/        # Services API
│   │   └── contexts/        # Contextes React
│   └── public/              # Assets statiques
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── models/          # Modèles de données
│   │   ├── routes/          # Routes API
│   │   ├── services/        # Logique métier
│   │   └── schemas/         # Schémas Pydantic
│   └── scripts/             # Scripts utilitaires
├── ai_service/              # Service IA
│   ├── app.py              # Application principale
│   └── config.py           # Configuration
├── database/               # Scripts de base de données
├── docs/                   # Documentation
└── nginx/                  # Configuration Nginx
```

## 🔧 Développement

### **Tests**
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### **Linting**
```bash
# Backend
flake8 app/
black app/

# Frontend
npm run lint
```

### **Build de production**
```bash
# Frontend
cd frontend
npm run build

# Docker
docker-compose -f docker-compose.production.yml up
```

## 📚 Documentation

- **API Documentation :** http://localhost:8000/docs
- **Service IA :** http://localhost:8001/docs
- **Architecture :** `docs/architecture.png`
- **Base de données :** `docs/erd_database.png`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- **Email :** support@cameg-chain.com
- **Documentation :** Voir le dossier `docs/`
- **Issues :** Utiliser le système d'issues GitHub

---

**🎉 CAMEG-CHAIN - Révolutionner la gestion des appels d'offres pharmaceutiques avec l'IA !**