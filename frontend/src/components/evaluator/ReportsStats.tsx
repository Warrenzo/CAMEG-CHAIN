import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  FileText, 
  Calendar,
  Users,
  CheckCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const ReportsStats: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Données simulées pour la démonstration
  const statsData = {
    totalEvaluations: 45,
    pendingEvaluations: 5,
    completedEvaluations: 40,
    averageScore: 78,
    averageProcessingTime: 3.2,
    topCountries: [
      { country: 'Inde', count: 12, percentage: 27 },
      { country: 'Chine', count: 8, percentage: 18 },
      { country: 'Ghana', count: 6, percentage: 13 },
      { country: 'Togo', count: 5, percentage: 11 },
      { country: 'Autres', count: 14, percentage: 31 }
    ],
    evaluationTrends: [
      { month: 'Jan', evaluations: 8, averageScore: 75 },
      { month: 'Fév', evaluations: 12, averageScore: 78 },
      { month: 'Mar', evaluations: 15, averageScore: 82 },
      { month: 'Avr', evaluations: 10, averageScore: 79 }
    ],
    scoreDistribution: [
      { range: '80-100%', count: 18, percentage: 40 },
      { range: '60-79%', count: 15, percentage: 33 },
      { range: '40-59%', count: 8, percentage: 18 },
      { range: '0-39%', count: 4, percentage: 9 }
    ]
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.success(`📊 Rapport ${format.toUpperCase()} généré avec succès`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Rapports & Statistiques</h1>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="form-input w-auto"
          >
            <option value="7days">7 derniers jours</option>
            <option value="30days">30 derniers jours</option>
            <option value="90days">90 derniers jours</option>
            <option value="1year">1 an</option>
          </select>
          <button
            onClick={() => handleExport('pdf')}
            className="btn-outline flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="btn-outline flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{statsData.totalEvaluations}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Total Évaluations</h3>
          <p className="text-sm text-gray-600">Sur la période sélectionnée</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-yellow-600">{statsData.pendingEvaluations}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">En Attente</h3>
          <p className="text-sm text-gray-600">Évaluations non finalisées</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{statsData.completedEvaluations}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Terminées</h3>
          <p className="text-sm text-gray-600">Évaluations finalisées</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{statsData.averageScore}%</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Score Moyen</h3>
          <p className="text-sm text-gray-600">Moyenne des évaluations</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendances d'évaluation */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tendances d'Évaluation</h3>
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {statsData.evaluationTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{trend.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-cameg-blue h-2 rounded-full" 
                        style={{ width: `${(trend.evaluations / 15) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{trend.evaluations}</span>
                  </div>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(trend.averageScore)}`}>
                    {trend.averageScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution des scores */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Distribution des Scores</h3>
            <PieChart className="h-6 w-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            {statsData.scoreDistribution.map((dist, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{dist.range}</span>
                <div className="flex items-center space-x-4">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-yellow-500' :
                        index === 2 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${dist.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{dist.count}</span>
                  <span className="text-sm font-medium text-gray-900 w-8">{dist.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top pays */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Répartition par Pays</h3>
          <Users className="h-6 w-6 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsData.topCountries.map((country, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-cameg-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{country.country}</p>
                  <p className="text-xs text-gray-500">{country.count} fournisseurs</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-cameg-blue">{country.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rapport détaillé */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Rapport Détaillé</h3>
          <div className="flex space-x-2">
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="form-input w-auto"
            >
              <option value="overview">Vue d'ensemble</option>
              <option value="performance">Performance</option>
              <option value="compliance">Conformité</option>
              <option value="risks">Analyse des risques</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Temps de Traitement</h4>
              <p className="text-2xl font-bold text-blue-600">{statsData.averageProcessingTime} jours</p>
              <p className="text-sm text-blue-700">Moyenne par évaluation</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Taux de Validation</h4>
              <p className="text-2xl font-bold text-green-600">
                {Math.round((statsData.completedEvaluations / statsData.totalEvaluations) * 100)}%
              </p>
              <p className="text-sm text-green-700">Fournisseurs validés</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Alertes Actives</h4>
              <p className="text-2xl font-bold text-orange-600">3</p>
              <p className="text-sm text-orange-700">Documents expirés</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Recommandations IA</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Optimiser le processus d'évaluation pour réduire le temps de traitement</li>
              <li>• Renforcer la vérification des documents pour les fournisseurs indiens</li>
              <li>• Mettre en place des alertes automatiques pour les documents expirés</li>
              <li>• Améliorer la formation des évaluateurs sur les critères de conformité</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button className="btn-outline flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Planifier un rapport automatique</span>
          </button>
          
          <button className="btn-outline flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Générer un rapport personnalisé</span>
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
        </div>
      </div>
    </div>
  );
};

export default ReportsStats;
