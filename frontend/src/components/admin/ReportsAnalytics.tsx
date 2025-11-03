import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Share2, 
  User,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportData {
  period: string;
  suppliersByStatus: {
    valides: number;
    enAttente: number;
    suspendus: number;
    rejetes: number;
  };
  scoresByCountry: {
    country: string;
    averageScore: number;
    count: number;
  }[];
  evaluationsByEvaluator: {
    evaluator: string;
    completed: number;
    pending: number;
    overdue: number;
  }[];
  timelineData: {
    date: string;
    pending: number;
    validated: number;
  }[];
}

const ReportsAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedEvaluator, setSelectedEvaluator] = useState('all');

  // Données simulées
  const reportData: ReportData = {
    period: 'Octobre 2025',
    suppliersByStatus: {
      valides: 85,
      enAttente: 10,
      suspendus: 3,
      rejetes: 2
    },
    scoresByCountry: [
      { country: 'Togo', averageScore: 87, count: 25 },
      { country: 'Ghana', averageScore: 89, count: 18 },
      { country: 'Burkina Faso', averageScore: 85, count: 15 },
      { country: 'Côte d\'Ivoire', averageScore: 91, count: 12 },
      { country: 'Sénégal', averageScore: 83, count: 8 },
      { country: 'Mali', averageScore: 86, count: 6 }
    ],
    evaluationsByEvaluator: [
      { evaluator: 'Dr. Kossi', completed: 24, pending: 3, overdue: 1 },
      { evaluator: 'Mme Akouvi', completed: 18, pending: 2, overdue: 0 },
      { evaluator: 'Dr. Mensah', completed: 15, pending: 4, overdue: 2 },
      { evaluator: 'Dr. Traoré', completed: 12, pending: 1, overdue: 0 }
    ],
    timelineData: [
      { date: '01/10', pending: 8, validated: 5 },
      { date: '02/10', pending: 12, validated: 7 },
      { date: '03/10', pending: 15, validated: 9 },
      { date: '04/10', pending: 18, validated: 12 },
      { date: '05/10', pending: 14, validated: 15 },
      { date: '06/10', pending: 16, validated: 18 },
      { date: '07/10', pending: 13, validated: 21 },
      { date: '08/10', pending: 11, validated: 24 },
      { date: '09/10', pending: 9, validated: 27 },
      { date: '10/10', pending: 7, validated: 30 }
    ]
  };

  const handleExportPDF = () => {
    toast.success('📄 Rapport PDF exporté avec succès');
  };

  const handleExportExcel = () => {
    toast.success('📊 Rapport Excel exporté avec succès');
  };

  const handleShareToDG = () => {
    toast.success('📤 Rapport partagé avec la Direction Générale');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres de Rapport</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Période</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="form-input"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          <div>
            <label className="form-label">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              <option value="all">Toutes</option>
              <option value="medicaments">Médicaments</option>
              <option value="equipements">Équipements</option>
              <option value="tests">Tests diagnostiques</option>
            </select>
          </div>
          <div>
            <label className="form-label">Pays</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="form-input"
            >
              <option value="all">Tous</option>
              <option value="togo">Togo</option>
              <option value="ghana">Ghana</option>
              <option value="burkina">Burkina Faso</option>
            </select>
          </div>
          <div>
            <label className="form-label">Évaluateur</label>
            <select
              value={selectedEvaluator}
              onChange={(e) => setSelectedEvaluator(e.target.value)}
              className="form-input"
            >
              <option value="all">Tous</option>
              <option value="kossi">Dr. Kossi</option>
              <option value="akouvi">Mme Akouvi</option>
              <option value="mensah">Dr. Mensah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fournisseurs par statut */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fournisseurs par Statut</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Validés</span>
              </div>
              <span className="font-semibold text-gray-900">{reportData.suppliersByStatus.valides}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">En attente</span>
              </div>
              <span className="font-semibold text-gray-900">{reportData.suppliersByStatus.enAttente}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Suspendus</span>
              </div>
              <span className="font-semibold text-gray-900">{reportData.suppliersByStatus.suspendus}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Rejetés</span>
              </div>
              <span className="font-semibold text-gray-900">{reportData.suppliersByStatus.rejetes}</span>
            </div>
          </div>
        </div>

        {/* Scores moyens par pays */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scores Moyens par Pays</h3>
          <div className="space-y-3">
            {reportData.scoresByCountry.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.country}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-cameg-blue h-2 rounded-full" 
                      style={{ width: `${item.averageScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                    {item.averageScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Évaluations par évaluateur */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Évaluations par Évaluateur</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Évaluateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terminées
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  En cours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  En retard
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.evaluationsByEvaluator.map((evaluator, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {evaluator.evaluator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.completed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.pending}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.overdue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      evaluator.overdue === 0 ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                    }`}>
                      {evaluator.overdue === 0 ? 'Excellent' : 'À surveiller'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline des dossiers */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Dossiers</h3>
        <div className="space-y-4">
          {reportData.timelineData.slice(-7).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 w-16">{item.date}</span>
              <div className="flex-1 mx-4">
                <div className="flex space-x-2">
                  <div className="flex-1 bg-yellow-100 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(item.pending / 20) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex-1 bg-green-100 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(item.validated / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 text-sm">
                <span className="text-yellow-600">{item.pending} en attente</span>
                <span className="text-green-600">{item.validated} validés</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDetailedReports = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapports Détaillés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="h-8 w-8 text-cameg-blue" />
              <div>
                <h4 className="font-semibold text-gray-900">Rapport Mensuel</h4>
                <p className="text-sm text-gray-600">Octobre 2025</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Analyse complète des performances du mois avec indicateurs clés et recommandations.
            </p>
            <div className="flex space-x-2">
              <button className="btn-outline text-sm">Voir</button>
              <button onClick={handleExportPDF} className="btn-primary text-sm">PDF</button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Analyse des Scores</h4>
                <p className="text-sm text-gray-600">Par pays et catégorie</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Comparaison des scores moyens par pays et identification des tendances.
            </p>
            <div className="flex space-x-2">
              <button className="btn-outline text-sm">Voir</button>
              <button onClick={handleExportExcel} className="btn-primary text-sm">Excel</button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Performance Évaluateurs</h4>
                <p className="text-sm text-gray-600">Trimestre Q4 2025</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Évaluation des performances individuelles et recommandations d'amélioration.
            </p>
            <div className="flex space-x-2">
              <button className="btn-outline text-sm">Voir</button>
              <button onClick={handleShareToDG} className="btn-primary text-sm">Partager</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Rapports et Statistiques</h1>
        <div className="flex space-x-3">
          <button onClick={handleExportPDF} className="btn-outline flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
          <button onClick={handleExportExcel} className="btn-outline flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
          <button onClick={handleShareToDG} className="btn-primary flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Partager au DG</span>
          </button>
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
            onClick={() => setActiveTab('detailed')}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'detailed'
                ? 'border-cameg-blue text-cameg-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Rapports détaillés</span>
          </button>
        </nav>
      </div>

      {/* Contenu */}
      <div className="min-h-96">
        {activeTab === 'overview' ? renderOverview() : renderDetailedReports()}
      </div>
    </div>
  );
};

export default ReportsAnalytics;
