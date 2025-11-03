import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import TendersManagement from '../components/admin/TendersManagement';
import EvaluationsSupervision from '../components/admin/EvaluationsSupervision';
import AICenter from '../components/admin/AICenter';
import ReportsAnalytics from '../components/admin/ReportsAnalytics';
import AuditHistory from '../components/admin/AuditHistory';
import SystemSettings from '../components/admin/SystemSettings';
import SupportTickets from '../components/admin/SupportTickets';
import { 
  Bell, 
  Brain, 
  User, 
  Settings, 
  LogOut, 
  Home, 
  FileText, 
  Calculator, 
  BarChart2, 
  History,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCheck,
  ClipboardList,
  HelpCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('accueil');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Données simulées pour la démonstration
  const systemStats = {
    fournisseursEnregistres: 120,
    fournisseursValides: 85,
    enAttenteValidation: 10,
    fournisseursSuspendus: 3,
    evaluationsEnCours: 12,
    appelsOffresOuverts: 5
  };

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Nouveaux fournisseurs validés',
      message: '2 nouveaux fournisseurs validés aujourd\'hui',
      time: 'Il y a 1 heure',
      priority: 'high'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Certificat GMP expiré',
      message: 'Un certificat GMP arrive à expiration',
      time: 'Il y a 3 heures',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'ai',
      title: 'Analyse IA terminée',
      message: 'L\'IA a détecté 3 incohérences dans les dossiers récents',
      time: 'Il y a 5 heures',
      priority: 'high'
    },
    {
      id: 4,
      type: 'info',
      title: 'Rapport mensuel',
      message: 'Rapport mensuel généré avec succès',
      time: 'Il y a 1 jour',
      priority: 'low'
    }
  ];

  const suppliers = [
    {
      id: 1,
      name: 'PharmaTogo SARL',
      country: 'Togo',
      status: 'valide',
      score: 89,
      lastUpdate: '14/10/2025',
      actions: ['voir_fiche', 'suspendre']
    },
    {
      id: 2,
      name: 'BioPlus SA',
      country: 'Ghana',
      status: 'en_attente',
      score: null,
      lastUpdate: '15/10/2025',
      actions: ['valider', 'voir_dossier']
    },
    {
      id: 3,
      name: 'MedLab Int.',
      country: 'Inde',
      status: 'suspendu',
      score: 63,
      lastUpdate: '10/09/2025',
      actions: ['reactiver']
    }
  ];

  const evaluators = [
    {
      id: 1,
      name: 'Dr. Kossi',
      dossiersAssignes: 5,
      termine: 4,
      enCours: 1,
      derniereActivite: '15/10/2025',
      performance: 98
    },
    {
      id: 2,
      name: 'Mme Akouvi',
      dossiersAssignes: 3,
      termine: 3,
      enCours: 0,
      derniereActivite: '14/10/2025',
      performance: 100
    },
    {
      id: 3,
      name: 'Dr. Mensah',
      dossiersAssignes: 4,
      termine: 2,
      enCours: 2,
      derniereActivite: '13/10/2025',
      performance: 80
    }
  ];

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valide': return 'text-green-600 bg-green-100';
      case 'en_attente': return 'text-yellow-600 bg-yellow-100';
      case 'suspendu': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valide': return 'Validé';
      case 'en_attente': return 'En attente';
      case 'suspendu': return 'Suspendu';
      default: return 'Inconnu';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'ai': return <Brain className="h-5 w-5 text-blue-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderAccueil = () => (
    <div className="space-y-6">
      {/* Bandeau d'introduction */}
      <div className="bg-gradient-to-r from-cameg-blue to-blue-600 text-white rounded-xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Bienvenue, {user?.company_name || 'Administrateur'}
            </h1>
            <p className="text-blue-100">
              Voici l'état du système au {new Date().toLocaleDateString('fr-FR')} :
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setActiveSection('appels-offres')}
              className="btn-primary bg-white text-cameg-blue hover:bg-gray-100"
            >
              Créer un appel d'offres
            </button>
            <button 
              onClick={() => setActiveSection('fournisseurs')}
              className="btn-outline border-white text-white hover:bg-white hover:text-cameg-blue"
            >
              Voir les dossiers à valider
            </button>
            <button 
              onClick={() => setActiveSection('analyse-ia')}
              className="btn-outline border-white text-white hover:bg-white hover:text-cameg-blue"
            >
              Analyser les rapports IA
            </button>
          </div>
        </div>
      </div>

      {/* Messages UI dynamiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <p className="text-green-800">
              <strong>2 nouveaux fournisseurs validés aujourd'hui.</strong>
            </p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <p className="text-yellow-800">
              <strong>Un certificat GMP arrive à expiration.</strong>
            </p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Brain className="h-5 w-5 text-blue-600 mr-3" />
            <p className="text-blue-800">
              <strong>L'IA a détecté 3 incohérences dans les dossiers récents.</strong>
            </p>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <BarChart2 className="h-5 w-5 text-purple-600 mr-3" />
            <p className="text-purple-800">
              <strong>Rapport mensuel généré avec succès.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('fournisseurs')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{systemStats.fournisseursEnregistres}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Fournisseurs enregistrés</h3>
          <p className="text-sm text-gray-600">Nombre total</p>
        </div>

        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('fournisseurs')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{systemStats.fournisseursValides}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Fournisseurs validés</h3>
          <p className="text-sm text-gray-600">Profil complet et actif</p>
        </div>

        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('fournisseurs')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-yellow-600">{systemStats.enAttenteValidation}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">En attente de validation</h3>
          <p className="text-sm text-gray-600">Dossiers à examiner</p>
        </div>

        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('fournisseurs')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-red-600">{systemStats.fournisseursSuspendus}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Fournisseurs suspendus</h3>
          <p className="text-sm text-gray-600">Conformité non respectée</p>
        </div>

        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('evaluations')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{systemStats.evaluationsEnCours}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Évaluations en cours</h3>
          <p className="text-sm text-gray-600">Dossiers assignés</p>
        </div>

        <div 
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveSection('appels-offres')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-orange-600">{systemStats.appelsOffresOuverts}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Appels d'offres ouverts</h3>
          <p className="text-sm text-gray-600">En phase de soumission</p>
        </div>
      </div>

      {/* Alertes principales */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes Principales</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <p className="text-yellow-800">
              <strong>3 fournisseurs ont des documents expirés.</strong>
            </p>
          </div>
          <div className="flex items-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
            <Brain className="h-5 w-5 text-blue-600 mr-3" />
            <p className="text-blue-800">
              <strong>L'IA recommande de vérifier les dossiers 2025-02 et 2025-03.</strong>
            </p>
          </div>
          <div className="flex items-center p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
            <Info className="h-5 w-5 text-green-600 mr-3" />
            <p className="text-green-800">
              <strong>Nouvel appel d'offres ajouté par la Direction des Achats.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFournisseurs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Gestion des Fournisseurs</h1>
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
          Validés
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
          En attente
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
          Suspendus
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
          Alerte
        </button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher par nom, pays, score, date..."
          className="form-input pl-10"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tableau des fournisseurs */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pays
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score qualité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière MAJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
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
                    {supplier.lastUpdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {supplier.actions.includes('voir_fiche') && (
                        <button className="text-cameg-blue hover:text-blue-700">Voir fiche</button>
                      )}
                      {supplier.actions.includes('valider') && (
                        <button className="text-green-600 hover:text-green-700">Valider</button>
                      )}
                      {supplier.actions.includes('suspendre') && (
                        <button className="text-red-600 hover:text-red-700">Suspendre</button>
                      )}
                      {supplier.actions.includes('reactiver') && (
                        <button className="text-blue-600 hover:text-blue-700">Réactiver</button>
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

  const renderEvaluators = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Supervision des Évaluateurs</h1>
        <button className="btn-primary">
          Assigner un dossier
        </button>
      </div>

      {/* Tableau des évaluateurs */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dossiers assignés
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terminé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  En cours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evaluators.map((evaluator) => (
                <tr key={evaluator.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{evaluator.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.dossiersAssignes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.termine}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.enCours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {evaluator.derniereActivite}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      evaluator.performance >= 90 ? 'text-green-600 bg-green-100' :
                      evaluator.performance >= 80 ? 'text-yellow-600 bg-yellow-100' :
                      'text-red-600 bg-red-100'
                    }`}>
                      {evaluator.performance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-cameg-blue hover:text-blue-700">Assigner</button>
                      <button className="text-yellow-600 hover:text-yellow-700">Rappel</button>
                      <button className="text-gray-600 hover:text-gray-700">Historique</button>
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

  const renderContent = () => {
    switch (activeSection) {
      case 'accueil':
        return renderAccueil();
      case 'fournisseurs':
        return renderFournisseurs();
      case 'evaluateurs':
        return renderEvaluators();
      case 'appels-offres':
        return <TendersManagement />;
      case 'evaluations':
        return <EvaluationsSupervision />;
      case 'analyse-ia':
        return <AICenter />;
      case 'rapports':
        return <ReportsAnalytics />;
      case 'parametres':
        return <SystemSettings />;
      case 'audit':
        return <AuditHistory />;
      case 'support':
        return <SupportTickets />;
      default:
        return renderAccueil();
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
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
                <p className="text-sm text-gray-600">Espace Administrateur — Direction Assurance Qualité Pharmaceutique</p>
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
                      <h3 className="font-semibold text-gray-900">Notifications Globales</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                          <div className="flex items-start space-x-3">
                            {getNotificationIcon(notification.type)}
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

              {/* Centre IA */}
              <button className="p-2 text-gray-600 hover:text-cameg-blue transition-colors">
                <Brain className="h-6 w-6" />
              </button>

              {/* Profil */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cameg-green rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.company_name || 'Administrateur'}
                </span>
              </div>

              {/* Paramètres système */}
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
                { id: 'fournisseurs', icon: FileText, label: 'Fournisseurs' },
                { id: 'evaluateurs', icon: UserCheck, label: 'Évaluateurs' },
                { id: 'appels-offres', icon: ClipboardList, label: 'Appels d\'offres' },
                { id: 'evaluations', icon: Calculator, label: 'Évaluations' },
                { id: 'analyse-ia', icon: Brain, label: 'Analyse IA' },
                { id: 'rapports', icon: BarChart2, label: 'Rapports / Statistiques' },
                { id: 'parametres', icon: Settings, label: 'Paramètres système' },
                { id: 'audit', icon: History, label: 'Historique / Audit' },
                { id: 'support', icon: HelpCircle, label: 'Support' }
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
              <h3 className="text-lg font-bold">CAMEG-CHAIN — Espace Administrateur DAQP</h3>
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
    </ProtectedRoute>
  );
};

export default AdminDashboardPage;
