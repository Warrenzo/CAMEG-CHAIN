import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, FlaskConical, Truck, Handshake } from 'lucide-react';

const AboutPage: React.FC = () => {
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
              <span className="nav-link text-cameg-blue font-semibold">À propos</span>
              <Link to="/tenders" className="nav-link">Appels d'offres</Link>
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
          <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center text-cameg-blue hover:text-blue-700 mb-8">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </Link>

            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-cameg-dark mb-6">
                À propos de CAMEG-CHAIN
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                La plateforme numérique qui révolutionne la gestion des appels d'offres 
                pharmaceutiques au Togo et en Afrique de l'Ouest.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white rounded-2xl p-8 mb-12 shadow-soft">
              <h2 className="text-3xl font-bold text-cameg-dark mb-6">Notre Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                CAMEG-CHAIN connecte la Direction de l'Assurance Qualité Pharmaceutique (DAQP) 
                avec les fournisseurs pharmaceutiques du Togo et d'ailleurs, en garantissant 
                la transparence, l'efficacité et la qualité dans tous les processus d'approvisionnement.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cameg-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="h-6 w-6 text-cameg-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cameg-dark mb-2">Innovation Technologique</h3>
                    <p className="text-gray-600">Utilisation de l'IA et de la blockchain pour optimiser les processus.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cameg-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="h-6 w-6 text-cameg-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cameg-dark mb-2">Qualité Garantie</h3>
                    <p className="text-gray-600">Contrôle strict de la qualité des médicaments et fournisseurs.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cameg-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6 text-cameg-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cameg-dark mb-2">Traçabilité</h3>
                    <p className="text-gray-600">Suivi complet de la chaîne d'approvisionnement.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-cameg-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Handshake className="h-6 w-6 text-cameg-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-cameg-dark mb-2">Partenariat</h3>
                    <p className="text-gray-600">Collaboration étroite avec tous les acteurs du secteur.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-r from-cameg-blue to-blue-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Notre Vision</h2>
              <p className="text-xl leading-relaxed">
                Devenir la référence en Afrique de l'Ouest pour la digitalisation des processus 
                d'approvisionnement pharmaceutique, en garantissant l'accès à des médicaments 
                de qualité pour tous les citoyens.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
