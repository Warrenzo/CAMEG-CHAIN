"""
Tests de sécurité pour CAMEG-CHAIN
"""
import pytest
from fastapi.testclient import TestClient
import time

class TestSecurityMiddleware:
    """Tests pour le middleware de sécurité"""
    
    def test_rate_limiting(self, client: TestClient):
        """Tester le rate limiting sur les endpoints sensibles"""
        # Faire plusieurs tentatives de connexion rapides
        login_data = {
            "email": "test@example.com",
            "password": "wrongpassword"
        }
        
        # Les premières tentatives doivent passer
        for i in range(5):  # Augmenter le nombre de tentatives
            response = client.post("/api/v1/auth/login", json=login_data)
            assert response.status_code in [401, 422]  # Erreur mais pas de rate limit
        
        # Après 5 tentatives, le rate limiting doit s'activer
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 429  # Too Many Requests
        assert "Trop de tentatives" in response.json()["detail"]
    
    def test_security_headers(self, client: TestClient):
        """Tester la présence des headers de sécurité"""
        response = client.get("/")
        
        assert response.status_code == 200
        
        # Vérifier les headers de sécurité
        headers = response.headers
        assert "X-Content-Type-Options" in headers
        assert headers["X-Content-Type-Options"] == "nosniff"
        
        assert "X-Frame-Options" in headers
        assert headers["X-Frame-Options"] == "DENY"
        
        assert "X-XSS-Protection" in headers
        assert headers["X-XSS-Protection"] == "1; mode=block"
        
        assert "Strict-Transport-Security" in headers
        assert "max-age=31536000" in headers["Strict-Transport-Security"]
        
        assert "Referrer-Policy" in headers
        assert headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    
    def test_cors_configuration(self, client: TestClient):
        """Tester la configuration CORS"""
        # Test d'une requête preflight
        response = client.options(
            "/api/v1/auth/login",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
        )
        
        assert response.status_code == 200
        
        # Vérifier les headers CORS
        headers = response.headers
        assert "Access-Control-Allow-Origin" in headers
        assert "Access-Control-Allow-Methods" in headers
        assert "Access-Control-Allow-Headers" in headers

class TestInputValidation:
    """Tests pour la validation des entrées"""
    
    def test_sql_injection_protection(self, client: TestClient):
        """Tester la protection contre les injections SQL"""
        malicious_data = {
            "email": "test@example.com'; DROP TABLE users; --",
            "password": "TestPassword123!",
            "company_name": "Test Company",
            "country": "Togo",
            "phone_number": "+22812345678"
        }
        
        response = client.post("/api/v1/auth/register/phase1", json=malicious_data)
        
        # La requête doit échouer avec une erreur de validation, pas une erreur SQL
        assert response.status_code == 422  # Validation error
        assert "sql" not in response.text.lower()
    
    def test_xss_protection(self, client: TestClient):
        """Tester la protection contre les attaques XSS"""
        xss_data = {
            "email": "test@example.com",
            "password": "TestPassword123!",
            "company_name": "<script>alert('XSS')</script>",
            "country": "Togo",
            "phone_number": "+22812345678"
        }
        
        response = client.post("/api/v1/auth/register/phase1", json=xss_data)
        
        # Le script doit être échappé
        if response.status_code == 200:
            data = response.json()
            assert "<script>" not in data["message"]
            assert "&lt;script&gt;" in data["message"] or "alert" not in data["message"]
    
    def test_input_length_limits(self, client: TestClient):
        """Tester les limites de longueur des entrées"""
        # Nom d'entreprise trop long
        long_name = "A" * 300  # Plus que la limite de 200 caractères
        long_data = {
            "email": "test@example.com",
            "password": "TestPassword123!",
            "company_name": long_name,
            "country": "Togo",
            "phone_number": "+22812345678"
        }
        
        response = client.post("/api/v1/auth/register/phase1", json=long_data)
        assert response.status_code == 422  # Validation error
        
        # Mot de passe trop long
        long_password = "A" * 200  # Plus que la limite de 128 caractères
        long_password_data = {
            "email": "test@example.com",
            "password": long_password,
            "company_name": "Test Company",
            "country": "Togo",
            "phone_number": "+22812345678"
        }
        
        response = client.post("/api/v1/auth/register/phase1", json=long_password_data)
        assert response.status_code == 422  # Validation error

class TestAuthenticationSecurity:
    """Tests de sécurité pour l'authentification"""
    
    def test_password_strength_requirements(self, client: TestClient):
        """Tester les exigences de force du mot de passe"""
        weak_passwords = [
            "123456",  # Trop simple
            "password",  # Trop commun
            "Password",  # Pas de chiffre ni caractère spécial
            "Password123",  # Pas de caractère spécial
            "password123!",  # Pas de majuscule
        ]
        
        for weak_password in weak_passwords:
            data = {
                "email": f"test{weak_password}@example.com",
                "password": weak_password,
                "company_name": "Test Company",
                "country": "Togo",
                "phone_number": "+22812345678"
            }
            
            response = client.post("/api/v1/auth/register/phase1", json=data)
            assert response.status_code == 422  # Validation error
    
    def test_account_lockout(self, client: TestClient):
        """Tester le verrouillage de compte après plusieurs tentatives"""
        # Créer un utilisateur
        user_data = {
            "email": "lockout@example.com",
            "password": "TestPassword123!",
            "company_name": "Test Company",
            "country": "Togo",
            "phone_number": "+22812345678"
        }
        client.post("/api/v1/auth/register/phase1", json=user_data)
        
        # Faire plusieurs tentatives de connexion avec un mauvais mot de passe
        login_data = {
            "email": "lockout@example.com",
            "password": "wrongpassword"
        }
        
        # Faire 5 tentatives (limite configurée)
        for i in range(5):
            response = client.post("/api/v1/auth/login", json=login_data)
            assert response.status_code == 401  # Unauthorized
        
        # La 6ème tentative doit être bloquée
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 423  # Locked
        assert "verrouillé" in response.json()["detail"]
    
    def test_token_expiration(self, client: TestClient):
        """Tester l'expiration des tokens"""
        # Créer un utilisateur et se connecter
        user_data = {
            "email": "expire@example.com",
            "password": "TestPassword123!",
            "company_name": "Test Company",
            "country": "Togo",
            "phone_number": "+22812345678"
        }
        client.post("/api/v1/auth/register/phase1", json=user_data)
        
        login_data = {
            "email": "expire@example.com",
            "password": "TestPassword123!"
        }
        response = client.post("/api/v1/auth/login", json=login_data)
        token = response.json()["access_token"]
        
        # Le token doit contenir une expiration
        assert "expires_in" in response.json()
        assert response.json()["expires_in"] > 0
