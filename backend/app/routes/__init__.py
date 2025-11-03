"""
Routes de l'application CAMEG-CHAIN
"""
from .auth import router as auth_router
from .supplier import router as supplier_router
from .tender import router as tender_router

__all__ = [
    "auth_router",
    "supplier_router",
    "tender_router"
]
