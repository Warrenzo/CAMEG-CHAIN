import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';
import TendersManagement from '../components/admin/TendersManagement';
import EvaluationsSupervision from '../components/admin/EvaluationsSupervision';
import AICenter from '../components/admin/AICenter';
import ReportsAnalytics from '../components/admin/ReportsAnalytics';
import AuditHistory from '../components/admin/AuditHistory';
import SystemSettings from '../components/admin/SystemSettings';
import SupportTickets from '../components/admin/SupportTickets';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
// Import de jspdf-autotable - extension du prototype jsPDF
import 'jspdf-autotable';
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
  Info,
  X,
  MapPin,
  Building2,
  Calendar,
  Plus,
  Eye,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Lock,
  Send,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('accueil');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({
    company_name: '',
    country: '',
    phone_number: '',
    email: '',
    password: ''
  });
  const [showAssignCaseModal, setShowAssignCaseModal] = useState(false);
  const [selectedEvaluatorForAssignment, setSelectedEvaluatorForAssignment] = useState<number | null>(null);

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

  const [suppliers, setSuppliers] = useState<Array<{
    id: number;
    name: string;
    country: string;
    status: 'valide' | 'en_attente' | 'suspendu';
    score: number | null;
    lastUpdate: string;
    actions: string[];
  }>>([
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
  ]);

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
    // Rediriger vers la page de login après la déconnexion
    navigate('/login');
  };

  // Fonctions pour les actions des fournisseurs
  const handleViewSupplier = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setSelectedSupplier(supplier);
    } else {
      toast.error('Fournisseur non trouvé');
    }
  };

  const handleValidateSupplier = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      toast.success(`✅ Fournisseur "${supplier.name}" validé avec succès`);
      // TODO: Implémenter l'appel API pour valider
      // await api.put(`/suppliers/${supplierId}/validate`);
      setSuppliers(prevSuppliers => 
        prevSuppliers.map(s => {
          if (s.id === supplierId) {
            return { ...s, status: 'valide' as const };
          }
          return s;
        })
      );
    }
  };

  const handleSuspendSupplier = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier && window.confirm(`Êtes-vous sûr de vouloir suspendre "${supplier.name}" ?`)) {
      toast.success(`⚠️ Fournisseur "${supplier.name}" suspendu`);
      // TODO: Implémenter l'appel API pour suspendre
      // await api.put(`/suppliers/${supplierId}/suspend`);
      setSuppliers(prevSuppliers => 
        prevSuppliers.map(s => {
          if (s.id === supplierId) {
            return { ...s, status: 'suspendu' as const };
          }
          return s;
        })
      );
    }
  };

  const handleReactivateSupplier = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      toast.success(`✅ Fournisseur "${supplier.name}" réactivé avec succès`);
      // TODO: Implémenter l'appel API pour réactiver
      // await api.put(`/suppliers/${supplierId}/reactivate`);
      setSuppliers(prevSuppliers => 
        prevSuppliers.map(s => {
          if (s.id === supplierId) {
            return { ...s, status: 'valide' as const };
          }
          return s;
        })
      );
    }
  };

  // Fonctions pour les exports
  const handleExportExcel = () => {
    try {
      // Préparer les données pour Excel
      const excelData = filteredSuppliers.map(supplier => ({
        'Nom': supplier.name,
        'Pays': supplier.country,
        'Statut': getStatusText(supplier.status),
        'Score Qualité (%)': supplier.score || 'N/A',
        'Dernière Mise à Jour': supplier.lastUpdate
      }));

      // Créer un nouveau workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Définir la largeur des colonnes
      ws['!cols'] = [
        { wch: 25 }, // Nom
        { wch: 15 }, // Pays
        { wch: 15 }, // Statut
        { wch: 18 }, // Score
        { wch: 20 }  // Dernière MAJ
      ];

      // Ajouter la feuille au workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Fournisseurs');

      // Générer le nom du fichier avec la date
      const date = new Date().toISOString().split('T')[0];
      const fileName = `fournisseurs_cameg_${date}.xlsx`;

      // Écrire le fichier et le télécharger
      XLSX.writeFile(wb, fileName);
      
      toast.success(`✅ Fichier Excel "${fileName}" téléchargé avec succès !`);
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      toast.error('❌ Erreur lors de l\'export Excel');
    }
  };

  const handleExportPDF = () => {
    try {
      // Créer un nouveau document PDF en format paysage
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Titre
      doc.setFontSize(16);
      doc.setTextColor(0, 51, 102); // Couleur CAMEG blue
      doc.setFont('helvetica', 'bold');
      doc.text('Liste des Fournisseurs - CAMEG-CHAIN', 14, 15);
      
      // Date d'export
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      const date = new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Exporté le : ${date}`, 14, 22);
      
      // Vérifier si autoTable est disponible (extension du prototype)
      if ((doc as any).autoTable && typeof (doc as any).autoTable === 'function') {
        // Préparer les données pour le tableau
        const tableData = filteredSuppliers.map(supplier => [
          supplier.name,
          supplier.country,
          getStatusText(supplier.status),
          supplier.score ? `${supplier.score}%` : 'N/A',
          supplier.lastUpdate
        ]);

        // Créer le tableau avec autoTable
        (doc as any).autoTable({
          startY: 28,
          head: [['Nom', 'Pays', 'Statut', 'Score Qualité', 'Dernière MAJ']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [0, 51, 102], // CAMEG blue
            textColor: 255,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 9,
            cellPadding: 3
          },
          columnStyles: {
            0: { cellWidth: 60 }, // Nom
            1: { cellWidth: 40 }, // Pays
            2: { cellWidth: 40 }, // Statut
            3: { cellWidth: 35 }, // Score
            4: { cellWidth: 40 }  // Dernière MAJ
          },
          margin: { left: 14, right: 14 }
        });

        // Statistiques en bas de page
        const finalY = (doc as any).lastAutoTable?.finalY || 100;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total : ${filteredSuppliers.length} fournisseur(s)`, 14, finalY + 10);
      } else {
        // Fallback : créer un tableau simple sans autoTable
        let yPos = 28;
        const lineHeight = 7;
        const colWidths: number[] = [60, 40, 40, 35, 40];
        const headers = ['Nom', 'Pays', 'Statut', 'Score Qualité', 'Dernière MAJ'];
        
        // En-tête du tableau
        doc.setFillColor(0, 51, 102);
        doc.rect(14, yPos - 5, 260, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        
        let xPos = 14;
        headers.forEach((header, index) => {
          doc.text(header, xPos + 2, yPos);
          const width = colWidths[index];
          if (width !== undefined) {
            xPos += width;
          }
        });
        
        yPos += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        // Données du tableau
        filteredSuppliers.forEach((supplier, index) => {
          if (yPos > 190) { // Nouvelle page si nécessaire
            doc.addPage();
            yPos = 20;
          }
          
          // Alternance de couleurs pour les lignes
          if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(14, yPos - 5, 260, lineHeight, 'F');
          }
          
          xPos = 14;
          const rowData = [
            supplier.name,
            supplier.country,
            getStatusText(supplier.status),
            supplier.score ? `${supplier.score}%` : 'N/A',
            supplier.lastUpdate
          ];
          
          rowData.forEach((cell, cellIndex) => {
            doc.text(cell.toString(), xPos + 2, yPos);
            const width = colWidths[cellIndex];
            if (width !== undefined) {
              xPos += width;
            }
          });
          
          yPos += lineHeight;
        });
        
        // Statistiques
        doc.setFontSize(10);
        doc.text(`Total : ${filteredSuppliers.length} fournisseur(s)`, 14, yPos + 5);
      }
      
      // Générer le nom du fichier avec la date
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `fournisseurs_cameg_${dateStr}.pdf`;

      // Sauvegarder le PDF
      doc.save(fileName);
      
      toast.success(`✅ Fichier PDF "${fileName}" téléchargé avec succès !`);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error(`❌ Erreur lors de l'export PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  // Filtrer les fournisseurs
  const filteredSuppliers = suppliers.filter(supplier => {
    // Filtre par statut
    if (supplierFilter !== 'tous') {
      if (supplierFilter === 'valides' && supplier.status !== 'valide') return false;
      if (supplierFilter === 'en_attente' && supplier.status !== 'en_attente') return false;
      if (supplierFilter === 'suspendus' && supplier.status !== 'suspendu') return false;
      if (supplierFilter === 'alerte' && supplier.status === 'valide' && (!supplier.score || supplier.score < 70)) return false;
    }
    
    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        supplier.name.toLowerCase().includes(search) ||
        supplier.country.toLowerCase().includes(search) ||
        (supplier.score && supplier.score.toString().includes(search)) ||
        supplier.lastUpdate.includes(search)
      );
    }
    
    return true;
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valide': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'en_attente': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'suspendu': return <Pause className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Compter les fournisseurs par statut
  const getSupplierCounts = () => {
    return {
      tous: suppliers.length,
      valides: suppliers.filter(s => s.status === 'valide').length,
      en_attente: suppliers.filter(s => s.status === 'en_attente').length,
      suspendus: suppliers.filter(s => s.status === 'suspendu').length,
      alerte: suppliers.filter(s => s.status === 'valide' && (!s.score || s.score < 70)).length
    };
  };

  const handleAnalyzeWithAI = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      toast.success(`🧠 Analyse IA lancée pour "${supplier.name}"...`);
      // Simuler l'analyse IA
      setTimeout(() => {
        setSuppliers(prevSuppliers => 
          prevSuppliers.map(s => {
            if (s.id === supplierId) {
              const newScore = Math.floor(Math.random() * 30) + 70; // Score entre 70 et 100
              toast.success(`✅ Score qualité calculé : ${newScore}%`);
              return { ...s, score: newScore };
            }
            return s;
          })
        );
      }, 2000);
      // TODO: Implémenter l'appel API pour l'analyse IA
      // await api.post(`/suppliers/${supplierId}/analyze-ai`);
    }
  };

  const handleAddSupplier = () => {
    setShowAddSupplierModal(true);
  };

  const handleCloseAddSupplierModal = () => {
    setShowAddSupplierModal(false);
    setNewSupplierData({
      company_name: '',
      country: '',
      phone_number: '',
      email: '',
      password: ''
    });
  };

  const handleSubmitNewSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newSupplierData.company_name || !newSupplierData.country || !newSupplierData.phone_number || !newSupplierData.email || !newSupplierData.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation du mot de passe selon les règles du backend
    if (newSupplierData.password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    // Vérifier les règles de complexité du mot de passe
    const passwordRegex = {
      hasUpperCase: /[A-Z]/.test(newSupplierData.password),
      hasLowerCase: /[a-z]/.test(newSupplierData.password),
      hasNumber: /\d/.test(newSupplierData.password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newSupplierData.password)
    };
    
    if (!passwordRegex.hasUpperCase) {
      toast.error('Le mot de passe doit contenir au moins une majuscule');
      return;
    }
    if (!passwordRegex.hasLowerCase) {
      toast.error('Le mot de passe doit contenir au moins une minuscule');
      return;
    }
    if (!passwordRegex.hasNumber) {
      toast.error('Le mot de passe doit contenir au moins un chiffre');
      return;
    }
    if (!passwordRegex.hasSpecialChar) {
      toast.error('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*(),.?":{}|<>)');
      return;
    }

    try {
      // Appel API pour créer le fournisseur (endpoint public, pas besoin de token)
      // Utiliser la même URL que AuthContext : /auth/register/phase1
      // L'instance api gère déjà le baseURL (http://localhost:8000)
      // Le backend a le préfixe /api/v1/auth, donc l'URL complète sera /api/v1/auth/register/phase1
      // Mais AuthContext utilise /auth/register/phase1, donc il doit y avoir un proxy ou une redirection
      const response = await api.post('/auth/register/phase1', {
        company_name: newSupplierData.company_name,
        country: newSupplierData.country,
        phone_number: newSupplierData.phone_number,
        email: newSupplierData.email,
        password: newSupplierData.password
      }, {
        transformRequest: [(data, headers) => {
          // Supprimer le header Authorization pour les endpoints publics
          if (headers) {
            delete headers['Authorization'];
          }
          return JSON.stringify(data);
        }]
      });

      // Ajouter le nouveau fournisseur à la liste locale
      const newSupplier = {
        id: response.data.user_id || suppliers.length + 1,
        name: newSupplierData.company_name,
        country: newSupplierData.country,
        status: 'en_attente' as const,
        score: null,
        lastUpdate: new Date().toLocaleDateString('fr-FR'),
        actions: ['valider', 'voir_dossier']
      };

      setSuppliers(prevSuppliers => [...prevSuppliers, newSupplier]);
      
      toast.success(`✅ Fournisseur "${newSupplierData.company_name}" ajouté avec succès`);
      handleCloseAddSupplierModal();
      
    } catch (error: any) {
      console.error('Erreur lors de la création du fournisseur:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      
      // Gestion des erreurs spécifiques
      if (error.response) {
        // Erreur HTTP (400, 404, 500, etc.)
        const status = error.response.status;
        const detail = error.response.data?.detail || error.response.data?.message || error.response.data?.error;
        const errorData = error.response.data;
        
        if (status === 404) {
          toast.error('❌ Endpoint non trouvé. Vérifiez que le backend est démarré sur http://localhost:8000');
        } else if (status === 400) {
          toast.error(detail || '❌ Données invalides. Vérifiez que tous les champs sont corrects.');
        } else if (status === 409 || detail?.includes('existe déjà') || detail?.includes('already exists')) {
          toast.error('❌ Cet email est déjà utilisé par un autre fournisseur.');
        } else if (status === 422) {
          // Erreur de validation Pydantic
          const validationErrors = errorData?.detail || [];
          if (Array.isArray(validationErrors) && validationErrors.length > 0) {
            const firstError = validationErrors[0];
            toast.error(`❌ Erreur de validation: ${firstError.loc?.join('.')} - ${firstError.msg}`);
          } else {
            toast.error('❌ Erreur de validation. Vérifiez que tous les champs sont remplis correctement.');
          }
        } else if (status === 500) {
          // Erreur serveur - afficher le détail si disponible
          let errorMessage = detail || errorData?.error || 'Une erreur interne du serveur s\'est produite';
          
          // Si l'erreur mentionne une contrainte de base de données, suggérer de redémarrer le backend
          if (errorMessage.includes('psycopg') || errorMessage.includes('NOT NULL') || errorMessage.includes('contrainte')) {
            errorMessage += '\n💡 Astuce: Redémarrez le backend pour appliquer les dernières modifications.';
          }
          
          toast.error(`❌ Erreur serveur: ${errorMessage}`, {
            duration: 8000 // Afficher plus longtemps pour les erreurs importantes
          });
          console.error('Erreur serveur complète:', errorData);
        } else {
          toast.error(detail || `❌ Erreur serveur (${status}). Veuillez réessayer.`);
        }
      } else if (error.request) {
        // Pas de réponse du serveur
        toast.error('❌ Impossible de contacter le serveur. Vérifiez que le backend est démarré sur http://localhost:8000');
      } else {
        // Erreur lors de la configuration de la requête
        toast.error('❌ Erreur lors de l\'ajout du fournisseur. Veuillez réessayer.');
      }
    }
  };

  // Fonctions pour les actions des évaluateurs
  const handleAssignCase = (evaluatorId?: number) => {
    if (evaluatorId) {
      setSelectedEvaluatorForAssignment(evaluatorId);
    }
    setShowAssignCaseModal(true);
  };

  const handleCloseAssignCaseModal = () => {
    setShowAssignCaseModal(false);
    setSelectedEvaluatorForAssignment(null);
  };

  const handleSubmitAssignCase = (evaluatorId: number, caseId: string) => {
    const evaluator = evaluators.find(e => e.id === evaluatorId);
    toast.success(`✅ Dossier "${caseId}" assigné avec succès à ${evaluator?.name || 'l\'évaluateur'}`);
    // TODO: Implémenter l'appel API pour assigner un dossier
    // await api.post(`/evaluators/${evaluatorId}/assign-case`, { case_id: caseId });
    handleCloseAssignCaseModal();
  };

  const handleSendReminder = (evaluatorId: number) => {
    const evaluator = evaluators.find(e => e.id === evaluatorId);
    if (evaluator) {
      toast.success(`📧 Rappel envoyé à ${evaluator.name}`);
      // TODO: Implémenter l'appel API pour envoyer un rappel
      // await api.post(`/evaluators/${evaluatorId}/send-reminder`);
    }
  };

  const handleViewHistory = (evaluatorId: number) => {
    const evaluator = evaluators.find(e => e.id === evaluatorId);
    if (evaluator) {
      toast(`📋 Historique de ${evaluator.name}`, { icon: 'ℹ️', duration: 3000 });
    }
    // TODO: Ouvrir une modal ou rediriger vers la page d'historique avec l'ID de l'évaluateur
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

  const renderFournisseurs = () => {
    const counts = getSupplierCounts();
    
    return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Gestion des Fournisseurs</h1>
        <div className="flex space-x-3">
          <button 
            onClick={handleAddSupplier}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un fournisseur</span>
          </button>
          <button 
            onClick={handleExportExcel}
            className="btn-outline"
          >
            Export Excel
          </button>
          <button 
            onClick={handleExportPDF}
            className="btn-outline"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Filtres avec compteurs */}
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => setSupplierFilter('tous')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            supplierFilter === 'tous' 
              ? 'bg-cameg-blue text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tous <span className="ml-1 font-semibold">({counts.tous})</span>
        </button>
        <button 
          onClick={() => setSupplierFilter('valides')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            supplierFilter === 'valides' 
              ? 'bg-cameg-blue text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Validés <span className="ml-1 font-semibold">({counts.valides})</span>
        </button>
        <button 
          onClick={() => setSupplierFilter('en_attente')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            supplierFilter === 'en_attente' 
              ? 'bg-cameg-blue text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          En attente <span className="ml-1 font-semibold">({counts.en_attente})</span>
        </button>
        <button 
          onClick={() => setSupplierFilter('suspendus')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            supplierFilter === 'suspendus' 
              ? 'bg-cameg-blue text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Suspendus <span className="ml-1 font-semibold">({counts.suspendus})</span>
        </button>
        <button 
          onClick={() => setSupplierFilter('alerte')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            supplierFilter === 'alerte' 
              ? 'bg-cameg-blue text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Alerte <span className="ml-1 font-semibold">({counts.alerte})</span>
        </button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher par nom, pays, score, date..."
          className="form-input pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center space-x-1.5 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                      {getStatusIcon(supplier.status)}
                      <span>{getStatusText(supplier.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.score ? `${supplier.score}%` : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.lastUpdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2 flex-wrap">
                      {/* Bouton Voir fiche - Toujours actif */}
                      <div className="relative group">
                        <button 
                          onClick={() => handleViewSupplier(supplier.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-cameg-blue bg-blue-50 rounded-md hover:bg-blue-100 transition-all duration-200 hover:shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Voir</span>
                        </button>
                      </div>

                      {/* Bouton Valider - Actif seulement si en attente */}
                      <div className="relative group">
                        <button 
                          onClick={() => supplier.status === 'en_attente' && handleValidateSupplier(supplier.id)}
                          disabled={supplier.status !== 'en_attente'}
                          className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                            supplier.status === 'en_attente'
                              ? 'text-green-600 bg-green-50 hover:bg-green-100 hover:shadow-sm cursor-pointer'
                              : 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-50'
                          }`}
                          title={supplier.status !== 'en_attente' ? 'Ce fournisseur est déjà validé ou suspendu' : 'Valider ce fournisseur'}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Valider</span>
                        </button>
                        {supplier.status !== 'en_attente' && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            {supplier.status === 'valide' ? 'Ce fournisseur est déjà validé' : 'Réactivation nécessaire avant validation'}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        )}
                      </div>

                      {/* Bouton Suspendre - Actif seulement si validé */}
                      <div className="relative group">
                        <button 
                          onClick={() => supplier.status === 'valide' && handleSuspendSupplier(supplier.id)}
                          disabled={supplier.status !== 'valide'}
                          className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                            supplier.status === 'valide'
                              ? 'text-red-600 bg-red-50 hover:bg-red-100 hover:shadow-sm cursor-pointer'
                              : 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-50'
                          }`}
                          title={supplier.status !== 'valide' ? 'Seuls les fournisseurs validés peuvent être suspendus' : 'Suspendre ce fournisseur'}
                        >
                          <Pause className="h-3.5 w-3.5" />
                          <span>Suspendre</span>
                        </button>
                        {supplier.status !== 'valide' && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            {supplier.status === 'en_attente' ? 'Valider d\'abord ce fournisseur' : 'Ce fournisseur est déjà suspendu'}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        )}
                      </div>

                      {/* Bouton Réactiver - Actif seulement si suspendu */}
                      <div className="relative group">
                        <button 
                          onClick={() => supplier.status === 'suspendu' && handleReactivateSupplier(supplier.id)}
                          disabled={supplier.status !== 'suspendu'}
                          className={`inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                            supplier.status === 'suspendu'
                              ? 'text-green-600 bg-green-50 hover:bg-green-100 hover:shadow-sm cursor-pointer'
                              : 'text-gray-400 bg-gray-100 cursor-not-allowed opacity-50'
                          }`}
                          title={supplier.status !== 'suspendu' ? 'Réactivation possible uniquement pour les fournisseurs suspendus' : 'Réactiver ce fournisseur'}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Réactiver</span>
                        </button>
                        {supplier.status !== 'suspendu' && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            {supplier.status === 'valide' ? 'Ce fournisseur est déjà actif' : 'Réactivation possible uniquement après audit'}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        )}
                      </div>

                      {/* Bouton Analyser via IA - Toujours actif */}
                      <div className="relative group">
                        <button 
                          onClick={() => handleAnalyzeWithAI(supplier.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-all duration-200 hover:shadow-sm"
                          title="Analyser le fournisseur via l'IA pour calculer ou actualiser le score qualité"
                        >
                          <Brain className="h-3.5 w-3.5" />
                          <span>Analyser</span>
                        </button>
                      </div>
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
  };

  const renderEvaluators = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Supervision des Évaluateurs</h1>
        <button 
          onClick={() => handleAssignCase()}
          className="btn-primary flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Assigner un dossier</span>
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
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleAssignCase(evaluator.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-cameg-blue bg-blue-50 rounded-md hover:bg-blue-100 transition-all duration-200 hover:shadow-sm"
                        title="Assigner un dossier à cet évaluateur"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Assigner</span>
                      </button>
                      <button 
                        onClick={() => handleSendReminder(evaluator.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 rounded-md hover:bg-yellow-100 transition-all duration-200 hover:shadow-sm"
                        title="Envoyer un rappel à cet évaluateur"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Rappel</span>
                      </button>
                      <button 
                        onClick={() => handleViewHistory(evaluator.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-all duration-200 hover:shadow-sm"
                        title="Voir l'historique de cet évaluateur"
                      >
                        <History className="h-3.5 w-3.5" />
                        <span>Historique</span>
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
              <button 
                onClick={() => setActiveSection('analyse-ia')}
                className="p-2 text-gray-600 hover:text-cameg-blue transition-colors"
                title="Analyse IA"
              >
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
              <button 
                onClick={() => setActiveSection('parametres')}
                className="p-2 text-gray-600 hover:text-cameg-blue transition-colors"
                title="Paramètres système"
              >
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

      {/* Modal d'assignation de dossier */}
      {showAssignCaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseAssignCaseModal}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-cameg-dark">
                {selectedEvaluatorForAssignment 
                  ? `Assigner un dossier à ${evaluators.find(e => e.id === selectedEvaluatorForAssignment)?.name}`
                  : 'Assigner un dossier à un évaluateur'
                }
              </h2>
              <button
                onClick={handleCloseAssignCaseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {!selectedEvaluatorForAssignment && (
                <div>
                  <label className="form-label flex items-center space-x-2">
                    <UserPlus className="h-4 w-4 text-cameg-blue" />
                    <span>Sélectionner un évaluateur *</span>
                  </label>
                  <select
                    className="form-input"
                    onChange={(e) => setSelectedEvaluatorForAssignment(parseInt(e.target.value))}
                    value={selectedEvaluatorForAssignment || ''}
                  >
                    <option value="">Choisir un évaluateur...</option>
                    {evaluators.map((evaluator) => (
                      <option key={evaluator.id} value={evaluator.id}>
                        {evaluator.name} - {evaluator.dossiersAssignes} dossiers assignés
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedEvaluatorForAssignment && (
                <>
                  <div>
                    <label className="form-label flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-cameg-blue" />
                      <span>Sélectionner un dossier *</span>
                    </label>
                    <select 
                      id="case-select"
                      className="form-input"
                      defaultValue=""
                    >
                      <option value="">Choisir un dossier...</option>
                      <option value="dossier-1">Dossier #2025-001 - PharmaTogo SARL</option>
                      <option value="dossier-2">Dossier #2025-002 - BioPlus SA</option>
                      <option value="dossier-3">Dossier #2025-003 - MedLab Int.</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Liste des dossiers en attente d'assignation
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Information :</p>
                        <p>Le dossier sera assigné à l'évaluateur sélectionné. Il recevra une notification par email.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleCloseAssignCaseModal}
                      className="btn-outline"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        const caseSelect = document.getElementById('case-select') as HTMLSelectElement;
                        const caseId = caseSelect?.value;
                        if (caseId && selectedEvaluatorForAssignment) {
                          handleSubmitAssignCase(selectedEvaluatorForAssignment, caseId);
                        } else {
                          toast.error('Veuillez sélectionner un dossier');
                        }
                      }}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Assigner le dossier</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de fournisseur */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseAddSupplierModal}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-cameg-dark">Ajouter un nouveau fournisseur</h2>
              <button
                onClick={handleCloseAddSupplierModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewSupplier} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company_name" className="form-label flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-cameg-blue" />
                    <span>Nom de l'entreprise *</span>
                  </label>
                  <input
                    id="company_name"
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ex: PharmaTogo SARL"
                    value={newSupplierData.company_name}
                    onChange={(e) => setNewSupplierData(prev => ({ ...prev, company_name: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="country" className="form-label flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-cameg-blue" />
                    <span>Pays *</span>
                  </label>
                  <select
                    id="country"
                    required
                    className="form-input"
                    value={newSupplierData.country}
                    onChange={(e) => setNewSupplierData(prev => ({ ...prev, country: e.target.value }))}
                  >
                    <option value="">Sélectionner un pays</option>
                    <option value="Togo">Togo</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    <option value="Sénégal">Sénégal</option>
                    <option value="Mali">Mali</option>
                    <option value="Bénin">Bénin</option>
                    <option value="Niger">Niger</option>
                    <option value="Inde">Inde</option>
                    <option value="Chine">Chine</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="phone_number" className="form-label flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-cameg-blue" />
                    <span>Téléphone *</span>
                  </label>
                  <input
                    id="phone_number"
                    type="tel"
                    required
                    className="form-input"
                    placeholder="Ex: +22890123456"
                    value={newSupplierData.phone_number}
                    onChange={(e) => setNewSupplierData(prev => ({ ...prev, phone_number: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="form-label flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-cameg-blue" />
                    <span>Email *</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="contact@entreprise.com"
                    value={newSupplierData.email}
                    onChange={(e) => setNewSupplierData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="password" className="form-label flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-cameg-blue" />
                    <span>Mot de passe temporaire *</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    className="form-input"
                    placeholder="Minimum 8 caractères"
                    value={newSupplierData.password}
                    onChange={(e) => setNewSupplierData(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Le fournisseur pourra modifier ce mot de passe lors de sa première connexion
                  </p>
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <p className="font-semibold mb-1">Règles du mot de passe :</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Minimum 8 caractères</li>
                      <li>Au moins une majuscule (A-Z)</li>
                      <li>Au moins une minuscule (a-z)</li>
                      <li>Au moins un chiffre (0-9)</li>
                      <li>Au moins un caractère spécial (!@#$%^&*...)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Note importante :</p>
                    <p>Le fournisseur sera créé avec le statut "En attente". Vous pourrez le valider après vérification de ses documents.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseAddSupplierModal}
                  className="btn-outline"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le fournisseur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de détails du fournisseur */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedSupplier(null)}>
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-cameg-dark">Fiche Fournisseur</h2>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* En-tête avec nom et statut */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedSupplier.name}</h3>
                  <p className="text-gray-600 mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedSupplier.country}
                  </p>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedSupplier.status)}`}>
                  {getStatusText(selectedSupplier.status)}
                </span>
              </div>

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                      <Building2 className="h-4 w-4 mr-2" />
                      Nom de l'entreprise
                    </label>
                    <p className="text-gray-900">{selectedSupplier.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      Pays
                    </label>
                    <p className="text-gray-900">{selectedSupplier.country}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Score Qualité
                    </label>
                    <p className="text-gray-900">
                      {selectedSupplier.score ? (
                        <span className={`font-semibold ${
                          selectedSupplier.score >= 80 ? 'text-green-600' :
                          selectedSupplier.score >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {selectedSupplier.score}%
                        </span>
                      ) : (
                        <span className="text-gray-400">Non évalué</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Dernière mise à jour
                    </label>
                    <p className="text-gray-900">{selectedSupplier.lastUpdate}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Statut
                    </label>
                    <p className="text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedSupplier.status)}`}>
                        {getStatusText(selectedSupplier.status)}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                      <FileText className="h-4 w-4 mr-2" />
                      ID Fournisseur
                    </label>
                    <p className="text-gray-900 font-mono text-sm">#{selectedSupplier.id}</p>
                  </div>
                </div>
              </div>

              {/* Actions disponibles */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Actions disponibles</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedSupplier.status === 'en_attente' && (
                    <button
                      onClick={() => {
                        handleValidateSupplier(selectedSupplier.id);
                        setSelectedSupplier(null);
                      }}
                      className="btn-primary"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Valider le fournisseur
                    </button>
                  )}
                  {selectedSupplier.status === 'valide' && (
                    <button
                      onClick={() => {
                        handleSuspendSupplier(selectedSupplier.id);
                        setSelectedSupplier(null);
                      }}
                      className="btn-outline border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Suspendre
                    </button>
                  )}
                  {selectedSupplier.status === 'suspendu' && (
                    <button
                      onClick={() => {
                        handleReactivateSupplier(selectedSupplier.id);
                        setSelectedSupplier(null);
                      }}
                      className="btn-primary"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Réactiver
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedSupplier(null)}
                    className="btn-outline"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
};

export default AdminDashboardPage;
