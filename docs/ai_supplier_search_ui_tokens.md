# Design System – “AI Supplier Intelligence” (Guidelines)

Ce document constitue la base de style avant intégration dans le frontend. Il s’inscrit dans l’ADN “neo-glassmorphism + 3D soft shadows” décrit précédemment.

---

## 1. Couleurs & dégradés

### Palette principale

| Usage                | Valeur                                                         | Notes                               |
|----------------------|----------------------------------------------------------------|-------------------------------------|
Fond profond           | `#050A1E` → `#0E1540` (gradient radial)                       | Utilisé sur `<body>` ou grosses sections |
Glace claire           | `rgba(255,255,255,0.08)`                                       | Couleur de base des cartes “glass”  |
Accent IA (Cyan)       | `#47D6FF`                                                      | Boutons, halos, éléments interactifs |
Accent Emerald         | `#41E2B0`                                                      | Scores élevés, succès               |
Accent Coral           | `#FF7A8A`                                                      | Alertes, incidents                   |
Neon Purple            | `linear-gradient(135deg,#5D2DE1,#8E5BFF)`                      | Boutons primaires, badges IA        |

### Tokens Tailwind (exemple)

```ts
// tailwind.config.js
theme: {
  extend: {
    colors: {
      'ai-bg': '#050A1E',
      'ai-surface': 'rgba(255,255,255,0.08)',
      'ai-border': 'rgba(255,255,255,0.12)',
      'ai-cyan': '#47D6FF',
      'ai-emerald': '#41E2B0',
      'ai-coral': '#FF7A8A'
    },
    boxShadow: {
      'glass': '0 20px 60px rgba(5,9,30,0.35)',
      'glow': '0 0 30px rgba(71,214,255,0.35)'
    },
    backdropBlur: {
      'xl': '18px'
    },
    borderRadius: {
      'xl': '24px'
    }
  }
}
```

---

## 2. Typographies

| Type        | Font Family        | Utilisation                                   |
|-------------|--------------------|-----------------------------------------------|
Titres H1-H3  | `Space Grotesk`    | Titrage principal, chiffres de score          |
Texte courant | `Inter` ou `IBM Plex Sans` | Lisibilité, densité de contenu           |
Chiffres KPI | `Sora` / `JetBrains Mono` | Donner un aspect “data dashboard”       |

**Note** : appliquer un léger `letter-spacing: 0.02em` sur les titres pour un look premium.

---

## 3. Composants clés

### 3.1 Champ de requête IA

- **Structure** : zone multi-ligne avec fond glass + légère animation (glow interne).  
- **Décor** : icône “orbite IA” (SVG) en pseudo-éléments.  
- **État focus** : liseré cyan animé (`box-shadow: 0 5px 30px rgba(71,214,255,0.35)` + `transform: translateY(-1px)`).

Pseudo-CSS :

```css
.ai-search-box {
  background: rgba(15, 25, 60, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  padding: 24px 28px;
  backdrop-filter: blur(18px);
  position: relative;
}
.ai-search-box:focus-within {
  box-shadow: 0 25px 50px rgba(71, 214, 255, 0.18);
  border-color: rgba(71, 214, 255, 0.5);
}
```

### 3.2 Carte résultat “supplier”

Layout recommandé :

```
┌─────────────────────────────────────────────┐
│ [Badge Score 0.86]   [Tags]   [Actions …]   │
│ Nom + Pays + Icône Verified                 │
│ Résumé + list produits + certifications     │
│ Graph mini sparkline / timeline mini        │
│ Sources principales + avatars sources       │
└─────────────────────────────────────────────┘
```

- **Badge score** : cercle avec gradient radial, texte centré + drop shadow interne.
- **Hover** : translation Y -4px, `box-shadow` intensifié, reveal d’icônes “Voir fiche / Ajouter”.
- **Animations** :  
  - `Framer Motion` pour l’entrée (fade + scale).  
  - `transform: perspective(1200px) rotateX(1deg)` pour créer un léger effet 3D.

### 3.3 Fiche IA (drawer)

- **Structure** : Drawer pleine hauteur, fond semi-translucide.  
- **Éléments** :
  - Header avec titre, score, boutons (export, assigner).  
  - Mosaic de cartes (grid 3 colonnes sur desktop).  
  - Graphique radial (score) : utiliser `conic-gradient` ou un composant Chart.
  - Timeline : vertical timeline avec points lumineux (utiliser pseudo-éléments circulaires, gradient).

### 3.4 Dashboard monitoring

- **Hero** : fond dégradé animé (ex : gradient qui tourne lentement) + illustration 3D (via Spline).  
- **Cartes KPI** : motifs de particules en background (SVG), chiffres avec animation `count-up`.  
- **Table jobs** : style “glass list” avec barre latérale colorée suivant le statut.

---

## 4. Micro-interactions & animations

- **Boutons** :  
  - État hover : gradient shift (ex. `background-position` animé).  
  - Textes qui se décalent vers le haut/bas pour indiquer l’action (ex. “Analyser” → “Analy…🔄”).  
- **Glows dynamiques** :  
  - Ajouter des `::after` avec `filter: blur(30px)` pour simuler halos autour des éléments clés.  
- **Parallax** :  
  - Sur la page entière, appliquer un `background-position` légèrement animé selon le scroll (ex. `background-attachment: fixed` + `transform` via JS/GSAP).
- **Transitions** :  
  - Utiliser `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` pour la cohérence.

---

## 5. Accessibilité

- Vérifier le contraste des textes sur fonds translucides (rajouter parfois un petit overlay sombre `rgba(5,5,15,0.35)`).
- Offrir un “Mode simple” (désactiver certaines animations/particules via `prefers-reduced-motion`).
- Gestion du focus (box-shadow contrasté, outline visible même sur background glass).

---

## 6. Prochaines étapes UI

1. Décliner ces tokens dans `tailwind.config` (ou theme Chakra/Styled Components).  
2. Créer une “AI Design Kit” (Figma) avec :  
   - Couleurs, gradients, ombres  
   - Composants (cards, badges, chips, timeline)  
   - Exemples d’écrans (Research -> Results -> Detail -> Monitoring)  
3. Mettre en place un **Storybook** ou `playroom` pour itérer sur les composants (AISearchBox, AISupplierCard, AIScoreBadge, AIAnalysisList…).  
4. Intégrer progressivement dans le code (en mode “feature flag” si besoin).

Ce guide sert de référence pour l’équipe frontend/UX afin de créer une expérience visuelle immersive tout en conservant les bonnes pratiques d’accessibilité et de performances.

