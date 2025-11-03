import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  Activity,
  Ban,
  RefreshCw,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ActiveConnection {
  id: string;
  user: string;
  role: 'admin' | 'evaluator' | 'supplier' | 'super-admin';
  ip: string;
  time: string;
  status: 'active' | 'inactive' | 'warning';
  location?: string;
  lastActivity: string;
}

interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'session_expired' | 'suspicious_activity' | 'unauthorized_access';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  ip?: string;
  user?: string;
  status: 'open' | 'investigating' | 'resolved';
}

const SecurityAccess: React.FC = () => {
  const [showIPs, setShowIPs] = useState(false);

  // Données simulées
  const activeConnections: ActiveConnection[] = [
    {
      id: '1',
      user: 'Admin-01',
      role: 'admin',
      ip: '41.204.x.x',
      time: '14:45',
      status: 'active',
      location: 'Lomé, Togo',
      lastActivity: 'Il y a 2 min'
    },
    {
      id: '2',
      user: 'Eva-Kossi',
      role: 'evaluator',
      ip: '41.67.x.x',
      time: '14:40',
      status: 'active',
      location: 'Kara, Togo',
      lastActivity: 'Il y a 5 min'
    },
    {
      id: '3',
      user: 'Fourn-008',
      role: 'supplier',
      ip: '129.2.x.x',
      time: '13:00',
      status: 'inactive',
      location: 'Accra, Ghana',
      lastActivity: 'Il y a 1h 45min'
    },
    {
      id: '4',
      user: 'SuperAdmin',
      role: 'super-admin',
      ip: '192.168.1.100',
      time: '14:50',
      status: 'active',
      location: 'Local',
      lastActivity: 'Maintenant'
    }
  ];

  const securityAlerts: SecurityAlert[] = [
    {
      id: '1',
      type: 'failed_login',
      description: 'Tentative de connexion échouée (5 fois)',
      severity: 'high',
      timestamp: '2025-10-15 14:30',
      ip: '203.45.x.x',
      user: 'unknown',
      status: 'open'
    },
    {
      id: '2',
      type: 'session_expired',
      description: 'Session expirée automatiquement',
      severity: 'medium',
      timestamp: '2025-10-15 14:25',
      ip: '41.67.x.x',
      user: 'Eva-Kossi',
      status: 'resolved'
    },
    {
      id: '3',
      type: 'suspicious_activity',
      description: 'Accès depuis une nouvelle localisation',
      severity: 'medium',
      timestamp: '2025-10-15 13:15',
      ip: '129.2.x.x',
      user: 'Fourn-008',
      status: 'investigating'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'text-purple-600 bg-purple-100';
      case 'admin':
        return 'text-blue-600 bg-blue-100';
      case 'evaluator':
        return 'text-green-600 bg-green-100';
      case 'supplier':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'Super-Admin';
      case 'admin':
        return 'Administrateur';
      case 'evaluator':
        return 'Évaluateur';
      case 'supplier':
        return 'Fournisseur';
      default:
        return 'Inconnu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'inactive':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'warning':
        return 'Attention';
      default:
        return 'Inconnu';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'Critique';
      case 'high':
        return 'Élevée';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Faible';
      default:
        return 'Inconnue';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'failed_login':
        return <Lock className="h-4 w-4" />;
      case 'session_expired':
        return <Clock className="h-4 w-4" />;
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4" />;
      case 'unauthorized_access':
        return <Ban className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleForceDisconnect = (_connectionId: string) => {
    toast.success('Déconnexion forcée effectuée');
  };

  const handleResetPassword = (_userId: string) => {
    toast.success('Mot de passe réinitialisé');
  };

  const handleBlockIP = (ip: string) => {
    toast.success(`IP ${ip} bloquée`);
  };

  const handleResolveAlert = (_alertId: string) => {
    toast.success('Alerte résolue');
  };

  const handleNotifyAdmin = (_alertId: string) => {
    toast.success('Administrateur DAQP notifié');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Sécurité & Accès</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowIPs(!showIPs)}
            className="btn-outline flex items-center space-x-2"
          >
            {showIPs ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showIPs ? 'Masquer IPs' : 'Afficher IPs'}</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques de sécurité */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connexions actives</p>
              <p className="text-2xl font-bold text-green-600">
                {activeConnections.filter(c => c.status === 'active').length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertes ouvertes</p>
              <p className="text-2xl font-bold text-red-600">
                {securityAlerts.filter(a => a.status === 'open').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tentatives échouées</p>
              <p className="text-2xl font-bold text-orange-600">5</p>
              <p className="text-xs text-gray-500">24h</p>
            </div>
            <Lock className="h-8 w-8 text-orange-400" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sessions expirées</p>
              <p className="text-2xl font-bold text-yellow-600">12</p>
              <p className="text-xs text-gray-500">24h</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Contrôle des connexions actives */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Contrôle des connexions actives</h3>
          <p className="text-sm text-gray-600">Surveillance des sessions utilisateurs</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeConnections.map((connection) => (
                <tr key={connection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-cameg-blue mr-3" />
                      <div className="text-sm font-medium text-gray-900">{connection.user}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(connection.role)}`}>
                      {getRoleText(connection.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {showIPs ? connection.ip : '***.***.***.***'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {connection.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {connection.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(connection.status)}`}>
                      {getStatusIcon(connection.status)}
                      <span className="ml-1">{getStatusText(connection.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleForceDisconnect(connection.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Déconnecter
                      </button>
                      <button
                        onClick={() => handleResetPassword(connection.id)}
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        Réinitialiser
                      </button>
                      <button
                        onClick={() => handleBlockIP(connection.ip)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        Bloquer IP
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertes de sécurité */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Alertes de sécurité</h3>
          <p className="text-sm text-gray-600">Surveillance des activités suspectes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gravité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {securityAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getAlertIcon(alert.type)}
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        {alert.type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{alert.description}</div>
                    {alert.ip && (
                      <div className="text-xs text-gray-500">IP: {showIPs ? alert.ip : '***.***.***.***'}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                      {getSeverityText(alert.severity)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(alert.timestamp).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      alert.status === 'resolved' ? 'text-green-600 bg-green-100' :
                      alert.status === 'investigating' ? 'text-yellow-600 bg-yellow-100' :
                      'text-red-600 bg-red-100'
                    }`}>
                      {alert.status === 'resolved' ? 'Résolu' :
                       alert.status === 'investigating' ? 'En cours' : 'Ouvert'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {alert.status === 'open' && (
                        <>
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Résoudre
                          </button>
                          <button
                            onClick={() => handleNotifyAdmin(alert.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Notifier Admin
                          </button>
                        </>
                      )}
                      {alert.ip && (
                        <button
                          onClick={() => handleBlockIP(alert.ip!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Bloquer IP
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

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <button className="w-full btn-outline text-sm">
              Forcer déconnexion globale
            </button>
            <button className="w-full btn-outline text-sm">
              Réinitialiser tous les mots de passe
            </button>
            <button className="w-full btn-outline text-sm">
              Bloquer toutes les IPs suspectes
            </button>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration sécurité</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Authentification 2FA</span>
              <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sessions automatiques</span>
              <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Détection anomalies</span>
              <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Connexions aujourd'hui</span>
              <span className="font-semibold">47</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tentatives échouées</span>
              <span className="font-semibold text-red-600">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">IPs bloquées</span>
              <span className="font-semibold text-orange-600">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sessions actives</span>
              <span className="font-semibold text-green-600">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAccess;
