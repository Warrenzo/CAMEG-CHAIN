import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AIServiceMonitoring from '../components/super-admin/AIServiceMonitoring';
import DatabaseControl from '../components/super-admin/DatabaseControl';
import SecurityAccess from '../components/super-admin/SecurityAccess';
import { 
  Bell, 
  Brain, 
  User, 
  Settings, 
  LogOut, 
  Home, 
  Server, 
  Database, 
  Shield, 
  HardDrive, 
  FileText, 
  History,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Globe,
  Lock,
  RefreshCw,
  Download,
  Upload,
  Users,
  AlertTriangle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('accueil');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Données simulées pour la démonstration
  const systemStatus = {
    overall: 'stable',
    uptime: '99.99%',
    lastBackup: '2025-10-16 02:00',
    activeModules: 4,
    criticalErrors: 0,
    sslStatus: 'active'
  };

  const modules = [
    {
      name: 'Backend Python (FastAPI)',
      status: 'active',
      lastActivity: '2s',
      uptime: '99.99%',
      responseTime: '120ms'
    },
    {
      name: 'IA Service (Flask ML)',
      status: 'active',
      lastActivity: '5s',
      uptime: '99.90%',
      responseTime: '220ms'
    },
    {
      name: 'Frontend React',
      status: 'online',
      lastActivity: '3s',
      uptime: '100%',
      responseTime: '45ms'
    },
    {
      name: 'PostgreSQL',
      status: 'connected',
      lastActivity: '—',
      uptime: '99.98%',
      responseTime: '15ms'
    }
  ];

  const apiEndpoints = [
    {
      route: '/api/login',
      responseTime: '120ms',
      status: 'success',
      lastCall: '2025-10-15 14:30',
      errors24h: 0
    },
    {
      route: '/api/supplier/register',
      responseTime: '145ms',
      status: 'success',
      lastCall: '2025-10-15 14:25',
      errors24h: 2
    },
    {
      route: '/api/evaluator/evaluate',
      responseTime: '200ms',
      status: 'success',
      lastCall: '2025-10-15 14:20',
      errors24h: 0
    },
    {
      route: '/api/ai/analyse',
      responseTime: '220ms',
      status: 'success',
      lastCall: '2025-10-16 14:15',
      errors24h: 1
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Sauvegarde automatique réussie',
      message: 'Sauvegarde de la base de données terminée avec succès',
      time: 'Il y a 2 heures',
      priority: 'low'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Temps de réponse élevé',
      message: 'L\'API /api/ai/analyse présente des temps de réponse > 200ms',
      time: 'Il y a 30 minutes',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'info',
      title: 'Mise à jour IA disponible',
      message: 'Nouvelle version du modèle IA disponible',
      time: 'Il y a 1 heure',
      priority: 'low'
    },
    {
      id: 4,
      type: 'error',
      title: 'Erreur de validation email',
      message: '2 erreurs de validation email dans /api/supplier/register',
      time: 'Il y a 45 minutes',
      priority: 'high'
    }
  ];

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'online':
      case 'connected':
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
      case 'active':
      case 'online':
      case 'connected':
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'online': return 'En ligne';
      case 'connected': return 'Connecté';
      case 'success': return 'OK';
      case 'warning': return 'Avertissement';
      case 'error': return 'Erreur';
      default: return 'Inconnu';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderAccueil = () => (
    <div className="space-y-6">
      {/* Bandeau de résumé global */}
      <div className="bg-gradient-to-r from-cameg-blue to-blue-600 text-white rounded-xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              CAMEG-CHAIN System Monitor
            </h1>
            <p className="text-blue-100">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-blue-100 mt-2">
              Tous les modules sont opérationnels.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{systemStatus.uptime}</div>
            <div className="text-blue-100">Uptime global</div>
          </div>
        </div>
      </div>

      {/* Bandeau d'état en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <p className="text-green-800">
              <strong>Système stable — {systemStatus.activeModules} modules actifs — {systemStatus.criticalErrors} erreur critique.</strong>
            </p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <p className="text-blue-800">
              <strong>Dernière sauvegarde : {systemStatus.lastBackup}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Cartes d'état des modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(module.status)}`}>
                {getStatusIcon(module.status)}
                <span className="ml-1">{getStatusText(module.status)}</span>
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{module.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Dernière activité:</span>
                <span className="font-medium">{module.lastActivity}</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-medium">{module.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span>Temps de réponse:</span>
                <span className="font-medium">{module.responseTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques système */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Requêtes API (24h)</p>
              <p className="text-2xl font-bold text-gray-900">12,847</p>
            </div>
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Erreurs (24h)</p>
              <p className="text-2xl font-bold text-red-600">3</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-green-600">47</p>
            </div>
            <Users className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackendModules = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Modules Backend / API</h1>
        <div className="flex space-x-3">
          <button className="btn-outline flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export logs CSV</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Redémarrer modules</span>
          </button>
        </div>
      </div>

      {/* Tableau des endpoints API */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API / Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temps de réponse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernier appel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erreurs 24h
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiEndpoints.map((endpoint, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{endpoint.route}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {endpoint.responseTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(endpoint.status)}`}>
                      {getStatusIcon(endpoint.status)}
                      <span className="ml-1">{getStatusText(endpoint.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(endpoint.lastCall).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={endpoint.errors24h > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                      {endpoint.errors24h}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-cameg-blue hover:text-blue-700">Voir logs</button>
                      <button className="text-yellow-600 hover:text-yellow-700">Redémarrer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Métriques de performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance API</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Temps moyen</span>
              <span className="font-semibold">171ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Temps max</span>
              <span className="font-semibold">220ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Requêtes/min</span>
              <span className="font-semibold">89</span>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Erreurs récentes</h3>
          <div className="space-y-2">
            <div className="text-sm text-red-600">• Timeout API IA (1x)</div>
            <div className="text-sm text-red-600">• Validation email (2x)</div>
            <div className="text-sm text-green-600">• Aucune autre erreur</div>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-2">
            <button className="w-full btn-outline text-sm">Voir logs détaillés</button>
            <button className="w-full btn-outline text-sm">Tester endpoints</button>
            <button className="w-full btn-outline text-sm">Redémarrer services</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'accueil':
        return renderAccueil();
      case 'backend':
        return renderBackendModules();
      case 'ia':
        return <AIServiceMonitoring />;
      case 'database':
        return <DatabaseControl />;
      case 'securite':
        return <SecurityAccess />;
      case 'stockage':
        return <div className="text-center py-12"><h2 className="text-xl font-semibold">Stockage en développement</h2></div>;
      case 'logs':
        return <div className="text-center py-12"><h2 className="text-xl font-semibold">Logs en développement</h2></div>;
      case 'parametres':
        return <div className="text-center py-12"><h2 className="text-xl font-semibold">Paramètres en développement</h2></div>;
      case 'sauvegardes':
        return <div className="text-center py-12"><h2 className="text-xl font-semibold">Sauvegardes en développement</h2></div>;
      case 'audit':
        return <div className="text-center py-12"><h2 className="text-xl font-semibold">Audit en développement</h2></div>;
      case 'utilisateurs':
        return <div className="text-center py-12"><h2 className="text-xl font-semibold">Utilisateurs en développement</h2></div>;
      case 'alertes':
        return <div className="text-center py-12"><h2 className="text-xl font-semibold">Alertes en développement</h2></div>;
      case 'integrations':
        return <div className="text-center py-12"><h2 className="text-xl font-semibold">Intégrations en développement</h2></div>;
      case 'mises-a-jour':
        return <div className="text-center py-12"><h2 className="text-xl font-semibold">Mises à jour en développement</h2></div>;
      case 'maintenance':
        return <div className="text-center py-12"><h2 className="text-xl font-semibold">Maintenance en développement</h2></div>;
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
                <p className="text-sm text-gray-600">Super-Administrateur — Système global de supervision</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Statut sécurité */}
              <div className="flex items-center space-x-2 text-sm">
                <Lock className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">Connexion SSL active</span>
              </div>

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
                      <h3 className="font-semibold text-gray-900">Notifications Système</h3>
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

              {/* Paramètres IA */}
              <button className="p-2 text-gray-600 hover:text-cameg-blue transition-colors">
                <Settings className="h-6 w-6" />
              </button>

              {/* Monitor IA */}
              <button className="p-2 text-gray-600 hover:text-cameg-blue transition-colors">
                <Brain className="h-6 w-6" />
              </button>

              {/* Profil */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cameg-green rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.company_name || 'Super-Admin'}
                </span>
              </div>

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
                { id: 'accueil', icon: Home, label: 'Accueil / Vue système' },
                { id: 'backend', icon: Server, label: 'Modules Backend / API' },
                { id: 'ia', icon: Brain, label: 'Service IA' },
                { id: 'database', icon: Database, label: 'Base de données' },
                { id: 'securite', icon: Shield, label: 'Sécurité & Accès' },
                { id: 'stockage', icon: HardDrive, label: 'Stockage fichiers' },
                { id: 'logs', icon: FileText, label: 'Logs & Diagnostics' },
                { id: 'parametres', icon: Settings, label: 'Paramètres système' },
                { id: 'sauvegardes', icon: Download, label: 'Sauvegardes' },
                { id: 'audit', icon: History, label: 'Audit général' },
                { id: 'utilisateurs', icon: Users, label: 'Utilisateurs / Rôles' },
                { id: 'alertes', icon: AlertTriangle, label: 'Alertes critiques' },
                { id: 'integrations', icon: Globe, label: 'Intégrations externes' },
                { id: 'mises-a-jour', icon: Upload, label: 'Mises à jour' },
                { id: 'maintenance', icon: RefreshCw, label: 'Maintenance système' }
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
                  <span className="font-medium text-sm">{item.label}</span>
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
              <h3 className="text-lg font-bold">CAMEG-CHAIN — Super-Administrateur</h3>
            </div>
            <p className="text-gray-400 mb-2">
              © 2025 Centrale d'Achat des Médicaments Essentiels et Génériques (Togo)
            </p>
            <p className="text-sm text-gray-500">
              Système de supervision technique — accès restreint
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SuperAdminDashboardPage;
