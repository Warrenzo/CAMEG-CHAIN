import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Brain, 
  FlaskConical,
  Truck,
  Handshake,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Données simulées pour les actualités (mémorisées)
  const newsItems = useMemo(() => [
    {
      id: 1,
      title: "Nouvel appel d'offres pour les médicaments antipaludiques",
      excerpt: "La CAMEG lance un appel d'offres pour l'approvisionnement en médicaments antipaludiques pour 2025.",
      image: "📋",
      link: "/tenders"
    },
    {
      id: 2,
      title: "Formation des évaluateurs sur les nouvelles normes",
      excerpt: "Session de formation organisée pour les évaluateurs sur les nouvelles normes de qualité pharmaceutique.",
      image: "🎓",
      link: "/support"
    },
    {
      id: 3,
      title: "Partenariat avec l'OMS pour la qualité des médicaments",
      excerpt: "Signature d'un nouveau partenariat pour renforcer le contrôle qualité des médicaments essentiels.",
      image: "🤝",
      link: "/about"
    }
  ], []);

  // Auto-carrousel pour les actualités
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [newsItems.length]);

  return (
    <div className="min-h-screen bg-cameg-gray">
      {/* Header fixe avec transparence */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-soft" role="banner">
        <div className="container-custom">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-cameg-blue rounded-lg flex items-center justify-center" role="img" aria-label="Logo CAMEG-CHAIN">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <h1 className="text-2xl font-bold text-cameg-dark">CAMEG-CHAIN</h1>
            </div>
            
            {/* Menu desktop */}
            <nav className="hidden md:flex space-x-6" role="navigation" aria-label="Menu principal">
              <Link to="/" className="nav-link">Accueil</Link>
              <Link to="/about" className="nav-link">À propos</Link>
              <Link to="/tenders" className="nav-link">Appels d'offres</Link>
              <Link to="/support" className="nav-link">Support</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
            </nav>

            {/* Boutons d'action */}
            <div className="flex items-center space-x-4">
              <Link to="/login" className="btn-outline hidden sm:inline-flex">Se connecter</Link>
              <Link to="/register" className="btn-primary">Créer un compte</Link>
              
              {/* Menu mobile */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-cameg-blue"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="nav-link">Accueil</Link>
                <Link to="/about" className="nav-link text-left">À propos</Link>
                <Link to="/tenders" className="nav-link text-left">Appels d'offres</Link>
                <Link to="/support" className="nav-link text-left">Support</Link>
                <Link to="/contact" className="nav-link text-left">Contact</Link>
                <Link to="/login" className="btn-outline">Se connecter</Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section avec image de fond */}
      <section className="relative bg-gradient-to-br from-cameg-blue/90 to-blue-700/90 text-white py-32 mt-16">
        {/* Image de fond simulée */}
        <div className="absolute inset-0 bg-gradient-to-br from-cameg-blue to-blue-700 opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Connecter la qualité pharmaceutique à l'innovation.
            </h1>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              CAMEG-CHAIN est la passerelle numérique entre la DAQP et les fournisseurs pharmaceutiques du Togo et d'ailleurs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="btn-primary bg-white text-cameg-blue hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Créer un compte fournisseur
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/login" 
                className="btn-outline border-white text-white hover:bg-white hover:text-cameg-blue transform hover:scale-105 transition-all duration-200"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section À propos de la CAMEG */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-cameg-blue rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">C</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-cameg-dark">À propos de la CAMEG</h2>
                  <p className="text-gray-600">Centrale d'Achat des Médicaments Essentiels et Génériques</p>
                </div>
              </div>
              <p className="text-lg text-gray-700 mb-6">
                La CAMEG-Togo assure la disponibilité continue des médicaments essentiels et de qualité.
                À travers CAMEG-CHAIN, elle renforce la transparence et la collaboration avec les fournisseurs nationaux et internationaux.
              </p>
              <Link to="/about" className="btn-outline flex items-center space-x-2">
                <span>Découvrir la CAMEG</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-cameg-blue to-blue-600 rounded-xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">15+</div>
                    <p className="text-blue-100">Années d'expérience</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">1000+</div>
                    <p className="text-blue-100">Fournisseurs évalués</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">50+</div>
                    <p className="text-blue-100">Pays partenaires</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">99%</div>
                    <p className="text-blue-100">Qualité garantie</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Nos missions */}
      <section className="py-20 bg-cameg-gray">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-cameg-dark mb-4">
              Nos missions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La CAMEG présente une organisation moderne et connectée, 
              au service de la qualité pharmaceutique
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card p-8 text-center hover:transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FlaskConical className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-cameg-dark">Assurer la qualité</h3>
              <p className="text-gray-600">
                Sélection rigoureuse et contrôle des produits pharmaceutiques.
              </p>
            </div>

            <div className="card p-8 text-center hover:transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-cameg-dark">Garantir la disponibilité</h3>
              <p className="text-gray-600">
                Une chaîne d'approvisionnement efficiente sur tout le territoire.
              </p>
            </div>

            <div className="card p-8 text-center hover:transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Handshake className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-cameg-dark">Collaborer avec transparence</h3>
              <p className="text-gray-600">
                Une plateforme ouverte pour des partenariats équitables.
              </p>
            </div>

            <div className="card p-8 text-center hover:transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-cameg-dark">Innover par l'IA</h3>
              <p className="text-gray-600">
                Intelligence artificielle pour une gestion proactive des fournisseurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Actualités / Appels d'offres récents */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-cameg-dark mb-4">
              📢 Dernières publications et appels d'offres
            </h2>
            <p className="text-xl text-gray-600">
              Restez informé des dernières actualités et opportunités
            </p>
          </div>

          <div className="relative">
            <div className="grid md:grid-cols-3 gap-8">
              {newsItems.map((item, index) => (
                <div 
                  key={item.id}
                  className={`card p-6 transition-all duration-500 ${
                    index === currentNewsIndex 
                      ? 'transform scale-105 shadow-lg border-cameg-blue border-2' 
                      : 'opacity-75'
                  }`}
                >
                  <div className="text-4xl mb-4 text-center">{item.image}</div>
                  <h3 className="text-lg font-semibold mb-3 text-cameg-dark line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                    {item.excerpt}
                  </p>
                  <Link to={item.link} className="btn-outline text-sm w-full">
                    Lire plus
                  </Link>
                </div>
              ))}
            </div>

            {/* Contrôles du carrousel */}
            <div className="flex justify-center mt-8 space-x-2">
              {newsItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentNewsIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentNewsIndex 
                      ? 'bg-cameg-blue' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Message institutionnel du DG */}
      <section className="py-20 bg-gradient-to-r from-cameg-green to-green-600 text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">👨‍💼</span>
            </div>
            <blockquote className="text-2xl italic mb-8 leading-relaxed">
              "La transparence, la qualité et la responsabilité guident notre action au service de la santé publique.
              Avec CAMEG-CHAIN, nous intégrons l'innovation pour renforcer la confiance entre partenaires."
            </blockquote>
            <div className="text-lg">
              <p className="font-semibold">Directeur Général, CAMEG-Togo</p>
              <p className="opacity-90">Centrale d'Achat des Médicaments Essentiels et Génériques</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Aide et support */}
      <section className="py-20 bg-cameg-gray">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-cameg-blue rounded-full flex items-center justify-center mx-auto mb-8">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-cameg-dark mb-6">
              Besoin d'aide ?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Notre équipe est à votre disposition pour vous accompagner
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary flex items-center justify-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Contacter le support</span>
              </button>
              <button className="btn-outline flex items-center justify-center space-x-2">
                <HelpCircle className="h-5 w-5" />
                <span>Consulter la FAQ</span>
              </button>
            </div>
            <div className="mt-8 text-sm text-gray-600">
              <p>📧 support@cameg-chain.tg</p>
              <p>☎️ +228 22 22 26 94</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer institutionnel */}
      <footer className="bg-cameg-dark text-white py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-cameg-blue rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <h3 className="text-xl font-bold">CAMEG-CHAIN</h3>
              </div>
              <p className="text-gray-400">
                Plateforme officielle de gestion des fournisseurs pharmaceutiques
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liens utiles</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-left">Mentions légales</button></li>
                <li><button className="hover:text-white text-left">Politique de confidentialité</button></li>
                <li><button className="hover:text-white text-left">Termes d'utilisation</button></li>
                <li><button className="hover:text-white text-left">Guide utilisateur</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Réseaux sociaux</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-left">LinkedIn</button></li>
                <li><button className="hover:text-white text-left">Twitter</button></li>
                <li><button className="hover:text-white text-left">Facebook</button></li>
                <li><button className="hover:text-white text-left">YouTube</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>202, Boulevard des Armées, Lomé</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@cameg-togo.tg</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+228 22 22 26 94</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>www.cameg-togo.tg</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CAMEG-Togo | Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Widget d'assistance IA */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {isChatOpen && (
            <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Assistant IA</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="bg-cameg-gray rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">
                  Bonjour 👋, besoin d'aide pour vous inscrire ? Je peux vous guider dans le processus d'inscription.
                </p>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-cameg-blue hover:underline">
                  Comment créer un compte ?
                </button>
                <button className="w-full text-left text-sm text-cameg-blue hover:underline">
                  Quels documents sont requis ?
                </button>
                <button className="w-full text-left text-sm text-cameg-blue hover:underline">
                  Comment soumettre une offre ?
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-14 h-14 bg-cameg-blue rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
