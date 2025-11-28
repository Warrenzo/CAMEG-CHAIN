# Maquette fonctionnelle – Module « Recherche Fournisseurs IA » (Super-Admin)

> Objectif : fournir une vision claire de l’interface et des interactions attendues pour la fonctionnalité de recherche de fournisseurs via l’IA et la consultation des analyses IA.  
> Format texte (wireframe conceptuel) – à transposer ensuite en maquettes graphiques Figma/React.

---

## 1. Navigation & informations générales

```
Sidebar (SuperAdmin)
└─ Veille & IA
   ├─ Recherche IA fournisseurs   ← page décrite ci-dessous
   ├─ Analyses IA (Monitoring)
   └─ Historique / Rapports IA
```

- Cette section apparaît dans la navigation latérale du Super-Admin, sous un groupe “Veille & IA”.
- Accès réservé au rôle `superadmin` (on peut aussi exposer en lecture seule à certains admins si besoin plus tard).

---

## 2. Page « Recherche IA fournisseurs »

### 2.1 Header

```
[Titre] 🔍 Recherche fournisseurs (IA)
[Boutons] • Historique des recherches  • Exporter résultats
```

- Bandeau informatif : “Entrez un besoin en langage naturel. L’IA interrogera nos sources externes (marketplaces, registres officiels, presse, réseaux pro…) et vous proposera une liste de fournisseurs prioritaires.”

### 2.2 Bloc de requête

```
[Textarea input (multi-ligne)]
Placeholder : "Ex. Fournisseurs de Mégamylase en Afrique de l’Ouest, certifiés GMP"

[Filtres avancés (accordéon ou panneau latéral)]
  - Zones géographiques (checkbox continents + champ pays)
  - Catégories de produits (liste multi-select)
  - Certifications recherchées (multi-select)
  - Seuil de score minimal (slider 0 → 1)
  - Date de dernière mention (sélecteur : 3 mois / 12 mois / custom)

[Bouton primaire] Lancer l’analyse IA (avec icône ⚙️ ou 🤖)
État : 
  - Normal
  - Loading (spinner + message “Analyse en cours – ceci peut prendre quelques secondes”)
  - Erreur (toast + bannière)
```

### 2.3 Résultats (liste)

Wireframe textuel pour une carte résultat :

```
┌─────────────────────────────────────────────────────────────┐
│ [Score global 86%] [Tags: Europe, API, GMP]                 │
│ BioPlus Diagnostics (France)                               │
│ "Fournisseur d’enzymes digestives, mentionné 12 fois en 2024" │
│ Matched produits : Mégamylase, enzymes digestives          │
│ Certifs : GMP, ISO 13485                                   │
│ Status interne : Nouveau (pas encore dans base)            │
│ Sources récentes : Google News • EMA Register • Alibaba    │
│ Actions : [Voir fiche IA] [Importer dans CAMEG-CHAIN]      │
└─────────────────────────────────────────────────────────────┘
```

- **Tri / pagination** : en haut de la liste (Score desc., Récence, Pays). Pagination classique (20 résultats/page).
- **Barre latérale** : possibilité de masquer/afficher les filtres pour avoir plus de place.
- **Charges vides** :
  - Lorsqu’aucun résultat : “Aucune correspondance. Essayez d’élargir votre requête ou de supprimer certains filtres.”
  - Lors du chargement initial : skeleton cards ou spinner central.

### 2.4 Fiche IA (panel ou page modale)

Lorsqu’on clique sur “Voir fiche IA” → ouverture d’un panel coulissant ou page dédiée (selon préférence UI).

Sections suggérées :

1. **Résumé**
   - Score global + breakdown (pertinence, conformité, réputation, fraîcheur).
   - Carte du monde avec zones d’activité.
   - Informations clé : siège social, site web, année de création estimée, taille (si disponible).

2. **Sources**
   - Liste filtrable : type (marketplace, registre officiel, news), date, fiabilité.
   - Affichage d’extraits (titre + snippet + bouton “ouvrir dans un nouvel onglet”).

3. **Conformité & Certifications**
   - Tableau certifs (type, organisme, validité).
   - Références aux registres (numéro d’agrément, date de mise à jour).

4. **Incidents & Reputation**
   - Chronologie des incidents détectés (rappels, sanctions, rumeurs).
   - Indicateur de tonalité (positif/neutre/négatif) basé sur analyse NLP.

5. **Actions**
   - Bouton “Créer un fournisseur CAMEG-CHAIN” (pré-remplit la fiche interne).
   - “Assigner à l’évaluateur” (ouvre modal pour choisir un évaluateur + notes).
   - “Exporter rapport IA” (PDF/HTML) avec possibilité de choisir langue.

6. **Notes internes**
   - Section pour ajouter des commentaires internes (SuperAdmin/DAQL).

### 2.5 Historique

En haut (ou via bouton) : modal listant les requêtes précédentes :

```
Date       | Requête                                | Résultats | Action
2025-11-22 | Fournisseurs ARV Afrique + GPA         | 42        | [Relancer] [Voir]
2025-11-20 | Tests VIH Asie Asie du Sud-Est comment | 60        | [Relancer] [Voir]
```

- Permet de rejouer une requête ou d’en consulter les résultats précédemment calculés.

---

## 3. Page « Analyses IA » (Monitoring)

**Objectif** : offrir au SuperAdmin une vue consolidée des jobs IA (collecte, analyses, génération de rapports).

### 3.1 Header & KPIs

```
[Titre] 🧠 Analyses IA - Monitoring

Cartes KPI:
- Jobs en cours: 2
- Jobs réussis (24h): 12
- Jobs échoués (24h): 1
- Temps moyen / job: 2m30s
- Fournisseurs découverts (24h): 87
```

### 3.2 Timeline / Table des jobs

Tableau avec colonnes :
| ID job | Requête / Type | Status | Début | Fin | Résumé | Actions |

Exemple :
```
JOB-20251122-001 | Fournisseurs Mégamylase EU | ✅ Terminé | 09:10 | 09:13 | 52 fournisseurs détectés | [Voir rapport]
JOB-20251122-002 | Veille Dispositif ORL (RSS) | 🔄 En cours | 09:45 | — | — | [Voir détails]
JOB-20251121-009 | Recherche concessionnaires API Afrique | ❌ Échec | 21:00 | 21:02 | Timeout source Alibaba | [Relancer]
```

### 3.3 Blocks supplémentaires

- **Sources connecteurs** : liste des connecteurs avec statut (Actif, Latence, Dernière synchronisation).
- **Alertes** : incidents (ex. “API LinkedIn rate limit”, “Scraper EMA en erreur”).
- **Logs** : lien vers un viewer de logs (ou redirection Grafana/ELK).

---

## 4. Interactions clés

1. **Lancer une analyse** → POST `/ai/suppliers/search` (backend orchestre la collecte si besoin, sinon interroge l’index).
2. **Consulter fiche** → GET `/ai/suppliers/{id}`.
3. **Générer rapport** → POST `/ai/suppliers/{id}/report`, job asynchrone avec status.
4. **Importer dans base interne** → POST `/suppliers/import-ai` (à définir) qui crée un enregistrement brouillon.
5. **Assigner** → POST `/tasks` ou `/support/tickets` avec référence du fournisseur IA.
6. **Historique** → GET `/ai/analyses` + stockage côté frontend pour affichage rapide.

---

## 5. États & UX writing

- **Chargement** : “Analyse IA en cours… cela peut prendre jusqu’à 30 secondes selon les sources consultées.”
- **Erreur** :
  - “Impossible d’interroger le moteur IA pour le moment. Réessayez ou contactez l’équipe technique.”
  - “Aucun résultat n’a été trouvé avec ces critères.”
- **Empty states** :
  - Historique vide → “Aucune recherche réalisée pour l’instant. Lancez votre première analyse.”
  - Tableau jobs vide → “Aucune analyse IA en cours. Lancez une recherche ou patientez.”

---

## 6. Accessibilité & responsive

- Prévoir un comportement responsive (tableaux → cartes sur mobile).
- Couleurs contrastées pour les badges (score, statut).
- Boutons et modales accessibles (Focus, navigation clavier).

---

## 7. Prochaines étapes

1. Valider ce wireframe avec les parties prenantes (SuperAdmin, DAQP).
2. Produire des maquettes Figma haute fidélité.
3. Créer les composants React (squelettes) et intégrer progressivement les endpoints (mock puis API réelle).


