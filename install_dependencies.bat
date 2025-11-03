@echo off
echo Installation des dependances pour CAMEG-CHAIN...
echo.

echo [1/3] Installation des dependances Python (Backend)...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation des dependances Python
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Installation des dependances Node.js (Frontend)...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation des dependances Node.js
    pause
    exit /b 1
)
cd ..

echo.
echo [3/3] Installation des dependances Python (Service IA)...
cd ai_service
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Erreur lors de l'installation des dependances Service IA
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ Installation terminee avec succes!
echo.
echo Prochaines etapes:
echo 1. Configurez votre fichier .env avec vos identifiants PostgreSQL
echo 2. Testez la connexion: python backend/test_connection.py
echo 3. Demarrez l'API: python backend/app/main.py
echo.
pause
