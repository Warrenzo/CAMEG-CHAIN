import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Send, 
  FileText,
  XCircle,
  RefreshCw,
  AlertCircle,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import SecureStorage from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';

interface Tender {
  id: string;
  reference: string;
  title: string;
  description: string;
  category: string;
  publication_date: string;
  opening_date: string;
  closing_date: string;
  status: string;
  tender_type: string;
  estimated_value?: number;
  currency: string;
  bids_count: number;
  eoi_count: number;
  views_count: number;
}

const TendersManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  
  // Vérifier si l'utilisateur est ADMIN (pas SUPERADMIN)
  const isAdmin = user?.role === 'admin';

  // Fonction utilitaire pour obtenir l'URL de base de l'API sans duplication
  const getApiBaseUrl = () => {
    let apiUrl = process.env['REACT_APP_API_URL'] || 'http://localhost:8000';
    // S'assurer que l'URL ne se termine pas par /api/v1 pour éviter la duplication
    apiUrl = apiUrl.replace(/\/api\/v1\/?$/, '');
    return apiUrl;
  };

  const [newTender, setNewTender] = useState({
    reference: '',
    title: '',
    description: '',
    category: '',
    opening_date: '',
    closing_date: '',
    tender_type: 'open',
    estimated_value: '',
    currency: 'XOF',
    eligibility_rules: {},
    required_documents: [] as string[],
    evaluation_criteria: {}
  });

  useEffect(() => {
    loadTenders();
  }, []);

  const loadTenders = async () => {
    setLoading(true);
    try {
      const token = SecureStorage.getToken();
      if (!token) {
        toast.error('Vous devez être connecté pour accéder à cette fonctionnalité');
        setLoading(false);
        return;
      }

      // Vérifier si le token est expiré avant de faire la requête
      if (SecureStorage.isTokenExpired(token)) {
        console.info('Token expiré détecté, redirection vers la page de connexion');
        SecureStorage.removeToken();
        setLoading(false);
        toast('Votre session a expiré. Veuillez vous reconnecter.', { icon: '⏰', duration: 3000 });
        window.location.href = '/login';
        return;
      }

      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/v1/tenders?skip=0&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.info('Token expiré ou invalide détecté par le serveur');
        SecureStorage.removeToken();
        toast('Votre session a expiré. Veuillez vous reconnecter.', { icon: '⏰', duration: 3000 });
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setTenders(Array.isArray(data) ? data : (data.tenders || []));
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Erreur inconnue' }));
        toast.error(errorData.detail || 'Erreur lors du chargement des appels d\'offres');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTender.title || !newTender.description || !newTender.category || !newTender.reference) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier que la description n'est pas vide après trim
    if (!newTender.description.trim()) {
      toast.error('La description ne peut pas être vide');
      return;
    }

    if (!newTender.opening_date || !newTender.closing_date) {
      toast.error('Veuillez sélectionner les dates d\'ouverture et de clôture');
      return;
    }

    // Valider le format des dates avant de les comparer
    // Le format datetime-local est déjà YYYY-MM-DDTHH:mm
    try {
      // Si la date contient déjà 'T', c'est déjà au format datetime-local
      // Sinon, on ajoute 'T00:00:00' pour les anciens formats
      const openingDateStr = newTender.opening_date.includes('T') 
        ? newTender.opening_date 
        : newTender.opening_date + 'T00:00:00';
      const closingDateStr = newTender.closing_date.includes('T')
        ? newTender.closing_date
        : newTender.closing_date + 'T23:59:59';
      
      const openingDate = new Date(openingDateStr);
      const closingDate = new Date(closingDateStr);
      
      if (isNaN(openingDate.getTime()) || isNaN(closingDate.getTime())) {
        console.error('Dates invalides:', { 
          opening: newTender.opening_date, 
          closing: newTender.closing_date,
          openingParsed: openingDateStr,
          closingParsed: closingDateStr
        });
        toast.error('Format de date invalide. Veuillez vérifier les dates saisies.');
        return;
      }

      if (closingDate <= openingDate) {
        toast.error('La date de clôture doit être postérieure à la date d\'ouverture');
        return;
      }
    } catch (dateError) {
      console.error('Erreur de validation de date:', dateError);
      toast.error('Format de date invalide. Veuillez vérifier les dates saisies.');
      return;
    }

    try {
      const token = SecureStorage.getToken();
      if (!token) {
        toast.error('Vous devez être connecté pour créer un appel d\'offres');
        return;
      }

      // Convertir les dates au format ISO avec l'heure
      let openingDateISO: string | null = null;
      let closingDateISO: string | null = null;

      try {
        if (newTender.opening_date) {
          // Format datetime-local: YYYY-MM-DDTHH:mm (déjà au bon format)
          // Si la date contient déjà 'T', c'est déjà au format datetime-local
          const openingDateStr = newTender.opening_date.includes('T') 
            ? newTender.opening_date 
            : newTender.opening_date + 'T00:00:00';
          const openingDate = new Date(openingDateStr);
          if (isNaN(openingDate.getTime())) {
            throw new Error('Date d\'ouverture invalide');
          }
          openingDateISO = openingDate.toISOString();
        }

        if (newTender.closing_date) {
          // Format datetime-local: YYYY-MM-DDTHH:mm (déjà au bon format)
          const closingDateStr = newTender.closing_date.includes('T')
            ? newTender.closing_date
            : newTender.closing_date + 'T23:59:59';
          const closingDate = new Date(closingDateStr);
          if (isNaN(closingDate.getTime())) {
            throw new Error('Date de clôture invalide');
          }
          closingDateISO = closingDate.toISOString();
        }

        if (!openingDateISO || !closingDateISO) {
          toast.error('Les dates d\'ouverture et de clôture sont obligatoires');
          return;
        }
      } catch (dateError) {
        console.error('Erreur de conversion de date:', dateError);
        toast.error('Format de date invalide. Veuillez vérifier les dates saisies.');
        return;
      }

      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/v1/tenders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reference: newTender.reference.trim(),
          title: newTender.title.trim(),
          description: newTender.description.trim(), // Nettoyer les espaces
          category: newTender.category.trim(),
          opening_date: openingDateISO,
          closing_date: closingDateISO,
          tender_type: newTender.tender_type,
          estimated_value: newTender.estimated_value ? parseFloat(newTender.estimated_value) : null,
          currency: newTender.currency,
          eligibility_rules: newTender.eligibility_rules || {},
          required_documents: newTender.required_documents || [],
          evaluation_criteria: newTender.evaluation_criteria || {}
        })
      });

      if (response.ok) {
        toast.success('✅ Appel d\'offres créé avec succès');
        setIsCreating(false);
        setNewTender({
          reference: '',
          title: '',
          description: '',
          category: '',
          opening_date: '',
          closing_date: '',
          tender_type: 'open',
          estimated_value: '',
          currency: 'XOF',
          eligibility_rules: {},
          required_documents: [],
          evaluation_criteria: {}
        });
        loadTenders();
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Erreur inconnue' }));
        console.error('Erreur lors de la création:', { 
          status: response.status, 
          error: errorData,
          requestData: {
            reference: newTender.reference,
            title: newTender.title,
            opening_date: newTender.opening_date,
            closing_date: newTender.closing_date
          }
        });
        
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          SecureStorage.removeToken();
          window.location.href = '/login';
        } else if (response.status === 403) {
          const errorMessage = errorData.detail || 'Accès refusé. Vous devez être super-administrateur ou administrateur pour créer un appel d\'offres.';
          toast.error(errorMessage);
          console.warn('Rôle utilisateur actuel:', user?.role);
        } else if (response.status === 500) {
          const errorMessage = errorData.detail || 'Erreur serveur lors de la création de l\'appel d\'offres';
          toast.error(`Erreur serveur: ${errorMessage}`);
          console.error('Détails de l\'erreur serveur:', errorData);
          console.error('Données envoyées:', {
            reference: newTender.reference,
            title: newTender.title,
            description: newTender.description ? `${newTender.description.substring(0, 50)}...` : 'VIDE',
            category: newTender.category,
            opening_date: openingDateISO,
            closing_date: closingDateISO,
            tender_type: newTender.tender_type
          });
        } else {
          toast.error(errorData.detail || 'Erreur lors de la création de l\'appel d\'offres');
        }
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Erreur de connexion au serveur');
    }
  };

  const handleUpdateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTender) return;

    try {
      const token = SecureStorage.getToken();
      if (!token) {
        toast.error('Vous devez être connecté pour modifier un appel d\'offres');
        return;
      }

      // Convertir les dates au format ISO si nécessaire
      let openingDateISO: string | undefined;
      let closingDateISO: string | undefined;

      try {
        // Si une nouvelle date est fournie, la convertir
        if (newTender.opening_date) {
          // Format datetime-local: YYYY-MM-DDTHH:mm
          const openingDateStr = newTender.opening_date.includes('T') 
            ? newTender.opening_date 
            : newTender.opening_date + 'T00:00:00';
          const openingDate = new Date(openingDateStr);
          if (!isNaN(openingDate.getTime())) {
            openingDateISO = openingDate.toISOString();
          }
        }
        // Sinon, utiliser la date existante (déjà au format ISO)
        if (!openingDateISO && selectedTender.opening_date) {
          openingDateISO = selectedTender.opening_date;
        }

        if (newTender.closing_date) {
          // Format datetime-local: YYYY-MM-DDTHH:mm
          const closingDateStr = newTender.closing_date.includes('T')
            ? newTender.closing_date
            : newTender.closing_date + 'T23:59:59';
          const closingDate = new Date(closingDateStr);
          if (!isNaN(closingDate.getTime())) {
            closingDateISO = closingDate.toISOString();
          }
        }
        if (!closingDateISO && selectedTender.closing_date) {
          closingDateISO = selectedTender.closing_date;
        }
      } catch (dateError) {
        console.error('Erreur de conversion de date:', dateError);
        toast.error('Format de date invalide. Veuillez vérifier les dates saisies.');
        return;
      }

      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/v1/tenders/${selectedTender.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTender.title || selectedTender.title,
          description: newTender.description || selectedTender.description,
          category: newTender.category || selectedTender.category,
          opening_date: openingDateISO,
          closing_date: closingDateISO,
          tender_type: newTender.tender_type || selectedTender.tender_type,
          estimated_value: newTender.estimated_value ? parseFloat(newTender.estimated_value) : selectedTender.estimated_value,
          currency: newTender.currency || selectedTender.currency,
          eligibility_rules: newTender.eligibility_rules,
          required_documents: newTender.required_documents,
          evaluation_criteria: newTender.evaluation_criteria
        })
      });

      if (response.ok) {
        toast.success('✅ Appel d\'offres modifié avec succès');
        setIsEditing(false);
        setSelectedTender(null);
        loadTenders();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erreur lors de la modification');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    }
  };

  const handlePublishTender = async (tenderId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir publier cet appel d\'offres ? Une fois publié, il sera visible par tous les fournisseurs.')) {
      return;
    }

    try {
      const token = SecureStorage.getToken();
      if (!token) {
        toast.error('Vous devez être connecté pour publier un appel d\'offres');
        return;
      }

      if (!isAdmin) {
        toast.error('Seuls les administrateurs peuvent publier les appels d\'offres');
        return;
      }

      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/v1/tenders/${tenderId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('✅ Appel d\'offres publié avec succès');
        loadTenders();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erreur lors de la publication');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    }
  };

  const handleCloseTender = async (tenderId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir clôturer cet appel d\'offres ?')) {
      return;
    }

    try {
      const token = SecureStorage.getToken();
      if (!token) {
        toast.error('Vous devez être connecté pour clôturer un appel d\'offres');
        return;
      }

      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/v1/tenders/${tenderId}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('✅ Appel d\'offres clôturé avec succès');
        loadTenders();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erreur lors de la clôture');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    }
  };

  const handleEditClick = (tender: Tender) => {
    setSelectedTender(tender);
    const openingDate = tender.opening_date ? (tender.opening_date.split('T')[0] || '') : '';
    const closingDate = tender.closing_date ? (tender.closing_date.split('T')[0] || '') : '';
    setNewTender({
      reference: tender.reference,
      title: tender.title,
      description: tender.description,
      category: tender.category,
      opening_date: openingDate,
      closing_date: closingDate,
      tender_type: tender.tender_type,
      estimated_value: tender.estimated_value?.toString() || '',
      currency: tender.currency,
      eligibility_rules: {},
      required_documents: [],
      evaluation_criteria: {}
    });
    setIsEditing(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'evaluated': return 'text-purple-600 bg-purple-100';
      case 'awarded': return 'text-indigo-600 bg-indigo-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'draft': return 'Brouillon';
      case 'closed': return 'Clôturé';
      case 'open': return 'Ouvert';
      case 'evaluated': return 'Évalué';
      case 'awarded': return 'Attribué';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const renderTendersList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cameg-dark">Liste des Appels d'Offres</h2>
        <div className="flex space-x-3">
          <button
            onClick={loadTenders}
            className="btn-outline flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
          <button
            onClick={() => {
              setIsCreating(true);
              setIsEditing(false);
              setSelectedTender(null);
              setNewTender({
                reference: '',
                title: '',
                description: '',
                category: '',
                opening_date: '',
                closing_date: '',
                tender_type: 'open',
                estimated_value: '',
                currency: 'XOF',
                eligibility_rules: {},
                required_documents: [],
                evaluation_criteria: {}
              });
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Créer un AO</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-cameg-blue" />
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : tenders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">Aucun appel d'offres trouvé</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence / Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date clôture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soumissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenders.map((tender) => (
                  <tr key={tender.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tender.reference}</div>
                        <div className="text-sm text-gray-500">{tender.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tender.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tender.closing_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tender.status)}`}>
                        {getStatusText(tender.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tender.bids_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditClick(tender)}
                          disabled={tender.status === 'closed' || tender.status === 'awarded' || tender.status === 'cancelled'}
                          className="text-cameg-blue hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          Modifier
                        </button>
                        {/* Bouton Publier - visible uniquement pour les ADMIN et si le statut est draft */}
                        {isAdmin && tender.status === 'draft' && (
                          <button 
                            onClick={() => handlePublishTender(tender.id)}
                            className="text-green-600 hover:text-green-700 flex items-center space-x-1"
                            title="Publier l'appel d'offres (réservé aux administrateurs)"
                          >
                            <Globe className="h-4 w-4" />
                            <span>Publier</span>
                          </button>
                        )}
                        {tender.status !== 'closed' && tender.status !== 'awarded' && tender.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleCloseTender(tender.id)}
                            className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Clôturer</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderCreateOrEditTender = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cameg-dark">
          {isEditing ? 'Modifier un Appel d\'Offres' : 'Créer un Appel d\'Offres'}
        </h2>
        <button
          onClick={() => {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedTender(null);
          }}
          className="btn-outline"
        >
          Annuler
        </button>
      </div>

      <div className="card p-6">
        <form onSubmit={isEditing ? handleUpdateTender : handleCreateTender} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Référence de l'AO *</label>
              <input
                type="text"
                required
                value={newTender.reference}
                onChange={(e) => setNewTender(prev => ({ ...prev, reference: e.target.value }))}
                className="form-input"
                placeholder="Ex: AO-2025-001"
                disabled={isEditing}
              />
            </div>

            <div>
              <label className="form-label">Titre de l'AO *</label>
              <input
                type="text"
                required
                value={newTender.title}
                onChange={(e) => setNewTender(prev => ({ ...prev, title: e.target.value }))}
                className="form-input"
                placeholder="Ex: Fourniture de médicaments antipaludéens"
              />
            </div>

            <div>
              <label className="form-label">Catégorie *</label>
              <select
                required
                value={newTender.category}
                onChange={(e) => setNewTender(prev => ({ ...prev, category: e.target.value }))}
                className="form-input"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Médicaments">Médicaments</option>
                <option value="Équipements">Équipements</option>
                <option value="Tests diagnostiques">Tests diagnostiques</option>
                <option value="Consommables">Consommables</option>
                <option value="Services">Services</option>
              </select>
            </div>

            <div>
              <label className="form-label">Type d'AO</label>
              <select
                value={newTender.tender_type}
                onChange={(e) => setNewTender(prev => ({ ...prev, tender_type: e.target.value }))}
                className="form-input"
              >
                <option value="open">Ouvert</option>
                <option value="restricted">Restreint</option>
                <option value="negotiated">Négocié</option>
              </select>
            </div>

            <div>
              <label className="form-label">Date d'ouverture *</label>
              <input
                type="datetime-local"
                required
                value={newTender.opening_date}
                onChange={(e) => setNewTender(prev => ({ ...prev, opening_date: e.target.value }))}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Date de clôture *</label>
              <input
                type="datetime-local"
                required
                value={newTender.closing_date}
                onChange={(e) => setNewTender(prev => ({ ...prev, closing_date: e.target.value }))}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Valeur estimée</label>
              <input
                type="number"
                value={newTender.estimated_value}
                onChange={(e) => setNewTender(prev => ({ ...prev, estimated_value: e.target.value }))}
                className="form-input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="form-label">Devise</label>
              <select
                value={newTender.currency}
                onChange={(e) => setNewTender(prev => ({ ...prev, currency: e.target.value }))}
                className="form-input"
              >
                <option value="XOF">XOF (Franc CFA)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="USD">USD (Dollar)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Description *</label>
            <textarea
              required
              value={newTender.description}
              onChange={(e) => setNewTender(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="form-input"
              placeholder="Description détaillée de l'appel d'offres..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setSelectedTender(null);
              }}
              className="btn-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isEditing ? 'Enregistrer les modifications' : 'Créer l\'AO'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Gestion des Appels d'Offres</h1>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('list');
              setIsCreating(false);
              setIsEditing(false);
            }}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-cameg-blue text-cameg-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Liste des AO</span>
          </button>
        </nav>
      </div>

      {/* Contenu */}
      <div className="min-h-96">
        {isCreating || isEditing ? renderCreateOrEditTender() : renderTendersList()}
      </div>
    </div>
  );
};

export default TendersManagement;
