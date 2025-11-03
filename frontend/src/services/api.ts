import axios, { AxiosError, AxiosResponse } from 'axios';
import SecureStorage from './storage';

const API_URL = process.env['REACT_APP_API_URL'] || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Timeout de 10 secondes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = SecureStorage.getToken();
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
    // Gestion des erreurs de réseau
    if (!error.response) {
      console.error('Erreur de réseau:', error.message);
      return Promise.reject(new Error('Erreur de connexion au serveur'));
    }

    // Gestion des erreurs d'authentification
    if (error.response?.status === 401) {
      SecureStorage.removeToken();
      window.location.href = '/login';
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
