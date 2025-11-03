import React, { useState } from 'react';
import { 
  Brain, 
  Play, 
  RefreshCw, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Target,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AIProcess {
  id: string;
  name: string;
  type: 'NLP' | 'ML' | 'CV/NLP';
  status: 'success' | 'warning' | 'error';
  lastExecution: string;
  duration: string;
  errors: number;
}

interface AIPerformance {
  accuracy: number;
  averageTime: string;
  anomaliesDetected: number;
  totalProcessed: number;
  successRate: number;
}

const AIServiceMonitoring: React.FC = () => {
  const [isReloading, setIsReloading] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);

  // Données simulées
  const aiProcesses: AIProcess[] = [
    {
      id: '1',
      name: 'Analyse documents',
      type: 'NLP',
      status: 'success',
      lastExecution: '15/10',
      duration: '2 min',
      errors: 0
    },
    {
      id: '2',
      name: 'Évaluation prédictive',
      type: 'ML',
      status: 'success',
      lastExecution: '15/10',
      duration: '4 min',
      errors: 1
    },
    {
      id: '3',
      name: 'Détection anomalies',
      type: 'CV/NLP',
      status: 'success',
      lastExecution: '15/10',
      duration: '6 min',
      errors: 0
    }
  ];

  const performance: AIPerformance = {
    accuracy: 94,
    averageTime: '2,4 min/dossier',
    anomaliesDetected: 2,
    totalProcessed: 50,
    successRate: 98
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'OK';
      case 'warning':
        return 'Avertissement';
      case 'error':
        return 'Erreur';
      default:
        return 'Inconnu';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'NLP':
        return 'text-blue-600 bg-blue-100';
      case 'ML':
        return 'text-purple-600 bg-purple-100';
      case 'CV/NLP':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleReloadModule = async (_processId: string) => {
    setIsReloading(true);
    // Simulation d'une action
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Module IA relancé avec succès');
    setIsReloading(false);
  };

  const handleRetrainModel = async () => {
    setIsRetraining(true);
    // Simulation d'une action
    await new Promise(resolve => setTimeout(resolve, 3000));
    toast.success('Modèle ré-entraîné avec succès');
    setIsRetraining(false);
  };

  const handleViewPerformance = () => {
    toast.success('Ouverture des performances historiques...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Service IA</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleViewPerformance}
            className="btn-outline flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Performances historiques</span>
          </button>
          <button
            onClick={handleRetrainModel}
            disabled={isRetraining}
            className="btn-outline flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>Ré-entraîner le modèle</span>
          </button>
          <button
            onClick={() => handleReloadModule('all')}
            disabled={isReloading}
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Relancer modules IA</span>
          </button>
        </div>
      </div>

      {/* Indicateurs IA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Précision moyenne</p>
              <p className="text-2xl font-bold text-green-600">{performance.accuracy}%</p>
              <p className="text-xs text-gray-500">Derniers {performance.totalProcessed} dossiers</p>
            </div>
            <Target className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Temps d'analyse moyen</p>
              <p className="text-2xl font-bold text-blue-600">{performance.averageTime}</p>
              <p className="text-xs text-gray-500">Par dossier</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Anomalies détectées</p>
              <p className="text-2xl font-bold text-yellow-600">{performance.anomaliesDetected}</p>
              <p className="text-xs text-gray-500">Cette semaine</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de succès</p>
              <p className="text-2xl font-bold text-purple-600">{performance.successRate}%</p>
              <p className="text-xs text-gray-500">Global</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Tableau des processus IA */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Monitoring IA</h3>
          <p className="text-sm text-gray-600">Surveillance des processus d'intelligence artificielle</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière exécution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erreurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aiProcesses.map((process) => (
                <tr key={process.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Brain className="h-5 w-5 text-cameg-blue mr-3" />
                      <div className="text-sm font-medium text-gray-900">{process.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(process.type)}`}>
                      {process.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(process.status)}`}>
                      {getStatusIcon(process.status)}
                      <span className="ml-1">{getStatusText(process.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {process.lastExecution}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {process.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={process.errors > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                      {process.errors}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReloadModule(process.id)}
                        disabled={isReloading}
                        className="text-cameg-blue hover:text-blue-700 disabled:opacity-50"
                      >
                        Relancer
                      </button>
                      <button className="text-gray-600 hover:text-gray-700">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Détails des erreurs */}
      {aiProcesses.some(p => p.errors > 0) && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails des erreurs</h3>
          <div className="space-y-3">
            {aiProcesses
              .filter(p => p.errors > 0)
              .map((process) => (
                <div key={process.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-yellow-900">{process.name}</h4>
                      <p className="text-sm text-yellow-700">
                        {process.errors} erreur(s) détectée(s) - Incohérence dans les données d'entrée
                      </p>
                    </div>
                    <button className="text-yellow-600 hover:text-yellow-700">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <button className="w-full btn-outline text-sm">
              Tester tous les modules IA
            </button>
            <button className="w-full btn-outline text-sm">
              Voir les logs détaillés
            </button>
            <button className="w-full btn-outline text-sm">
              Exporter les métriques
            </button>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Auto-analyse</span>
              <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Notifications</span>
              <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mode debug</span>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut système</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Serveur IA</span>
              <span className="text-green-600 font-semibold">Actif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Modèles chargés</span>
              <span className="text-green-600 font-semibold">3/3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mémoire utilisée</span>
              <span className="text-blue-600 font-semibold">2.1 GB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">CPU</span>
              <span className="text-yellow-600 font-semibold">45%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIServiceMonitoring;
