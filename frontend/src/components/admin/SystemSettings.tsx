import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Mail, 
  Brain, 
  Save, 
  Plus, 
  Eye, 
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'evaluator' | 'supplier';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Données simulées
  const users: User[] = [
    {
      id: '1',
      name: 'Dr. Marie Kouassi',
      email: 'marie.kouassi@cameg.bf',
      role: 'admin',
      status: 'active',
      lastLogin: '2025-10-15 14:30',
      createdAt: '2025-01-15'
    },
    {
      id: '2',
      name: 'Dr. Kossi',
      email: 'kossi@cameg.bf',
      role: 'evaluator',
      status: 'active',
      lastLogin: '2025-10-15 13:45',
      createdAt: '2025-02-10'
    },
    {
      id: '3',
      name: 'Mme Akouvi',
      email: 'akouvi@cameg.bf',
      role: 'evaluator',
      status: 'active',
      lastLogin: '2025-10-15 12:20',
      createdAt: '2025-02-15'
    },
    {
      id: '4',
      name: 'Dr. Mensah',
      email: 'mensah@cameg.bf',
      role: 'evaluator',
      status: 'inactive',
      lastLogin: '2025-10-10 16:00',
      createdAt: '2025-03-01'
    }
  ];

  const [systemConfig, setSystemConfig] = useState({
    validationTimeout: 7,
    notificationEnabled: true,
    autoBackup: true,
    backupFrequency: 'daily',
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 3,
    twoFactorRequired: false
  });

  const [emailTemplates, setEmailTemplates] = useState({
    supplierWelcome: 'Bienvenue sur CAMEG-CHAIN. Votre compte a été créé avec succès.',
    supplierValidation: 'Félicitations ! Votre profil a été validé par notre équipe.',
    supplierRejection: 'Votre profil nécessite des modifications avant validation.',
    evaluatorAssignment: 'Un nouveau dossier vous a été assigné pour évaluation.',
    systemMaintenance: 'Maintenance système programmée. Veuillez sauvegarder vos travaux.'
  });

  const [aiSettings, setAiSettings] = useState({
    autoAnalysis: true,
    complianceCheck: true,
    riskAssessment: true,
    anomalyDetection: true,
    reportGeneration: true,
    confidenceThreshold: 85,
    updateFrequency: 'hourly'
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'evaluator' as 'admin' | 'evaluator' | 'supplier',
    password: ''
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'evaluator': return 'text-blue-600 bg-blue-100';
      case 'supplier': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'evaluator': return 'Évaluateur';
      case 'supplier': return 'Fournisseur';
      default: return 'Inconnu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    toast.success('✅ Utilisateur créé avec succès');
    setIsCreatingUser(false);
    setNewUser({ name: '', email: '', role: 'evaluator', password: '' });
  };

  const handleSaveSettings = (section: string) => {
    toast.success(`✅ Paramètres ${section} sauvegardés avec succès`);
  };

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cameg-dark">Gestion des Utilisateurs</h2>
        <button
          onClick={() => setIsCreatingUser(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Créer un utilisateur</span>
        </button>
      </div>

      {/* Formulaire de création d'utilisateur */}
      {isCreatingUser && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer un nouvel utilisateur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Nom complet *</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                placeholder="Ex: Dr. Jean Dupont"
              />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                className="form-input"
                placeholder="jean.dupont@cameg.bf"
              />
            </div>
            <div>
              <label className="form-label">Rôle *</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'evaluator' | 'supplier' }))}
                className="form-input"
              >
                <option value="evaluator">Évaluateur</option>
                <option value="admin">Administrateur</option>
                <option value="supplier">Fournisseur</option>
              </select>
            </div>
            <div>
              <label className="form-label">Mot de passe temporaire *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  className="form-input pr-10"
                  placeholder="Mot de passe temporaire"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setIsCreatingUser(false)}
              className="btn-outline"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateUser}
              className="btn-primary"
            >
              Créer l'utilisateur
            </button>
          </div>
        </div>
      )}

      {/* Liste des utilisateurs */}
      <div className="card overflow-hidden">
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.lastLogin).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-cameg-blue hover:text-blue-700">Modifier</button>
                      <button className="text-yellow-600 hover:text-yellow-700">Réinitialiser</button>
                      <button className="text-red-600 hover:text-red-700">Supprimer</button>
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

  const renderConfigurationTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cameg-dark">Configuration Système</h2>
        <button
          onClick={() => handleSaveSettings('système')}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Sauvegarder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de Validation</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Délai de validation (jours)</label>
              <input
                type="number"
                value={systemConfig.validationTimeout}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, validationTimeout: parseInt(e.target.value) }))}
                className="form-input"
                min="1"
                max="30"
              />
            </div>
            <div>
              <label className="form-label">Délai d'expiration de session (minutes)</label>
              <input
                type="number"
                value={systemConfig.sessionTimeout}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                className="form-input"
                min="15"
                max="480"
              />
            </div>
            <div>
              <label className="form-label">Expiration du mot de passe (jours)</label>
              <input
                type="number"
                value={systemConfig.passwordExpiry}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                className="form-input"
                min="30"
                max="365"
              />
            </div>
            <div>
              <label className="form-label">Tentatives de connexion max</label>
              <input
                type="number"
                value={systemConfig.maxLoginAttempts}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                className="form-input"
                min="3"
                max="10"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sauvegarde et Maintenance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Sauvegarde automatique</h4>
                <p className="text-sm text-gray-600">Sauvegarder automatiquement la base de données</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemConfig.autoBackup}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, autoBackup: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cameg-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cameg-blue"></div>
              </label>
            </div>
            <div>
              <label className="form-label">Fréquence de sauvegarde</label>
              <select
                value={systemConfig.backupFrequency}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, backupFrequency: e.target.value }))}
                className="form-input"
              >
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Authentification à deux facteurs</h4>
                <p className="text-sm text-gray-600">Obligatoire pour tous les utilisateurs</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemConfig.twoFactorRequired}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, twoFactorRequired: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cameg-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cameg-blue"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cameg-dark">Templates d'Emails</h2>
        <button
          onClick={() => handleSaveSettings('emails')}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Sauvegarder</span>
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(emailTemplates).map(([key, template]) => (
          <div key={key} className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {key === 'supplierWelcome' && 'Bienvenue fournisseur'}
              {key === 'supplierValidation' && 'Validation fournisseur'}
              {key === 'supplierRejection' && 'Rejet fournisseur'}
              {key === 'evaluatorAssignment' && 'Assignation évaluateur'}
              {key === 'systemMaintenance' && 'Maintenance système'}
            </h3>
            <textarea
              value={template}
              onChange={(e) => setEmailTemplates(prev => ({ ...prev, [key]: e.target.value }))}
              rows={4}
              className="form-input"
              placeholder="Contenu du template..."
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderAISettingsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cameg-dark">Configuration IA</h2>
        <button
          onClick={() => handleSaveSettings('IA')}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Sauvegarder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités IA</h3>
          <div className="space-y-4">
            {[
              { key: 'autoAnalysis', label: 'Analyse automatique', description: 'Analyser automatiquement les dossiers soumis' },
              { key: 'complianceCheck', label: 'Vérification de conformité', description: 'Vérifier la conformité des documents' },
              { key: 'riskAssessment', label: 'Évaluation des risques', description: 'Évaluer les risques fournisseurs' },
              { key: 'anomalyDetection', label: 'Détection d\'anomalies', description: 'Détecter les incohérences' },
              { key: 'reportGeneration', label: 'Génération de rapports', description: 'Générer des rapports automatiques' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{item.label}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSettings[item.key as keyof typeof aiSettings] as boolean}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cameg-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cameg-blue"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Paramètres Avancés</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Seuil de confiance minimum (%)</label>
              <input
                type="number"
                value={aiSettings.confidenceThreshold}
                onChange={(e) => setAiSettings(prev => ({ ...prev, confidenceThreshold: parseInt(e.target.value) }))}
                className="form-input"
                min="50"
                max="100"
              />
            </div>
            <div>
              <label className="form-label">Fréquence de mise à jour</label>
              <select
                value={aiSettings.updateFrequency}
                onChange={(e) => setAiSettings(prev => ({ ...prev, updateFrequency: e.target.value }))}
                className="form-input"
              >
                <option value="realtime">Temps réel</option>
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users': return renderUsersTab();
      case 'configuration': return renderConfigurationTab();
      case 'emails': return renderEmailTemplatesTab();
      case 'ai': return renderAISettingsTab();
      default: return renderUsersTab();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Paramètres Système</h1>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', label: 'Utilisateurs', icon: Users },
            { id: 'configuration', label: 'Configuration', icon: Settings },
            { id: 'emails', label: 'Messages automatiques', icon: Mail },
            { id: 'ai', label: 'Intégration IA', icon: Brain }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-cameg-blue text-cameg-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu de l'onglet */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SystemSettings;
