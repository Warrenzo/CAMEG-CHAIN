import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  HardDrive,
  Activity,
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DatabaseTable {
  name: string;
  status: 'ok' | 'warning' | 'error';
  size: string;
  lastBackup: string;
  records: number;
  health: number;
}

interface DatabaseStats {
  totalSize: string;
  totalTables: number;
  activeConnections: number;
  uptime: string;
  lastMaintenance: string;
}

const DatabaseControl: React.FC = () => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Données simulées
  const tables: DatabaseTable[] = [
    {
      name: 'Table fournisseurs',
      status: 'ok',
      size: '230 Mo',
      lastBackup: '02:00',
      records: 1247,
      health: 98
    },
    {
      name: 'Table évaluations',
      status: 'ok',
      size: '120 Mo',
      lastBackup: '02:00',
      records: 892,
      health: 95
    },
    {
      name: 'Table IA logs',
      status: 'ok',
      size: '45 Mo',
      lastBackup: '02:00',
      records: 2156,
      health: 92
    },
    {
      name: 'Table appels_offres',
      status: 'warning',
      size: '89 Mo',
      lastBackup: '02:00',
      records: 156,
      health: 88
    },
    {
      name: 'Table audit_logs',
      status: 'ok',
      size: '156 Mo',
      lastBackup: '02:00',
      records: 8934,
      health: 96
    }
  ];

  const stats: DatabaseStats = {
    totalSize: '640 Mo',
    totalTables: 12,
    activeConnections: 8,
    uptime: '99.98%',
    lastMaintenance: '2025-10-15 03:00'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
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
      case 'ok':
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
      case 'ok':
        return 'OK';
      case 'warning':
        return 'Attention';
      case 'error':
        return 'Erreur';
      default:
        return 'Inconnu';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-600';
    if (health >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleInspectTable = (tableName: string) => {
    toast.success(`Inspection de la table ${tableName}...`);
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    // Simulation d'une action
    await new Promise(resolve => setTimeout(resolve, 3000));
    toast.success('Sauvegarde manuelle créée avec succès');
    setIsCreatingBackup(false);
  };

  const handleRestore = async (tableName: string) => {
    setIsRestoring(true);
    // Simulation d'une action
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success(`Restauration de ${tableName} terminée`);
    setIsRestoring(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Base de données (PostgreSQL)</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="btn-outline flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Sauvegarde manuelle</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taille totale</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSize}</p>
            </div>
            <HardDrive className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tables</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTables}</p>
            </div>
            <Database className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connexions actives</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeConnections}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-green-600">{stats.uptime}</p>
            </div>
            <Clock className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dernière maintenance</p>
              <p className="text-sm font-bold text-gray-900">{stats.lastMaintenance}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Tableau de santé des tables */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Tableau de santé</h3>
          <p className="text-sm text-gray-600">État des tables et intégrité des données</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Élément
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enregistrements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Santé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière sauvegarde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tables.map((table, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 text-cameg-blue mr-3" />
                      <div className="text-sm font-medium text-gray-900">{table.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(table.status)}`}>
                      {getStatusIcon(table.status)}
                      <span className="ml-1">{getStatusText(table.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {table.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {table.records.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`font-semibold ${getHealthColor(table.health)}`}>
                      {table.health}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {table.lastBackup}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleInspectTable(table.name)}
                        className="text-cameg-blue hover:text-blue-700"
                      >
                        Inspecter
                      </button>
                      <button
                        onClick={() => handleRestore(table.name)}
                        disabled={isRestoring}
                        className="text-green-600 hover:text-green-700 disabled:opacity-50"
                      >
                        Restaurer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions et maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions de maintenance</h3>
          <div className="space-y-3">
            <button className="w-full btn-outline text-sm flex items-center justify-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Inspecter toutes les tables</span>
            </button>
            <button className="w-full btn-outline text-sm flex items-center justify-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Créer une sauvegarde complète</span>
            </button>
            <button className="w-full btn-outline text-sm flex items-center justify-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>Restaurer une version précédente</span>
            </button>
            <button className="w-full btn-outline text-sm flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Optimiser les index</span>
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Sauvegardes automatiques</label>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-gray-600">Quotidiennes à 02:00</span>
                <div className="w-12 h-6 bg-green-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Stockage des sauvegardes</label>
              <div className="mt-1">
                <select className="form-input text-sm">
                  <option value="local">Local</option>
                  <option value="cloud">Cloud</option>
                  <option value="both">Local + Cloud</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Rétention des logs</label>
              <div className="mt-1">
                <select className="form-input text-sm">
                  <option value="30">30 jours</option>
                  <option value="90">90 jours</option>
                  <option value="365">1 an</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Alertes par email</span>
              <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes et recommandations */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes et recommandations</h3>
        <div className="space-y-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h4 className="font-medium text-yellow-900">Table appels_offres</h4>
                <p className="text-sm text-yellow-700">
                  Santé à 88% - Recommandation d'optimisation des index
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-blue-900">Maintenance programmée</h4>
                <p className="text-sm text-blue-700">
                  Optimisation automatique prévue le 20/10/2025 à 03:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseControl;
