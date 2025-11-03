import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

interface HistoryEntry {
  id: string;
  date: string;
  time: string;
  action: string;
  supplier: string;
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled';
  details: string;
  user: string;
  type: 'evaluation' | 'validation' | 'ai_analysis' | 'document_upload' | 'status_change';
}

const HistorySection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('30days');

  // Données simulées pour la démonstration
  const historyData: HistoryEntry[] = [
    {
      id: '1',
      date: '15/10/2025',
      time: '14:30',
      action: 'Évaluation enregistrée',
      supplier: 'PharmaTogo SARL',
      status: 'in_progress',
      details: 'Évaluation partielle sauvegardée - Score GMP: 75%',
      user: 'Dr. Marie Kouassi',
      type: 'evaluation'
    },
    {
      id: '2',
      date: '15/10/2025',
      time: '11:15',
      action: 'Rapport IA généré',
      supplier: 'BioPlus SA',
      status: 'completed',
      details: 'Analyse automatique terminée - Score global: 82%',
      user: 'Système IA',
      type: 'ai_analysis'
    },
    {
      id: '3',
      date: '14/10/2025',
      time: '16:45',
      action: 'Dossier validé',
      supplier: 'MedLab Int.',
      status: 'completed',
      details: 'Validation finale approuvée par l\'administrateur',
      user: 'Dr. Marie Kouassi',
      type: 'validation'
    },
    {
      id: '4',
      date: '14/10/2025',
      time: '09:20',
      action: 'Documents téléchargés',
      supplier: 'PharmaTogo SARL',
      status: 'completed',
      details: '5 documents ajoutés au dossier',
      user: 'PharmaTogo SARL',
      type: 'document_upload'
    },
    {
      id: '5',
      date: '13/10/2025',
      time: '15:10',
      action: 'Statut modifié',
      supplier: 'BioPlus SA',
      status: 'completed',
      details: 'Statut changé de "En attente" à "En cours d\'évaluation"',
      user: 'Dr. Marie Kouassi',
      type: 'status_change'
    },
    {
      id: '6',
      date: '12/10/2025',
      time: '10:30',
      action: 'Évaluation rejetée',
      supplier: 'MedLab Int.',
      status: 'cancelled',
      details: 'Dossier rejeté - Documents insuffisants',
      user: 'Dr. Marie Kouassi',
      type: 'evaluation'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'evaluation': return <FileText className="h-4 w-4" />;
      case 'validation': return <CheckCircle className="h-4 w-4" />;
      case 'ai_analysis': return <History className="h-4 w-4" />;
      case 'document_upload': return <FileText className="h-4 w-4" />;
      case 'status_change': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredData = historyData.filter(entry => {
    const matchesSearch = entry.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || entry.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleExport = () => {
    toast.success('📊 Historique exporté avec succès');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Historique des Actions</h1>
        <button
          onClick={handleExport}
          className="btn-outline flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Exporter l'historique</span>
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par fournisseur, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="form-input"
          >
            <option value="all">Tous les types</option>
            <option value="evaluation">Évaluations</option>
            <option value="validation">Validations</option>
            <option value="ai_analysis">Analyses IA</option>
            <option value="document_upload">Téléchargements</option>
            <option value="status_change">Changements de statut</option>
          </select>

          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="form-input"
          >
            <option value="7days">7 derniers jours</option>
            <option value="30days">30 derniers jours</option>
            <option value="90days">90 derniers jours</option>
            <option value="1year">1 an</option>
          </select>

          <button className="btn-outline flex items-center justify-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtres avancés</span>
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <History className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{filteredData.length}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Actions totales</h3>
          <p className="text-sm text-gray-600">Sur la période sélectionnée</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {filteredData.filter(entry => entry.status === 'completed').length}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Terminées</h3>
          <p className="text-sm text-gray-600">Actions finalisées</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-yellow-600">
              {filteredData.filter(entry => entry.status === 'in_progress').length}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">En cours</h3>
          <p className="text-sm text-gray-600">Actions en cours</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {new Set(filteredData.map(entry => entry.supplier)).size}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Fournisseurs</h3>
          <p className="text-sm text-gray-600">Fournisseurs concernés</p>
        </div>
      </div>

      {/* Journal des actions */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Journal des Actions</h3>
          <p className="text-sm text-gray-600 mt-1">Traçabilité complète des opérations (ISO, audits internes, conformité OMS)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date / Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Détails
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{entry.date}</div>
                        <div className="text-sm text-gray-500">{entry.time}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(entry.type)}
                      <span className="text-sm font-medium text-gray-900">{entry.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(entry.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                        {getStatusText(entry.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.user}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={entry.details}>
                      {entry.details}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune action trouvée</h3>
            <p className="text-gray-500">Aucune action ne correspond aux critères de recherche sélectionnés.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Affichage de {filteredData.length} action(s) sur {historyData.length} total
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Précédent
          </button>
          <button className="px-3 py-2 text-sm font-medium text-white bg-cameg-blue border border-transparent rounded-md hover:bg-blue-700">
            1
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistorySection;
