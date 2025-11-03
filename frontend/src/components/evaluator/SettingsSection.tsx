import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Save,
  Eye,
  EyeOff,
  Key,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: 'Marie',
    lastName: 'Kouassi',
    email: 'marie.kouassi@cameg.bf',
    phone: '+226 XX XX XX XX',
    position: 'Évaluateur Senior',
    department: 'DAQP',
    office: 'Ouagadougou, Burkina Faso'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newDossiers: true,
    documentExpiry: true,
    evaluationReminders: true,
    systemUpdates: false,
    weeklyReports: true,
    emailNotifications: true,
    pushNotifications: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAlerts: true
  });

  const [preferences, setPreferences] = useState({
    language: 'fr',
    theme: 'light',
    timezone: 'Africa/Ouagadougou',
    dateFormat: 'DD/MM/YYYY',
    itemsPerPage: 25,
    autoSave: true
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'preferences', label: 'Préférences', icon: Settings }
  ];

  const handleSave = (section: string) => {
    toast.success(`✅ Paramètres ${section} sauvegardés avec succès`);
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Informations Personnelles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Prénom</label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">Nom</label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                className="form-input pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">Téléphone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                className="form-input pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">Poste</label>
            <input
              type="text"
              value={profileData.position}
              onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
              className="form-input"
            />
          </div>
          
          <div>
            <label className="form-label">Département</label>
            <input
              type="text"
              value={profileData.department}
              onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
              className="form-input"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="form-label">Bureau</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={profileData.office}
                onChange={(e) => setProfileData(prev => ({ ...prev, office: e.target.value }))}
                className="form-input pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Changer le Mot de Passe</h3>
        
        <div className="space-y-4">
          <div>
            <label className="form-label">Mot de passe actuel</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                className="form-input pl-10 pr-10"
                placeholder="Votre mot de passe actuel"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <label className="form-label">Nouveau mot de passe</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input pl-10 pr-10"
                placeholder="Nouveau mot de passe"
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
          
          <div>
            <label className="form-label">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              className="form-input"
              placeholder="Confirmer le nouveau mot de passe"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('profil')}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Sauvegarder</span>
        </button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Préférences de Notification</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Types de notifications</h4>
            <div className="space-y-4">
              {[
                { key: 'newDossiers', label: 'Nouveaux dossiers soumis', description: 'Recevoir une notification pour chaque nouveau dossier' },
                { key: 'documentExpiry', label: 'Expiration de documents', description: 'Alertes pour les documents qui expirent bientôt' },
                { key: 'evaluationReminders', label: 'Rappels d\'évaluation', description: 'Notifications pour les évaluations en attente' },
                { key: 'systemUpdates', label: 'Mises à jour système', description: 'Informations sur les mises à jour de la plateforme' },
                { key: 'weeklyReports', label: 'Rapports hebdomadaires', description: 'Résumé hebdomadaire de votre activité' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{item.label}</h5>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        [item.key]: e.target.checked
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cameg-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cameg-blue"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Canaux de notification</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Notifications email</h5>
                  <p className="text-sm text-gray-600">Recevoir les notifications par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      emailNotifications: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cameg-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cameg-blue"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Notifications push</h5>
                  <p className="text-sm text-gray-600">Notifications dans l'interface</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      pushNotifications: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cameg-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cameg-blue"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('notifications')}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Sauvegarder</span>
        </button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Paramètres de Sécurité</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Authentification à deux facteurs</h4>
              <p className="text-sm text-gray-600">Ajouter une couche de sécurité supplémentaire</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.twoFactorAuth}
                onChange={(e) => setSecuritySettings(prev => ({
                  ...prev,
                  twoFactorAuth: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cameg-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cameg-blue"></div>
            </label>
          </div>

          <div>
            <label className="form-label">Délai d'expiration de session (minutes)</label>
            <select
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings(prev => ({
                ...prev,
                sessionTimeout: parseInt(e.target.value)
              }))}
              className="form-input"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 heure</option>
              <option value={120}>2 heures</option>
            </select>
          </div>

          <div>
            <label className="form-label">Expiration du mot de passe (jours)</label>
            <select
              value={securitySettings.passwordExpiry}
              onChange={(e) => setSecuritySettings(prev => ({
                ...prev,
                passwordExpiry: parseInt(e.target.value)
              }))}
              className="form-input"
            >
              <option value={30}>30 jours</option>
              <option value={60}>60 jours</option>
              <option value={90}>90 jours</option>
              <option value={180}>180 jours</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Alertes de connexion</h4>
              <p className="text-sm text-gray-600">Recevoir des notifications pour les nouvelles connexions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.loginAlerts}
                onChange={(e) => setSecuritySettings(prev => ({
                  ...prev,
                  loginAlerts: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cameg-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cameg-blue"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('sécurité')}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Sauvegarder</span>
        </button>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Préférences Générales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Langue</label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              className="form-input"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="form-label">Thème</label>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
              className="form-input"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="auto">Automatique</option>
            </select>
          </div>

          <div>
            <label className="form-label">Fuseau horaire</label>
            <select
              value={preferences.timezone}
              onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
              className="form-input"
            >
              <option value="Africa/Ouagadougou">Ouagadougou (GMT+0)</option>
              <option value="Africa/Abidjan">Abidjan (GMT+0)</option>
              <option value="Europe/Paris">Paris (GMT+1)</option>
            </select>
          </div>

          <div>
            <label className="form-label">Format de date</label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="form-input"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="form-label">Éléments par page</label>
            <select
              value={preferences.itemsPerPage}
              onChange={(e) => setPreferences(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value) }))}
              className="form-input"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Sauvegarde automatique</h4>
              <p className="text-sm text-gray-600">Sauvegarder automatiquement les modifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoSave}
                onChange={(e) => setPreferences(prev => ({ ...prev, autoSave: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cameg-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cameg-blue"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('préférences')}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Sauvegarder</span>
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'notifications': return renderNotificationsTab();
      case 'security': return renderSecurityTab();
      case 'preferences': return renderPreferencesTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Paramètres</h1>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
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

export default SettingsSection;
