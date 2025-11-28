# IA Supplier Intelligence – Spécification fonctionnelle & technique

## 1. Contexte & objectifs

Le Super-Admin doit disposer d’un module « Recherche via l’IA » capable de répondre à des requêtes métiers telles que : « Trouve-moi des fournisseurs de Mégamylase en Europe et en Afrique ».  
L’ambition est de disposer d’un moteur de sourcing intelligent qui :

1. **Analyse des données externes** (marketplaces, registres d’autorités, blogs, réseaux sociaux, forums, annuaires industriels…).
2. **Agrège & normalise** des fiches fournisseurs avec leurs zones géographiques, spécialités, certifications, historiques.
3. **Attribue un score IA** (pertinence, conformité, réputation) pour aider la DAQP à prioriser.
4. **Permet la consultation des résultats d’analyses IA** (rapports, performances, alertes) dans l’espace Super-Admin.

## 2. Personae & cas d’usage

| Persona          | Besoin clé                                                                    |
|------------------|-------------------------------------------------------------------------------|
| Super-Admin      | Identifier des fournisseurs fiables rapidement et suivre les analyses IA     |
| Équipe DAQP      | Recevoir des listes pré-qualifiées et des rapports de conformité              |
| Analyste marché  | Veille sur les nouveaux entrants, les certifications, les incidents produits  |

**Exemples de requêtes métiers** :
- « Fournisseurs de Mégamylase en Afrique de l’Ouest avec certification GMP »
- « Qui distribue des kits PCR VIH en Asie et a été cité en 2024 ? »
- « Donne-moi les 10 meilleures sociétés pharmaceutiques mentionnées récemment dans la presse à propos de médicaments ORL ».

## 3. Périmètre fonctionnel

### 3.1 Recherche IA
- Champ de recherche en langage naturel.
- Filtres : régions (continent/pays), type de produit (API, dispositifs, laboratoire, distribution), statut (nouveau / confirmé), fourchette de score, date de dernière mention.
- Résultats paginés avec pour chaque fournisseur :
  - Informations de base (nom, pays, site web, type, taille approximative).
  - Matching avec la base interne (flag « déjà dans CAMEG-CHAIN »).
  - Score IA structuré (Pertinence / Conformité / Réputation / Fraîcheur).
  - Principales sources (titre, résumé, lien, date).
  - Actions rapides : « Consulter la fiche IA », « Créer une fiche fournisseur », « Assigner à un évaluateur », « Exporter ».

### 3.2 Consultation des analyses IA
- Tableau de bord global : nombre d’analyses lancées, succès/échecs, temps moyen, anomalies détectées, connecteurs actifs.
- Liste des analyses ou rapports générés (filtres par date, produit, région).
- Possibilité d’ouvrir un rapport détaillé (PDF/HTML) contenant la synthèse IA (comparaison de fournisseurs, risques, recommandations).
- Historique des recherches et possibilité de relancer une analyse.

### 3.3 Intégration au workflow
- Bouton « Ajouter à la base fournisseurs » → crée un brouillon de fiche (link vers `suppliers`).
- Création automatique de tâches ou tickets pour la DAQP (ex. « Vérifier le fournisseur X détecté par l’IA »).
- Notifications (mail / in-app) si un résultat dépasse un seuil de confiance ou si une alerte est relevée (incident, retrait de produit).

## 4. Architecture technique (macro)

```
[Sources externes] --> [Connecteurs & Crawler] --> [Ingestion Layer]
                        |                        (raw storage + logs)
                        v
                   [Data Processing]
                       - Normalisation
                       - NLP (NER, classification)
                       - Matching & Enrichissement
                       - Scoring
                        |
                        v
              [Search/Index Layer] (Elasticsearch + vector store)
                        |
                        v
                [AI Supplier Service API]
                        |
                        v
                [SuperAdmin UI & Dashboards]
```

### 4.1 Collecte & ingestion
| Type de source                     | Exemple                     | Méthode              |
|-----------------------------------|-----------------------------|----------------------|
Marketplaces B2B                    | Alibaba, Global Sources     | API + crawler        |
Registres officiels                 | FDA, EMA, ANSM, SFDA       | API / scrap réglementaire |
Blogs & presse                      | Google/Bing / GDELT / RSS   | API + scraping contrôlé |
Réseaux sociaux pro                 | LinkedIn (via partenaire)   | API / feed surveillé |
Forums / communautés                | Reddit, Quora, blog pharma  | API + langage naturel |
Annuaire / Data provider            | Dun & Bradstreet, Kompass   | API payante          |

### 4.2 Traitement
- **Normalisation** : cleaning, formatage, translitération noms, extraction du pays, langues multiples.
- **NLP** : fastText/BERT pour NER, classification produits/certifications, résumés.
- **Matching** : fuzzy matching + heuristiques (nom société, URL, emails, numéros d’enregistrement).
- **Enrichissement** : info sur les certifications, financements, volume de mentions, indicateurs ESG/qualité.
- **Scoring** (heuristique v1) :
  - `score_pertinence` (mots-clés, proximité sémantique, densité mentions)
  - `score_conformité` (présence dans registres, certifications)
  - `score_confiance` (nombre de sources uniques, tonalité)
  - `score_fraicheur` (dernière mention)
  - `score_global` = agrégation pondérée (configurable).

### 4.3 API (draft)

#### 4.3.1 `POST /api/v1/ai/suppliers/search`
```json
{
  "query": "Recherche fournisseur Mégamylase Afrique Europe",
  "filters": {
    "regions": ["Europe", "Africa"],
    "product_categories": ["Pharmaceutical"],
    "min_score": 0.6,
    "certifications": ["GMP"]
  },
  "pagination": { "page": 1, "size": 20 }
}
```

**Réponse :**
```json
{
  "total": 245,
  "page": 1,
  "size": 20,
  "results": [
    {
      "id": "ai_sup_12345",
      "name": "BioPlus Diagnostics",
      "country": "France",
      "website": "https://bioplus.fr",
      "matched_products": ["Mégamylase", "Enzymes digestives"],
      "score": {
        "global": 0.87,
        "pertinence": 0.92,
        "compliance": 0.80,
        "reputation": 0.78,
        "freshness": "2024-11-10"
      },
      "certifications": ["GMP", "ISO 13485"],
      "matched_sources": [
        {
          "type": "Marketplace",
          "title": "BioPlus - Mégamylase supplier",
          "url": "https://example.com/bioplus",
          "snippet": "Supplier of enzymatic APIs and Mégamylase for EU market.",
          "published_at": "2024-10-25",
          "reliability": 0.9
        },
        {
          "type": "Registre EMA",
          "title": "License 2024-EMA-12345",
          "url": "https://ema.europa.eu/...",
          "published_at": "2024-05-01"
        }
      ],
      "internal_status": {
        "exists_in_cameg": false,
        "linked_supplier_id": null
      },
      "actions": [
        { "type": "ANALYZE", "label": "Voir le rapport IA" },
        { "type": "IMPORT", "label": "Créer une fiche fournisseur" }
      ]
    }
  ]
}
```

#### 4.3.2 `GET /api/v1/ai/suppliers/{id}`
- Retourne la fiche détaillée, incluant : description, contacts, timeline des mentions, scoring détaillé, sources, graphiques, éventuels incidents.

#### 4.3.3 `POST /api/v1/ai/suppliers/{id}/report`
- Génère un rapport (PDF/HTML) avec résumé IA, top facts, recommandations.

#### 4.3.4 `GET /api/v1/ai/analyses`
- Liste des analyses réalisées (statut, temps d’exécution, type, commande déclenchée).

## 5. UX / UI (détails)

### 5.1 Page « Recherche IA »
- **Header** : Titre + bouton “Nouvelle recherche” + accès historique.
- **Zone de saisie** :
  - Input principal (multi-ligne) avec suggestions (ex : “Tapez un produit, une zone géographique, un type de fournisseur…”).
  - Filtres latéraux (accordéon) : Zone géographique, catégories de produits, certifications requises, bornes de score, date de dernière mention.
  - Bouton “Analyser” avec état (en cours / terminé / erreur).
- **Résultats** :
  - Cartes affichant : Nom + pays + résumé + tags + score + badge “Nouveau / Déjà connu / À vérifier”.
  - Tri (Score, Pertinence, Date) + pagination.
  - Actions inline (voir fiche, exporter, assigner).

### 5.2 Fiche IA
- **Onglet Résumé** : description, contact, indicateurs (map, timeline des mentions, radar scoring).
- **Onglet Sources** : liste filtrable (type, date, fiabilité) + preview + lien.
- **Onglet Conformité** : certifications, registres, licences.
- **Onglet Incidents/alertes** : rappels, sanctions, mentions négatives.
- **Actions** : 
  - “Créer/associer une fiche fournisseur”
  - “Assigner à [évaluateur X]”
  - “Exporter (PDF/CSV)”
  - “Créer une tâche/alerte”

### 5.3 Monitoring des analyses IA
- **Dashboard** : 
  - Nombre de jobs en cours / terminés / en erreur.
  - Temps moyen, volume de fournisseurs trouvés.
  - Top connecteurs (succès/échecs).
  - Liste des dernières analyses avec statut et accès rapport.
- **Logs/Details** : pour chaque job, afficher les étapes (collecte, traitement, scoring) avec timestamps et erreurs.

## 6. Non-fonctionnel
- **Sécurité** : Authentification JWT, contrôle RBAC (SuperAdmin uniquement), logging des requêtes & audit trail.
- **Conformité** : respecter les CGU des sources, conserver les preuves d’origine, gestion RGPD (données contacts).
- **Performance** : temps de réponse cible < 5s pour une recherche sur données indexées. Les jobs lourds (collecte) peuvent être asynchrones (avec polling).
- **Observabilité** : métriques pour chaque connecteur (succès/erreurs/latence), dashboards (Grafana/Datadog).
- **Scalabilité** : microservice dédié, connecteurs isolés, queue pour traiter les requêtes lourdes.

## 7. Prochaines étapes
1. **Atelier Source & Légal** : finaliser la liste des plateformes autorisées, les limites d’usage.
2. **Spécification API détaillée** : formaliser le contrat (OpenAPI), schémas JSON, codes d’erreur.
3. **POC collecte** : implémenter 1 connecteur simple, stocker un échantillon, prouver la faisabilité.
4. **Design UI** : maquettes Figma + composant Skeleton dans `SuperAdmin`.
5. **Roadmap détaillée** : découpage par sprint (P1 à P6), identification des dépendances techniques.

Ce document servira de base pour valider la vision et cadrer le développement progressif de la fonctionnalité « Recherche de fournisseurs via l’IA » ainsi que la consultation des analyses IA côté SuperAdmin.

