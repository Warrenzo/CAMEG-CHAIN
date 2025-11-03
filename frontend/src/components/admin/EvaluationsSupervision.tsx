import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Evaluation {
  id: string;
  supplierName: string;
  evaluatorName: string;
  tenderId: string;
  submissionDate: string;
  evaluationDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  aiScore: number;
  humanScore: number | null;
  priority: 'high' | 'medium' | 'low';
  daysOverdue?: number;
}

const EvaluationsSupervision: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  // Données simulées
  const evaluations: Evaluation[] = [
    {
      id: 'EV-001',
      supplierName: 'PharmaTogo SARL',
      evaluatorName: 'Dr. Kossi',
      tenderId: 'AO-2025-001',
      submissionDate: '2025-10-14',
      evaluationDate: '2025-10-15',
      status: 'in_progress',
      aiScore: 92,
      humanScore: null,
      priority: 'high',
      daysOverdue: 0
    },
    {
      id: 'EV-002',
      supplierName: 'MedPlus Ghana',
      evaluatorName: 'Mme Akouvi',
      tenderId: 'AO-2025-001',
      submissionDate: '2025-10-15',
      evaluationDate: '2025-10-16',
      status: 'completed',
      aiScore: 88,
      humanScore: 85,
      priority: 'medium',
      daysOverdue: 0
    },
    {
      id: 'EV-003',
      supplierName: 'LabTech International',
      evaluatorName: 'Dr. Mensah',
      tenderId: 'AO-2025-002',
      submissionDate: '2025-10-12',
      evaluationDate: '2025-10-13',
      status: 'overdue',
      aiScore: 85,
      humanScore: null,
      priority: 'high',
      daysOverdue: 3
    },
    {
      id: 'EV-004',
      supplierName: 'BioPharma Ltd',
      evaluatorName: 'Dr. Kossi',
      tenderId: 'AO-2025-002',
      submissionDate: '2025-10-16',
      evaluationDate: '2025-10-17',
      status: 'pending',
      aiScore: 78,
      humanScore: null,
      priority: 'medium',
      daysOverdue: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'overdue': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return 'Inconnue';
    }
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'overdue') return evaluation.status === 'overdue';
    if (activeFilter === 'pending') return evaluation.status === 'pending';
    if (activeFilter === 'in_progress') return evaluation.status === 'in_progress';
    if (activeFilter === 'completed') return evaluation.status === 'completed';
    return true;
  });

  const handleAssignEvaluator = (_evaluationId: string) => {
    toast.success('Évaluateur assigné avec succès');
  };

  const handleSendReminder = (_evaluationId: string) => {
    toast.success('Rappel envoyé à l\'évaluateur');
  };

  const handleViewDetails = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
  };

  const stats = {
    total: evaluations.length,
    completed: evaluations.filter(e => e.status === 'completed').length,
    inProgress: evaluations.filter(e => e.status === 'in_progress').length,
    overdue: evaluations.filter(e => e.status === 'overdue').length,
    pending: evaluations.filter(e => e.status === 'pending').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Supervision des Évaluations</h1>
        <div className="flex space-x-3">
          <button className="btn-outline flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button className="btn-primary">
            Assigner un dossier
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En retard</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeFilter === 'all' 
              ? 'bg-cameg-blue text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setActiveFilter('overdue')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeFilter === 'overdue' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          En retard ({stats.overdue})
        </button>
        <button
          onClick={() => setActiveFilter('in_progress')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeFilter === 'in_progress' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          En cours ({stats.inProgress})
        </button>
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeFilter === 'pending' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          En attente ({stats.pending})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeFilter === 'completed' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Terminées ({stats.completed})
        </button>
      </div>

      {/* Tableau des évaluations */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AO
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Évaluateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date soumission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score IA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score humain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {evaluation.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluation.supplierName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluation.tenderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluation.evaluatorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(evaluation.submissionDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      {evaluation.aiScore}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluation.humanScore ? `${evaluation.humanScore}%` : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(evaluation.status)}`}>
                      {getStatusIcon(evaluation.status)}
                      <span className="ml-1">{getStatusText(evaluation.status)}</span>
                      {evaluation.daysOverdue && evaluation.daysOverdue > 0 && (
                        <span className="ml-1">({evaluation.daysOverdue}j)</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(evaluation.priority)}`}>
                      {getPriorityText(evaluation.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDetails(evaluation)}
                        className="text-cameg-blue hover:text-blue-700"
                      >
                        Voir
                      </button>
                      {evaluation.status === 'pending' && (
                        <button 
                          onClick={() => handleAssignEvaluator(evaluation.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Assigner
                        </button>
                      )}
                      {evaluation.status === 'overdue' && (
                        <button 
                          onClick={() => handleSendReminder(evaluation.id)}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          Rappel
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

      {/* Modal de détails */}
      {selectedEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Détails de l'évaluation {selectedEvaluation.id}
              </h3>
              <button
                onClick={() => setSelectedEvaluation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Fournisseur</label>
                  <p className="text-gray-900">{selectedEvaluation.supplierName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Évaluateur</label>
                  <p className="text-gray-900">{selectedEvaluation.evaluatorName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Appel d'offres</label>
                  <p className="text-gray-900">{selectedEvaluation.tenderId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date de soumission</label>
                  <p className="text-gray-900">{new Date(selectedEvaluation.submissionDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Score IA</label>
                  <p className="text-gray-900">{selectedEvaluation.aiScore}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Score humain</label>
                  <p className="text-gray-900">{selectedEvaluation.humanScore ? `${selectedEvaluation.humanScore}%` : 'Non évalué'}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedEvaluation(null)}
                  className="btn-outline"
                >
                  Fermer
                </button>
                <button className="btn-primary">
                  Voir le rapport complet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationsSupervision;
