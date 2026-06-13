# 06 — Integrations (Sensei Group)

> **But du document.** Tous les outils externes, connexions et API **au même endroit**. Avant de
> brancher quoi que ce soit, on le déclare ici. Avant de débugger une intégration, on la lit ici.

- **Version** : 0.1
- **Dernière mise à jour** : 2026-06-13
- ⚠️ **Aucun secret n'est écrit dans ce document.** Seulement les *noms* des variables d'environnement.
  Les valeurs vivent dans Supabase / le gestionnaire de secrets, jamais dans le repo.

---

## 1. Vue d'ensemble

| Domaine | Service | Statut | Utilisé par |
|---|---|---|---|
| Backend / DB / Auth | **Supabase** | ✅ Décidé | Tout |
| Paiement mobile money | À sélectionner (voir §3) | 🔲 À choisir | `payments`, `bnpl`, `flights` |
| Paiement carte | Flutterwave / Stripe | 🔲 V1.5 | `payments` |
| Inventaire vols | Duffel / Amadeus | 🔲 À choisir | `flights` |
| SMS / OTP | À sélectionner (voir §6) | 🔲 À choisir | `auth`, `notifications` |
| Push mobile | Expo Notifications | 🔲 V1.5 | `notifications` |
| KYC / vérif identité | Manuel (V1) → fournisseur (V2) | 🟡 Manuel V1 | `auth` |

> Légende : ✅ décidé · 🟡 partiel · 🔲 à décider.

---

## 2. Supabase (socle backend)

- **Rôle** : Postgres, Auth, Storage (documents KYC), Edge Functions (décision BNPL, webhooks), RLS.
- **Organisation repo** : `supabase/migrations` · `supabase/functions` · `supabase/policies` · `supabase/seeds`.
- **Variables d'environnement** :
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY` (client)
  - `SUPABASE_SERVICE_ROLE_KEY` (serveur / Edge Functions uniquement — **jamais** côté client)
- **Edge Functions prévues (V1)** :
  - `bnpl-decision` — calcule l'éligibilité à partir du score.
  - `payment-webhook` — reçoit les confirmations du prestataire de paiement (idempotent via `provider_ref`).
  - `score-update` — applique un `credit_score_event` après un événement de remboursement.
- **Règles** : RLS sur toutes les tables ; `service_role` réservé au serveur ; types générés via `pnpm db:types`.

---

## 3. Paiement — Mobile Money (RDC)

Le mobile money domine en RDC. Opérateurs cibles :

| Opérateur | Service | Priorité V1 |
|---|---|---|
| Vodacom | **M-Pesa** | À confirmer (souvent le + répandu) |
| Airtel | **Airtel Money** | V1.5 |
| Orange | **Orange Money** | V1.5 |
| Africell | Afrimoney | V2 |

**Options d'intégration :**
- **Agrégateur panafricain** (recommandé pour aller vite) : Flutterwave, Paystack ou MFS Africa —
  un seul branchement couvre plusieurs opérateurs + cartes.
- **API directe opérateur** : plus de contrôle, plus de friction contractuelle.

> 🔲 **Décision à prendre** : agrégateur unique vs intégrations directes. Recommandation : commencer
> avec **un agrégateur** pour la V1, puis internaliser si volume/coûts le justifient.

- **Variables d'environnement (génériques, à préciser selon le choix)** :
  - `PAYMENTS_PROVIDER` (ex : `flutterwave`)
  - `PAYMENTS_API_KEY`
  - `PAYMENTS_WEBHOOK_SECRET`
- **Contrat interne** : tout passe par `packages/payments` (abstraction). Les apps ne connaissent
  jamais le prestataire directement.
- **Idempotence** : chaque transaction stocke `provider_ref` (cf. `payments.provider_ref`).

---

## 4. Paiement — Carte (V1.5)

- Candidats : **Flutterwave**, **Stripe** (selon couverture RDC / acquisition).
- Variables : `CARD_PROVIDER`, `CARD_API_KEY`, `CARD_WEBHOOK_SECRET`.
- Même règle : derrière `packages/payments`.

---

## 5. Inventaire vols (`flights`)

| Fournisseur | Notes |
|---|---|
| **Duffel** | API moderne, intégration rapide, bon pour démarrer. |
| **Amadeus Self-Service** | Large couverture, plus complexe. |
| Travelport / Kiwi (Tequila) | Alternatives. |

> 🔲 **Décision à prendre** : **1 seul fournisseur en V1** (recommandation : le plus simple à intégrer
> avec une bonne couverture des routes RDC). Multi-fournisseur = V2.

- **Variables d'environnement** :
  - `FLIGHTS_PROVIDER` (ex : `duffel`)
  - `FLIGHTS_API_KEY`
- **Flux** : recherche → `flight_offers` (avec `expires_at`) → réservation → paiement → confirmation (PNR).
- **Attention** : les offres expirent. Toujours revérifier le prix/dispo avant d'encaisser.

---

## 6. SMS / OTP & Notifications

- **OTP** (auth par téléphone) : critique dès la V1. Candidats : Twilio, Africa's Talking
  (forte présence Afrique), ou via l'agrégateur de paiement s'il propose du SMS.
- **Push** (V1.5) : **Expo Notifications** côté mobile.
- **Email** (optionnel) : Resend / Supabase Auth emails.
- **Variables** :
  - `SMS_PROVIDER`, `SMS_API_KEY`, `SMS_SENDER_ID`
- **Centralisé** dans `packages/notifications` (un seul point d'envoi SMS/push/email).

---

## 7. KYC / Vérification d'identité

- **V1** : vérification **manuelle** par un agent (upload pièce → Storage privé → validation back-office).
- **V2** : fournisseur de vérification d'identité automatisé (à choisir selon couverture RDC).
- Données : tables `identities` (cf. dictionnaire) ; documents en **Storage privé** chiffré.

---

## 8. Règles transverses d'intégration

1. **Un secret ne va jamais dans le repo.** Seulement le *nom* de la variable ici.
2. **Toute intégration externe est encapsulée dans un `package/`** (`payments`, `notifications`, `database`).
   Les apps ne parlent jamais directement à un service tiers.
3. **Webhooks = idempotents** (clé `provider_ref` / signature vérifiée via le secret dédié).
4. **Toute nouvelle intégration est ajoutée à ce document AVANT d'être codée.**
5. Sandbox/test d'abord : aucune clé de production en développement.

---

## 9. Décisions ouvertes (à trancher)

- [ ] Agrégateur de paiement unique vs intégrations mobile money directes.
- [ ] Fournisseur d'inventaire vols pour la V1.
- [ ] Fournisseur SMS/OTP.
- [ ] Stratégie KYC V2 (fournisseur automatisé).
