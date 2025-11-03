import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';

const TendersPage: React.FC = () => {
  // Données simulées pour les appels d'offres
  const tenders = [
    {
      id: 1,
      title: "Appel d'offres pour médicaments antipaludiques",
      description: "Approvisionnement en médicaments antipaludiques pour le programme national de lutte contre le paludisme 2025.",
      deadline: "2025-02-15",
      status: "Ouvert",
      location: "Lomé, Togo",
      budget: "2,500,000,000 FCFA"
    },
    {
      id: 2,
      title: "Fourniture d'équipements médicaux",
      description: "Acquisition d'équipements de diagnostic et de traitement pour les centres de santé.",
      deadline: "2025-01-30",
      status: "Ouvert",
      location: "Tout le Togo",
      budget: "1,800,000,000 FCFA"
    },
    {
      id: 3,
      title: "Médicaments essentiels - Lot 1",
      description: "Approvisionnement en médicaments essentiels pour les hôpitaux publics.",
      deadline: "2025-01-20",
      status: "Bientôt clos",
      location: "Région Maritime",
      budget: "3,200,000,000 FCFA"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ouvert':
        return 'bg-green-100 text-green-800';
      case 'Bientôt clos':
        return 'bg-yellow-100 text-yellow-800';
      case 'Fermé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="nav-link">Accueil</Link>
              <Link to="/about" className="nav-link">À propos</Link>
              <span className="nav-link text-cameg-blue font-semibold">Appels d'offres</span>
              <Link to="/support" className="nav-link">Support</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/login" className="btn-outline hidden sm:inline-flex">Se connecter</Link>
              <Link to="/register" className="btn-primary">Créer un compte</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="py-16">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <Link to="/" className="inline-flex items-center text-cameg-blue hover:text-blue-700 mb-8">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </Link>

            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-cameg-dark mb-6">
                Appels d'Offres Actifs
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez les opportunités d'approvisionnement pharmaceutique 
                disponibles pour les fournisseurs qualifiés.
              </p>
            </div>

            {/* Liste des appels d'offres */}
            <div className="space-y-6">
              {tenders.map((tender) => (
                <div key={tender.id} className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-cameg-dark mb-2">
                        {tender.title}
                      </h3>
                      <p className="text-gray-600 text-lg mb-4">
                        {tender.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tender.status)}`}>
                      {tender.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-cameg-blue" />
                      <div>
                        <p className="text-sm text-gray-500">Date limite</p>
                        <p className="font-semibold text-cameg-dark">{tender.deadline}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-cameg-blue" />
                      <div>
                        <p className="text-sm text-gray-500">Localisation</p>
                        <p className="font-semibold text-cameg-dark">{tender.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-cameg-blue" />
                      <div>
                        <p className="text-sm text-gray-500">Budget estimé</p>
                        <p className="font-semibold text-cameg-dark">{tender.budget}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Pour participer, vous devez être un fournisseur enregistré et validé.
                    </p>
                    <button className="btn-primary flex items-center space-x-2">
                      <span>Voir les détails</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to action */}
            <div className="bg-gradient-to-r from-cameg-blue to-blue-600 rounded-2xl p-8 text-white text-center mt-12">
              <h2 className="text-3xl font-bold mb-4">Intéressé par nos appels d'offres ?</h2>
              <p className="text-xl mb-6">
                Créez votre compte fournisseur pour accéder à tous les appels d'offres 
                et soumettre vos propositions.
              </p>
              <Link to="/register" className="btn-white inline-flex items-center space-x-2">
                <span>Créer un compte fournisseur</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TendersPage;
