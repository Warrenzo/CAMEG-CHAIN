import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import EvaluationGrid from '../components/evaluator/EvaluationGrid';
import AIAnalysis from '../components/evaluator/AIAnalysis';
import ReportsStats from '../components/evaluator/ReportsStats';
import HistorySection from '../components/evaluator/HistorySection';
import SettingsSection from '../components/evaluator/SettingsSection';
import { 
  Bell, 
  Brain, 
  User, 
  Settings, 
  LogOut, 
  Home, 
  Users, 
  FileText, 
  Calculator, 
  BarChart2, 
  History,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const EvaluatorDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('accueil');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Données simulées pour la démonstration
  const dashboardStats = {
    dossiersAEvaluer: 5,
    dossiersEnCours: 2,
    fournisseursValides: 8,
    fournisseursRejetes: 1,
    alertesConformite: 3
  };

  const notifications = [
    {
      id: 1,
      type: 'new_dossier',
      title: 'Nouveau dossier soumis',
      message: 'PharmaTogo SARL a soumis son dossier de préqualification',
      time: 'Il y a 2 heures',
      priority: 'high'
    },
    {
      id: 2,
      type: 'document_expired',
      title: 'Document expiré',
      message: 'Certificat GMP de BioPlus SA expire dans 7 jours',
      time: 'Il y a 4 heures',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'evaluation_complete',
      title: 'Évaluation terminée',
      message: 'Votre évaluation de MedLab Int. a été enregistrée',
      time: 'Il y a 1 jour',
      priority: 'low'
    }
  ];

  const suppliers = [
    {
      id: 1,
      name: 'PharmaTogo SARL',
      country: 'Togo',
      status: 'en_attente',
      score: null,
      lastEvaluation: '14/10/2025',
      products: 'Médicaments génériques'
    },
    {
      id: 2,
      name: 'BioPlus SA',
      country: 'Ghana',
      status: 'valide',
      score: 87,
      lastEvaluation: '11/10/2025',
      products: 'Équipements médicaux'
    },
    {
      id: 3,
      name: 'MedLab Int.',
      country: 'Inde',
      status: 'rejete',
      score: 52,
      lastEvaluation: '03/10/2025',
      products: 'Tests de diagnostic'
    }
  ];

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return 'text-yellow-600 bg-yellow-100';
      case 'valide': return 'text-green-600 bg-green-100';
      case 'rejete': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'valide': return 'Validé';
      case 'rejete': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  const renderAccueil = () => (
    <div className="space-y-6">
      {/* Bandeau supérieur */}
      <div className="bg-gradient-to-r from-cameg-blue to-blue-600 text-white rounded-xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Bonjour, {user?.company_name || 'Évaluateur'}
            </h1>
            <p className="text-blue-100">
              Vous avez {dashboardStats.dossiersAEvaluer} dossiers en attente, {dashboardStats.dossiersEnCours} en révision, 
              et {dashboardStats.fournisseursValides} fournisseurs validés aujourd'hui.
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setActiveSection('fournisseurs')}
              className="btn-primary bg-white text-cameg-blue hover:bg-gray-100"
            >
              Accéder aux nouveaux dossiers
            </button>
            <button 
              onClick={() => setActiveSection('rapports')}
              className="btn-outline border-white text-white hover:bg-white hover:text-cameg-blue"
            >
              Consulter les rapports
            </button>
            <button 
              onClick={() => setActiveSection('analyse-ia')}
              className="btn-outline border-white text-white hover:bg-white hover:text-cameg-blue"
            >
              Lancer une analyse IA
            </button>
          </div>
        </div>
      </div>

      {/* Cartes de statut */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('fournisseurs')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-yellow-600">{dashboardStats.dossiersAEvaluer}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Dossiers à évaluer</h3>
          <p className="text-sm text-gray-600">Dossiers soumis en attente de traitement</p>
        </div>

        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('dossiers')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{dashboardStats.dossiersEnCours}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Dossiers en cours</h3>
          <p className="text-sm text-gray-600">Évaluations non finalisées</p>
        </div>

        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('fournisseurs')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{dashboardStats.fournisseursValides}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Fournisseurs validés</h3>
          <p className="text-sm text-gray-600">Total validés sur la période</p>
        </div>

        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('fournisseurs')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">{dashboardStats.fournisseursRejetes}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Fournisseurs rejetés</h3>
          <p className="text-sm text-gray-600">Cas non conforme</p>
        </div>

        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('analyse-ia')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-600">{dashboardStats.alertesConformite}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Alerte conformité</h3>
          <p className="text-sm text-gray-600">Documents manquants ou expirés</p>
        </div>
      </div>

      {/* Messages dynamiques */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-blue-600 mr-3" />
          <p className="text-blue-800">
            <strong>3 nouveaux dossiers à évaluer aujourd'hui.</strong> Votre dernière évaluation a été enregistrée avec succès.
          </p>
        </div>
      </div>
    </div>
  );

  const renderFournisseurs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Liste des Fournisseurs</h1>
        <div className="flex space-x-3">
          <button className="btn-outline">
            Export Excel
          </button>
          <button className="btn-outline">
            Export PDF
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2 bg-cameg-blue text-white rounded-lg text-sm font-medium">
          Tous
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
          En attente
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
          Validés
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
          Rejetés
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
          Alerte
        </button>
      </div>

      {/* Recherche et filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher par nom, pays, statut..."
            className="form-input pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="date"
            className="form-input pl-10"
            placeholder="Filtrer par date d'évaluation"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tableau des fournisseurs */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pays
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score global
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière évaluation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-gray-500">{supplier.products}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                      {getStatusText(supplier.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.score ? `${supplier.score}%` : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.lastEvaluation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {supplier.status === 'en_attente' ? (
                      <button 
                        onClick={() => setActiveSection('grille-evaluation')}
                        className="text-cameg-blue hover:text-blue-700"
                      >
                        Évaluer
                      </button>
                    ) : (
                      <button className="text-gray-500 hover:text-gray-700">
                        Voir fiche
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          💡 <strong>Conseil :</strong> Cliquez sur "Évaluer" pour accéder à la fiche complète du fournisseur.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'accueil':
        return renderAccueil();
      case 'fournisseurs':
        return renderFournisseurs();
      case 'dossiers':
        return <div className="text-center py-12"><h2 className="text-xl font-semibold">Section Dossiers en développement</h2></div>;
      case 'grille-evaluation':
        return <EvaluationGrid />;
      case 'analyse-ia':
        return <AIAnalysis />;
      case 'rapports':
        return <ReportsStats />;
      case 'historique':
        return <HistorySection />;
      case 'parametres':
        return <SettingsSection />;
      default:
        return renderAccueil();
    }
  };

  return (
    <div className="min-h-screen bg-cameg-gray">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="container-custom">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cameg-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-cameg-dark">CAMEG-CHAIN</h1>
                <p className="text-sm text-gray-600">Espace Évaluateur — DAQP</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-gray-600 hover:text-cameg-blue transition-colors"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.priority === 'high' ? 'bg-red-500' :
                              notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assistance IA */}
              <button className="p-2 text-gray-600 hover:text-cameg-blue transition-colors">
                <Brain className="h-6 w-6" />
              </button>

              {/* Profil */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cameg-green rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.company_name || 'Évaluateur'}
                </span>
              </div>

              {/* Paramètres */}
              <button className="p-2 text-gray-600 hover:text-cameg-blue transition-colors">
                <Settings className="h-6 w-6" />
              </button>

              {/* Déconnexion */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-xl shadow-soft p-4 h-fit">
            <nav className="space-y-2">
              {[
                { id: 'accueil', icon: Home, label: 'Accueil' },
                { id: 'fournisseurs', icon: Users, label: 'Fournisseurs' },
                { id: 'dossiers', icon: FileText, label: 'Dossiers' },
                { id: 'grille-evaluation', icon: Calculator, label: 'Grille d\'évaluation' },
                { id: 'analyse-ia', icon: Brain, label: 'Analyse IA' },
                { id: 'rapports', icon: BarChart2, label: 'Rapports / Statistiques' },
                { id: 'historique', icon: History, label: 'Historique' },
                { id: 'parametres', icon: Settings, label: 'Paramètres' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-cameg-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {activeSection === item.id && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Footer institutionnel */}
      <footer className="bg-cameg-dark text-white py-8 mt-12">
        <div className="container-custom">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-cameg-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <h3 className="text-lg font-bold">CAMEG-CHAIN — Espace Évaluateur DAQP</h3>
            </div>
            <p className="text-gray-400 mb-2">
              © 2025 Centrale d'Achat des Médicaments Essentiels et Génériques (Togo)
            </p>
            <p className="text-sm text-gray-500">
              Données confidentielles — usage réservé au personnel autorisé
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EvaluatorDashboardPage;
