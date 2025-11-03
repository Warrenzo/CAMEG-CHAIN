import React, { useState } from 'react';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Users, 
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  Search,
  Clock,
  Shield,
  Zap,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AIReport {
  id: string;
  type: 'compliance' | 'risk' | 'performance' | 'anomaly';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
  status: 'new' | 'reviewed' | 'resolved';
  affectedItems: number;
  confidence: number;
}

interface AIIndicator {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'good' | 'warning' | 'critical';
}

const AICenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);

  // Données simulées
  const aiReports: AIReport[] = [
    {
      id: 'AI-001',
      type: 'compliance',
      title: 'Documents expirés détectés',
      description: '3 fournisseurs ont des certificats GMP qui expirent dans les 30 prochains jours',
      severity: 'high',
      date: '2025-10-15',
      status: 'new',
      affectedItems: 3,
      confidence: 95
    },
    {
      id: 'AI-002',
      type: 'anomaly',
      title: 'Incohérences dans les dossiers',
      description: 'L\'IA a détecté des incohérences entre les dates de certification et les documents soumis',
      severity: 'medium',
      date: '2025-10-14',
      status: 'reviewed',
      affectedItems: 2,
      confidence: 87
    },
    {
      id: 'AI-003',
      type: 'risk',
      title: 'Score de risque élevé',
      description: 'Un fournisseur présente un score de risque géopolitique élevé',
      severity: 'high',
      date: '2025-10-13',
      status: 'new',
      affectedItems: 1,
      confidence: 92
    },
    {
      id: 'AI-004',
      type: 'performance',
      title: 'Tendance positive des évaluations',
      description: 'Amélioration de 15% du score moyen des fournisseurs ce mois',
      severity: 'low',
      date: '2025-10-12',
      status: 'resolved',
      affectedItems: 0,
      confidence: 98
    }
  ];

  const indicators: AIIndicator[] = [
    {
      name: 'Score de conformité moyen',
      value: 87,
      trend: 'up',
      change: 5,
      status: 'good'
    },
    {
      name: 'Taux de détection d\'anomalies',
      value: 94,
      trend: 'stable',
      change: 0,
      status: 'good'
    },
    {
      name: 'Précision des prédictions',
      value: 91,
      trend: 'up',
      change: 3,
      status: 'good'
    },
    {
      name: 'Temps de traitement moyen',
      value: 2.3,
      trend: 'down',
      change: -0.5,
      status: 'good'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return 'Inconnue';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100';
      case 'reviewed': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Nouveau';
      case 'reviewed': return 'Examiné';
      case 'resolved': return 'Résolu';
      default: return 'Inconnu';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'compliance': return <Shield className="h-5 w-5" />;
      case 'risk': return <AlertTriangle className="h-5 w-5" />;
      case 'performance': return <TrendingUp className="h-5 w-5" />;
      case 'anomaly': return <Zap className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'compliance': return 'Conformité';
      case 'risk': return 'Risque';
      case 'performance': return 'Performance';
      case 'anomaly': return 'Anomalie';
      default: return 'Inconnu';
    }
  };

  const getIndicatorStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
      case 'stable': return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
      default: return null;
    }
  };

  const handleGenerateReport = () => {
    toast.success('🧠 Rapport IA généré avec succès');
  };

  const handleRefreshAnalysis = () => {
    toast.success('🔄 Analyse IA mise à jour');
  };

  const handleViewReport = (report: AIReport) => {
    setSelectedReport(report);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {indicators.map((indicator, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex items-center space-x-1">
                {getTrendIcon(indicator.trend)}
                <span className={`text-sm font-medium ${getIndicatorStatusColor(indicator.status)}`}>
                  {indicator.change > 0 ? '+' : ''}{indicator.change}%
                </span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{indicator.name}</h3>
            <p className="text-2xl font-bold text-gray-900">
              {indicator.value}{indicator.name.includes('Temps') ? 's' : '%'}
            </p>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleGenerateReport}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Brain className="h-5 w-5" />
            <span>Générer rapport IA</span>
          </button>
          <button
            onClick={handleRefreshAnalysis}
            className="btn-outline flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Actualiser l'analyse</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Exporter données</span>
          </button>
        </div>
      </div>

      {/* Résumé des rapports */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé des Rapports IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {aiReports.filter(r => r.severity === 'high').length}
            </div>
            <div className="text-sm text-red-700">Alertes élevées</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {aiReports.filter(r => r.severity === 'medium').length}
            </div>
            <div className="text-sm text-yellow-700">Alertes moyennes</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {aiReports.filter(r => r.status === 'new').length}
            </div>
            <div className="text-sm text-blue-700">Nouveaux rapports</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {aiReports.filter(r => r.status === 'resolved').length}
            </div>
            <div className="text-sm text-green-700">Résolus</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cameg-dark">Rapports IA</h2>
        <div className="flex space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              className="form-input pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <select className="form-input w-auto">
            <option value="">Tous les types</option>
            <option value="compliance">Conformité</option>
            <option value="risk">Risque</option>
            <option value="performance">Performance</option>
            <option value="anomaly">Anomalie</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {aiReports.map((report) => (
          <div key={report.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {getTypeIcon(report.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(report.severity)}`}>
                      {getSeverityText(report.severity)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {getStatusText(report.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{report.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(report.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{report.affectedItems} éléments affectés</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Brain className="h-4 w-4" />
                      <span>{report.confidence}% de confiance</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewReport(report)}
                  className="btn-outline text-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Voir
                </button>
                {report.status === 'new' && (
                  <button className="btn-primary text-sm">
                    Examiner
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Centre IA</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>IA Active</span>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-cameg-blue text-cameg-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Vue d'ensemble</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-cameg-blue text-cameg-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Rapports</span>
          </button>
        </nav>
      </div>

      {/* Contenu */}
      <div className="min-h-96">
        {activeTab === 'overview' ? renderOverview() : renderReports()}
      </div>

      {/* Modal de détails du rapport */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Rapport IA - {selectedReport.title}
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <p className="text-gray-900">{getTypeText(selectedReport.type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Sévérité</label>
                  <p className="text-gray-900">{getSeverityText(selectedReport.severity)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Statut</label>
                  <p className="text-gray-900">{getStatusText(selectedReport.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Confiance IA</label>
                  <p className="text-gray-900">{selectedReport.confidence}%</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedReport.description}</p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="btn-outline"
                >
                  Fermer
                </button>
                <button className="btn-primary">
                  Voir le rapport détaillé
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICenter;
