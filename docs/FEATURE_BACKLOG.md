# 05 — Feature Backlog (Sensei Group)

> **But du document.** Ce qui est dans la **V1**, et ce qui **attend**. Sans ça, on rajoute « une
> petite piqûre » tous les jours et on ne livre jamais. La règle : si ce n'est pas dans la V1,
> c'est dans « Plus tard », point.

- **Version** : 0.3
- **Dernière mise à jour** : 2026-06-16

---

## 🎯 Objectif de la V1 (la seule chose qui compte)

> **Boucler UN cycle complet :** un voyageur cherche un billet → l'achète en **BNPL (3-4x)** →
> rembourse ses échéances → son comportement **met à jour son score** dans `credit`.

Si une feature ne sert pas directement ce cycle, elle attend.

---

## ✅ V1 — Périmètre verrouillé

### Socle commun (`packages/`)
- [~] Auth Supabase (téléphone + OTP, email optionnel) — email OK ; OTP téléphone en attente.
- [ ] KYC minimal (1 pièce d'identité, statut `pending`/`verified`).
- [ ] Design system minimal dans `packages/ui` (tokens du BRAND_BRIEF).
- [x] i18n FR + EN (Lingala/Swahili : clés en place, traductions partielles OK).
- [x] `api-client` : hooks TanStack Query de base.
- [x] RLS sur toutes les tables créées.

### `flights` (canal d'acquisition)
- [x] Recherche de vols (origine, destination, dates, passagers, classe).
- [x] Affichage des offres (1 seul fournisseur d'inventaire en V1).
- [x] Tunnel de réservation : passagers + récap (details → customise → protect → summary).
- [x] Choix du moyen de paiement : mobile money **ou** BNPL.
- [x] Confirmation de réservation (PNR) après paiement réussi + écran « Gérer ma réservation ».

### `bnpl` (le cœur)
- [x] Éligibilité instantanée appuyée sur le score `credit`.
- [x] Échéancier 3x ou 4x, **frais affichés clairement avant validation**.
- [x] Acceptation de l'échéancier (consentement).
- [x] Suivi des échéances : à venir / payée / en retard.
- [x] Prélèvement/encaissement d'une échéance (Edge Function `pay-installment`).
- [ ] Rappel avant échéance (notification).

> **App web `bnpl-web` (« Sensei Pay ») — build complet façon Affirm (2026-06-15).**
> Site public : landing acheteur, `comment-ca-marche`, `ou-payer`, **estimateur de préqualification** (`eligibilite`, calcul live via `decideBnpl`), `faq`, `entreprise` (landing marchand).
> App connectée (garde `RequireAuth`) : tableau de bord (prochaine échéance, reste à payer, score, préqualif), liste des plans, **détail de plan** (`/paiements/$planId`), **mon score** (jauge + historique `credit_score_events`), **moyens de paiement** (mobile money — M-Pesa / Orange Money / Airtel Money, CRUD via `payment_methods`), profil.
> ⚠️ Restent **mockés / UI seulement** (cohérent avec le périmètre) : encaissement mobile money (toujours via le mock `pay-installment`), bascule « prélèvement automatique » et rappels d'échéance (placeholders UI). i18n FR + EN.

> **Intégrateur marchand complet (façon Affirm) — livré 2026-06-15.**
> Migrations `0004_merchant_integrator.sql` + `0005_merchant_portal.sql`. Edge Functions : `merchant-checkout`, `checkout-confirm`, `merchant-authorize`, `merchant-capture`, `merchant-void`, `merchant-refund`, `merchant-setup`, `webhook-dispatch`. SDK `sensei.js` (`packages/sensei-js`) : `init`, `checkout`, `renderPromo`. Page `/checkout?token=` (côté acheteur). Portail marchand (`/merchant/`) : tableau de bord KPI, transactions filtrables, clés API (affichées une seule fois, régénération de secret), webhooks (URL + events log, signature HMAC-SHA256 `X-Sensei-Signature`).

> **Documentation développeurs — livrée 2026-06-16.**
> Page `/developpeurs` (remplace le placeholder) : démarrage en 4 étapes, référence API complète des 5 endpoints marchand (méthode/path/auth/requête/réponse), section webhooks (4 événements + vérification de signature HMAC), exemples de code JS/cURL/Python, note de transparence sur l'environnement actuel (un seul environnement live, encaissement mobile money mocké). i18n FR + EN complet, nouveau composant `CodeBlock` (copie en un clic) dans `components/ui.tsx`.

> **Règlement marchand : commission + versement net au comptant — livré 2026-06-16.**
> Jusqu'ici, `merchant-capture` traçait la vente sans jamais calculer ni verser quoi que ce soit
> au marchand — gap critique corrigé. Migration `0007_merchant_payouts.sql` : `merchants.commission_bps`
> (points de base, défaut 500 = 5 %, jamais de float) + table `merchant_payouts` (grand livre
> append-only des versements `payout` et reprises `reversal`, taux figé par `commission_bps_snapshot`
> pour ne jamais réécrire l'historique si le taux change). `merchant-capture` calcule la commission et
> verse **le net en une fois** dès la capture (mocké, même convention que `pay-installment`) ; webhook
> `PAYOUT.PAID`. Si le marchand n'a pas encore configuré son `settlement_account`, le versement est créé
> en `pending` **sans bloquer la capture** (la commande est livrée, l'argent reste dû). `merchant-refund`
> émet désormais une reprise proportionnelle (`PAYOUT.REVERSED`) au taux snapshoté du versement d'origine,
> ne pénalise plus le score crédit de l'acheteur, et plafonne le cumul des remboursements sur une même
> capture (rejette tout dépassement, `refund_exceeds_remaining_captured_amount`) — deux bugs corrigés,
> détail : [`ERROR_LOG.md`](ERROR_LOG.md). **Vérifié de bout en bout sur le projet Supabase cloud** :
> capture → versement net + webhook `PAYOUT.PAID` ; remboursement partiel → reprise proportionnelle ;
> tentative de sur-remboursement → rejetée ; remboursement du restant → plan annulé + échéances `waived`
> + aucune ligne `credit_score_events` créée ; capture sans `settlement_account` → versement `pending`
> sans bloquer la commande et sans webhook `PAYOUT.PAID`.
> Onboarding (`merchant-setup`) exige désormais un compte de règlement. Portail marchand : nouvelle page
> `/merchant/payouts`, KPIs « Net versé »/« Commission Sensei » sur le tableau de bord, carte « Réglages
> de règlement » (clés API), 2 nouveaux types d'événements (webhooks).

> **Terminal virtuel + Home enrichi (portail marchand) — livré 2026-06-16.**
> Nouvelle Edge Function `merchant-terminal` (JWT marchand, pas de clé secrète) : `action: "create"`
> génère un lien de paiement pour une vente par téléphone/en agence (`checkout_sessions.metadata_json.source
> = "virtual_terminal"`), `action: "capture"` rejoue la séquence authorize→capture→versement déjà éprouvée
> par `merchant-authorize`/`merchant-capture` (idempotente : `alreadyCaptured: true` sans doublon ; 409 si la
> session n'est pas encore `authorized` ; 403 hors marchand propriétaire ; 400 si le montant n'est pas un
> entier positif). Nouvelle page `/merchant/terminal` (formulaire + liste filtrée des ventes du terminal,
> lien copiable, bouton « Finaliser la vente »), entrée de navigation dédiée, et checklist d'onboarding
> sur `/merchant` (compte créé / compte de règlement configuré / première vente confirmée / lien doc API).
> Nouvelle route acheteur `/checkout/merci` (`checkout_.merci.tsx`) comme `return_url` des ventes terminal
> (pas de site marchand à rediriger vers) — bug de routing trouvé et corrigé au passage, détail :
> [`ERROR_LOG.md`](ERROR_LOG.md). **Vérifié de bout en bout** sur le projet Supabase cloud : création →
> paiement acheteur → autorisation → capture → versement net (5 % commission) → propagation correcte aux
> KPIs/checklist/transactions/payouts/webhooks → idempotence et les 3 cas d'erreur (409/403/400) confirmés.

### `credit` (le moteur de données)
- [x] Création automatique d'un `credit_profile` à l'inscription (trigger `handle_new_user`, score initial 600).
- [x] Score interne minimal (règles simples au départ, pas de ML).
- [x] Mise à jour du score sur événement BNPL (`on_time_payment`, `late_payment`, `bnpl_completed`, `bnpl_default`).
- [x] Écran « Mon score » + historique (`credit_score_events`) — dashboard + report credit-web/mobile.
- [x] Journal d'audit (`audit_logs`) sur les accès au score — *corrigé le 2026-06-16 : c'était faux pour le flux marchand (Sensei Pay à la caisse), qui lisait le score sans consentement ni trace. `checkout-confirm` vérifie/crée désormais un `consent` (`granted_to_type=merchant`) et écrit `credit_inquiries` + `audit_logs` avant toute décision d'éligibilité. Détail : [`ERROR_LOG.md`](ERROR_LOG.md).*

### Paiements (`packages/payments`)
- [ ] Intégration **un** fournisseur mobile money (priorité au plus utilisé localement).
- [x] Webhooks de confirmation (idempotents, `provider_ref`).

---

## 🟡 V1.5 — juste après (utile mais pas bloquant)

- Carte bancaire comme moyen de paiement (`flights` + remboursement BNPL).
- Mobile money multi-opérateurs (Orange, Airtel, M-Pesa…).
- Traductions complètes Lingala + Swahili.
- [x] ~~Tableau de bord marchand (`merchants`) basique.~~ → livré en advance dans V1 (portail complet).
- Contestation d'une ligne de rapport (`disputes`) côté utilisateur.
- Notifications push (en plus des SMS).

---

## 🔵 V2 — plus tard (vision, pas maintenant)

- **Portail B2B prêteurs** : interrogation de score via API avec consentement (`lenders`, `credit_inquiries` hard/soft).
- Score basé sur **plus de signaux** (télécom, utilities, historique de paiement importé).
- Modèle de score statistique / ML (remplace les règles).
- Multi-devises (USD + CDF), conversion.
- [x] ~~BNPL pour marchands tiers hors `flights` (SDK / checkout marchand).~~ → livré en advance (intégrateur complet façon Affirm).
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
