import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Brain,
  FileText,
  Settings,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AuditLog {
  id: string;
  date: string;
  time: string;
  user: string;
  userRole: 'admin' | 'evaluator' | 'supplier' | 'system' | 'ai';
  action: string;
  target: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details: string;
  ipAddress?: string;
  sessionId?: string;
}

const AuditHistory: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('week');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Données simulées
  const auditLogs: AuditLog[] = [
    {
      id: 'AUD-001',
      date: '2025-10-15',
      time: '14:30:25',
      user: 'Dr. Marie Kouassi',
      userRole: 'admin',
      action: 'Validation fournisseur',
      target: 'PharmaTogo SARL',
      status: 'success',
      details: 'Fournisseur validé avec score de 89% après évaluation complète',
      ipAddress: '192.168.1.100',
      sessionId: 'SESS-789123'
    },
    {
      id: 'AUD-002',
      date: '2025-10-15',
      time: '14:25:10',
      user: 'Système IA',
      userRole: 'ai',
      action: 'Rapport généré',
      target: 'Dossier 2025-02',
      status: 'info',
      details: 'Rapport d\'analyse IA généré automatiquement - 3 anomalies détectées',
      sessionId: 'AI-SESS-456'
    },
    {
      id: 'AUD-003',
      date: '2025-10-15',
      time: '14:20:45',
      user: 'Dr. Kossi',
      userRole: 'evaluator',
      action: 'Soumission évaluation',
      target: 'BioPlus SA',
      status: 'success',
      details: 'Évaluation soumise avec score global de 92%',
      ipAddress: '192.168.1.105',
      sessionId: 'SESS-456789'
    },
    {
      id: 'AUD-004',
      date: '2025-10-15',
      time: '14:15:30',
      user: 'Mme Akouvi',
      userRole: 'evaluator',
      action: 'Tentative d\'accès',
      target: 'Dossier 2025-03',
      status: 'warning',
      details: 'Tentative d\'accès à un dossier non assigné - accès refusé',
      ipAddress: '192.168.1.110',
      sessionId: 'SESS-123456'
    },
    {
      id: 'AUD-005',
      date: '2025-10-15',
      time: '14:10:15',
      user: 'PharmaTogo SARL',
      userRole: 'supplier',
      action: 'Mise à jour profil',
      target: 'Profil fournisseur',
      status: 'success',
      details: 'Mise à jour des informations de contact et documents',
      ipAddress: '203.45.67.89',
      sessionId: 'SESS-987654'
    },
    {
      id: 'AUD-006',
      date: '2025-10-15',
      time: '14:05:00',
      user: 'Dr. Marie Kouassi',
      userRole: 'admin',
      action: 'Suspension fournisseur',
      target: 'MedLab International',
      status: 'error',
      details: 'Fournisseur suspendu pour non-conformité aux exigences GMP',
      ipAddress: '192.168.1.100',
      sessionId: 'SESS-789123'
    },
    {
      id: 'AUD-007',
      date: '2025-10-15',
      time: '14:00:30',
      user: 'Système',
      userRole: 'system',
      action: 'Sauvegarde automatique',
      target: 'Base de données',
      status: 'info',
      details: 'Sauvegarde automatique de la base de données effectuée avec succès',
      sessionId: 'SYS-SESS-001'
    },
    {
      id: 'AUD-008',
      date: '2025-10-15',
      time: '13:55:20',
      user: 'Dr. Mensah',
      userRole: 'evaluator',
      action: 'Connexion',
      target: 'Système',
      status: 'success',
      details: 'Connexion réussie depuis l\'adresse IP 192.168.1.115',
      ipAddress: '192.168.1.115',
      sessionId: 'SESS-555666'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'info': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Succès';
      case 'warning': return 'Avertissement';
      case 'error': return 'Erreur';
      case 'info': return 'Information';
      default: return 'Inconnu';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'evaluator': return <User className="h-4 w-4" />;
      case 'supplier': return <FileText className="h-4 w-4" />;
      case 'ai': return <Brain className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'evaluator': return 'text-blue-600 bg-blue-100';
      case 'supplier': return 'text-green-600 bg-green-100';
      case 'ai': return 'text-orange-600 bg-orange-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'evaluator': return 'Évaluateur';
      case 'supplier': return 'Fournisseur';
      case 'ai': return 'IA';
      case 'system': return 'Système';
      default: return 'Inconnu';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesFilter = activeFilter === 'all' || log.status === activeFilter;
    const matchesSearch = searchTerm === '' || 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportLogs = () => {
    toast.success('📄 Journal d\'audit exporté avec succès');
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
  };

  const stats = {
    total: auditLogs.length,
    success: auditLogs.filter(l => l.status === 'success').length,
    warning: auditLogs.filter(l => l.status === 'warning').length,
    error: auditLogs.filter(l => l.status === 'error').length,
    info: auditLogs.filter(l => l.status === 'info').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Historique / Audit</h1>
        <div className="flex space-x-3">
          <button onClick={handleExportLogs} className="btn-outline flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
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
            <History className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Succès</p>
              <p className="text-2xl font-bold text-green-600">{stats.success}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avertissements</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Erreurs</p>
              <p className="text-2xl font-bold text-red-600">{stats.error}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Informations</p>
              <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Recherche</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par utilisateur, action, cible..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="form-label">Statut</label>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">Tous</option>
              <option value="success">Succès</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
              <option value="info">Information</option>
            </select>
          </div>
          <div>
            <label className="form-label">Période</label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="form-input"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des logs */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cible
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
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{new Date(log.date).toLocaleDateString('fr-FR')}</div>
                      <div className="text-gray-500">{log.time}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(log.userRole)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{log.user}</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(log.userRole)}`}>
                          {getRoleText(log.userRole)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.target}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                      {getStatusIcon(log.status)}
                      <span className="ml-1">{getStatusText(log.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(log)}
                      className="text-cameg-blue hover:text-blue-700"
                    >
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Détails de l'action - {selectedLog.id}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Date et heure</label>
                  <p className="text-gray-900">
                    {new Date(selectedLog.date).toLocaleDateString('fr-FR')} à {selectedLog.time}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Utilisateur</label>
                  <p className="text-gray-900">{selectedLog.user}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Rôle</label>
                  <p className="text-gray-900">{getRoleText(selectedLog.userRole)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Statut</label>
                  <p className="text-gray-900">{getStatusText(selectedLog.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Action</label>
                  <p className="text-gray-900">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Cible</label>
                  <p className="text-gray-900">{selectedLog.target}</p>
                </div>
                {selectedLog.ipAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Adresse IP</label>
                    <p className="text-gray-900">{selectedLog.ipAddress}</p>
                  </div>
                )}
                {selectedLog.sessionId && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">ID de session</label>
                    <p className="text-gray-900">{selectedLog.sessionId}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Détails</label>
                <p className="text-gray-900">{selectedLog.details}</p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="btn-outline"
                >
                  Fermer
                </button>
                <button className="btn-primary">
                  Exporter cette entrée
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditHistory;
