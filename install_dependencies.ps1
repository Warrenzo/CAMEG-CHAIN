# Script d'installation des dépendances pour CAMEG-CHAIN
Write-Host "🚀 Installation des dépendances pour CAMEG-CHAIN..." -ForegroundColor Green
Write-Host ""

# Vérifier Python
Write-Host "[1/4] Vérification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✅ Python trouvé: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "Installez Python 3.9+ depuis https://python.org" -ForegroundColor Yellow
    exit 1
}

# Vérifier Node.js
Write-Host "[2/4] Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js trouvé: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "Installez Node.js 16+ depuis https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Installation des dépendances Backend
Write-Host "[3/4] Installation des dépendances Python (Backend)..." -ForegroundColor Yellow
Set-Location backend
try {
    pip install -r requirements.txt
    Write-Host "✅ Dépendances Backend installées" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'installation des dépendances Backend" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Installation des dépendances Frontend
Write-Host "[4/4] Installation des dépendances Node.js (Frontend)..." -ForegroundColor Yellow
Set-Location frontend
try {
    npm install
    Write-Host "✅ Dépendances Frontend installées" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'installation des dépendances Frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "🎉 Installation terminée avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Copiez env.example vers .env et configurez vos identifiants PostgreSQL" -ForegroundColor White
Write-Host "2. Testez la connexion: python backend/test_connection.py" -ForegroundColor White
Write-Host "3. Démarrez l'API: python backend/app/main.py" -ForegroundColor White
Write-Host "4. Démarrez le frontend: cd frontend && npm start" -ForegroundColor White
Write-Host ""
Write-Host "📖 Consultez le README.md pour plus d'informations" -ForegroundColor Yellow
