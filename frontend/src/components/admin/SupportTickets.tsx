import React, { useState } from 'react';
import { 
  HelpCircle, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  Search,
  Send,
  Archive,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Ticket {
  id: string;
  title: string;
  type: 'technical' | 'account' | 'evaluation' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  author: string;
  authorRole: 'supplier' | 'evaluator' | 'admin';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  description: string;
  messages: {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    isInternal: boolean;
  }[];
}

const SupportTickets: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Données simulées
  const tickets: Ticket[] = [
    {
      id: 'TKT-001',
      title: 'Problème de connexion au système',
      type: 'technical',
      priority: 'high',
      status: 'open',
      author: 'PharmaTogo SARL',
      authorRole: 'supplier',
      createdAt: '2025-10-15 10:30',
      updatedAt: '2025-10-15 14:20',
      description: 'Impossible de se connecter au système depuis hier. Message d\'erreur "Session expirée" même après réinitialisation du mot de passe.',
      messages: [
        {
          id: 'MSG-001',
          author: 'PharmaTogo SARL',
          content: 'Bonjour, je n\'arrive pas à me connecter au système. Pouvez-vous m\'aider ?',
          timestamp: '2025-10-15 10:30',
          isInternal: false
        },
        {
          id: 'MSG-002',
          author: 'Support CAMEG',
          content: 'Bonjour, nous avons identifié le problème. Veuillez essayer de vider le cache de votre navigateur et de vous reconnecter.',
          timestamp: '2025-10-15 11:15',
          isInternal: false
        }
      ]
    },
    {
      id: 'TKT-002',
      title: 'Évaluation non visible dans mon tableau de bord',
      type: 'evaluation',
      priority: 'medium',
      status: 'in_progress',
      author: 'Dr. Kossi',
      authorRole: 'evaluator',
      createdAt: '2025-10-15 09:15',
      updatedAt: '2025-10-15 13:45',
      assignedTo: 'Support Technique',
      description: 'L\'évaluation que j\'ai soumise hier n\'apparaît pas dans mon tableau de bord. Le dossier était "BioPlus SA - AO-2025-001".',
      messages: [
        {
          id: 'MSG-003',
          author: 'Dr. Kossi',
          content: 'Bonjour, j\'ai soumis une évaluation hier mais elle n\'apparaît pas dans mon tableau de bord.',
          timestamp: '2025-10-15 09:15',
          isInternal: false
        },
        {
          id: 'MSG-004',
          author: 'Support CAMEG',
          content: 'Nous vérifions votre dossier. Il semble y avoir un problème de synchronisation.',
          timestamp: '2025-10-15 10:30',
          isInternal: false
        }
      ]
    },
    {
      id: 'TKT-003',
      title: 'Demande de réactivation de compte',
      type: 'account',
      priority: 'low',
      status: 'resolved',
      author: 'MedLab International',
      authorRole: 'supplier',
      createdAt: '2025-10-14 16:20',
      updatedAt: '2025-10-15 08:30',
      assignedTo: 'Admin DAQP',
      description: 'Notre compte a été suspendu et nous souhaitons le réactiver. Nous avons corrigé les problèmes de conformité mentionnés.',
      messages: [
        {
          id: 'MSG-005',
          author: 'MedLab International',
          content: 'Bonjour, notre compte a été suspendu. Nous avons corrigé les problèmes et souhaitons le réactiver.',
          timestamp: '2025-10-14 16:20',
          isInternal: false
        },
        {
          id: 'MSG-006',
          author: 'Admin DAQP',
          content: 'Votre compte a été réactivé. Vous pouvez maintenant vous connecter normalement.',
          timestamp: '2025-10-15 08:30',
          isInternal: false
        }
      ]
    },
    {
      id: 'TKT-004',
      title: 'Question sur les critères d\'évaluation',
      type: 'general',
      priority: 'low',
      status: 'closed',
      author: 'Mme Akouvi',
      authorRole: 'evaluator',
      createdAt: '2025-10-13 14:45',
      updatedAt: '2025-10-14 10:15',
      assignedTo: 'Formation DAQP',
      description: 'J\'aimerais avoir des clarifications sur les nouveaux critères d\'évaluation pour les médicaments génériques.',
      messages: [
        {
          id: 'MSG-007',
          author: 'Mme Akouvi',
          content: 'Bonjour, j\'ai des questions sur les nouveaux critères d\'évaluation.',
          timestamp: '2025-10-13 14:45',
          isInternal: false
        },
        {
          id: 'MSG-008',
          author: 'Formation DAQP',
          content: 'Nous vous avons envoyé le guide mis à jour par email. N\'hésitez pas si vous avez d\'autres questions.',
          timestamp: '2025-10-14 10:15',
          isInternal: false
        }
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technical': return 'text-red-600 bg-red-100';
      case 'account': return 'text-blue-600 bg-blue-100';
      case 'evaluation': return 'text-green-600 bg-green-100';
      case 'general': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'technical': return 'Technique';
      case 'account': return 'Compte';
      case 'evaluation': return 'Évaluation';
      case 'general': return 'Général';
      default: return 'Inconnu';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return 'Inconnue';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <Archive className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'supplier': return 'text-green-600 bg-green-100';
      case 'evaluator': return 'text-blue-600 bg-blue-100';
      case 'admin': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'supplier': return 'Fournisseur';
      case 'evaluator': return 'Évaluateur';
      case 'admin': return 'Administrateur';
      default: return 'Inconnu';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = activeFilter === 'all' || ticket.status === activeFilter;
    const matchesSearch = searchTerm === '' || 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAssignTicket = (_ticketId: string) => {
    toast.success('Ticket assigné avec succès');
  };

  const handleResolveTicket = (_ticketId: string) => {
    toast.success('Ticket marqué comme résolu');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }
    toast.success('Message envoyé avec succès');
    setNewMessage('');
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Support / Assistance</h1>
        <button
          onClick={() => {
            // TODO: Implémenter la création de ticket
            console.log('Création de nouveau ticket');
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau ticket</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <HelpCircle className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ouverts</p>
              <p className="text-2xl font-bold text-red-600">{stats.open}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Résolus</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fermés</p>
              <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
            </div>
            <Archive className="h-8 w-8 text-gray-400" />
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
                placeholder="Rechercher par titre, auteur..."
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
              <option value="open">Ouverts</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolus</option>
              <option value="closed">Fermés</option>
            </select>
          </div>
          <div>
            <label className="form-label">Type</label>
            <select className="form-input">
              <option value="all">Tous</option>
              <option value="technical">Technique</option>
              <option value="account">Compte</option>
              <option value="evaluation">Évaluation</option>
              <option value="general">Général</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des tickets */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{ticket.id}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{ticket.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ticket.author}</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(ticket.authorRole)}`}>
                          {getRoleText(ticket.authorRole)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(ticket.type)}`}>
                      {getTypeText(ticket.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {getPriorityText(ticket.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1">{getStatusText(ticket.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewTicket(ticket)}
                        className="text-cameg-blue hover:text-blue-700"
                      >
                        Voir
                      </button>
                      {ticket.status === 'open' && (
                        <button
                          onClick={() => handleAssignTicket(ticket.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Assigner
                        </button>
                      )}
                      {ticket.status === 'in_progress' && (
                        <button
                          onClick={() => handleResolveTicket(ticket.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Résoudre
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

      {/* Modal de détails du ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ticket {selectedTicket.id} - {selectedTicket.title}
              </h3>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Informations du ticket */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auteur</label>
                  <p className="text-gray-900">{selectedTicket.author}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <p className="text-gray-900">{getTypeText(selectedTicket.type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Priorité</label>
                  <p className="text-gray-900">{getPriorityText(selectedTicket.priority)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Statut</label>
                  <p className="text-gray-900">{getStatusText(selectedTicket.status)}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{selectedTicket.description}</p>
              </div>

              {/* Messages */}
              <div>
                <label className="text-sm font-medium text-gray-700">Conversation</label>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg ${
                      message.isInternal ? 'bg-blue-50' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{message.author}</span>
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700">{message.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nouveau message */}
              <div>
                <label className="text-sm font-medium text-gray-700">Répondre</label>
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                    className="form-input flex-1"
                    placeholder="Tapez votre réponse..."
                  />
                  <button
                    onClick={handleSendMessage}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Envoyer</span>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="btn-outline"
                >
                  Fermer
                </button>
                <button className="btn-primary">
                  Mettre à jour le statut
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
