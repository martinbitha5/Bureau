# 02 — Brand Brief (Sensei Group)

> **But du document.** Couleurs, typo, ton, univers. Tout ce qui est visuel ou verbal se
> réfère ici. Si une couleur ou un mot n'est pas dans ce document, il n'existe pas encore.

- **Version** : 0.1
- **Dernière mise à jour** : 2026-06-13
- **Positionnement validé** : **Confiance & sérieux institutionnel**.

---

## 1. Plateforme de marque

- **Mission** : donner à chaque Congolais une identité financière opposable.
- **Promesse** : « Vous saurez toujours où vous en êtes. » (transparence radicale)
- **Personnalité** : sérieux, fiable, calme, précis. Pas de hype, pas de promesses creuses.
- **Archétype** : *le Sage / le Gardien* — d'où le nom « Sensei » (le maître qui guide).

### Tension de marque à tenir

Sensei doit être **crédible comme une institution** mais **utilisable comme une fintech**.
Règle pratique : le **fond** est institutionnel (rigueur, preuve, traçabilité), la **forme** est
moderne (clarté, rapidité, mobile-first). On ne sacrifie jamais la confiance pour le « fun ».

---

## 2. Le ton de voix

| On dit | On ne dit pas |
|---|---|
| « Votre échéancier : 3 paiements de 50 $. » | « Payez plus tard, c'est magique ! » |
| « Voici pourquoi votre score a baissé. » | « Oups, votre score a changé 🤷 » |
| « Avec votre accord, ce prêteur verra votre score. » | « On partage vos données pour vous aider. » |
| « Aucun frais caché. Tout est affiché avant de valider. » | « 0 % d'intérêt* » (avec astérisque) |

**Principes d'écriture :**
1. **Clarté avant tout.** Un chiffre vaut mieux qu'un adjectif.
2. **Jamais d'astérisque trompeur.** Les conditions sont dans la phrase, pas en bas de page.
3. **Vouvoiement** par défaut (registre institutionnel, respectueux).
4. **Pédagogie** : on explique le crédit, on ne le subit pas.
5. Multilingue : la traduction garde le même niveau de sérieux (FR / EN / Lingala / Swahili).

---

## 3. Palette de couleurs (proposition à valider)

Palette « confiance institutionnelle » : bleu nuit dominant, vert de validation sobre,
accents chauds limités aux actions. Toutes les valeurs sont des **tokens** (voir `packages/ui`).

| Token | Hex | Usage |
|---|---|---|
| `--sensei-ink` | `#0A1B2E` | Bleu nuit — fonds sérieux, texte de titre |
| `--sensei-blue` | `#123A6B` | Bleu institutionnel — barre de marque, liens |
| `--sensei-blue-bright` | `#1E63C4` | Bleu d'action — boutons primaires |
| `--sensei-trust` | `#1E8E5A` | Vert — score positif, paiement validé |
| `--sensei-warn` | `#C9852A` | Ambre — échéance proche, attention |
| `--sensei-danger` | `#B3271E` | Rouge sobre — retard, erreur, refus |
| `--sensei-paper` | `#F7F9FC` | Fond clair des écrans |
| `--sensei-line` | `#D9E1EC` | Bordures, séparateurs |
| `--sensei-text` | `#1B2733` | Texte courant |
| `--sensei-muted` | `#5B6B7B` | Texte secondaire |

> ⚠️ **Le rouge et l'ambre sont réglementés.** Dans un contexte de crédit, les couleurs portent
> du sens (bon/mauvais score, retard). Elles ne sont **jamais** décoratives. Toujours
> accompagnées d'un libellé texte (accessibilité + clarté).

### Couleur par produit (sous-marques)
Chaque produit garde le bleu Sensei comme socle, avec une teinte d'accent :
- `credit` → bleu institutionnel pur (le plus sobre, c'est le coffre-fort).
- `bnpl` → bleu d'action + vert confiance (le mouvement, le paiement).
- `flights` → bleu + une pointe de teal voyage (à définir, sans casser le socle).

---

## 4. Typographie (proposition à valider)

- **Titres / chiffres financiers** : une grotesque géométrique lisible et solide
  (ex : *Inter*, *Geist*, ou *IBM Plex Sans*). Les **montants** sont en chiffres tabulaires.
- **Texte courant** : même famille, graisse régulière, fort confort de lecture mobile.
- **Données chiffrées critiques** (montant, score, échéance) : graisse semi-bold + chiffres
  tabulaires (`font-variant-numeric: tabular-nums`) pour l'alignement.

Règle : **un montant d'argent ne doit jamais être ambigu**. Toujours la devise (`USD` / `$`),
toujours 2 décimales pour l'argent, alignement à droite dans les tableaux.

---

## 5. Univers visuel

- **Sobre, aéré, beaucoup de blanc.** L'argent des gens mérite du calme, pas du bruit.
- **Données mises en avant** : le score, l'échéancier, le rapport sont les héros visuels.
- **Iconographie** : linéaire, fine, neutre. Pas d'illustrations « cartoon ».
- **Photographie** (marketing) : vraies personnes, contextes RDC réels, dignité, lumière naturelle.
- **Mobile-first** : tout doit tenir et respirer sur un petit écran en réseau lent.

---

## 6. Accessibilité (non négociable)

- Contraste AA minimum (texte/fonds).
- L'information ne passe **jamais uniquement par la couleur** (toujours libellé/icône).
- Cibles tactiles ≥ 44 px.
- Tout libellé est traduisible (clés i18n, jamais de texte en dur).

---

## 7. À faire (branding définitif — bloqué)

- [ ] Nom commercial final du groupe et des 3 produits (actuellement codes provisoires).
- [ ] Logo + déclinaisons.
- [ ] Validation finale palette + typo.
- [ ] Charte des sous-marques par produit.
