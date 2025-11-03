import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Phone, Mail, HelpCircle, FileText, Clock } from 'lucide-react';

const SupportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('faq');

  const faqs = [
    {
      question: "Comment créer un compte fournisseur ?",
      answer: "Pour créer un compte fournisseur, cliquez sur 'Créer un compte' dans le menu principal, puis suivez le processus d'inscription en deux phases. Vous devrez fournir vos informations de base puis compléter votre profil avec les documents requis."
    },
    {
      question: "Quels documents sont requis pour la validation ?",
      answer: "Les documents requis incluent : licence pharmaceutique, certificat GMP, attestation de conformité, certificat d'inscription au registre du commerce, et autres documents spécifiques selon votre domaine d'activité."
    },
    {
      question: "Combien de temps prend la validation d'un compte ?",
      answer: "Le processus de validation prend généralement 5 à 10 jours ouvrables après soumission de tous les documents requis. Vous recevrez une notification par email une fois votre compte validé."
    },
    {
      question: "Comment participer aux appels d'offres ?",
      answer: "Une fois votre compte validé, vous pouvez consulter tous les appels d'offres actifs dans la section dédiée, télécharger les dossiers de candidature et soumettre vos propositions avant la date limite."
    }
  ];

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
              <span className="nav-link text-cameg-blue font-semibold">Support</span>
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

            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-cameg-dark mb-6">
                Centre d'Aide et Support
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Trouvez rapidement les réponses à vos questions ou contactez notre équipe support.
              </p>
            </div>

            {/* Onglets */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'faq'
                    ? 'bg-white text-cameg-blue shadow-sm'
                    : 'text-gray-600 hover:text-cameg-blue'
                }`}
              >
                <HelpCircle className="h-5 w-5 inline mr-2" />
                FAQ
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'contact'
                    ? 'bg-white text-cameg-blue shadow-sm'
                    : 'text-gray-600 hover:text-cameg-blue'
                }`}
              >
                <MessageCircle className="h-5 w-5 inline mr-2" />
                Contact
              </button>
              <button
                onClick={() => setActiveTab('guides')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                  activeTab === 'guides'
                    ? 'bg-white text-cameg-blue shadow-sm'
                    : 'text-gray-600 hover:text-cameg-blue'
                }`}
              >
                <FileText className="h-5 w-5 inline mr-2" />
                Guides
              </button>
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'faq' && (
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-soft">
                    <h3 className="text-xl font-semibold text-cameg-dark mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="bg-white rounded-2xl p-8 shadow-soft">
                <h2 className="text-2xl font-bold text-cameg-dark mb-6">Contactez notre équipe</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-cameg-dark mb-4">Informations de contact</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-cameg-blue" />
                        <div>
                          <p className="font-medium text-cameg-dark">Téléphone</p>
                          <p className="text-gray-600">+228 22 22 26 94</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-cameg-blue" />
                        <div>
                          <p className="font-medium text-cameg-dark">Email</p>
                          <p className="text-gray-600">support@cameg-chain.tg</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-cameg-blue" />
                        <div>
                          <p className="font-medium text-cameg-dark">Horaires</p>
                          <p className="text-gray-600">Lun - Ven: 07h30 – 12h30 / 14h00 – 17h00<br />Samedi et dimanche: fermé</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-cameg-dark mb-4">Envoyez-nous un message</h3>
                    <form className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Votre nom"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Votre email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <textarea
                          rows={4}
                          placeholder="Votre message"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cameg-blue focus:border-transparent"
                        />
                      </div>
                      <button type="submit" className="btn-primary w-full">
                        Envoyer le message
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guides' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <h3 className="text-xl font-semibold text-cameg-dark mb-3">
                    Guide d'inscription fournisseur
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Apprenez comment créer et configurer votre compte fournisseur étape par étape.
                  </p>
                  <button className="btn-outline">Télécharger le guide</button>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <h3 className="text-xl font-semibold text-cameg-dark mb-3">
                    Guide de soumission d'offres
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Découvrez comment participer efficacement aux appels d'offres.
                  </p>
                  <button className="btn-outline">Télécharger le guide</button>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft">
                  <h3 className="text-xl font-semibold text-cameg-dark mb-3">
                    Documentation technique
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Accédez à la documentation complète de la plateforme.
                  </p>
                  <button className="btn-outline">Consulter la documentation</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportPage;
