import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  FileText, 
  Bell, 
  Settings, 
  LogOut, 
  Eye, 
  Download, 
  Heart,
  AlertCircle,
  Home,
  FileCheck,
  Brain,
  ChevronRight,
  Calendar,
  Shield,
  Building,
  X,
  Send,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import SecureStorage from '../services/storage';

interface SupplierProfile {
  id: string;
  company_name: string;
  email: string;
  country: string;
  phone_number?: string;
  profile_completion_percentage?: string;
  profile_status?: string;
  documents_uploaded?: string;
  validated_by_admin?: boolean;
  validation_notes?: string;
  updated_at?: string;
  created_at?: string;
}

interface TenderItem {
  id: string;
  title: string;
  reference: string;
  category: string;
  opening_date?: string;
  closing_date: string;
  status: string;
  tender_type: string;
  can_view: boolean;
  can_express_interest: boolean;
  can_submit_bid: boolean;
  can_download_documents: boolean;
  missing_requirements: string[];
  description?: string;
}

interface TenderListResponse {
  tenders: TenderItem[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_prev: boolean;
}

const SupplierDashboardPhase1Page: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('accueil');
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [tenderFilter, setTenderFilter] = useState('all');
  const [supplierProfile, setSupplierProfile] = useState<SupplierProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [tendersLoading, setTendersLoading] = useState(true);
  const [tendersError, setTendersError] = useState<string | null>(null);
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [interestMessage, setInterestMessage] = useState('');
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);

  const getApiBaseUrl = () => {
    const apiUrl = process.env['REACT_APP_API_URL'] || 'http://localhost:8000';
    return apiUrl.replace(/\/api\/v1\/?$/, '');
  };

  const handleUnauthorized = () => {
    toast.error('Session expirée. Veuillez vous reconnecter.');
    SecureStorage.removeToken();
    navigate('/login');
  };

  const ensureAuthToken = () => {
    const token = SecureStorage.getToken();
    if (!token || SecureStorage.isTokenExpired(token)) {
      handleUnauthorized();
      return null;
    }
    return token;
  };

  const loadProfile = async (token: string) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/suppliers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Impossible de charger le profil fournisseur.');
      }

      const data: SupplierProfile = await response.json();
      setSupplierProfile(data);
    } catch (error: any) {
      console.error('Erreur profil fournisseur:', error);
      setProfileError(error.message || 'Erreur de chargement du profil.');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadTenders = async (token: string) => {
    setTendersLoading(true);
    setTendersError(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/tenders?status=published&limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Impossible de charger les appels d’offres.');
      }

      const data: TenderListResponse = await response.json();
      setTenders(Array.isArray(data?.tenders) ? data.tenders : []);
    } catch (error: any) {
      console.error('Erreur AO fournisseurs:', error);
      setTendersError(error.message || 'Erreur de chargement des appels d’offres.');
    } finally {
      setTendersLoading(false);
    }
  };

  useEffect(() => {
    const token = ensureAuthToken();
    if (!token) return;
    loadProfile(token);
    loadTenders(token);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR');
  };

  const supplierName = supplierProfile?.company_name || user?.company_name || user?.email || 'Votre entreprise';
  const profileCompletion = supplierProfile?.profile_completion_percentage
    ? parseInt(supplierProfile.profile_completion_percentage, 10)
    : 0;
  const lastConnection = supplierProfile?.updated_at
    ? formatDate(supplierProfile.updated_at)
    : supplierProfile?.created_at
    ? formatDate(supplierProfile.created_at)
    : '—';
  const profileStatus = supplierProfile?.profile_status || 'phase_1_complete';
  const isProfileValidated = Boolean(supplierProfile?.validated_by_admin);
  const canSubmitOffers = profileStatus === 'profile_complete' && isProfileValidated;
  
  const notifications = [
    { id: 1, type: 'new_tender', message: 'Un nouvel appel d\'offres "Fourniture de tests VIH" est ouvert jusqu\'au 30/10.', time: 'Il y a 2 heures' },
    { id: 2, type: 'profile', message: 'Votre profil est incomplet : ajoutez votre licence pharmaceutique.', time: 'Il y a 1 jour' },
    { id: 3, type: 'info', message: 'Votre compte est en cours d\'examen par la DAQP.', time: 'Il y a 2 jours' }
  ];

  const handleShowInterest = (tender: TenderItem) => {
    if (!tender.can_express_interest) {
      toast.error('Votre profil ne permet pas encore de manifester votre intérêt pour cet appel d’offres.');
      return;
    }
    setSelectedTenderId(tender.id);
    setShowInterestModal(true);
  };

  const handleConfirmInterest = async () => {
    if (!selectedTenderId) return;
    const token = ensureAuthToken();
    if (!token) return;

    setIsSubmittingInterest(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/v1/tenders/${selectedTenderId}/interest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: interestMessage || undefined,
          contact_preference: 'email'
        })
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Impossible d’enregistrer votre intérêt.');
      }

      toast.success('Votre intérêt a bien été enregistré. Vous serez alerté dès l’ouverture des soumissions.');
      setShowInterestModal(false);
      setInterestMessage('');
      setSelectedTenderId(null);
      const freshToken = ensureAuthToken();
      if (freshToken) {
        loadTenders(freshToken);
      }
    } catch (error: any) {
      console.error('Erreur manifestation intérêt:', error);
      toast.error(error.message || 'Erreur lors de la manifestation d’intérêt.');
    } finally {
      setIsSubmittingInterest(false);
    }
  };

  const handleRestrictedAction = (action: string) => {
    const reason = isProfileValidated
      ? 'Votre profil doit être complet pour accéder à cette fonctionnalité.'
      : 'Votre compte doit d’abord être validé par la DAQP.';
    toast.error(`⛔ ${reason} (${action})`, { duration: 5000 });
  };

  const handleAIMessage = () => {
    if (aiMessage.trim()) {
      toast.success('Message envoyé à Cami ! Elle vous répondra bientôt.', {
        duration: 3000,
      });
      setAiMessage('');
    }
  };

  const getTenderFilterKey = (tender: TenderItem) => {
    const now = Date.now();
    const opening = tender.opening_date ? new Date(tender.opening_date).getTime() : null;
    const closing = tender.closing_date ? new Date(tender.closing_date).getTime() : null;

    if (closing && closing < now) return 'closed';
    if (opening && opening > now) return 'upcoming';
    return 'current';
  };

  const filteredTenders = tenders.filter((tender) => {
    if (tenderFilter === 'all') return true;
    return getTenderFilterKey(tender) === tenderFilter;
  });

  const openTendersCount = tenders.filter((tender) => getTenderFilterKey(tender) === 'current').length;
  const selectedTender = selectedTenderId ? tenders.find((t) => t.id === selectedTenderId) : null;
  const profileCompletionValue = Number.isFinite(profileCompletion) ? Math.min(Math.max(profileCompletion, 0), 100) : 0;
  const profileStatusMessage = (() => {
    switch (profileStatus) {
      case 'profile_complete':
        return 'Votre profil est complet et en cours de revue.';
      case 'phase_1_complete':
        return 'Votre profil est en attente de validation par la DAQP.';
      case 'profile_incomplete':
        return 'Veuillez compléter les informations requises pour accéder à toutes les fonctionnalités.';
      case 'profile_partial':
        return 'Complétez la phase 2 pour débloquer l’accès complet.';
      default:
        return 'Contactez le support pour plus d’informations.';
    }
  })();

  const renderContent = () => {
    switch (activeSection) {
      case 'accueil':
        return (
          <div className="space-y-6">
            {/* En-tête contextuel */}
            <div className="bg-gradient-to-r from-cameg-blue/10 to-blue-600/10 border border-cameg-blue/20 rounded-xl p-8">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-cameg-blue rounded-full flex items-center justify-center">
                  <span className="text-3xl">👋</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-cameg-dark mb-2">
                    Bienvenue sur CAMEG-CHAIN, {supplierName}
                  </h2>
                  <p className="text-lg text-gray-700 mb-4">
                    Votre compte est actuellement actif avec un accès limité.<br />
                    Vous pouvez consulter les appels d'offres publics et compléter votre profil pour débloquer toutes les fonctionnalités.
                  </p>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setActiveSection('profil')}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <FileCheck className="h-4 w-4" />
                      <span>Compléter mon profil</span>
                    </button>
                    <button 
                      onClick={() => setActiveSection('tenders')}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Consulter les appels d'offres</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cartes de statut en grille */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Profil complété */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cameg-dark">Profil complété</h3>
                    <p className="text-2xl font-bold text-orange-600">
                      {profileLoading ? '...' : `${profileCompletionValue}%`}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${profileLoading ? 0 : profileCompletionValue}%` }}
                  ></div>
                </div>
                <button 
                  onClick={() => setActiveSection('profil')}
                  className="btn-outline w-full text-sm"
                >
                  Continuer
                </button>
              </div>

              {/* Appels d'offres disponibles */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cameg-dark">Appels d'offres disponibles</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {tendersLoading ? '...' : openTendersCount}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSection('tenders')}
                  className="btn-outline w-full text-sm"
                >
                  Voir la liste
                </button>
              </div>

              {/* Dernière connexion */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cameg-dark">Dernière connexion</h3>
                    <p className="text-sm text-gray-600">{lastConnection}</p>
                  </div>
                </div>
              </div>

              {/* Statut du compte */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cameg-dark">Statut du compte</h3>
                    <p className={`text-sm font-medium ${isProfileValidated ? 'text-green-600' : 'text-orange-600'}`}>
                      {isProfileValidated ? 'Validé' : 'Actif (limité)'}
                    </p>
                  </div>
                </div>
                <button className="text-cameg-blue text-sm hover:underline">
                  En savoir plus
                </button>
              </div>
            </div>

            {/* Section Appels d'offres récents */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-cameg-dark flex items-center space-x-2">
                  <span className="text-2xl">📢</span>
                  <span>Appels d'offres en cours</span>
                </h3>
                <button 
                  onClick={() => setActiveSection('tenders')}
                  className="text-cameg-blue hover:underline flex items-center space-x-1"
                >
                  <span>Voir tout</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Filtre rapide */}
              <div className="flex space-x-2 mb-6">
                {[
                  { key: 'all', label: 'Tous' },
                  { key: 'current', label: 'En cours' },
                  { key: 'upcoming', label: 'À venir' },
                  { key: 'closed', label: 'Clôturés' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setTenderFilter(filter.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      tenderFilter === filter.key
                        ? 'bg-cameg-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Liste des appels d'offres */}
              <div className="space-y-4">
                {tendersLoading ? (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Chargement des appels d'offres...</span>
                  </div>
                ) : tendersError ? (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                    {tendersError}
                  </div>
                ) : filteredTenders.slice(0, 3).length === 0 ? (
                  <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    Aucun appel d'offres disponible pour le moment.
                  </div>
                ) : (
                  filteredTenders.slice(0, 3).map((tender) => {
                    const isCurrent = getTenderFilterKey(tender) === 'current';
                    const canExpress = tender.can_express_interest;
                    const canSubmit = canSubmitOffers && tender.can_submit_bid;
                    return (
                      <div key={tender.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-cameg-dark">{tender.title}</h4>
                            <p className="text-gray-600">Catégorie: {tender.category}</p>
                            <p className="text-gray-600">Clôture: {formatDate(tender.closing_date)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isCurrent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isCurrent ? 'En cours' : 'Clôturé'}
                          </span>
                        </div>
                        <div className="flex space-x-3 flex-wrap">
                          <button className="btn-outline flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span>Consulter</span>
                          </button>
                          <button 
                            onClick={() => (canExpress ? handleShowInterest(tender) : handleRestrictedAction('manifester votre intérêt'))}
                            className={`btn-primary flex items-center space-x-2 ${canExpress ? '' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={!canExpress}
                          >
                            <Heart className="h-4 w-4" />
                            <span>Manifester mon intérêt</span>
                          </button>
                          <button 
                            onClick={() => (canSubmit ? toast('Soumission non implémentée') : handleRestrictedAction('soumettre une offre'))}
                            className={`btn-outline flex items-center space-x-2 ${canSubmit ? '' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={!canSubmit}
                          >
                            <Send className="h-4 w-4" />
                            <span>Soumettre une offre</span>
                          </button>
                        </div>
                        {!canSubmit && (
                          <div className="mt-2 text-sm text-orange-600">
                            Complétez et validez votre profil pour activer cette option.
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bloc IA - Assistant d'inscription intelligente */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🧠</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-cameg-dark mb-2">
                    Cami - Votre assistante IA
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Bonjour {supplierName.split(' ')[0]} 👋<br />
                    Je suis votre assistante IA. Je peux vous aider à compléter votre profil, rechercher des fournisseurs partenaires ou comprendre les critères de préqualification.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => setActiveSection('profil')}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <span className="text-lg">💡</span>
                      <span>Compléter mon profil maintenant</span>
                    </button>
                    <button 
                      onClick={() => setShowAIChat(true)}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <span className="text-lg">🔍</span>
                      <span>Rechercher un produit ou un fournisseur</span>
                    </button>
                    <button 
                      onClick={() => setShowAIChat(true)}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <span className="text-lg">❓</span>
                      <span>Comprendre la préqualification</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloc Mes notifications */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cameg-dark flex items-center space-x-2">
                  <span className="text-xl">📬</span>
                  <span>Mes notifications</span>
                </h3>
                <button 
                  onClick={() => setActiveSection('notifications')}
                  className="text-cameg-blue hover:underline"
                >
                  Voir tout
                </button>
              </div>
              <div className="space-y-3">
                {notifications.slice(0, 2).map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bell className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'profil':
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-cameg-dark mb-4">Mon profil</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">
                    {profileLoading ? 'Chargement du statut...' : profileStatusMessage}
                  </span>
                </div>
                <p className="text-yellow-700 mt-2">
                  {isProfileValidated
                    ? 'Votre compte est validé. Les mises à jour importantes doivent passer par l’administrateur.'
                    : 'Votre profil sera accessible en modification une fois votre compte validé par la DAQP.'}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Nom de l'entreprise</label>
                  <div className="form-input bg-gray-50" style={{ pointerEvents: 'none' }}>
                    {profileLoading ? 'Chargement...' : supplierProfile?.company_name || '—'}
                  </div>
                </div>
                <div>
                  <label className="form-label">Pays</label>
                  <div className="form-input bg-gray-50" style={{ pointerEvents: 'none' }}>
                    {profileLoading ? 'Chargement...' : supplierProfile?.country || '—'}
                  </div>
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <div className="form-input bg-gray-50" style={{ pointerEvents: 'none' }}>
                    {profileLoading ? 'Chargement...' : supplierProfile?.email || user?.email || '—'}
                  </div>
                </div>
                <div>
                  <label className="form-label">Téléphone</label>
                  <div className="form-input bg-gray-50" style={{ pointerEvents: 'none' }}>
                    {profileLoading ? 'Chargement...' : supplierProfile?.phone_number || '+---'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tenders':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h2 className="text-2xl font-bold text-cameg-dark mb-4 flex items-center space-x-2">
                <span className="text-2xl">📢</span>
                <span>Appels d'offres</span>
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  <strong>Information :</strong> Les fournisseurs en attente de validation peuvent consulter les appels d'offres et manifester leur intérêt.
                  La soumission complète est réservée aux comptes validés.
                </p>
              </div>

              {/* Filtre rapide */}
              <div className="flex space-x-2 mb-6">
                {[
                  { key: 'all', label: 'Tous' },
                  { key: 'current', label: 'En cours' },
                  { key: 'upcoming', label: 'À venir' },
                  { key: 'closed', label: 'Clôturés' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setTenderFilter(filter.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      tenderFilter === filter.key
                        ? 'bg-cameg-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {tendersLoading ? (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Chargement des appels d'offres...</span>
                  </div>
                ) : tendersError ? (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                    {tendersError}
                  </div>
                ) : filteredTenders.length === 0 ? (
                  <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    Aucun appel d'offres ne correspond à ce filtre.
                  </div>
                ) : (
                  filteredTenders.map((tender) => {
                    const filterKey = getTenderFilterKey(tender);
                    const canExpress = tender.can_express_interest;
                    const canSubmit = canSubmitOffers && tender.can_submit_bid;
                    return (
                      <div key={tender.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-cameg-dark mb-2">{tender.title}</h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Référence:</span> {tender.reference}
                              </div>
                              <div>
                                <span className="font-medium">Catégorie:</span> {tender.category}
                              </div>
                              <div>
                                <span className="font-medium">Clôture:</span> {formatDate(tender.closing_date)}
                              </div>
                              <div>
                                <span className="font-medium">Statut:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  filterKey === 'closed' 
                                    ? 'bg-gray-100 text-gray-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {filterKey === 'closed' ? 'Clôturé' : 'En cours'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <button className="btn-outline flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span>Consulter l'appel d'offres</span>
                          </button>
                          <button 
                            className={`btn-outline flex items-center space-x-2 ${tender.can_download_documents ? '' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={!tender.can_download_documents}
                          >
                            <Download className="h-4 w-4" />
                            <span>Télécharger le dossier complet</span>
                          </button>
                          <button 
                            onClick={() => (canExpress ? handleShowInterest(tender) : handleRestrictedAction('manifester votre intérêt'))}
                            className={`btn-primary flex items-center space-x-2 ${canExpress ? '' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={!canExpress}
                          >
                            <Heart className="h-4 w-4" />
                            <span>Manifester mon intérêt</span>
                          </button>
                          <button 
                            onClick={() => (canSubmit ? toast('Soumission non implémentée') : handleRestrictedAction('soumettre une offre'))}
                            className={`btn-outline flex items-center space-x-2 ${canSubmit ? '' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={!canSubmit}
                          >
                            <Send className="h-4 w-4" />
                            <span>Soumettre une offre</span>
                          </button>
                        </div>
                        {!canSubmit && (
                          <div className="mt-3 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                            Complétez et validez votre profil pour activer la soumission.
                            {tender.missing_requirements?.length > 0 && (
                              <div className="text-xs text-orange-500 mt-1">
                                Manquants: {tender.missing_requirements.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-cameg-dark mb-4">Documents</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  📎 Vous pourrez uploader vos documents une fois votre compte validé.
                </h3>
                <p className="text-yellow-700">
                  "La DAQP vérifiera d'abord vos informations de base avant d'autoriser la soumission de documents."
                </p>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-cameg-dark mb-4">Notifications</h2>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cameg-gray">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="container-custom">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-cameg-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <h1 className="text-2xl font-bold text-cameg-dark">CAMEG-CHAIN</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-cameg-blue relative">
                  <Bell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cameg-blue rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium">{supplierName}</span>
              </div>
              <button 
                className="btn-outline"
                onClick={() => {
                  logout();
                  toast.success('Déconnexion réussie');
                  navigate('/login');
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        {profileError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {profileError}
          </div>
        )}
        <div className="flex gap-8">
          {/* Sidebar - Menu latéral avec couleurs spécifiques */}
          <div className="w-64 bg-[#003366] rounded-xl shadow-soft p-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('accueil')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                  activeSection === 'accueil' 
                    ? 'bg-cameg-green text-white font-semibold' 
                    : 'text-white hover:bg-cameg-green/20'
                }`}
              >
                {activeSection === 'accueil' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cameg-green rounded-r"></div>
                )}
                <Home className="h-5 w-5" />
                <span>Accueil</span>
              </button>
              <button
                onClick={() => setActiveSection('tenders')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                  activeSection === 'tenders' 
                    ? 'bg-cameg-green text-white font-semibold' 
                    : 'text-white hover:bg-cameg-green/20'
                }`}
              >
                {activeSection === 'tenders' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cameg-green rounded-r"></div>
                )}
                <FileText className="h-5 w-5" />
                <span>Appels d'offres</span>
              </button>
              <button
                onClick={() => setActiveSection('profil')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                  activeSection === 'profil' 
                    ? 'bg-cameg-green text-white font-semibold' 
                    : 'text-white hover:bg-cameg-green/20'
                }`}
              >
                {activeSection === 'profil' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cameg-green rounded-r"></div>
                )}
                <FileCheck className="h-5 w-5" />
                <span>Mon profil</span>
              </button>
              <button
                onClick={() => setShowAIChat(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-white hover:bg-cameg-green/20"
              >
                <Brain className="h-5 w-5" />
                <span>Assistance IA</span>
              </button>
              <button
                onClick={() => setActiveSection('notifications')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                  activeSection === 'notifications' 
                    ? 'bg-cameg-green text-white font-semibold' 
                    : 'text-white hover:bg-cameg-green/20'
                }`}
              >
                {activeSection === 'notifications' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cameg-green rounded-r"></div>
                )}
                <Bell className="h-5 w-5" />
                <span>Support</span>
                {notifications.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveSection('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                  activeSection === 'settings' 
                    ? 'bg-cameg-green text-white font-semibold' 
                    : 'text-white hover:bg-cameg-green/20'
                }`}
              >
                {activeSection === 'settings' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cameg-green rounded-r"></div>
                )}
                <Settings className="h-5 w-5" />
                <span>Paramètres</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Chat drawer IA */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50">
          <div className="bg-white rounded-t-xl w-96 h-[600px] flex flex-col">
            {/* Header du chat */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🧠</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Cami - Assistante IA</h3>
                    <p className="text-sm opacity-90">En ligne</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIChat(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages du chat */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">🧠</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-gray-800">
                    Bonjour {supplierName.split(' ')[0]} ! 👋<br />
                    Je suis là pour vous aider. Que puis-je faire pour vous aujourd'hui ?
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 justify-end">
                <div className="bg-cameg-blue text-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm">
                    Comment puis-je compléter mon profil plus rapidement ?
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">🧠</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-gray-800">
                    Pour accélérer votre validation, je recommande de :
                    <br />• Ajouter votre licence pharmaceutique
                    <br />• Compléter vos informations légales
                    <br />• Télécharger vos certificats GMP/ISO
                  </p>
                </div>
              </div>
            </div>

            {/* Input du chat */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cameg-blue"
                  onKeyPress={(e) => e.key === 'Enter' && handleAIMessage()}
                />
                <button
                  onClick={handleAIMessage}
                  className="bg-cameg-blue text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de manifestation d'intérêt */}
      {showInterestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-cameg-dark mb-4">
              Manifester mon intérêt
            </h3>
            <div className="text-sm text-gray-600 mb-4">
              {selectedTender ? (
                <>
                  <p className="font-medium text-cameg-dark">{selectedTender.title}</p>
                  <p>Référence : {selectedTender.reference}</p>
                </>
              ) : (
                <p>Sélectionnez un appel d'offres pour continuer.</p>
              )}
            </div>
            <p className="text-gray-600 mb-4">
              Vous recevrez une notification lorsque la phase de soumission sera ouverte. Vous pouvez laisser un message à l'équipe DAQP.
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-4 focus:ring-2 focus:ring-cameg-blue"
              rows={4}
              placeholder="Message (optionnel)"
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowInterestModal(false)}
                className="btn-outline flex-1"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmInterest}
                className="btn-primary flex-1"
                disabled={isSubmittingInterest}
              >
                {isSubmittingInterest ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bandeau d'information institutionnelle */}
      <div className="bg-cameg-blue text-white py-6 mt-12">
        <div className="container-custom">
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">
                Plateforme officielle propulsée par la CAMEG-Togo et la Direction de l'Assurance Qualité Pharmaceutique
              </p>
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span className="text-sm">CAMEG-Togo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Ministère de la Santé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboardPhase1Page;
