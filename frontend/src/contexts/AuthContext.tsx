import { 
  createContext, 
  useState, 
  useContext, 
  useEffect, 
  ReactNode,
  useCallback,
  useMemo
} from 'react';
import api from '../services/api';
import SecureStorage from '../services/storage';

interface User {
  id: string;
  email: string;
  role: string;
  company_name?: string;
  country?: string;
  phone?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(SecureStorage.getToken());
  const [isAuthenticated, setIsAuthenticated] = useState(!!SecureStorage.getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (isMounted) {
            setUser(response.data);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          if (isMounted) {
            SecureStorage.removeToken();
            setToken(null);
            setIsAuthenticated(false);
          }
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };
    
    loadUser();
    
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      SecureStorage.setToken(access_token);
      SecureStorage.setUserData(userData);
      setToken(access_token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message);
      
      // Gestion des erreurs de validation Pydantic
      let errorMessage = "Échec de la connexion";
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Erreurs de validation multiples
          errorMessage = error.response.data.detail
            .map((err: any) => err.msg || err.message || "Erreur de validation")
            .join(", ");
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (typeof error.response.data.detail === 'object') {
          errorMessage = error.response.data.detail.msg || error.response.data.detail.message || "Erreur de validation";
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register/phase1', userData);
      return { success: true, message: response.data.message };
    } catch (error: any) {
      console.error("Registration failed:", error.response?.data || error.message);
      
      // Gestion des erreurs de validation Pydantic
      let errorMessage = "Échec de l'inscription";
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          // Erreurs de validation multiples
          errorMessage = error.response.data.detail
            .map((err: any) => err.msg || err.message || "Erreur de validation")
            .join(", ");
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (typeof error.response.data.detail === 'object') {
          errorMessage = error.response.data.detail.msg || error.response.data.detail.message || "Erreur de validation";
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    SecureStorage.clearAll();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const contextValue = useMemo(() => ({
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    login, 
    register, 
    logout 
  }), [user, token, isAuthenticated, isLoading, login, register, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
