# 03 — Data Dictionary (Sensei Group)

> **But du document.** Chaque champ est défini **une seule fois**, ici. L'IA (et l'équipe)
> nomme les choses **partout pareil**. Si un champ n'est pas ici, on ne l'invente pas : on
> l'ajoute ici d'abord, puis on l'utilise.

- **Version** : 0.1
- **Dernière mise à jour** : 2026-06-13
- **Conventions** :
  - Tables et colonnes : `snake_case`, pluriel pour les tables (`users`, `bnpl_plans`).
  - Clés primaires : `id` (UUID v4).
  - Clés étrangères : `<entité_singulier>_id` (ex : `user_id`).
  - Dates : `timestamptz` en UTC, suffixe `_at` (`created_at`, `paid_at`).
  - Argent : **entier en cents USD** (`amount_cents`), jamais de float. Devise dans `currency` (= `USD` en V1).
  - Énumérations : type Postgres `enum` ou table de référence ; valeurs en `snake_case`.
  - Booléens : préfixe `is_` / `has_` (`is_active`).
  - Tout est soumis à **RLS** Supabase (voir `supabase/policies/`).

---

## 0. Types & énumérations partagés

| Enum | Valeurs |
|---|---|
| `currency` | `USD` *(seule valeur V1)* |
| `language` | `fr`, `en`, `ln` (lingala), `sw` (swahili) |
| `kyc_status` | `unverified`, `pending`, `verified`, `rejected` |
| `consent_scope` | `credit_score_read`, `credit_report_read`, `data_sharing_lender` |
| `score_band` | `poor`, `fair`, `good`, `very_good`, `excellent` |
| `bnpl_application_status` | `draft`, `submitted`, `approved`, `declined`, `expired` |
| `bnpl_plan_status` | `active`, `completed`, `defaulted`, `cancelled` |
| `installment_status` | `scheduled`, `due`, `paid`, `late`, `failed`, `waived` |
| `payment_method_type` | `mobile_money`, `card`, `bnpl` |
| `payment_status` | `initiated`, `pending`, `succeeded`, `failed`, `refunded` |
| `booking_status` | `searching`, `held`, `pending_payment`, `confirmed`, `cancelled`, `refunded` |
| `actor_type` | `consumer`, `lender`, `merchant`, `staff`, `system` |

---

## 1. `users` — compte unique de l'écosystème
> Un seul compte donne accès à credit / bnpl / flights.

| Champ | Type | Description | Contraintes |
|---|---|---|---|
| `id` | uuid | Identifiant utilisateur | PK |
| `auth_id` | uuid | Réf. Supabase Auth (`auth.users.id`) | unique, FK |
| `email` | text | Email | unique, nullable (mobile-first) |
| `phone` | text | Téléphone E.164 (`+243…`) | unique, requis |
| `full_name` | text | Nom complet légal | requis pour KYC |
| `preferred_language` | language | Langue d'interface | défaut `fr` |
| `kyc_status` | kyc_status | État de vérification d'identité | défaut `unverified` |
| `created_at` | timestamptz | Création | défaut `now()` |
| `updated_at` | timestamptz | Dernière modif | |

## 2. `identities` — pièces d'identité (KYC)
| Champ | Type | Description | Contraintes |
|---|---|---|---|
| `id` | uuid | PK | |
| `user_id` | uuid | → `users.id` | FK |
| `id_type` | text | `national_id`, `passport`, `voter_card`, `driver_license` | |
| `id_number` | text | Numéro de pièce (chiffré au repos) | |
| `document_url` | text | Scan stocké (Storage privé) | |
| `verified_at` | timestamptz | Date de vérification | nullable |
| `created_at` | timestamptz | | |

## 3. `consents` — registre de consentement (cœur réglementaire)
> Toute lecture de donnée de crédit exige un consentement actif et traçable.

| Champ | Type | Description | Contraintes |
|---|---|---|---|
| `id` | uuid | PK | |
| `user_id` | uuid | → `users.id` | FK |
| `scope` | consent_scope | Portée du consentement | |
| `granted_to_type` | actor_type | Type d'acteur autorisé (`lender`, `merchant`…), nullable si self | nullable |
| `granted_to_id` | uuid | ID de l'acteur autorisé (`lenders.id` ou `merchants.id`), nullable si self | nullable, pas de FK (polymorphe) |
| `is_active` | bool | Consentement en cours | défaut `true` |
| `granted_at` | timestamptz | Octroi | |
| `revoked_at` | timestamptz | Révocation | nullable |

---

## 4. Domaine `credit`

### 4.1 `credit_profiles` — profil de crédit (1 par user)
| Champ | Type | Description | Contraintes |
|---|---|---|---|
| `id` | uuid | PK | |
| `user_id` | uuid | → `users.id` | FK, unique |
| `current_score` | int | Score Sensei courant (ex. 300–850) | |
| `score_band` | score_band | Tranche lisible | |
| `score_updated_at` | timestamptz | Dernier recalcul | |
| `created_at` | timestamptz | | |

### 4.2 `credit_score_events` — historique du score (audit)
> On ne modifie jamais un score « en place » : on empile des événements.

| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `credit_profile_id` | uuid | → `credit_profiles.id` |
| `previous_score` | int | Score avant |
| `new_score` | int | Score après |
| `reason_code` | text | `on_time_payment`, `late_payment`, `new_inquiry`, `bnpl_completed`, `bnpl_default`… |
| `source` | text | Produit/événement déclencheur (`bnpl`, `manual`, `import`) |
| `created_at` | timestamptz | |

### 4.3 `credit_report_lines` — lignes du rapport de crédit
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `credit_profile_id` | uuid | → `credit_profiles.id` |
| `category` | text | `bnpl_plan`, `loan`, `utility`, `telecom`… |
| `description` | text | Libellé humain de la ligne |
| `amount_cents` | bigint | Montant concerné (cents USD) |
| `currency` | currency | `USD` |
| `status` | text | `current`, `late`, `closed`, `disputed` |
| `reported_by` | uuid | Acteur source (nullable) |
| `created_at` | timestamptz | |

### 4.4 `credit_inquiries` — requêtes de score (tiers : lender B2B ou merchant BNPL)
> Trace chaque fois qu'un score est consulté par un tiers — y compris un marchand qui
> déclenche une vérification d'éligibilité Sensei Pay au moment du paiement.

| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `credit_profile_id` | uuid | → `credit_profiles.id` |
| `requested_by_type` | actor_type | Type d'acteur demandeur (`lender` ou `merchant`) |
| `requested_by_id` | uuid | ID du demandeur (`lenders.id` ou `merchants.id`), pas de FK (polymorphe) |
| `consent_id` | uuid | → `consents.id` (obligatoire) |
| `inquiry_type` | text | `soft` (sans impact) / `hard` (avec impact score) |
| `created_at` | timestamptz | |

### 4.5 `disputes` — contestation d'une ligne de rapport
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `credit_report_line_id` | uuid | → `credit_report_lines.id` |
| `user_id` | uuid | → `users.id` |
| `reason` | text | Motif de la contestation |
| `status` | text | `open`, `under_review`, `resolved`, `rejected` |
| `created_at` / `resolved_at` | timestamptz | |

---

## 5. Domaine `bnpl`

### 5.1 `bnpl_applications` — demande de financement
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | → `users.id` |
| `merchant_id` | uuid | → `merchants.id` (nullable si interne) |
| `order_ref` | text | Réf. de la commande financée (ex : `bookings.id`) |
| `principal_cents` | bigint | Montant à financer (cents USD) |
| `currency` | currency | `USD` |
| `status` | bnpl_application_status | |
| `decision_score` | int | Score utilisé pour décider |
| `decision_reason` | text | Code de décision (audit) |
| `created_at` / `decided_at` | timestamptz | |

### 5.2 `bnpl_plans` — échéancier accepté
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `application_id` | uuid | → `bnpl_applications.id` |
| `user_id` | uuid | → `users.id` |
| `principal_cents` | bigint | Capital |
| `fee_cents` | bigint | Frais **affichés** (0 si sans frais) |
| `total_cents` | bigint | Total à rembourser (= principal + fee) |
| `installment_count` | int | Nombre d'échéances (ex : 3, 4) |
| `currency` | currency | `USD` |
| `status` | bnpl_plan_status | |
| `created_at` | timestamptz | |

### 5.3 `installments` — échéances individuelles
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `plan_id` | uuid | → `bnpl_plans.id` |
| `sequence` | int | N° d'échéance (1..n) |
| `amount_cents` | bigint | Montant de l'échéance |
| `due_date` | date | Date d'échéance |
| `status` | installment_status | |
| `paid_at` | timestamptz | nullable |

---

## 6. Domaine `payments` (transversal)

### 6.1 `payment_methods` — moyens enregistrés
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | → `users.id` |
| `type` | payment_method_type | `mobile_money` / `card` / `bnpl` |
| `provider` | text | `mpesa`, `orange_money`, `airtel_money`, `card_processor`… |
| `masked_identifier` | text | Numéro masqué (`+243•••789`) |
| `is_default` | bool | |
| `created_at` | timestamptz | |

### 6.2 `payments` — transactions
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | → `users.id` |
| `payment_method_id` | uuid | → `payment_methods.id` (nullable) |
| `purpose` | text | `booking`, `installment`, `bnpl_settlement` |
| `reference_id` | uuid | ID de l'objet payé (`installments.id`, `bookings.id`…) |
| `amount_cents` | bigint | Montant |
| `currency` | currency | `USD` |
| `status` | payment_status | |
| `provider_ref` | text | Référence côté prestataire (idempotence) |
| `created_at` / `settled_at` | timestamptz | |

---

## 7. Domaine `flights`

### 7.1 `flight_searches` — recherches (analytics + cache)
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | nullable (recherche anonyme possible) |
| `origin` | text | Code IATA (`FIH`…) |
| `destination` | text | Code IATA |
| `depart_date` | date | |
| `return_date` | date | nullable (aller simple) |
| `passenger_count` | int | |
| `cabin_class` | text | `economy`, `premium`, `business` |
| `created_at` | timestamptz | |

### 7.2 `flight_offers` — offres retournées par le fournisseur
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `search_id` | uuid | → `flight_searches.id` |
| `provider` | text | Fournisseur d'inventaire (`duffel`…) |
| `provider_offer_id` | text | ID offre côté fournisseur |
| `total_cents` | bigint | Prix total (cents USD) |
| `currency` | currency | `USD` |
| `expires_at` | timestamptz | Validité de l'offre |
| `segments_json` | jsonb | Détail des segments (vols, horaires) |

### 7.3 `bookings` — réservations
> Réservation **sans compte** (modèle invité, façon Alternative Airlines) : on ne crée pas de
> compte, on s'identifie a posteriori avec `booking_ref` + `contact_email` (cf. « Gérer ma réservation »).

| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | → `users.id`. **Nullable** (réservation invité sans compte) |
| `offer_id` | uuid | → `flight_offers.id` |
| `booking_ref` | text | **Référence Sensei** lisible présentée au client (ex : `SN-C3E-M7Z6A`). ≠ PNR fournisseur. Sert d'identifiant pour « Gérer ma réservation » |
| `provider_booking_ref` | text | PNR / réf. de la compagnie aérienne (nullable tant que `Processing`) |
| `status` | booking_status | |
| `total_cents` | bigint | Montant total |
| `currency` | currency | `USD` |
| `contact_email` | text | E-mail de l'acheteur (clé de récupération de la réservation invité) |
| `contact_phone` | text | Téléphone mobile de contact (nullable) |
| `contact_opt_in` | bool | A accepté de « rester en contact » (offres/SMS). Défaut `false` |
| `payment_id` | uuid | → `payments.id` (nullable tant qu'impayé) |
| `bnpl_plan_id` | uuid | → `bnpl_plans.id` (nullable si payé comptant) |
| `created_at` / `confirmed_at` | timestamptz | |

### 7.4 `passengers` — voyageurs d'une réservation
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `booking_id` | uuid | → `bookings.id` |
| `title` | text | Civilité (`mr`, `mrs`, `ms`, `mx`) |
| `first_name` | text | Prénom tel que sur la pièce |
| `middle_name` | text | Deuxième prénom (nullable) |
| `last_name` | text | Nom de famille tel que sur la pièce |
| `full_name` | text | Nom complet composé (compat / affichage) |
| `birth_date` | date | |
| `document_number` | text | Passeport/ID de voyage (nullable à ce stade) |
| `type` | text | `adult`, `child`, `infant` |

---

## 8. Acteurs B2B & back-office

### 8.1 `lenders` — prêteurs / institutions qui interrogent le crédit
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | Raison sociale |
| `api_key_hash` | text | Clé d'API (hashée) |
| `is_active` | bool | |
| `created_at` | timestamptz | |

### 8.2 `merchants` — marchands BNPL
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | Nom du marchand |
| `settlement_account` | text | Compte de règlement (mobile money) — où le marchand reçoit son versement net |
| `commission_bps` | integer | Taux de commission Sensei, en points de base (500 = 5 %). Défaut 500. Modifiable seulement en base en V1 |
| `is_active` | bool | |

### 8.3 `merchant_payouts` — versements & reprises marchand (append-only)
> Le marchand est payé **au comptant, en une fois**, net de commission, dès la capture de la
> vente — jamais en attendant les échéances BNPL de l'acheteur. C'est Sensei qui porte seul le
> risque d'impayé ensuite. Cette table est le grand livre de ces versements.

| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `merchant_id` | uuid | → `merchants.id` |
| `type` | merchant_payout_type | `payout` (versement initial) ou `reversal` (reprise suite à remboursement) |
| `status` | merchant_payout_status | `pending` (compte de règlement pas encore configuré), `succeeded`, `failed` |
| `capture_transaction_id` | uuid | → `merchant_transactions.id` — la capture d'origine |
| `refund_transaction_id` | uuid | → `merchant_transactions.id`, uniquement pour un `reversal` |
| `source_payout_id` | uuid | → `merchant_payouts.id`, le `payout` initial dont un `reversal` reprend une fraction |
| `commission_bps_snapshot` | integer | Taux figé au moment du versement — un changement ultérieur de `merchants.commission_bps` ne réécrit jamais l'historique |
| `gross_amount_cents` | bigint | Montant brut de la vente (ou du remboursement, pour un `reversal`) |
| `commission_cents` | bigint | Commission Sensei prélevée |
| `net_amount_cents` | bigint | `gross_amount_cents - commission_cents` — ce que reçoit le marchand |
| `currency` | currency | `USD` |
| `settlement_account` | text | Copie figée du compte de règlement au moment du versement (audit) |
| `provider_ref` | text | Référence idempotence (`payout_capture_<id>` / `reversal_refund_<id>`) |
| `created_at` | timestamptz | |
| `settled_at` | timestamptz | Nullable — fixé quand `status = succeeded` |

### 8.4 `audit_logs` — journal d'audit transverse (obligatoire)
| Champ | Type | Description |
|---|---|---|
| `id` | uuid | PK |
| `actor_type` | actor_type | Qui agit |
| `actor_id` | uuid | ID de l'acteur (nullable pour `system`) |
| `action` | text | Ex : `credit_score.read`, `consent.revoke`, `bnpl.approve` |
| `target_table` | text | Table concernée |
| `target_id` | uuid | Ligne concernée |
| `metadata` | jsonb | Contexte |
| `created_at` | timestamptz | |

---

## 9. Règles d'or de la donnée

1. **Argent = entier cents USD** (`amount_cents`). Jamais de float. Devise explicite.
2. **On n'écrase pas l'historique de crédit** : score & rapport sont *append-only* (événements).
3. **Toute lecture de crédit par un tiers est tracée** (`credit_inquiries` + `audit_logs`).
4. **Pas de donnée de crédit sans `consent` actif.**
5. **PII chiffrée au repos** (numéros de pièce, documents en Storage privé).
6. Un nouveau champ → on l'ajoute **ici d'abord**, puis migration `supabase/migrations/`.
