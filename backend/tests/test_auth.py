"""
Tests pour l'authentification
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.services.auth import AuthService
from app.models.user import User, UserRole, UserStatus

class TestAuthService:
    """Tests pour le service d'authentification"""
    
    def test_password_validation(self):
        """Tester la validation des mots de passe"""
        # Mot de passe valide
        is_valid, message = AuthService.validate_password_strength("ValidPass123!")
        assert is_valid is True
        assert message == "Mot de passe valide"
        
        # Mot de passe trop court
        is_valid, message = AuthService.validate_password_strength("Short1!")
        assert is_valid is False
        assert "8 caractères" in message
        
        # Mot de passe sans majuscule
        is_valid, message = AuthService.validate_password_strength("nouppercase123!")
        assert is_valid is False
        assert "majuscule" in message
        
        # Mot de passe sans minuscule
        is_valid, message = AuthService.validate_password_strength("NOLOWERCASE123!")
        assert is_valid is False
        assert "minuscule" in message
        
        # Mot de passe sans chiffre
        is_valid, message = AuthService.validate_password_strength("NoNumbers!")
        assert is_valid is False
        assert "chiffre" in message
        
        # Mot de passe sans caractère spécial
        is_valid, message = AuthService.validate_password_strength("NoSpecial123")
        assert is_valid is False
        assert "caractère spécial" in message
        
        # Mot de passe commun
        is_valid, message = AuthService.validate_password_strength("password")
        assert is_valid is False
        assert "trop commun" in message
    
    def test_password_hashing(self):
        """Tester le hachage des mots de passe"""
        password = "TestPassword123!"
        hashed = AuthService.get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 50  # bcrypt produit des hash longs
        
        # Vérifier que le hash peut être vérifié
        assert AuthService.verify_password(password, hashed) is True
        assert AuthService.verify_password("wrong_password", hashed) is False
    
    def test_token_creation_and_verification(self):
        """Tester la création et vérification des tokens JWT"""
        user_data = {"sub": "test-user-id"}
        token = AuthService.create_access_token(user_data)
        
        assert token is not None
        assert len(token) > 100  # JWT tokens sont longs
        
        # Vérifier le token
        payload = AuthService.verify_token(token)
        assert payload["sub"] == "test-user-id"
        assert "exp" in payload
        assert "iat" in payload
        assert "jti" in payload
    
    def test_token_blacklist(self):
        """Tester la blacklist des tokens"""
        user_data = {"sub": "test-user-id"}
        token = AuthService.create_access_token(user_data)
        
        # Token valide initialement
        payload = AuthService.verify_token(token)
        assert payload["sub"] == "test-user-id"
        
        # Révoquer le token
        AuthService.revoke_token(token)
        
        # Token révoqué doit échouer
        with pytest.raises(Exception):
            AuthService.verify_token(token)

class TestAuthEndpoints:
    """Tests pour les endpoints d'authentification"""
    
    def test_register_supplier_phase1(self, client: TestClient, test_supplier_data):
        """Tester l'inscription Phase 1 d'un fournisseur"""
        response = client.post("/api/v1/auth/register/phase1", json=test_supplier_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "user_id" in data
        assert data["status"] == "en_attente_validation"
        assert "next_steps" in data
    
    def test_register_duplicate_email(self, client: TestClient, test_supplier_data):
        """Tester l'inscription avec un email déjà existant"""
        # Premier enregistrement
        client.post("/api/v1/auth/register/phase1", json=test_supplier_data)
        
        # Deuxième enregistrement avec le même email
        response = client.post("/api/v1/auth/register/phase1", json=test_supplier_data)
        
        assert response.status_code == 400
        assert "existe déjà" in response.json()["detail"]
    
    def test_register_invalid_data(self, client: TestClient):
        """Tester l'inscription avec des données invalides"""
        invalid_data = {
            "email": "invalid-email",
            "password": "weak",
            "company_name": "",
            "country": "",
            "phone_number": "123"
        }
        
        response = client.post("/api/v1/auth/register/phase1", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    def test_login_success(self, client: TestClient, test_supplier_data):
        """Tester la connexion réussie"""
        # Créer un utilisateur
        client.post("/api/v1/auth/register/phase1", json=test_supplier_data)
        
        # Se connecter
        login_data = {
            "email": test_supplier_data["email"],
            "password": test_supplier_data["password"]
        }
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert "user" in data
    
    def test_login_invalid_credentials(self, client: TestClient):
        """Tester la connexion avec des identifiants invalides"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"]
    
    def test_get_current_user(self, client: TestClient, test_supplier_data):
        """Tester la récupération des informations de l'utilisateur connecté"""
        # Créer et se connecter
        client.post("/api/v1/auth/register/phase1", json=test_supplier_data)
        
        login_data = {
            "email": test_supplier_data["email"],
            "password": test_supplier_data["password"]
        }
        login_response = client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        
        # Récupérer les informations utilisateur
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_supplier_data["email"]
        assert "id" in data
        assert "role" in data
        assert "status" in data
    
    def test_get_current_user_no_token(self, client: TestClient):
        """Tester la récupération des informations sans token"""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 403  # Forbidden
    
    def test_logout(self, client: TestClient):
        """Tester la déconnexion"""
        response = client.post("/api/v1/auth/logout")
        assert response.status_code == 200
        assert "Déconnexion réussie" in response.json()["message"]
