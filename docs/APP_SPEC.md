# 01 — App Spec (Sensei Group)

> **But du document.** Définir ce qu'est l'écosystème, pour qui, et pourquoi il existe.
> C'est la source de vérité du *quoi* et du *pourquoi*. Tout ce qui contredit ce document
> est un bug de produit, pas une feature.

- **Version** : 0.1 (brouillon de fondation)
- **Dernière mise à jour** : 2026-06-14
- **Statut** : noms provisoires (`credit`, `bnpl`, `flights`), branding ultérieur.

---

## 1. La vision en une phrase

> **Sensei** construit la première infrastructure de crédit grand public de RDC : un bureau de
> crédit qui crée la donnée de solvabilité, un BNPL qui s'en sert pour avancer l'argent, et une
> plateforme de vente de billets d'avion qui est le premier cas d'usage concret du BNPL.

## 2. Le problème

En RDC, il n'existe pas de bureau de crédit grand public fiable. Conséquence :
- Les prêteurs ne savent pas à qui ils prêtent → crédit cher, rare, réservé à une élite.
- Les particuliers n'ont **aucun historique de crédit** opposable, même quand ils sont solvables.
- Acheter un bien important (billet d'avion, électroménager, scolarité) se fait cash ou pas du tout.
- Les paiements sont fragmentés (mobile money multi-opérateurs, peu de cartes, cash dominant).

## 3. La solution — un volant d'inertie de données

Les trois produits ne sont pas trois apps séparées : c'est **une seule boucle**.

```
        ┌─────────────────────────────────────────────┐
        │                                             ▼
   [ credit ]  ──── score & historique ────►   [ bnpl ]
   bureau de crédit                          paiement échelonné
        ▲                                          │
        │                                          ▼
   comportements de remboursement  ◄────  [ flights ]
   (nouvelle donnée de crédit)            1er cas d'usage du BNPL
```

1. **`credit`** agrège les données et produit un **score** + un **historique**.
2. **`bnpl`** consomme ce score pour décider d'accorder/échelonner un paiement.
3. **`flights`** vend des billets et propose le BNPL comme moyen de paiement.
4. Chaque remboursement BNPL **réinjecte** de la donnée comportementale dans `credit`.

Plus l'écosystème tourne, plus la donnée de crédit s'enrichit, plus le score est précis,
plus le risque baisse, plus on peut prêter — c'est l'avantage défendable du projet.

---

## 4. Les trois produits

### 4.1 `credit` — Bureau de crédit (inspiration : Equifax)

- **Quoi** : collecte, normalise et stocke des données de solvabilité ; produit un **score Sensei**
  et un **rapport de crédit** consultable.
- **Pour qui** :
  - **B2C** : un particulier consulte son propre score et son rapport.
  - **B2B** : prêteurs, banques, télécoms, bailleurs interrogent un score (avec consentement).
- **Valeur** : créer la confiance là où il n'y a aujourd'hui aucune donnée opposable.
- **Sensible** : c'est le cœur réglementaire et éthique. Consentement, traçabilité, droit de
  rectification, contestation d'une ligne de rapport = obligatoires dès le départ.

### 4.2 `bnpl` — Paiement échelonné (inspiration : Affirm)

- **Quoi** : permet de payer un achat en plusieurs fois. Décision instantanée appuyée sur le
  score `credit`. Échéancier transparent, **sans frais cachés**.
- **Pour qui** :
  - **Acheteurs** : étalent un paiement (ex : un billet d'avion en 3 ou 4 fois).
  - **Marchands** : encaissent immédiatement, Sensei porte le risque.
- **Valeur** : rendre accessible un achat important sans cash immédiat, de façon honnête.
- **Principe** : pas de frais cachés, échéancier affiché *avant* l'engagement, rappels avant
  prélèvement. Le ton institutionnel impose la clarté totale.

### 4.3 `flights` — Vente de billets d'avion (inspiration : Alternative Airlines)

- **Quoi** : recherche et achat de billets, avec **branchement de plusieurs moyens de paiement**
  (mobile money, carte, et surtout **BNPL Sensei**).
- **Pour qui** : voyageurs en RDC et diaspora.
- **Valeur** : premier usage tangible du BNPL ; vitrine grand public de l'écosystème.
- **Rôle stratégique** : c'est le canal d'acquisition. Les gens viennent pour un billet,
  repartent avec un compte Sensei et un début d'historique de crédit.
- **Modèle invité (V1)** : aucun compte requis pour chercher et réserver. Le tunnel complet
  (recherche → détails → personnalisation → protection → récap → paiement) fonctionne sans
  authentification. Deux références sont générées à la confirmation. L'écran « Gérer ma
  réservation » est accessible par référence de réservation + adresse e-mail uniquement.
  La création de compte Sensei est proposée après paiement (pas imposée).

---

## 5. Personas

| Persona | Produit principal | Besoin |
|---|---|---|
| **Voyageur urbain (Kinshasa)** | `flights` + `bnpl` | Payer un billet en plusieurs fois |
| **Diaspora** | `flights` | Acheter un billet pour la famille restée au pays |
| **Particulier bancarisé** | `credit` | Connaître/améliorer son score |
| **Prêteur / banque** | `credit` (B2B) | Évaluer le risque d'un emprunteur (avec consentement) |
| **Marchand** | `bnpl` (B2B) | Vendre plus, encaisser tout de suite |
| **Agent de conformité Sensei** | back-office | Auditer consentements, litiges, fraude |

---

## 6. Périmètre MVP (V1) — résumé

Le détail vit dans [`FEATURE_BACKLOG.md`](FEATURE_BACKLOG.md). En une ligne :

> **V1 = `flights` (recherche + achat) × `bnpl` (échéancier 3-4x) × `credit` (compte + score interne minimal).**

Le but de la V1 : boucler **un** cycle complet — un voyageur achète un billet en BNPL, rembourse,
et son comportement nourrit son score. Tout le reste attend.

---

## 7. Ce que Sensei n'est PAS (V1)

- ❌ Pas une banque (pas de dépôts, pas de compte courant).
- ❌ Pas un agrégateur de toutes les compagnies du monde (on commence avec 1 fournisseur d'inventaire).
- ❌ Pas un bureau de crédit « complet » dès J1 (le score démarre sur peu de signaux et s'enrichit).
- ❌ Pas multi-devises en V1 (USD seulement).

---

## 8. Critères de succès (mesurables)

- Un utilisateur peut **acheter un billet et choisir BNPL** en moins de 5 minutes.
- Un échéancier BNPL est **généré, affiché et honoré** sans frais surprise.
- Un remboursement **modifie le score** de l'utilisateur de façon traçable.
- Un prêteur B2B peut **interroger un score avec consentement** et voir la trace de la requête.

---

## 9. Contraintes transverses

- **Marché** : RDC. USD only (V1). Connectivité parfois faible → mobile-first, tolérant au réseau.
- **Langues** : FR (base), EN, Lingala, Swahili.
- **Réglementaire** : consentement explicite + journal d'audit sur toute donnée de crédit.
- **Confiance** : c'est le ton de toute la marque (voir [`BRAND_BRIEF.md`](BRAND_BRIEF.md)).
