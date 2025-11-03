import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
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
              <Link to="/tenders" className="nav-link">Appels d'offres</Link>
              <Link to="/support" className="nav-link">Support</Link>
              <span className="nav-link text-cameg-blue font-semibold">Contact</span>
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
                Contactez-nous
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Notre équipe est là pour vous accompagner dans votre démarche 
                d'inscription et répondre à toutes vos questions.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Formulaire de contact */}
              <div className="bg-white rounded-2xl p-8 shadow-soft">
                <h2 className="text-2xl font-bold text-cameg-dark mb-6">
                  Envoyez-nous un message
                </h2>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue focus:border-transparent"
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue focus:border-transparent"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue focus:border-transparent"
                      placeholder="+228 XX XX XX XX"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue focus:border-transparent">
                      <option>Question générale</option>
                      <option>Inscription fournisseur</option>
                      <option>Appels d'offres</option>
                      <option>Problème technique</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue focus:border-transparent"
                      placeholder="Décrivez votre demande en détail..."
                    />
                  </div>
                  
                  <button type="submit" className="btn-primary w-full flex items-center justify-center space-x-2">
                    <Send className="h-5 w-5" />
                    <span>Envoyer le message</span>
                  </button>
                </form>
              </div>

              {/* Informations de contact */}
              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-8 shadow-soft">
                  <h2 className="text-2xl font-bold text-cameg-dark mb-6">
                    Informations de contact
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-cameg-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-cameg-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-cameg-dark mb-1">Adresse</h3>
                        <p className="text-gray-600">
                          202, Boulevard des Armées<br />
                          Face à la morgue de Tokoin Hôpital<br />
                          Lomé, Togo
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-cameg-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-cameg-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-cameg-dark mb-1">Téléphone</h3>
                        <p className="text-gray-600">+228 22 22 26 94</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-cameg-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-cameg-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-cameg-dark mb-1">Email</h3>
                        <p className="text-gray-600">contact@cameg-chain.tg</p>
                        <p className="text-gray-600">support@cameg-chain.tg</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-cameg-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-cameg-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-cameg-dark mb-1">Horaires d'ouverture</h3>
                        <p className="text-gray-600">
                          Lundi à vendredi: 07h30 – 12h30 / 14h00 – 17h00<br />
                          Samedi et dimanche: fermé
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cameg-blue to-blue-600 rounded-2xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">Besoin d'aide immédiate ?</h3>
                  <p className="mb-6">
                    Notre équipe support est disponible pour vous accompagner 
                    dans vos démarches d'inscription et répondre à vos questions.
                  </p>
                  <div className="space-y-3">
                    <a href="tel:+22822222694" className="flex items-center space-x-3 hover:underline">
                      <Phone className="h-5 w-5" />
                      <span>Appeler maintenant</span>
                    </a>
                    <a href="mailto:support@cameg-chain.tg" className="flex items-center space-x-3 hover:underline">
                      <Mail className="h-5 w-5" />
                      <span>Envoyer un email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
