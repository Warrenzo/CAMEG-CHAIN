import React, { useState } from 'react';
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Download,
  RefreshCw,
  TrendingUp,
  Shield,
  Clock,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AIAnalysisResult {
  overallScore: number;
  confidence: number;
  recommendations: string[];
  alerts: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    category: string;
  }>;
  documentAnalysis: Array<{
    document: string;
    status: 'valid' | 'expired' | 'missing' | 'invalid';
    score: number;
    issues: string[];
  }>;
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const AIAnalysis: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

  // Données simulées pour la démonstration
  const mockAnalysisResult: AIAnalysisResult = {
    overallScore: 78,
    confidence: 0.85,
    recommendations: [
      'Vérifier la validité du certificat GMP qui expire dans 30 jours',
      'Demander des références clients supplémentaires pour les 2 dernières années',
      'Valider la capacité de production avec des documents officiels',
      'Confirmer les conditions de stockage et de transport'
    ],
    alerts: [
      {
        type: 'warning',
        message: 'Certificat GMP expire dans 30 jours',
        category: 'Conformité'
      },
      {
        type: 'error',
        message: 'Document de traçabilité manquant',
        category: 'Documentation'
      },
      {
        type: 'info',
        message: 'Références clients limitées à 3 pays',
        category: 'Expérience'
      }
    ],
    documentAnalysis: [
      {
        document: 'Certificat GMP',
        status: 'valid',
        score: 85,
        issues: ['Expire dans 30 jours']
      },
      {
        document: 'Licence d\'exploitation',
        status: 'valid',
        score: 95,
        issues: []
      },
      {
        document: 'Rapport d\'audit qualité',
        status: 'valid',
        score: 78,
        issues: ['Audit datant de plus de 2 ans']
      },
      {
        document: 'Fiche de traçabilité',
        status: 'missing',
        score: 0,
        issues: ['Document non fourni']
      },
      {
        document: 'Certificat ISO 9001',
        status: 'valid',
        score: 90,
        issues: []
      }
    ],
    complianceScore: 72,
    riskLevel: 'medium'
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulation d'analyse IA
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setAnalysisResult(mockAnalysisResult);
    setIsAnalyzing(false);
    toast.success('🧠 Analyse IA terminée avec succès');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'expired': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'missing': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'invalid': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-yellow-600 bg-yellow-100';
      case 'missing': return 'text-red-600 bg-red-100';
      case 'invalid': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid': return 'Valide';
      case 'expired': return 'Expiré';
      case 'missing': return 'Manquant';
      case 'invalid': return 'Invalide';
      default: return 'Inconnu';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-cameg-dark">Analyse IA</h1>
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="btn-primary flex items-center space-x-2"
        >
          {isAnalyzing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          <span>{isAnalyzing ? 'Analyse en cours...' : 'Lancer l\'analyse IA'}</span>
        </button>
      </div>

      {!analysisResult && !isAnalyzing && (
        <div className="card p-12 text-center">
          <Brain className="h-16 w-16 text-cameg-blue mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Analyse Automatique de Conformité
          </h3>
          <p className="text-gray-600 mb-6">
            L'IA va analyser automatiquement les documents soumis, vérifier leur conformité 
            et générer un rapport détaillé avec des recommandations.
          </p>
          <button
            onClick={runAnalysis}
            className="btn-primary"
          >
            Démarrer l'analyse
          </button>
        </div>
      )}

      {isAnalyzing && (
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cameg-blue mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Analyse IA en cours...
          </h3>
          <p className="text-gray-600">
            Vérification des documents, analyse de conformité, calcul des scores...
          </p>
        </div>
      )}

      {analysisResult && (
        <div className="space-y-6">
          {/* Résumé global */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {analysisResult.overallScore}%
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Score Global</h3>
              <p className="text-sm text-gray-600">Évaluation automatique</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {analysisResult.complianceScore}%
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Conformité</h3>
              <p className="text-sm text-gray-600">Documents réglementaires</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {Math.round(analysisResult.confidence * 100)}%
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Confiance IA</h3>
              <p className="text-sm text-gray-600">Fiabilité de l'analyse</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <span className={`text-2xl font-bold ${getRiskColor(analysisResult.riskLevel).split(' ')[0]}`}>
                  {analysisResult.riskLevel.toUpperCase()}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Niveau de Risque</h3>
              <p className="text-sm text-gray-600">Évaluation des risques</p>
            </div>
          </div>

          {/* Alertes */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes & Notifications</h3>
            <div className="space-y-3">
              {analysisResult.alerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">Catégorie: {alert.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analyse des documents */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Analyse des Documents</h3>
              <button className="btn-outline flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Exporter le rapport</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Problèmes identifiés
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analysisResult.documentAnalysis.map((doc, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-900">{doc.document}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(doc.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                            {getStatusText(doc.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doc.score}%
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {doc.issues.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                              {doc.issues.map((issue, i) => (
                                <li key={i} className="text-red-600">{issue}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-green-600">Aucun problème détecté</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommandations */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommandations IA</h3>
            <div className="space-y-3">
              {analysisResult.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <button className="btn-outline flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Relancer l'analyse</span>
              </button>
              
              <button className="btn-outline flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Télécharger le rapport complet</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Dernière analyse: {new Date().toLocaleString('fr-FR')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
