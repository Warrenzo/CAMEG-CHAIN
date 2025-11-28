import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  UserMinus, 
  Shield, 
  UserCheck, 
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users as UsersIcon,
  KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';
import SecureStorage from '../../services/storage';

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  role: string;
  status: string;
  is_active: boolean;
  phone_number: string | null;
  created_at: string;
  updated_at: string | null;
  last_login: string | null;
}

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  size: number;
  has_next: boolean;
  has_prev: boolean;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'admins' | 'evaluators' | 'suppliers'>('admins');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [resetForm, setResetForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  // Formulaire de création
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    full_name: '',
    username: '',
    phone_number: ''
  });

  // Fonction utilitaire pour obtenir l'URL de base de l'API sans duplication
  const getApiBaseUrl = () => {
    let apiUrl = process.env['REACT_APP_API_URL'] || 'http://localhost:8000';
    // S'assurer que l'URL ne se termine pas par /api/v1 pour éviter la duplication
    apiUrl = apiUrl.replace(/\/api\/v1\/?$/, '');
    return apiUrl;
  };

  useEffect(() => {
    loadUsers();
  }, [activeTab, page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = SecureStorage.getToken();
      if (!token) {
        toast.error('Vous devez être connecté pour accéder à cette fonctionnalité');
        setLoading(false);
        return;
      }

      const apiBaseUrl = getApiBaseUrl();
      const endpoint = activeTab === 'admins' 
        ? '/api/v1/admin/users/admins'
        : activeTab === 'evaluators'
        ? '/api/v1/admin/users/evaluators'
        : '/api/v1/admin/users/suppliers';
      
      console.log('🔍 Chargement des utilisateurs:', { endpoint, page, activeTab, apiBaseUrl });
      
      const response = await fetch(`${apiBaseUrl}${endpoint}?page=${page}&size=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: UserListResponse = await response.json();
        console.log('✅ Réponse reçue:', data);
        console.log('📊 Données utilisateurs:', { 
          usersCount: data.users?.length || 0, 
          total: data.total,
          users: data.users 
        });
        setUsers(data.users || []);
        setTotal(data.total || 0);
        
        if ((data.users || []).length === 0) {
          console.log('⚠️ Aucun utilisateur trouvé pour ce filtre');
        }
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des utilisateurs:', error);
      
      if (error.message) {
        toast.error(`Erreur: ${error.message}`);
      } else {
        toast.error('Erreur lors du chargement des utilisateurs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = SecureStorage.getToken();
      if (!token) {
        toast.error('Vous devez être connecté pour créer un utilisateur');
        return;
      }

      const apiBaseUrl = getApiBaseUrl();
      const endpoint = activeTab === 'admins'
        ? '/api/v1/admin/users/admins'
        : '/api/v1/admin/users/evaluators';
      
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: createForm.email,
          password: createForm.password,
          full_name: createForm.full_name,
          username: createForm.username || undefined,
          phone_number: createForm.phone_number || undefined
        })
      });

      if (response.ok) {
        toast.success(`${activeTab === 'admins' ? 'Administrateur' : 'Évaluateur'} créé avec succès`);
        setShowCreateModal(false);
        setCreateForm({ email: '', password: '', full_name: '', username: '', phone_number: '' });
        loadUsers();
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          SecureStorage.removeToken();
          window.location.href = '/login';
        } else if (response.status === 403) {
          toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
        } else {
          toast.error(errorData.detail || 'Erreur lors de la création de l\'utilisateur');
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleDeactivate = async (reason?: string) => {
    if (!selectedUser) return;

    try {
      const token = SecureStorage.getToken();
      if (!token) {
        toast.error('Vous devez être connecté pour désactiver un utilisateur');
        return;
      }

      const apiBaseUrl = getApiBaseUrl();
      const endpoint = activeTab === 'admins'
        ? `/api/v1/admin/users/admins/${selectedUser.id}/deactivate`
        : activeTab === 'evaluators'
        ? `/api/v1/admin/users/evaluators/${selectedUser.id}/deactivate`
        : `/api/v1/admin/users/suppliers/${selectedUser.id}/deactivate`;
      
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast.success('Utilisateur désactivé avec succès');
        setShowDeactivateModal(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          SecureStorage.removeToken();
          window.location.href = '/login';
        } else if (response.status === 403) {
          toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
        } else {
          toast.error(errorData.detail || 'Erreur lors de la désactivation de l\'utilisateur');
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la désactivation:', error);
      toast.error('Erreur lors de la désactivation de l\'utilisateur');
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      const token = SecureStorage.getToken();
      if (!token) {
        toast.error('Vous devez être connecté pour réactiver un utilisateur');
        return;
      }

      const apiBaseUrl = getApiBaseUrl();
      const endpoint = activeTab === 'admins'
        ? `/api/v1/admin/users/admins/${userId}/reactivate`
        : activeTab === 'evaluators'
        ? `/api/v1/admin/users/evaluators/${userId}/reactivate`
        : `/api/v1/admin/users/suppliers/${userId}/reactivate`;
      
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        toast.success('Utilisateur réactivé avec succès');
        loadUsers();
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          SecureStorage.removeToken();
          window.location.href = '/login';
        } else if (response.status === 403) {
          toast.error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
        } else {
          toast.error(errorData.detail || 'Erreur lors de la réactivation de l\'utilisateur');
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la réactivation:', error);
      toast.error('Erreur lors de la réactivation de l\'utilisateur');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const token = SecureStorage.getToken();
      if (!token) {
        toast.error('Vous devez être connecté pour réinitialiser un mot de passe');
        return;
      }

      const apiBaseUrl = getApiBaseUrl();
      const endpoint = `/api/v1/admin/users/${selectedUser.id}/reset-password`;

      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_password: resetForm.newPassword,
          confirm_password: resetForm.confirmPassword
        })
      });

      if (response.ok) {
        toast.success(`Mot de passe réinitialisé pour ${selectedUser.email}`);
        setShowResetModal(false);
        setResetForm({ newPassword: '', confirmPassword: '' });
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
          SecureStorage.removeToken();
          window.location.href = '/login';
        } else if (response.status === 403) {
          toast.error('Accès refusé. Vous n’avez pas les permissions nécessaires.');
        } else {
          toast.error(errorData.detail || 'Erreur lors de la réinitialisation');
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'evaluator': return 'Évaluateur';
      case 'supplier': return 'Fournisseur';
      case 'superadmin': return 'Super-Admin';
      default: return role;
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.is_active && user.status === 'actif') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Actif
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Suspendu
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-cameg-dark">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-1">Créer, activer et désactiver les utilisateurs du système</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadUsers}
            className="btn-outline flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
          {(activeTab === 'admins' || activeTab === 'evaluators') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Créer {activeTab === 'admins' ? 'Admin' : 'Évaluateur'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'admins' as const, label: 'Administrateurs', icon: Shield },
            { id: 'evaluators' as const, label: 'Évaluateurs', icon: UserCheck },
            { id: 'suppliers' as const, label: 'Fournisseurs', icon: UsersIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
                setSearchTerm('');
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-cameg-blue text-cameg-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par email, nom ou username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue focus:border-cameg-blue"
          />
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-cameg-blue" />
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || user.username}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getRoleLabel(user.role)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString('fr-FR')
                        : 'Jamais'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {user.is_active ? (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeactivateModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                          >
                            <UserMinus className="h-4 w-4" />
                            <span>Désactiver</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(user.id)}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                          >
                            <UserCheck className="h-4 w-4" />
                            <span>Réactiver</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setResetForm({ newPassword: '', confirmPassword: '' });
                            setShowResetModal(true);
                          }}
                          className="text-cameg-blue hover:text-blue-800 flex items-center space-x-1"
                        >
                          <KeyRound className="h-4 w-4" />
                          <span>Réinitialiser</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de {(page - 1) * 20 + 1} à {Math.min(page * 20, total)} sur {total}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 20 >= total}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              Créer un {activeTab === 'admins' ? 'Administrateur' : 'Évaluateur'}
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue"
                  placeholder="Min. 8 caractères, majuscule, minuscule, chiffre, spécial"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username (optionnel)
                </label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={createForm.phone_number}
                  onChange={(e) => setCreateForm({ ...createForm, phone_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Créer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ email: '', password: '', full_name: '', username: '', phone_number: '' });
                  }}
                  className="flex-1 btn-outline"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de désactivation */}
      {showDeactivateModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Désactiver l'utilisateur</h2>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir désactiver <strong>{selectedUser.email}</strong> ?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeactivate()}
                className="flex-1 btn-primary bg-red-600 hover:bg-red-700"
              >
                Confirmer
              </button>
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 btn-outline"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réinitialisation */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Réinitialiser le mot de passe</h2>
            <p className="text-gray-600 mb-4">
              Nouveau mot de passe pour <strong>{selectedUser.email}</strong>
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe *
                </label>
                <input
                  type="password"
                  required
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue"
                  placeholder="Min. 8 caractères, majuscule, minuscule, chiffre, spécial"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe *
                </label>
                <input
                  type="password"
                  required
                  value={resetForm.confirmPassword}
                  onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Réinitialiser
                </button>
                <button
                  type="button"
                  className="flex-1 btn-outline"
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;

