import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success('Connexion réussie !');
        navigate('/dashboard');
      } else {
        // Gestion des erreurs spécifiques selon les spécifications
        if (result.error?.includes('invalid') || result.error?.includes('incorrect')) {
          toast.error('❌ Identifiants incorrects. Vérifiez votre e-mail et votre mot de passe.');
        } else if (result.error?.includes('pending') || result.error?.includes('validation')) {
          toast.error('⚠️ Votre compte est en attente de validation par la DAQP.\nVous serez informé dès qu\'il sera activé.\nEn attendant, vous pouvez consulter les appels d\'offres publics.', {
            duration: 6000,
          });
        } else {
          toast.error(result.error || 'Erreur de connexion');
        }
      }
    } catch (error) {
      toast.error('Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cameg-gray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-cameg-blue hover:text-blue-700 mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Link>
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-cameg-blue rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-cameg-dark">
            Connexion à la plateforme
          </h2>
          <p className="mt-2 text-gray-600">
            Accès sécurisé
          </p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="form-input pr-10"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-cameg-blue focus:ring-cameg-blue border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="text-cameg-blue hover:text-blue-700">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Vous n'avez pas encore de compte ?{' '}
                <Link to="/register" className="text-cameg-blue hover:text-blue-700 font-medium">
                  Créer un compte
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            En vous connectant, vous acceptez nos{' '}
            <button className="text-cameg-blue hover:text-blue-700">
              conditions d'utilisation
            </button>{' '}
            et notre{' '}
            <button className="text-cameg-blue hover:text-blue-700">
              politique de confidentialité
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
