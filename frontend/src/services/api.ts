import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import SecureStorage from './storage';

// Étendre le type pour inclure la propriété _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_URL = process.env['REACT_APP_API_URL'] || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Timeout de 30 secondes (augmenté pour permettre le démarrage du serveur)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fonction pour renouveler le token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshToken = async (): Promise<string | null> => {
  const refreshTokenValue = SecureStorage.getRefreshToken();
  if (!refreshTokenValue) {
    return null;
  }

  try {
    const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
      refresh_token: refreshTokenValue
    });
    
    const { access_token, refresh_token } = response.data;
    SecureStorage.setToken(access_token);
    if (refresh_token) {
      SecureStorage.setRefreshToken(refresh_token);
    }
    return access_token;
  } catch (error) {
    // Si le refresh échoue, déconnecter l'utilisateur
    SecureStorage.removeToken();
    window.location.href = '/login';
    return null;
  }
};

// Intercepteur pour ajouter le token d'authentification et vérifier l'expiration
api.interceptors.request.use(
  async (config) => {
    let token = SecureStorage.getToken();
    
    // Vérifier si le token est expiré ou va expirer bientôt (dans les 5 prochaines minutes)
    // Ne pas vérifier pour les requêtes de refresh pour éviter les boucles
    if (token && SecureStorage.isTokenExpired(token) && !config.url?.includes('/auth/refresh')) {
      // Si un refresh est déjà en cours, attendre
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
          return config;
        }).catch(() => {
          return Promise.reject(new Error('Erreur de rafraîchissement du token'));
        });
      }

      // Démarrer le refresh
      isRefreshing = true;
      const newToken = await refreshToken();
      isRefreshing = false;

      if (newToken) {
        token = newToken;
        processQueue(null, newToken);
      } else {
        processQueue(new Error('Impossible de renouveler le token'));
        return Promise.reject(new Error('Session expirée'));
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Filtrer les erreurs liées aux extensions de navigateur
    const errorMessage = error.message || '';
    if (errorMessage.includes('message channel closed') || 
        errorMessage.includes('asynchronous response')) {
      // Ignorer silencieusement les erreurs d'extensions de navigateur
      return Promise.reject(error);
    }

    // Gestion des erreurs de réseau
    if (!error.response) {
      // Ne pas logger les erreurs de réseau si c'est juste une extension
      if (!errorMessage.includes('message channel')) {
        console.error('Erreur de réseau:', error.message);
        
        // Vérifier si c'est un timeout
        if (error.code === 'ECONNABORTED' || errorMessage.includes('timeout')) {
          return Promise.reject(new Error(`Le serveur ne répond pas. Vérifiez que le backend est démarré sur ${API_URL}`));
        }
        
        // Vérifier si c'est une erreur de connexion
        if (error.code === 'ERR_NETWORK' || errorMessage.includes('Network Error')) {
          return Promise.reject(new Error(`Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur ${API_URL}`));
        }
      }
      return Promise.reject(new Error('Erreur de connexion au serveur'));
    }

    // Gestion des erreurs d'authentification - Tentative de refresh
    if (error.response?.status === 401) {
      const originalRequest = error.config as CustomAxiosRequestConfig;
      
      // Vérifier que originalRequest existe
      if (!originalRequest) {
        SecureStorage.removeToken();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Éviter les boucles infinies
      if (originalRequest._retry) {
        SecureStorage.removeToken();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Si un refresh est déjà en cours, attendre
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          if (newToken && originalRequest) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
          return Promise.reject(error);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      // Démarrer le refresh
      isRefreshing = true;
      return refreshToken().then((newToken) => {
        isRefreshing = false;
        if (newToken && originalRequest) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        } else {
          processQueue(new Error('Impossible de renouveler le token'));
          SecureStorage.removeToken();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }).catch((refreshError) => {
        isRefreshing = false;
        processQueue(refreshError);
        SecureStorage.removeToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      });
    }

    // Gestion des erreurs de rate limiting
    if (error.response?.status === 429) {
      console.error('Trop de requêtes, veuillez patienter');
    }

    // Gestion des erreurs serveur
    if (error.response?.status >= 500) {
      console.error('Erreur serveur:', error.response.status);
    }

    return Promise.reject(error);
  }
);

export default api;
