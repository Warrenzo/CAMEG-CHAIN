// Service sécurisé pour la gestion du stockage local
class SecureStorage {
  private static readonly TOKEN_KEY = 'cameg_auth_token';
  private static readonly USER_KEY = 'cameg_user_data';

  // Validation du token
  private static isValidToken(token: string): boolean {
    try {
      // Vérifier que le token n'est pas vide et a une structure basique
      if (!token || token.length < 10) return false;
      
      // Vérifier que ce n'est pas un token expiré évident
      if (token.includes('expired') || token.includes('invalid')) return false;
      
      return true;
    } catch {
      return false;
    }
  }

  // Stockage sécurisé du token
  static setToken(token: string): void {
    try {
      if (this.isValidToken(token)) {
        localStorage.setItem(this.TOKEN_KEY, token);
      } else {
        console.warn('Tentative de stockage d\'un token invalide');
        this.removeToken();
      }
    } catch (error) {
      console.error('Erreur lors du stockage du token:', error);
    }
  }

  // Récupération sécurisée du token
  static getToken(): string | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token && this.isValidToken(token)) {
        return token;
      }
      // Nettoyer le token invalide
      this.removeToken();
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  // Suppression sécurisée du token
  static removeToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
    }
  }

  // Stockage sécurisé des données utilisateur
  static setUserData(userData: any): void {
    try {
      if (userData && typeof userData === 'object') {
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Erreur lors du stockage des données utilisateur:', error);
    }
  }

  // Récupération sécurisée des données utilisateur
  static getUserData(): any | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      this.removeUserData();
      return null;
    }
  }

  // Suppression sécurisée des données utilisateur
  static removeUserData(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression des données utilisateur:', error);
    }
  }

  // Nettoyage complet
  static clearAll(): void {
    this.removeToken();
    this.removeUserData();
  }

  // Vérification de la disponibilité du localStorage
  static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

export default SecureStorage;
