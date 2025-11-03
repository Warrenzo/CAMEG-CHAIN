"""
Schémas Pydantic pour la validation des données
"""
from .user import (
    UserCreate,
    UserResponse,
    SupplierPhase1Create,
    SupplierPhase1Response,
    SupplierPhase2Update,
    SupplierResponse,
    DocumentUpload,
    DocumentResponse,
    LoginRequest,
    TokenResponse,
    SupplierValidationRequest,
    AdminDashboardResponse
)

from .tender import (
    TenderCreate,
    TenderUpdate,
    TenderResponse,
    TenderListResponse,
    ExpressionOfInterestCreate,
    ExpressionOfInterestResponse,
    BidCreate,
    BidUpdate,
    BidResponse,
    TenderPermissions,
    BidEvaluation,
    BidEvaluationResponse,
    NotificationResponse,
    TenderStats,
    SupplierTenderStats
)

__all__ = [
    "UserCreate",
    "UserResponse", 
    "SupplierPhase1Create",
    "SupplierPhase1Response",
    "SupplierPhase2Update",
    "SupplierResponse",
    "DocumentUpload",
    "DocumentResponse",
    "LoginRequest",
    "TokenResponse",
    "SupplierValidationRequest",
    "AdminDashboardResponse",
    "TenderCreate",
    "TenderUpdate",
    "TenderResponse",
    "TenderListResponse",
    "ExpressionOfInterestCreate",
    "ExpressionOfInterestResponse",
    "BidCreate",
    "BidUpdate",
    "BidResponse",
    "TenderPermissions",
    "BidEvaluation",
    "BidEvaluationResponse",
    "NotificationResponse",
    "TenderStats",
    "SupplierTenderStats"
]
