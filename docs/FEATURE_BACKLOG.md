# 05 — Feature Backlog (Sensei Group)

> **But du document.** Ce qui est dans la **V1**, et ce qui **attend**. Sans ça, on rajoute « une
> petite piqûre » tous les jours et on ne livre jamais. La règle : si ce n'est pas dans la V1,
> c'est dans « Plus tard », point.

- **Version** : 0.1
- **Dernière mise à jour** : 2026-06-13

---

## 🎯 Objectif de la V1 (la seule chose qui compte)

> **Boucler UN cycle complet :** un voyageur cherche un billet → l'achète en **BNPL (3-4x)** →
> rembourse ses échéances → son comportement **met à jour son score** dans `credit`.

Si une feature ne sert pas directement ce cycle, elle attend.

---

## ✅ V1 — Périmètre verrouillé

### Socle commun (`packages/`)
- [ ] Auth Supabase (téléphone + OTP, email optionnel) — compte unique écosystème.
- [ ] KYC minimal (1 pièce d'identité, statut `pending`/`verified`).
- [ ] Design system minimal dans `packages/ui` (tokens du BRAND_BRIEF).
- [ ] i18n FR + EN (Lingala/Swahili : clés en place, traductions partielles OK).
- [ ] `api-client` : hooks TanStack Query de base.
- [ ] RLS sur toutes les tables créées.

### `flights` (canal d'acquisition)
- [ ] Recherche de vols (origine, destination, dates, passagers, classe).
- [ ] Affichage des offres (1 seul fournisseur d'inventaire en V1).
- [ ] Tunnel de réservation : passagers + récap.
- [ ] Choix du moyen de paiement : mobile money **ou** BNPL.
- [ ] Confirmation de réservation (PNR) après paiement réussi.

### `bnpl` (le cœur)
- [ ] Éligibilité instantanée appuyée sur le score `credit`.
- [ ] Échéancier 3x ou 4x, **frais affichés clairement avant validation**.
- [ ] Acceptation de l'échéancier (consentement).
- [ ] Suivi des échéances : à venir / payée / en retard.
- [ ] Prélèvement/encaissement d'une échéance (mobile money).
- [ ] Rappel avant échéance (notification).

### `credit` (le moteur de données)
- [ ] Création automatique d'un `credit_profile` à l'inscription.
- [ ] Score interne minimal (règles simples au départ, pas de ML).
- [ ] Mise à jour du score sur événement BNPL (`on_time_payment`, `late_payment`, `bnpl_completed`, `bnpl_default`).
- [ ] Écran « Mon score » + historique (`credit_score_events`).
- [ ] Journal d'audit (`audit_logs`) sur les accès au score.

### Paiements (`packages/payments`)
- [ ] Intégration **un** fournisseur mobile money (priorité au plus utilisé localement).
- [ ] Webhooks de confirmation (idempotents).

---

## 🟡 V1.5 — juste après (utile mais pas bloquant)

- Carte bancaire comme moyen de paiement (`flights` + remboursement BNPL).
- Mobile money multi-opérateurs (Orange, Airtel, M-Pesa…).
- Traductions complètes Lingala + Swahili.
- Tableau de bord marchand (`merchants`) basique.
- Contestation d'une ligne de rapport (`disputes`) côté utilisateur.
- Notifications push (en plus des SMS).

---

## 🔵 V2 — plus tard (vision, pas maintenant)

- **Portail B2B prêteurs** : interrogation de score via API avec consentement (`lenders`, `credit_inquiries` hard/soft).
- Score basé sur **plus de signaux** (télécom, utilities, historique de paiement importé).
- Modèle de score statistique / ML (remplace les règles).
- Multi-devises (USD + CDF), conversion.
- BNPL pour marchands tiers hors `flights` (SDK / checkout marchand).
- Programme de fidélité / amélioration de score gamifiée.
- Hôtels / autres voyages dans `flights`.

---

## 🧊 Volontairement HORS périmètre (pour éviter le scope creep)

- ❌ Compte bancaire / dépôts / épargne.
- ❌ Agrégation mondiale de compagnies aériennes.
- ❌ Cartes physiques Sensei.
- ❌ App marketplace générale.
- ❌ Score « complet » à la Equifax dès le lancement.

---

## Règles de gestion du backlog

1. Toute nouvelle idée arrive dans **V2** par défaut. Elle ne « monte » en V1 que par décision explicite.
2. On ne commence pas une feature V1.5/V2 tant que la boucle V1 n'est pas bouclée.
3. Une feature « finie » = implémentée + testée + conforme au [`DATA_DICTIONARY.md`](DATA_DICTIONARY.md) et au [`BRAND_BRIEF.md`](BRAND_BRIEF.md).
4. Si on hésite à classer une feature : elle attend.
