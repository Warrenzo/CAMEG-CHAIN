import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Building2,
  Globe,
  Phone,
  Mail,
  Lock,
  Shield,
  Brain,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    country: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.company_name.trim()) {
      toast.error('Le nom de l\'entreprise est requis');
      return false;
    }
    if (!formData.country) {
      toast.error('Le pays est requis');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Le numéro de téléphone est requis');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('L\'adresse email est requise');
      return false;
    }
    if (formData.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return false;
    }
    if (!formData.acceptTerms) {
      toast.error('Vous devez accepter les conditions d\'utilisation');
      return false;
    }
    return true;
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const { confirmPassword, acceptTerms, phone, ...registrationData } = formData;
      // Mapper phone vers phone_number pour correspondre au schéma backend
      const mappedData = {
        ...registrationData,
        phone_number: phone
      };
      const result = await register(mappedData);
      
      if (result.success) {
        toast.success('✅ Votre compte a été créé avec succès !\nVous pouvez dès maintenant consulter les appels d\'offres publics.\nComplétez votre profil pour accéder à toutes les fonctionnalités.', {
          duration: 8000,
        });
        // Redirection vers le tableau de bord restreint (Phase 1)
        navigate('/supplier-dashboard-phase1');
      } else {
        toast.error(result.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      toast.error('Une erreur inattendue s\'est produite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cameg-gray">
      {/* Header avec retour */}
      <div className="bg-white shadow-soft">
        <div className="container-custom">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="inline-flex items-center text-cameg-blue hover:text-blue-700">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </Link>
            <Link to="/login" className="btn-outline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>

      {/* Layout en 2 zones */}
      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Zone gauche - Confiance et contexte */}
          <div className="space-y-8">
            {/* Logo et phrase institutionnelle */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="w-20 h-20 bg-cameg-blue rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">C</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-cameg-dark mb-2">
                CAMEG-CHAIN
              </h1>
              <p className="text-lg text-cameg-blue font-medium">
                Plateforme officielle de la CAMEG-Togo — Direction de l'Assurance Qualité Pharmaceutique
              </p>
            </div>

            {/* Illustration légère - Carte du Togo stylisée */}
            <div className="relative">
              <div className="bg-gradient-to-br from-cameg-blue/10 to-blue-600/10 rounded-2xl p-8 border border-cameg-blue/20">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 relative">
                    {/* Carte du Togo stylisée avec points connectés */}
                    <div className="w-full h-full bg-gradient-to-br from-cameg-green to-green-600 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">TG</span>
                      </div>
                      {/* Points connectés (chaîne logistique) */}
                      <div className="absolute top-4 left-4 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <div className="absolute top-8 right-6 w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-6 left-8 w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      <div className="absolute bottom-4 right-4 w-3 h-3 bg-white rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                      {/* Lignes de connexion */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line x1="25" y1="25" x2="75" y2="35" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2"/>
                        <line x1="75" y1="35" x2="60" y2="75" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2"/>
                        <line x1="60" y1="75" x2="25" y2="25" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-cameg-dark mb-3">
                    Chaîne logistique connectée
                  </h3>
                  <p className="text-gray-600">
                    Réseau de fournisseurs pharmaceutiques au Togo et en Afrique de l'Ouest
                  </p>
                </div>
              </div>
            </div>

            {/* Texte d'introduction */}
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-cameg-dark mb-4">
                Créez votre compte fournisseur
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Créez votre compte fournisseur pour collaborer avec la CAMEG dans un cadre de transparence et d'innovation.
              </p>
            </div>

            {/* Éléments de réassurance */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Connexion sécurisée — vos données sont protégées.</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Brain className="h-5 w-5 text-blue-600" />
                <span>Plateforme propulsée par IA — CAMEG-CHAIN.</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Building className="h-5 w-5 text-cameg-blue" />
                <span>Développée sous l'autorité du Ministère de la Santé du Togo.</span>
              </div>
            </div>
          </div>

          {/* Zone droite - Formulaire d'inscription */}
          <div className="bg-white rounded-xl shadow-soft p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-cameg-dark mb-2">
                Créer un compte fournisseur
              </h2>
              <p className="text-gray-600">
                Commencez votre inscription pour rejoindre la plateforme CAMEG-CHAIN.<br />
                Vous pourrez compléter votre profil plus tard.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="company_name" className="form-label flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-cameg-blue" />
                  <span>Nom de l'entreprise *</span>
                </label>
                <div className="relative">
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    required
                    className={`form-input ${
                      formData.company_name.trim() 
                        ? 'border-green-500 focus:border-green-500' 
                        : ''
                    }`}
                    placeholder="Nom de votre entreprise"
                    value={formData.company_name}
                    onChange={handleInputChange}
                  />
                  {formData.company_name.trim() && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="country" className="form-label flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-cameg-blue" />
                  <span>Pays *</span>
                </label>
                <div className="relative">
                  <select
                    id="country"
                    name="country"
                    required
                    className={`form-input ${
                      formData.country 
                        ? 'border-green-500 focus:border-green-500' 
                        : ''
                    }`}
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionnez votre pays</option>
                    <option value="TG">Togo</option>
                    <option value="BF">Burkina Faso</option>
                    <option value="CI">Côte d'Ivoire</option>
                    <option value="ML">Mali</option>
                    <option value="NE">Niger</option>
                    <option value="SN">Sénégal</option>
                    <option value="IN">Inde</option>
                    <option value="CN">Chine</option>
                    <option value="DE">Allemagne</option>
                    <option value="FR">France</option>
                    <option value="US">États-Unis</option>
                    <option value="OTHER">Autre</option>
                  </select>
                  {formData.country && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="form-label flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-cameg-blue" />
                  <span>Téléphone professionnel *</span>
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className={`form-input ${
                      formData.phone.trim() 
                        ? 'border-green-500 focus:border-green-500' 
                        : ''
                    }`}
                    placeholder="+228 XX XX XX XX"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  {formData.phone.trim() && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="form-label flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-cameg-blue" />
                  <span>Adresse e-mail professionnelle *</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`form-input ${
                      formData.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                        ? 'border-green-500 focus:border-green-500' 
                        : formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }`}
                    placeholder="votre@entreprise.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {formData.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                  {formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                  )}
                </div>
                {formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <p className="text-red-500 text-sm mt-1">Format d'email invalide</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="form-label flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-cameg-blue" />
                  <span>Mot de passe *</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`form-input pr-10 ${
                      formData.password.length >= 8 
                        ? 'border-green-500 focus:border-green-500' 
                        : formData.password.length > 0
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }`}
                    placeholder="Minimum 8 caractères"
                    value={formData.password}
                    onChange={handleInputChange}
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
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${strengthColors[passwordStrength - 1] || 'bg-gray-300'}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {strengthLabels[passwordStrength - 1] || 'Très faible'}
                      </span>
                    </div>
                    {passwordStrength < 3 && formData.password.length > 0 && (
                      <p className="text-red-500 text-sm mt-1">Ajoutez au moins une majuscule et un chiffre.</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-cameg-blue" />
                  <span>Confirmer le mot de passe *</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className={`form-input pr-10 ${
                      formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-500 focus:border-green-500' 
                        : formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }`}
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-600">Les mots de passe correspondent</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-sm text-red-600">Les mots de passe ne correspondent pas</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-cameg-blue focus:ring-cameg-blue border-gray-300 rounded"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                  J'accepte les{' '}
                  <button className="text-cameg-blue hover:text-blue-700">
                    conditions d'utilisation
                  </button>{' '}
                  et la{' '}
                  <button className="text-cameg-blue hover:text-blue-700">
                    politique de confidentialité
                  </button>
                </label>
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
                  {isLoading ? 'Création du compte en cours...' : 'Créer mon compte'}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Déjà un compte ?{' '}
                  <Link to="/login" className="text-cameg-blue hover:text-blue-700 font-medium">
                    Se connecter
                  </Link>
                </p>
              </div>
            </form>

            {/* Additional Info */}
            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                Besoin d'assistance ? Contactez{' '}
                <a href="mailto:support@cameg-chain.tg" className="text-cameg-blue hover:text-blue-700">
                  support@cameg-chain.tg
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
