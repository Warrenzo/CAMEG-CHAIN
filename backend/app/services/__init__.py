"""
Services de l'application CAMEG-CHAIN
"""
from .auth import AuthService
from .supplier import SupplierService
from .tender import TenderService

__all__ = [
    "AuthService",
    "SupplierService",
    "TenderService"
]
