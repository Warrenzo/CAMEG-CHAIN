import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Save, 
  Send, 
  Calculator,
  FileText,
  Award,
  Truck,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EvaluationData {
  gmp: {
    certificates: number;
    audits: number;
    licenses: number;
    comments: string;
  };
  experience: {
    references: number;
    countries: number;
    years: number;
    comments: string;
  };
  documentation: {
    completeness: number;
    traceability: number;
    quality: number;
    comments: string;
  };
  logistics: {
    storage: number;
    transport: number;
    capacity: number;
    comments: string;
  };
  pricing: {
    competitiveness: number;
    delivery: number;
    payment: number;
    comments: string;
  };
  risks: {
    compliance: number;
    stability: number;
    observations: string;
  };
}

const EvaluationGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    gmp: { certificates: 0, audits: 0, licenses: 0, comments: '' },
    experience: { references: 0, countries: 0, years: 0, comments: '' },
    documentation: { completeness: 0, traceability: 0, quality: 0, comments: '' },
    logistics: { storage: 0, transport: 0, capacity: 0, comments: '' },
    pricing: { competitiveness: 0, delivery: 0, payment: 0, comments: '' },
    risks: { compliance: 0, stability: 0, observations: '' }
  });

  const tabs = [
    { id: 0, label: 'GMP & Conformité', icon: Award, weight: 25 },
    { id: 1, label: 'Expérience Fournisseur', icon: FileText, weight: 20 },
    { id: 2, label: 'Documentation Technique', icon: FileText, weight: 15 },
    { id: 3, label: 'Capacité Logistique', icon: Truck, weight: 15 },
    { id: 4, label: 'Prix & Compétitivité', icon: DollarSign, weight: 15 },
    { id: 5, label: 'Risques & Observations', icon: AlertTriangle, weight: 10 }
  ];

  const calculateSectionScore = (section: any, maxScore: number = 20) => {
    const values = Object.values(section).filter(val => typeof val === 'number') as number[];
    const total = values.reduce((sum, val) => sum + val, 0);
    return Math.round((total / (values.length * maxScore)) * 100);
  };

  const calculateTotalScore = () => {
    const gmpScore = calculateSectionScore(evaluationData.gmp) * 0.25;
    const experienceScore = calculateSectionScore(evaluationData.experience) * 0.20;
    const docScore = calculateSectionScore(evaluationData.documentation) * 0.15;
    const logisticsScore = calculateSectionScore(evaluationData.logistics) * 0.15;
    const pricingScore = calculateSectionScore(evaluationData.pricing) * 0.15;
    const risksScore = calculateSectionScore(evaluationData.risks) * 0.10;
    
    return Math.round(gmpScore + experienceScore + docScore + logisticsScore + pricingScore + risksScore);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Satisfaisant';
    return 'Insuffisant';
  };

  const handleSave = () => {
    toast.success('✅ Évaluation enregistrée avec succès.');
  };

  const handleSubmit = () => {
    const totalScore = calculateTotalScore();
    if (totalScore < 60) {
      toast.error('⚠️ Score insuffisant pour validation. Veuillez revoir les critères.');
      return;
    }
    toast.success('🎯 Dossier transmis à l\'administrateur pour validation finale.');
  };

  const renderGMPTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Certificats GMP</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validité des certificats (0-20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={evaluationData.gmp.certificates}
                onChange={(e) => setEvaluationData(prev => ({
                  ...prev,
                  gmp: { ...prev.gmp, certificates: parseInt(e.target.value) || 0 }
                }))}
                className="form-input"
              />
            </div>
            <div className="flex items-center space-x-2">
              {evaluationData.gmp.certificates >= 15 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : evaluationData.gmp.certificates >= 10 ? (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="text-sm text-gray-600">
                {evaluationData.gmp.certificates >= 15 ? 'Tous les documents validés' :
                 evaluationData.gmp.certificates >= 10 ? 'Certains éléments manquent' :
                 'Document expiré ou invalide'}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Audits Réalisés</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualité des audits (0-20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={evaluationData.gmp.audits}
                onChange={(e) => setEvaluationData(prev => ({
                  ...prev,
                  gmp: { ...prev.gmp, audits: parseInt(e.target.value) || 0 }
                }))}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Licences & Autorisations</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conformité réglementaire (0-20)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={evaluationData.gmp.licenses}
                onChange={(e) => setEvaluationData(prev => ({
                  ...prev,
                  gmp: { ...prev.gmp, licenses: parseInt(e.target.value) || 0 }
                }))}
                className="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Commentaires GMP & Conformité</h3>
        <textarea
          value={evaluationData.gmp.comments}
          onChange={(e) => setEvaluationData(prev => ({
            ...prev,
            gmp: { ...prev.gmp, comments: e.target.value }
          }))}
          rows={4}
          className="form-input"
          placeholder="Observations sur la conformité GMP, qualité des certificats, etc."
        />
      </div>
    </div>
  );

  const renderExperienceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Références Clients</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualité des références (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.experience.references}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                experience: { ...prev.experience, references: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Pays d'Activité</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diversité géographique (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.experience.countries}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                experience: { ...prev.experience, countries: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Ancienneté</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expérience sectorielle (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.experience.years}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                experience: { ...prev.experience, years: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Commentaires Expérience</h3>
        <textarea
          value={evaluationData.experience.comments}
          onChange={(e) => setEvaluationData(prev => ({
            ...prev,
            experience: { ...prev.experience, comments: e.target.value }
          }))}
          rows={4}
          className="form-input"
          placeholder="Observations sur l'expérience, les références, la réputation, etc."
        />
      </div>
    </div>
  );

  const renderDocumentationTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Complétude des Dossiers</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exhaustivité des documents (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.documentation.completeness}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                documentation: { ...prev.documentation, completeness: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Traçabilité</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualité de la traçabilité (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.documentation.traceability}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                documentation: { ...prev.documentation, traceability: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Qualité Documentaire</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Présentation et clarté (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.documentation.quality}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                documentation: { ...prev.documentation, quality: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Commentaires Documentation Technique</h3>
        <textarea
          value={evaluationData.documentation.comments}
          onChange={(e) => setEvaluationData(prev => ({
            ...prev,
            documentation: { ...prev.documentation, comments: e.target.value }
          }))}
          rows={4}
          className="form-input"
          placeholder="Observations sur la qualité des dossiers, la traçabilité, la présentation, etc."
        />
      </div>
    </div>
  );

  const renderLogisticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Capacité de Stockage</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Infrastructure de stockage (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.logistics.storage}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                logistics: { ...prev.logistics, storage: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Transport et Distribution</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Réseau de transport (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.logistics.transport}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                logistics: { ...prev.logistics, transport: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Capacité de Production</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume et flexibilité (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.logistics.capacity}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                logistics: { ...prev.logistics, capacity: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Commentaires Capacité Logistique</h3>
        <textarea
          value={evaluationData.logistics.comments}
          onChange={(e) => setEvaluationData(prev => ({
            ...prev,
            logistics: { ...prev.logistics, comments: e.target.value }
          }))}
          rows={4}
          className="form-input"
          placeholder="Observations sur les capacités de stockage, transport, distribution, etc."
        />
      </div>
    </div>
  );

  const renderPricingTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Compétitivité des Prix</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justesse du coût (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.pricing.competitiveness}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                pricing: { ...prev.pricing, competitiveness: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Délais de Livraison</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Respect des délais (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.pricing.delivery}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                pricing: { ...prev.pricing, delivery: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Conditions de Paiement</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flexibilité des paiements (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.pricing.payment}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                pricing: { ...prev.pricing, payment: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Commentaires Prix & Compétitivité</h3>
        <textarea
          value={evaluationData.pricing.comments}
          onChange={(e) => setEvaluationData(prev => ({
            ...prev,
            pricing: { ...prev.pricing, comments: e.target.value }
          }))}
          rows={4}
          className="form-input"
          placeholder="Observations sur la compétitivité des prix, les délais, les conditions de paiement, etc."
        />
      </div>
    </div>
  );

  const renderRisksTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Conformité Réglementaire</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau de conformité (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.risks.compliance}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                risks: { ...prev.risks, compliance: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Stabilité Financière</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Solidité financière (0-20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={evaluationData.risks.stability}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                risks: { ...prev.risks, stability: parseInt(e.target.value) || 0 }
              }))}
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Risques & Observations</h3>
        <textarea
          value={evaluationData.risks.observations}
          onChange={(e) => setEvaluationData(prev => ({
            ...prev,
            risks: { ...prev.risks, observations: e.target.value }
          }))}
          rows={6}
          className="form-input"
          placeholder="Observations sur les risques identifiés, non-conformités, points d'attention, recommandations, etc."
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderGMPTab();
      case 1: return renderExperienceTab();
      case 2: return renderDocumentationTab();
      case 3: return renderLogisticsTab();
      case 4: return renderPricingTab();
      case 5: return renderRisksTab();
      default: return renderGMPTab();
    }
  };

  const totalScore = calculateTotalScore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Grille d'Évaluation</h1>
        <div className="flex items-center space-x-4">
          <div className={`px-4 py-2 rounded-lg ${getScoreColor(totalScore)}`}>
            <span className="font-semibold">Score Global: {totalScore}%</span>
            <span className="ml-2 text-sm">({getScoreLabel(totalScore)})</span>
          </div>
        </div>
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
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {tab.weight}%
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu de l'onglet */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSave}
            className="btn-secondary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Enregistrer l'évaluation partielle</span>
          </button>
          
          <button className="btn-outline flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Calculer le score global</span>
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="btn-primary flex items-center space-x-2"
        >
          <Send className="h-4 w-4" />
          <span>Soumettre la décision finale</span>
        </button>
      </div>

      {/* Messages de feedback */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Calculator className="h-5 w-5 text-blue-600 mr-3" />
          <p className="text-blue-800">
            <strong>💡 Score global recalculé automatiquement</strong> à chaque modification des critères.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EvaluationGrid;
