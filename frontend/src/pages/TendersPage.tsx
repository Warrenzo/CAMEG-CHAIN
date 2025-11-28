import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';

type TenderStatus =
  | 'draft'
  | 'published'
  | 'open'
  | 'closed'
  | 'evaluated'
  | 'awarded'
  | 'cancelled';

interface PublicTender {
  id: string;
  reference: string;
  title: string;
  description: string;
  closing_date: string;
  category: string;
  status: TenderStatus;
  estimated_value?: number;
  currency?: string;
  location?: string;
}

const TendersPage: React.FC = () => {
  const [tenders, setTenders] = React.useState<PublicTender[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const getApiBaseUrl = React.useCallback(() => {
    const apiUrl = process.env['REACT_APP_API_URL'] || 'http://localhost:8000';
    return apiUrl.replace(/\/api\/v1\/?$/, '');
  }, []);

  React.useEffect(() => {
    const fetchTenders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${getApiBaseUrl()}/api/v1/tenders?status=published&limit=50`
        );

        if (!response.ok) {
          throw new Error("Impossible de charger la liste des appels d'offres.");
        }

        const data = await response.json();
        const list = Array.isArray(data) ? data : data.tenders || [];

        const formatted = list
          .filter((tender: any) => tender.status === 'published')
          .map(
            (tender: any): PublicTender => ({
              id: tender.id || tender.reference,
              reference: tender.reference,
              title: tender.title,
              description: tender.description,
              closing_date: tender.closing_date,
              category: tender.category,
              status: tender.status,
              estimated_value: tender.estimated_value,
              currency: tender.currency,
              location:
                tender.eligibility_rules?.countries?.join(', ') ||
                'Couverture internationale'
            })
          );

        setTenders(formatted);
      } catch (err) {
        console.error('Erreur lors du chargement des AO:', err);
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors du chargement des appels d'offres."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenders();
  }, [getApiBaseUrl]);

  const getStatusColor = (status: TenderStatus) => {
    switch (status) {
      case 'published':
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
      case 'evaluated':
      case 'awarded':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: TenderStatus) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'published':
        return 'Publié';
      case 'open':
        return 'Ouvert';
      case 'closed':
        return 'Clôturé';
      case 'evaluated':
        return 'Évalué';
      case 'awarded':
        return 'Attribué';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Statut inconnu';
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Non précisée';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }
    return parsed.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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
              {isLoading && (
                <div className="bg-white rounded-2xl p-8 shadow-soft text-center">
                  <p className="text-lg text-gray-600">Chargement des appels d'offres en cours...</p>
                </div>
              )}

              {error && !isLoading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-center">
                  {error}
                </div>
              )}

              {!isLoading && !error && tenders.length === 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-soft text-center">
                  <h3 className="text-2xl font-bold text-cameg-dark mb-2">Aucun appel d'offres publié</h3>
                  <p className="text-gray-600">
                    Les appels d'offres seront affichés ici dès qu'ils seront publiés par l'administration.
                  </p>
                </div>
              )}

              {!isLoading &&
                !error &&
                tenders.map((tender) => (
                  <div key={tender.id} className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <p className="text-sm uppercase tracking-wide text-gray-400 font-semibold mb-1">
                          Ref. {tender.reference}
                        </p>
                        <h3 className="text-2xl font-bold text-cameg-dark mb-2">
                          {tender.title}
                        </h3>
                        <p className="text-gray-600 text-lg mb-4 line-clamp-3">
                          {tender.description}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tender.status)}`}>
                        {getStatusLabel(tender.status)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-cameg-blue" />
                        <div>
                          <p className="text-sm text-gray-500">Date limite</p>
                          <p className="font-semibold text-cameg-dark">{formatDate(tender.closing_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-cameg-blue" />
                        <div>
                          <p className="text-sm text-gray-500">Zone concernée</p>
                          <p className="font-semibold text-cameg-dark">{tender.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-cameg-blue" />
                        <div>
                          <p className="text-sm text-gray-500">Budget estimé</p>
                          <p className="font-semibold text-cameg-dark">
                            {tender.estimated_value
                              ? `${tender.estimated_value.toLocaleString('fr-FR')} ${tender.currency || 'FCFA'}`
                              : 'À préciser'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <p className="text-sm text-gray-500">
                        Pour participer, connectez-vous avec votre compte fournisseur validé ou inscrivez-vous.
                      </p>
                      <Link to="/login" className="btn-primary flex items-center justify-center space-x-2">
                        <span>Voir les détails (connexion requise)</span>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
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
