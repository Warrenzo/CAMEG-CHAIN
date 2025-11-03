import React, { useState } from 'react';
import { 
  User, 
  FileText, 
  Bell, 
  Settings, 
  LogOut, 
  Eye, 
  Download, 
  Upload,
  Edit,
  Save,
  CheckCircle,
  Brain,
  Plus,
  Trash2,
  Home,
  FileCheck,
  FolderOpen,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Send,
  X,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const SupplierDashboardPhase2Page: React.FC = () => {
  const [activeSection, setActiveSection] = useState('accueil');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTender, setSelectedTender] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [showTenderDetails, setShowTenderDetails] = useState(false);

  // Données simulées
  const supplierName = "PharmaTogo SARL";
  const lastProfileUpdate = "12 octobre 2025";
  
  const notifications = [
    { id: 1, type: 'ao', message: 'Nouvel appel d\'offre : fournitures d\'antipaludiques.', time: 'Il y a 2 heures' },
    { id: 2, type: 'validation', message: 'Votre offre 2025/04 a été validée par la DAQP.', time: 'Il y a 1 jour' },
    { id: 3, type: 'alert', message: 'Certificat GMP expirera le 30/11.', time: 'Il y a 2 jours' },
    { id: 4, type: 'message', message: 'L\'administrateur a laissé un commentaire sur votre dossier.', time: 'Il y a 3 jours' }
  ];

  // Statistiques de synthèse
  const stats = {
    activeTenders: 5,
    submittedOffers: 3,
    acceptedOffers: 1,
    pendingOffers: 2,
    expiringDocuments: 1
  };

  const tenders = [
    {
      id: 1,
      title: 'Fourniture de tests VIH',
      reference: 'AO-2025-01',
      category: 'Tests diagnostiques',
      deadline: '2025-10-30',
      status: 'open',
      canSubmit: true,
      publisher: 'DAQP',
      productType: 'Tests diagnostiques',
      description: 'Fourniture de tests de diagnostic rapide pour le VIH destinés aux centres de santé communautaires.'
    },
    {
      id: 2,
      title: 'Médicaments antipaludiques',
      reference: 'AO-2025-02',
      category: 'Médicaments',
      deadline: '2025-11-15',
      status: 'open',
      canSubmit: true,
      publisher: 'CAMEG Centrale',
      productType: 'Médicaments',
      description: 'Fourniture de médicaments antipaludiques pour le traitement et la prévention du paludisme.'
    },
    {
      id: 3,
      title: 'Équipements médicaux',
      reference: 'AO-2025-03',
      category: 'Équipements',
      deadline: '2025-12-01',
      status: 'open',
      canSubmit: true,
      publisher: 'DAQP',
      productType: 'Équipements médicaux',
      description: 'Fourniture d\'équipements médicaux pour les hôpitaux de district.'
    }
  ];

  const myDossiers = [
    {
      id: 1,
      aoNumber: '2025-04',
      status: 'En cours d\'analyse',
      submissionDate: '14/10/2025',
      qualityScore: 88,
      decision: 'En attente',
      title: 'Médicaments cardiovasculaires'
    },
    {
      id: 2,
      aoNumber: '2025-05',
      status: 'Validé',
      submissionDate: '10/10/2025',
      qualityScore: 92,
      decision: 'Accepté',
      title: 'Consommables médicaux'
    },
    {
      id: 3,
      aoNumber: '2025-06',
      status: 'En attente de validation',
      submissionDate: '16/10/2025',
      qualityScore: 75,
      decision: 'En attente',
      title: 'Tests de grossesse'
    }
  ];

  const documents = [
    { id: 1, name: 'Licence pharmaceutique', status: 'validated', expiry: '2025-12-31' },
    { id: 2, name: 'Certificat GMP', status: 'pending', expiry: '2025-06-30' },
    { id: 3, name: 'Licence d\'exploitation', status: 'expiring', expiry: '2025-02-15' },
    { id: 4, name: 'Certificat ISO 9001', status: 'missing', expiry: null }
  ];

  const handleSubmitOffer = (tenderId: string) => {
    setSelectedTender(tenderId);
    setShowSubmissionModal(true);
  };

  const handleConfirmSubmission = () => {
    toast.success('✅ Votre offre a bien été enregistrée sous la référence AO-2025-15.\nVous recevrez une confirmation officielle par e-mail après la clôture.', {
      duration: 8000,
    });
    setShowSubmissionModal(false);
    setSelectedTender(null);
  };

  const handleProfileSave = () => {
    toast.success('💾 Vos informations ont été enregistrées avec succès.', {
      duration: 3000,
    });
    setIsEditingProfile(false);
  };

  const handleDocumentUpload = () => {
    toast.success('✅ Document enregistré avec succès.', {
      duration: 3000,
    });
  };


  const handleAIMessage = () => {
    if (aiMessage.trim()) {
      toast.success('Message envoyé à Cami ! Elle vous répondra bientôt.', {
        duration: 3000,
      });
      setAiMessage('');
    }
  };

  const handleTenderDetails = (tenderId: string) => {
    setSelectedTender(tenderId);
    setShowTenderDetails(true);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'accueil':
        return (
          <div className="space-y-6">
            {/* Bandeau supérieur : résumé d'activité */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-8">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🎉</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-cameg-dark mb-2">
                    Bienvenue {supplierName} — votre profil est validé
                  </h2>
                  <p className="text-lg text-gray-700 mb-4">
                    Vous pouvez maintenant participer aux appels d'offres et gérer vos documents.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Votre compte est actif et validé.<br />
                    Dernière mise à jour de votre profil : {lastProfileUpdate}
                  </p>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setActiveSection('tenders')}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Soumettre une offre</span>
                    </button>
                    <button 
                      onClick={() => setActiveSection('profil')}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <FileCheck className="h-4 w-4" />
                      <span>Mettre à jour mes documents</span>
                    </button>
                    <button 
                      onClick={() => setShowAIChat(true)}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <Brain className="h-4 w-4" />
                      <span>Analyser mes offres avec l'IA</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cartes de synthèse (statistiques visuelles) */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* AO en cours */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cameg-dark">AO en cours</h3>
                    <p className="text-2xl font-bold text-blue-600">{stats.activeTenders}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSection('tenders')}
                  className="btn-outline w-full text-sm"
                >
                  Voir la liste
                </button>
              </div>

              {/* Offres soumises */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cameg-dark">Offres soumises</h3>
                    <p className="text-2xl font-bold text-green-600">{stats.submittedOffers}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSection('dossiers')}
                  className="btn-outline w-full text-sm"
                >
                  Suivre le statut
                </button>
              </div>

              {/* Offres acceptées */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cameg-dark">Offres acceptées</h3>
                    <p className="text-2xl font-bold text-emerald-600">{stats.acceptedOffers}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSection('dossiers')}
                  className="btn-outline w-full text-sm"
                >
                  Voir détails
                </button>
              </div>

              {/* Offres en attente */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cameg-dark">Offres en attente</h3>
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingOffers}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSection('dossiers')}
                  className="btn-outline w-full text-sm"
                >
                  Voir les dossiers
                </button>
              </div>

              {/* Documents expirant bientôt */}
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cameg-dark">Documents expirant bientôt</h3>
                    <p className="text-2xl font-bold text-red-600">{stats.expiringDocuments}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSection('profil')}
                  className="btn-outline w-full text-sm"
                >
                  Renouveler maintenant
                </button>
              </div>
            </div>

            {/* Section principale : "Appels d'offres disponibles" */}
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-cameg-dark flex items-center space-x-2">
                  <span className="text-2xl">📢</span>
                  <span>Appels d'offres disponibles</span>
                </h3>
                <button 
                  onClick={() => setActiveSection('tenders')}
                  className="text-cameg-blue hover:underline flex items-center space-x-1"
                >
                  <span>Voir tout</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                {tenders.slice(0, 3).map((tender) => (
                  <div key={tender.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-cameg-dark mb-2">{tender.title}</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Référence:</span> {tender.reference}
                          </div>
                          <div>
                            <span className="font-medium">Émetteur:</span> {tender.publisher}
                          </div>
                          <div>
                            <span className="font-medium">Type de produit:</span> {tender.productType}
                          </div>
                          <div>
                            <span className="font-medium">Clôture:</span> {tender.deadline}
                          </div>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Ouvert
                      </span>
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleTenderDetails(tender.id.toString())}
                        className="btn-outline flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Consulter</span>
                      </button>
                      <button className="btn-outline flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Télécharger le cahier des charges</span>
                      </button>
                      <button 
                        onClick={() => handleSubmitOffer(tender.id.toString())}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Soumettre une offre</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'profil':
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cameg-dark">Informations de l'entreprise</h2>
                <div className="flex space-x-3">
                  {!isEditingProfile ? (
                    <button 
                      onClick={() => setIsEditingProfile(true)}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Modifier mes informations</span>
                    </button>
                  ) : (
                    <button 
                      onClick={handleProfileSave}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Enregistrer les modifications</span>
                    </button>
                  )}
                  <button className="btn-outline flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Voir mon profil public</span>
                  </button>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">✅ Votre profil est actif.</span>
                </div>
                <p className="text-green-700 mt-1">
                  Vous pouvez mettre à jour vos informations à tout moment.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Nom de l'entreprise</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    defaultValue={supplierName}
                    disabled={!isEditingProfile}
                  />
                </div>
                <div>
                  <label className="form-label">Pays</label>
                  <select 
                    className="form-input" 
                    defaultValue="TG"
                    disabled={!isEditingProfile}
                  >
                    <option value="TG">Togo</option>
                    <option value="BF">Burkina Faso</option>
                    <option value="CI">Côte d'Ivoire</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    defaultValue="contact@pharmatogo.tg"
                    disabled={!isEditingProfile}
                  />
                </div>
                <div>
                  <label className="form-label">Téléphone</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    defaultValue="+228 XX XX XX XX"
                    disabled={!isEditingProfile}
                  />
                </div>
                <div>
                  <label className="form-label">Adresse</label>
                  <textarea 
                    className="form-input" 
                    rows={3}
                    defaultValue="123 Avenue de la Paix, Lomé, Togo"
                    disabled={!isEditingProfile}
                  />
                </div>
                <div>
                  <label className="form-label">Site web</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    defaultValue="https://www.pharmatogo.tg"
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'tenders':
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-cameg-dark mb-4">Appels d'offres</h2>
              <p className="text-gray-600 mb-6">
                Consultez les appels d'offres actifs et soumettez vos offres directement depuis votre espace fournisseur.
              </p>

              <div className="space-y-4">
                {tenders.map((tender) => (
                  <div key={tender.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-cameg-dark">{tender.title}</h3>
                        <p className="text-gray-600">Référence: {tender.reference}</p>
                        <p className="text-gray-600">Clôture: {tender.deadline}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        tender.status === 'open' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tender.status === 'open' ? 'Ouvert' : 'Soumis'}
                      </span>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button className="btn-outline flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>Consulter le dossier</span>
                      </button>
                      <button className="btn-outline flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Télécharger le cahier des charges</span>
                      </button>
                      {tender.canSubmit ? (
                        <button 
                          onClick={() => handleSubmitOffer(tender.id.toString())}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Soumettre une offre</span>
                        </button>
                      ) : (
                        <button className="btn-outline flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <span>Suivre ma soumission</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-cameg-dark mb-4">Documents réglementaires et certifications</h2>
              <p className="text-gray-600 mb-6">
                Téléversez ici les documents requis pour votre préqualification.
                Les formats acceptés sont PDF, DOCX, ou image (max. 5 Mo).
              </p>

              <div className="flex space-x-4 mb-6">
                <button 
                  onClick={handleDocumentUpload}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Uploader un document</span>
                </button>
                <button className="btn-outline flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Télécharger modèle officiel</span>
                </button>
                <button className="btn-outline flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Voir l'historique</span>
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  <strong>Info-bulle :</strong> Un certificat expiré ou manquant peut limiter votre participation à certains appels d'offres.
                </p>
              </div>

              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          doc.status === 'validated' ? 'bg-green-100' :
                          doc.status === 'pending' ? 'bg-yellow-100' :
                          doc.status === 'expiring' ? 'bg-orange-100' :
                          'bg-red-100'
                        }`}>
                          <FileText className={`h-5 w-5 ${
                            doc.status === 'validated' ? 'text-green-600' :
                            doc.status === 'pending' ? 'text-yellow-600' :
                            doc.status === 'expiring' ? 'text-orange-600' :
                            'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-cameg-dark">{doc.name}</h3>
                          <p className="text-sm text-gray-600">
                            {doc.expiry ? `Expire le ${doc.expiry}` : 'Document manquant'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'validated' ? 'bg-green-100 text-green-800' :
                          doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          doc.status === 'expiring' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {doc.status === 'validated' ? 'Validé' :
                           doc.status === 'pending' ? 'En attente' :
                           doc.status === 'expiring' ? 'Expire bientôt' :
                           'Manquant'}
                        </span>
                        <button className="btn-outline text-sm">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="btn-outline text-sm text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'dossiers':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h2 className="text-2xl font-bold text-cameg-dark mb-6 flex items-center space-x-2">
                <FolderOpen className="h-6 w-6" />
                <span>Mes dossiers</span>
              </h2>
              <p className="text-gray-600 mb-6">
                Suivez l'état de toutes vos soumissions et propositions.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-cameg-dark">AO n°</th>
                      <th className="text-left py-3 px-4 font-semibold text-cameg-dark">Titre</th>
                      <th className="text-left py-3 px-4 font-semibold text-cameg-dark">Statut</th>
                      <th className="text-left py-3 px-4 font-semibold text-cameg-dark">Date de soumission</th>
                      <th className="text-left py-3 px-4 font-semibold text-cameg-dark">Score qualité</th>
                      <th className="text-left py-3 px-4 font-semibold text-cameg-dark">Décision</th>
                      <th className="text-left py-3 px-4 font-semibold text-cameg-dark">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myDossiers.map((dossier) => (
                      <tr key={dossier.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium text-cameg-blue">{dossier.aoNumber}</td>
                        <td className="py-4 px-4">{dossier.title}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            dossier.status === 'Validé' ? 'bg-green-100 text-green-800' :
                            dossier.status === 'En cours d\'analyse' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {dossier.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{dossier.submissionDate}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  dossier.qualityScore >= 90 ? 'bg-green-500' :
                                  dossier.qualityScore >= 80 ? 'bg-blue-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${dossier.qualityScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{dossier.qualityScore}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            dossier.decision === 'Accepté' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {dossier.decision}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button className="btn-outline text-sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Voir détails
                            </button>
                            <button className="btn-outline text-sm">
                              <Download className="h-4 w-4 mr-1" />
                              Récépissé
                            </button>
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

      case 'rapports':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h2 className="text-2xl font-bold text-cameg-dark mb-6 flex items-center space-x-2">
                <BarChart3 className="h-6 w-6" />
                <span>Rapports et statistiques</span>
              </h2>
              <p className="text-gray-600 mb-6">
                Analysez vos performances et exportez vos rapports.
              </p>

              {/* Indicateurs clés */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nombre total d'offres soumises</p>
                      <p className="text-2xl font-bold text-blue-600">12</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Taux de succès</p>
                      <p className="text-2xl font-bold text-green-600">42%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Temps moyen de validation</p>
                      <p className="text-2xl font-bold text-orange-600">5 jours</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Documents expirés</p>
                      <p className="text-2xl font-bold text-red-600">2</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphique simple (simulation) */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-cameg-dark mb-4">Évolution des soumissions</h3>
                <div className="h-64 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Graphique d'évolution des soumissions</p>
                    <p className="text-sm">(Intégration Recharts ou Chart.js)</p>
                  </div>
                </div>
              </div>

              {/* Actions d'export */}
              <div className="flex space-x-4">
                <button className="btn-primary flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Exporter en PDF</span>
                </button>
                <button className="btn-outline flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Exporter en Excel</span>
                </button>
                <button 
                  onClick={() => setShowAIChat(true)}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Brain className="h-4 w-4" />
                  <span>Générer un résumé IA</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <h2 className="text-2xl font-bold text-cameg-dark mb-6 flex items-center space-x-2">
                <Bell className="h-6 w-6" />
                <span>Notifications et communications</span>
              </h2>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.type === 'ao' ? 'bg-blue-100' :
                        notification.type === 'validation' ? 'bg-green-100' :
                        notification.type === 'alert' ? 'bg-red-100' :
                        'bg-purple-100'
                      }`}>
                        <Bell className={`h-4 w-4 ${
                          notification.type === 'ao' ? 'text-blue-600' :
                          notification.type === 'validation' ? 'text-green-600' :
                          notification.type === 'alert' ? 'text-red-600' :
                          'text-purple-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-cameg-blue hover:underline text-sm">
                          Marquer comme lu
                        </button>
                        <button className="text-red-600 hover:underline text-sm">
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cameg-gray">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="container-custom">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-cameg-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <h1 className="text-2xl font-bold text-cameg-dark">CAMEG-CHAIN</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-cameg-blue relative">
                  <Bell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cameg-blue rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-700 font-medium">{supplierName}</span>
              </div>
              <button className="btn-outline">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Sidebar - Menu latéral avec couleurs spécifiques Phase 2 */}
          <div className="w-64 bg-[#003366] rounded-xl shadow-soft p-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('accueil')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                  activeSection === 'accueil' 
                    ? 'bg-cameg-green text-white font-semibold' 
                    : 'text-white hover:bg-cameg-green/20'
                }`}
              >
                {activeSection === 'accueil' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cameg-green rounded-r"></div>
                )}
                <Home className="h-5 w-5" />
                <span>Accueil</span>
              </button>
              <button
                onClick={() => setActiveSection('tenders')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                  activeSection === 'tenders' 
                    ? 'bg-cameg-green text-white font-semibold' 
                    : 'text-white hover:bg-cameg-green/20'
                }`}
              >
                {activeSection === 'tenders' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cameg-green rounded-r"></div>
                )}
                <FileText className="h-5 w-5" />
                <span>Appels d'offres</span>
              </button>
              <button
                onClick={() => setActiveSection('profil')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                  activeSection === 'profil' 
                    ? 'bg-cameg-green text-white font-semibold' 
                    : 'text-white hover:bg-cameg-green/20'
                }`}
              >
                {activeSection === 'profil' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cameg-green rounded-r"></div>
                )}
                <FileCheck className="h-5 w-5" />
                <span>Mon profil</span>
              </button>
              <button
                onClick={() => setShowAIChat(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-white hover:bg-cameg-green/20"
              >
                <Brain className="h-5 w-5" />
                <span>Assistant IA</span>
              </button>
              <button
                onClick={() => setActiveSection('dossiers')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                  activeSection === 'dossiers' 
                    ? 'bg-cameg-green text-white font-semibold' 
                    : 'text-white hover:bg-cameg-green/20'
                }`}
              >
                {activeSection === 'dossiers' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cameg-green rounded-r"></div>
                )}
                <FolderOpen className="h-5 w-5" />
                <span>Mes dossiers</span>
              </button>
              <button
                onClick={() => setActiveSection('rapports')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                  activeSection === 'rapports' 
                    ? 'bg-cameg-green text-white font-semibold' 
                    : 'text-white hover:bg-cameg-green/20'
                }`}
              >
                {activeSection === 'rapports' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cameg-green rounded-r"></div>
                )}
                <BarChart3 className="h-5 w-5" />
                <span>Rapports / Statistiques</span>
              </button>
              <button
                onClick={() => setActiveSection('notifications')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                  activeSection === 'notifications' 
                    ? 'bg-cameg-green text-white font-semibold' 
                    : 'text-white hover:bg-cameg-green/20'
                }`}
              >
                {activeSection === 'notifications' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cameg-green rounded-r"></div>
                )}
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveSection('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors relative ${
                  activeSection === 'settings' 
                    ? 'bg-cameg-green text-white font-semibold' 
                    : 'text-white hover:bg-cameg-green/20'
                }`}
              >
                {activeSection === 'settings' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cameg-green rounded-r"></div>
                )}
                <Settings className="h-5 w-5" />
                <span>Paramètres</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Chat drawer IA */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50">
          <div className="bg-white rounded-t-xl w-96 h-[600px] flex flex-col">
            {/* Header du chat */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🧠</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Cami - Assistante IA</h3>
                    <p className="text-sm opacity-90">En ligne</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIChat(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages du chat */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">🧠</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-gray-800">
                    Bonjour {supplierName.split(' ')[0]} ! 👋<br />
                    Je suis là pour vous aider avec vos appels d'offres et documents.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 justify-end">
                <div className="bg-cameg-blue text-white rounded-lg p-3 max-w-xs">
                  <p className="text-sm">
                    Peux-tu analyser mes offres soumises ?
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">🧠</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-gray-800">
                    J'ai analysé vos 3 offres soumises :
                    <br />• Score moyen : 85%
                    <br />• Points forts : Documents complets
                    <br />• À améliorer : Prix compétitifs
                  </p>
                </div>
              </div>
            </div>

            {/* Input du chat */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cameg-blue"
                  onKeyPress={(e) => e.key === 'Enter' && handleAIMessage()}
                />
                <button
                  onClick={handleAIMessage}
                  className="bg-cameg-blue text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panneau de détails des appels d'offres */}
      {showTenderDetails && selectedTender && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-cameg-dark">
                Détails de l'appel d'offres
              </h3>
              <button
                onClick={() => setShowTenderDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {(() => {
              const tender = tenders.find(t => t.id.toString() === selectedTender);
              if (!tender) return null;
              
              return (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-cameg-dark mb-2">{tender.title}</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div><span className="font-medium">Référence:</span> {tender.reference}</div>
                      <div><span className="font-medium">Émetteur:</span> {tender.publisher}</div>
                      <div><span className="font-medium">Type de produit:</span> {tender.productType}</div>
                      <div><span className="font-medium">Clôture:</span> {tender.deadline}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-cameg-dark mb-2">Description complète</h5>
                    <p className="text-gray-700">{tender.description}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-cameg-dark mb-2">Critères techniques</h5>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Certificat GMP obligatoire</li>
                      <li>Licence pharmaceutique valide</li>
                      <li>Fiches techniques détaillées</li>
                      <li>Échantillons pour tests</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-cameg-dark mb-2">Documents à joindre</h5>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>Offre technique (PDF)</li>
                      <li>Offre financière (Excel)</li>
                      <li>Certificats de conformité</li>
                      <li>Références clients</li>
                    </ul>
                  </div>
                  
                  <div className="flex space-x-3 pt-4 border-t">
                    <button className="btn-outline flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Télécharger le cahier des charges</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowTenderDetails(false);
                        handleSubmitOffer(tender.id.toString());
                      }}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Soumettre mon offre</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal de soumission d'offre */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-cameg-dark mb-4">
              Soumettre une offre
            </h3>
            <p className="text-gray-600 mb-6">
              Vous êtes sur le point de soumettre votre offre pour cet appel d'offres.
              Assurez-vous que tous vos documents sont à jour.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="btn-outline flex-1"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSubmission}
                className="btn-primary flex-1"
              >
                Confirmer la soumission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboardPhase2Page;
