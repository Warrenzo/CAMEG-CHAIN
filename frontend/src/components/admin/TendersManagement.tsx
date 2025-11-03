import React, { useState } from 'react';
import { 
  Plus, 
  Send, 
  Save, 
  FileText,
  Users,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Tender {
  id: string;
  title: string;
  description: string;
  category: string;
  publicationDate: string;
  closingDate: string;
  status: 'draft' | 'published' | 'closed' | 'evaluating';
  submissions: number;
  documents: string[];
}

const TendersManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [isCreating, setIsCreating] = useState(false);

  // Données simulées
  const tenders: Tender[] = [
    {
      id: 'AO-2025-001',
      title: 'Fourniture de médicaments antipaludéens',
      description: 'Acquisition de médicaments antipaludéens pour le programme national',
      category: 'Médicaments',
      publicationDate: '2025-10-01',
      closingDate: '2025-10-31',
      status: 'published',
      submissions: 8,
      documents: ['Cahier des charges', 'Spécifications techniques']
    },
    {
      id: 'AO-2025-002',
      title: 'Équipements de laboratoire',
      description: 'Acquisition d\'équipements pour les laboratoires de contrôle qualité',
      category: 'Équipements',
      publicationDate: '2025-10-10',
      closingDate: '2025-11-10',
      status: 'published',
      submissions: 5,
      documents: ['Cahier des charges', 'Liste des équipements']
    },
    {
      id: 'AO-2025-003',
      title: 'Tests de diagnostic VIH',
      description: 'Fourniture de tests de diagnostic pour le dépistage VIH',
      category: 'Tests diagnostiques',
      publicationDate: '2025-10-15',
      closingDate: '2025-11-15',
      status: 'draft',
      submissions: 0,
      documents: ['Cahier des charges']
    }
  ];

  const submissions = [
    {
      id: '1',
      tenderId: 'AO-2025-001',
      supplier: 'PharmaTogo SARL',
      submissionDate: '2025-10-14',
      aiScore: 92,
      status: 'en_evaluation',
      evaluator: 'Dr. Kossi'
    },
    {
      id: '2',
      tenderId: 'AO-2025-001',
      supplier: 'MedPlus Ghana',
      submissionDate: '2025-10-15',
      aiScore: 88,
      status: 'valide',
      evaluator: 'Mme Akouvi'
    },
    {
      id: '3',
      tenderId: 'AO-2025-002',
      supplier: 'LabTech International',
      submissionDate: '2025-10-12',
      aiScore: 85,
      status: 'en_evaluation',
      evaluator: 'Dr. Mensah'
    }
  ];

  const [newTender, setNewTender] = useState({
    title: '',
    description: '',
    category: '',
    publicationDate: '',
    closingDate: '',
    documents: [] as string[]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      case 'evaluating': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'draft': return 'Brouillon';
      case 'closed': return 'Clôturé';
      case 'evaluating': return 'En évaluation';
      default: return 'Inconnu';
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'valide': return 'text-green-600 bg-green-100';
      case 'en_evaluation': return 'text-blue-600 bg-blue-100';
      case 'rejete': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSubmissionStatusText = (status: string) => {
    switch (status) {
      case 'valide': return 'Validé';
      case 'en_evaluation': return 'En évaluation';
      case 'rejete': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  const handleCreateTender = () => {
    if (!newTender.title || !newTender.description || !newTender.category) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    toast.success('✅ Appel d\'offres créé avec succès');
    setIsCreating(false);
    setNewTender({
      title: '',
      description: '',
      category: '',
      publicationDate: '',
      closingDate: '',
      documents: []
    });
  };

  const handlePublishTender = (_tenderId: string) => {
    toast.success('📢 Appel d\'offres publié avec succès. Notification envoyée aux fournisseurs actifs.');
  };

  const renderTendersList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cameg-dark">Liste des Appels d'Offres</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Créer un AO</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
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
                      <div className="text-sm font-medium text-gray-900">{tender.id}</div>
                      <div className="text-sm text-gray-500">{tender.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tender.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(tender.closingDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tender.status)}`}>
                      {getStatusText(tender.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tender.submissions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-cameg-blue hover:text-blue-700">Voir</button>
                      <button className="text-gray-600 hover:text-gray-700">Modifier</button>
                      {tender.status === 'draft' && (
                        <button 
                          onClick={() => handlePublishTender(tender.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Publier
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
    </div>
  );

  const renderCreateTender = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cameg-dark">Créer un Appel d'Offres</h2>
        <button
          onClick={() => setIsCreating(false)}
          className="btn-outline"
        >
          Annuler
        </button>
      </div>

      <div className="card p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Titre de l'AO *</label>
              <input
                type="text"
                value={newTender.title}
                onChange={(e) => setNewTender(prev => ({ ...prev, title: e.target.value }))}
                className="form-input"
                placeholder="Ex: Fourniture de médicaments antipaludéens"
              />
            </div>

            <div>
              <label className="form-label">Catégorie *</label>
              <select
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
              <label className="form-label">Date de publication</label>
              <input
                type="date"
                value={newTender.publicationDate}
                onChange={(e) => setNewTender(prev => ({ ...prev, publicationDate: e.target.value }))}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Date de clôture *</label>
              <input
                type="date"
                value={newTender.closingDate}
                onChange={(e) => setNewTender(prev => ({ ...prev, closingDate: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Description courte *</label>
            <textarea
              value={newTender.description}
              onChange={(e) => setNewTender(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="form-input"
              placeholder="Description détaillée de l'appel d'offres..."
            />
          </div>

          <div>
            <label className="form-label">Documents associés</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="cahier-charges"
                  className="h-4 w-4 text-cameg-blue focus:ring-cameg-blue border-gray-300 rounded"
                />
                <label htmlFor="cahier-charges" className="text-sm text-gray-700">
                  Cahier des charges
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="specifications"
                  className="h-4 w-4 text-cameg-blue focus:ring-cameg-blue border-gray-300 rounded"
                />
                <label htmlFor="specifications" className="text-sm text-gray-700">
                  Spécifications techniques
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="conditions"
                  className="h-4 w-4 text-cameg-blue focus:ring-cameg-blue border-gray-300 rounded"
                />
                <label htmlFor="conditions" className="text-sm text-gray-700">
                  Conditions générales
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="btn-outline"
            >
              Annuler
            </button>
            <button
              type="button"
              className="btn-secondary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Enregistrer brouillon</span>
            </button>
            <button
              type="button"
              onClick={handleCreateTender}
              className="btn-primary flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Publier AO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderSubmissions = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cameg-dark">Suivi des Soumissions</h2>
        <div className="flex space-x-3">
          <select className="form-input w-auto">
            <option value="">Tous les AO</option>
            <option value="AO-2025-001">AO-2025-001</option>
            <option value="AO-2025-002">AO-2025-002</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AO n°
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date soumission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score IA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Évaluateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {submission.tenderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(submission.submissionDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      {submission.aiScore}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubmissionStatusColor(submission.status)}`}>
                      {getSubmissionStatusText(submission.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.evaluator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-cameg-blue hover:text-blue-700">Voir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            onClick={() => setActiveTab('list')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-cameg-blue text-cameg-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Liste des AO</span>
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'submissions'
                ? 'border-cameg-blue text-cameg-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Suivi des soumissions</span>
          </button>
        </nav>
      </div>

      {/* Contenu */}
      <div className="min-h-96">
        {isCreating ? renderCreateTender() : 
         activeTab === 'list' ? renderTendersList() :
         activeTab === 'submissions' ? renderSubmissions() :
         renderTendersList()}
      </div>
    </div>
  );
};

export default TendersManagement;
