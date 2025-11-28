#!/usr/bin/env python3
"""
Script de démarrage de l'API backend CAMEG-CHAIN
"""
import uvicorn
import sys
import os
from pathlib import Path

# Ajouter le répertoire parent au path pour les imports
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    # Démarrer l'API avec uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

