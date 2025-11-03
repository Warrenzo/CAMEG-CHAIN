import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement actual password reset API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setIsSubmitted(true);
      toast.success('Instructions de réinitialisation envoyées par email');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-cameg-gray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-cameg-dark mb-4">
              Email envoyé !
            </h2>
            <p className="text-gray-600 mb-8">
              Nous avons envoyé les instructions de réinitialisation à{' '}
              <span className="font-medium">{email}</span>
            </p>
            
            <div className="space-y-4">
              <Link to="/login" className="btn-primary w-full flex justify-center items-center">
                Retour à la connexion
              </Link>
              <button
                onClick={() => setIsSubmitted(false)}
                className="btn-outline w-full"
              >
                Réessayer avec un autre email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cameg-gray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/login" className="inline-flex items-center text-cameg-blue hover:text-blue-700 mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à la connexion
          </Link>
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-cameg-blue rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-cameg-dark">
            Mot de passe oublié ?
          </h2>
          <p className="mt-2 text-gray-600">
            Entrez votre adresse email pour recevoir les instructions de réinitialisation
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
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                {isLoading ? 'Envoi en cours...' : 'Envoyer les instructions'}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link to="/login" className="text-cameg-blue hover:text-blue-700">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
