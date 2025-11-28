@echo off
echo ============================================================
echo   CAMEG-CHAIN - Demarrage simultane des serveurs
echo ============================================================
echo.
echo Demarrage des serveurs suivants:
echo   - Backend API (port 8000)
echo   - Frontend React (port 3000)
echo   - Service IA (port 8001)
echo.
echo ============================================================
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Python n'est pas installe ou n'est pas dans le PATH
    pause
    exit /b 1
)

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe ou n'est pas dans le PATH
    pause
    exit /b 1
)

REM Vérifier si npm est installé
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] npm n'est pas installe ou n'est pas dans le PATH
    pause
    exit /b 1
)

echo [OK] Toutes les dependances sont installees
echo.

REM Démarrer le Backend API dans une nouvelle fenêtre
echo [1/3] Demarrage du Backend API (port 8000)...
start "CAMEG-CHAIN - Backend API" cmd /k "cd backend && python start_api_final.py"
timeout /t 2 /nobreak >nul

REM Démarrer le Service IA dans une nouvelle fenêtre
echo [2/3] Demarrage du Service IA (port 8001)...
start "CAMEG-CHAIN - Service IA" cmd /k "cd ai_service && python app.py"
timeout /t 2 /nobreak >nul

REM Démarrer le Frontend React dans une nouvelle fenêtre
echo [3/3] Demarrage du Frontend React (port 3000)...
start "CAMEG-CHAIN - Frontend React" cmd /k "cd frontend && npm start"
timeout /t 2 /nobreak >nul

echo.
echo ============================================================
echo   Tous les serveurs sont en cours de demarrage...
echo ============================================================
echo.
echo URLs d'acces:
echo   - Frontend:     http://localhost:3000
echo   - Backend API:  http://localhost:8000
echo   - Docs API:     http://localhost:8000/docs
echo   - Service IA:   http://localhost:8001
echo   - Docs IA:      http://localhost:8001/docs
echo.
echo Les serveurs s'ouvrent dans des fenetres separees.
echo Pour arreter les serveurs, fermez les fenetres correspondantes.
echo.
echo ============================================================
pause

