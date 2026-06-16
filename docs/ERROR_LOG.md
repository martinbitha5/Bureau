# 07 — Error Log (Sensei Group)

> **But du document.** Chaque bug documenté **une fois**, pour éviter que l'IA (et l'équipe)
> refasse la même erreur en boucle. Quand tu codes sans documentation, tu improvises. Quand tu
> codes avec un système, tu construis.

- **Version** : 0.2
- **Dernière mise à jour** : 2026-06-16

---

## Comment utiliser ce journal

1. **Avant de débugger** : chercher (Ctrl+F) le message d'erreur ou le symptôme ici.
2. **Après avoir résolu un bug non trivial** : ajouter une entrée (copier le modèle ci-dessous).
3. Une entrée = **un** bug. Concis, factuel, reproductible.
4. Classer par domaine via les tags : `[supabase]` `[rls]` `[bnpl]` `[credit]` `[flights]`
   `[payments]` `[auth]` `[expo]` `[tanstack]` `[i18n]` `[money]` `[build]`.

### Modèle d'entrée (à copier)

```
### YYYY-MM-DD — [tag] Titre court du problème
- **Symptôme** : ce qu'on observe (message exact, comportement).
- **Contexte** : où/quand (app, package, étape).
- **Cause racine** : pourquoi ça arrivait vraiment.
- **Correction** : ce qui a réglé le problème (commit/fichier si pertinent).
- **Prévention** : la règle pour que ça ne revienne pas.
```

---

## Pièges connus à éviter dès le départ (pré-remplis)

Ces entrées sont des **rappels préventifs** issus de la conception, pas encore des bugs rencontrés.

### [money] Ne jamais stocker l'argent en float
- **Symptôme** : montants qui dérivent (`49.999...`), totaux d'échéancier faux.
- **Cause racine** : arithmétique flottante.
- **Prévention** : argent = **entier `*_cents` USD**. Calculs en entiers. Cf. [`DATA_DICTIONARY.md`](DATA_DICTIONARY.md) §9.

### [rls] Table sans politique RLS = données invisibles ou exposées
- **Symptôme** : requêtes qui renvoient vide (RLS active sans policy) **ou** fuite de données (RLS désactivée).
- **Prévention** : toute nouvelle table → migration + policy dans `supabase/policies/` dans le même lot.

### [credit] Accès à un score sans consentement / sans trace
- **Symptôme** : un tiers lit un score sans `consent` actif ou sans entrée `credit_inquiries`/`audit_logs`.
- **Prévention** : passer par l'Edge Function dédiée qui **vérifie le consentement et écrit l'audit**. Jamais d'accès direct.

### [credit] Écrasement de l'historique de score
- **Symptôme** : impossible d'expliquer pourquoi un score a changé.
- **Prévention** : score & rapport **append-only** (`credit_score_events`). On n'`UPDATE` jamais l'historique.

### [payments] Webhook rejoué → double encaissement
- **Symptôme** : une échéance payée deux fois, double `payment` créé.
- **Prévention** : idempotence via `provider_ref` + vérification de signature (`PAYMENTS_WEBHOOK_SECRET`).

### [flights] Offre expirée encaissée
- **Symptôme** : prix changé / réservation refusée par le fournisseur après paiement.
- **Prévention** : revérifier `flight_offers.expires_at` et le prix **juste avant** d'encaisser.

### [auth] OTP par téléphone en réseau lent
- **Symptôme** : timeout, double envoi de SMS, utilisateur bloqué.
- **Prévention** : délais tolérants, anti-double-envoi, message clair, fallback. Tester en conditions réseau dégradées.

### [tanstack] Appel Supabase hors `api-client`
- **Symptôme** : cache incohérent, données dupliquées, logique d'accès éparpillée.
- **Prévention** : **tout** passe par les hooks TanStack Query de `packages/api-client`. Cf. [`CLAUDE.md`](CLAUDE.md) §3.

### [i18n] Texte en dur dans l'UI
- **Symptôme** : chaîne non traduite en EN/Lingala/Swahili.
- **Prévention** : aucune chaîne en dur ; toujours une clé i18n.

---

## Journal des bugs rencontrés

> _(Les plus récentes en haut.)_

### 2026-06-16 — [tanstack] `/checkout/merci` n'affichait jamais sa propre page de confirmation
- **Symptôme** : après autorisation d'une vente créée par le terminal virtuel, la redirection vers `/checkout/merci?checkout_token=...` affichait le message d'erreur de `/checkout` (« Lien invalide / Aucun token de paiement dans l'URL ») au lieu de la confirmation attendue (« Financement confirmé »).
- **Contexte** : `apps/bnpl-web/src/routes/checkout.merci.tsx`, livré avec le terminal virtuel. TanStack Router (file-based routing) nestait automatiquement ce fichier comme route **enfant** de `checkout.tsx` à cause du segment en point (`checkout.merci.tsx`).
- **Cause racine** : `checkout.tsx` ne rend jamais `<Outlet />` — donc une route enfant ne s'affiche jamais, quel que soit son contenu. Seul le composant parent (`CheckoutPage`) s'exécutait, sans le paramètre `checkout_token` qu'il attend, d'où son propre message d'erreur.
- **Correction** : renommage en `checkout_.merci.tsx` (convention d'échappement « non-nested routes » de TanStack Router : underscore final sur le segment parent). Même URL publique (`/checkout/merci`), mais route **sœur** au lieu d'enfant — le plugin Vite a régénéré `routeTree.gen.ts` et réécrit lui-même l'appel `createFileRoute(...)` interne en conséquence.
- **Prévention** : toute nouvelle route `X.Y.tsx` dont le composant `X.tsx` ne rend pas `<Outlet />` doit être nommée `X_.Y.tsx` dès le départ — sinon elle ne s'affichera jamais, sans erreur de build pour le signaler.

### 2026-06-16 — [bnpl] `merchant-refund` ne plafonnait pas le cumul des remboursements sur une même capture
- **Symptôme** : aucun symptôme observé en usage normal — trouvé en relisant `merchant-refund` juste avant le test end-to-end du versement marchand. La fonction validait `amountCents` (ou le montant par défaut) **uniquement contre le montant total de la capture d'origine**, jamais contre ce qui avait déjà été remboursé. Deux remboursements partiels successifs (ou un partiel suivi d'un appel sans `amountCents`, censé rembourser « le total ») pouvaient donc dépasser le montant réellement capturé.
- **Contexte** : `supabase/functions/merchant-refund/index.ts`, dans le même lot que la reprise de versement (`merchant_payouts`, entrée ci-dessous). Le plan prévoyait explicitement de « sommer les `reversal` déjà émis » avant de calculer une nouvelle reprise — cette sommation n'avait pas été câblée dans le code déployé.
- **Cause racine** : la validation (`refundAmount > captureTx.amount_cents`) raisonnait par appel isolé, pas par cumul. Sans elle, un marchand intégrateur buggé (ou malveillant) pouvait déclencher plusieurs `reversal` dont la somme excède le `payout` d'origine — sur-reprise de commission/net jamais réellement perçus.
- **Correction** : avant de calculer `refundAmount`, on somme désormais tous les `merchant_transactions` (`type=refund`) déjà liés à la même `checkout_session_id`, on dérive `remaining = capture - déjà_remboursé`, et on rejette (`refund_exceeds_remaining_captured_amount`, 400) tout appel qui dépasserait ce restant. Un appel sans `amountCents` rembourse désormais le **restant**, pas le total d'origine. Vérifié en bout en bout : remboursement partiel (40%) → tentative de rembourser 100% à nouveau → rejetée 400 → remboursement du restant (60%, sans `amountCents`) → accepté, deux `reversal` correctement proportionnés au taux figé.
- **Prévention** : toute validation de montant sur une opération répétable (remboursement, reprise, prélèvement partiel) doit comparer au **cumul déjà effectué**, pas seulement au plafond de l'opération d'origine — un garde-fou qui ne regarde qu'un appel isolé ne protège pas contre une séquence d'appels.

### 2026-06-16 — [bnpl] Aucun versement marchand : `merchant-capture` traçait la vente mais ne payait jamais personne
- **Symptôme** : aucun symptôme visible côté API (toutes les réponses `merchant-capture` étaient `200`, statuts cohérents) — le problème n'apparaît qu'en relisant le code en se demandant « qui paie le marchand, et quand ? ». Réponse : personne, jamais. `merchant_transactions` traçait bien la capture, mais aucune ligne nulle part ne représentait l'argent dû au marchand.
- **Contexte** : `supabase/functions/merchant-capture/index.ts`, depuis la livraison de l'intégrateur marchand (`0004_merchant_integrator.sql`, 2026-06-15). La colonne `merchants.settlement_account` existait depuis `0001_init.sql` mais n'était lue ni écrite par aucune fonction (seedée en dur uniquement) — un signe qu'elle avait été prévue puis jamais branchée.
- **Cause racine** : le modèle économique attendu (commission Sensei + versement du net au marchand, **au comptant et en une fois**, indépendamment des échéances BNPL de l'acheteur) n'avait jamais été codifié en schéma ni en logique — seul le statut de la transaction (capturé/annulé/remboursé) existait, pas le règlement financier qui doit en découler.
- **Correction** : migration `0007_merchant_payouts.sql` (`merchants.commission_bps` + table `merchant_payouts`, append-only, RLS). `merchant-capture` calcule désormais la commission (`computeCommission` dans `_shared/merchant.ts`) et insère un `merchant_payouts` (`type=payout`) avec le net versé, immédiatement après chaque capture réussie ; webhook `PAYOUT.PAID`. Si `settlement_account` n'est pas configuré, le versement est créé en `pending` **sans bloquer la capture** (la commande reste livrée, l'argent reste dû). `merchant-refund` émet la reprise symétrique (`reversal` + `PAYOUT.REVERSED`) au taux **figé** (`commission_bps_snapshot`) du versement d'origine — jamais au taux courant du marchand, pour ne pas réécrire l'historique si le taux change. Détail complet : [`FEATURE_BACKLOG.md`](FEATURE_BACKLOG.md).
- **Prévention** : une fonctionnalité qui « trace un statut » (capturé, payé, remboursé) ne garantit pas que l'argent correspondant a réellement bougé — vérifier explicitement, pour toute transaction financière, qu'il existe une ligne de grand livre qui représente le mouvement de fonds lui-même, pas seulement l'état de la commande.

### 2026-06-16 — [bnpl] `merchant-refund` pénalisait à tort le score crédit de l'acheteur sur un remboursement marchand
- **Symptôme** : un remboursement initié par le **marchand** (retour produit, geste commercial, etc.) faisait chuter le score crédit de l'**acheteur** via un événement `bnpl_default` (-60 points) — alors que l'acheteur n'avait commis aucun défaut de paiement.
- **Contexte** : `supabase/functions/merchant-refund/index.ts`. Trouvé en relisant ce fichier pour y ajouter la reprise de versement (entrée ci-dessus) — le bloc de pénalité de score y était déjà présent, sans lien avec la nouvelle fonctionnalité.
- **Cause racine** : confusion entre deux causes métier distinctes qui partagent le même symptôme final (« argent rendu/non perçu ») : un remboursement est **une décision du marchand**, un défaut est **un manquement de l'acheteur**. Le code traitait les deux comme équivalents et appliquait la pénalité réservée au second cas chaque fois qu'un remboursement passait.
- **Correction** : suppression complète du bloc de pénalité de score (et des helpers `SCORE_MIN`/`SCORE_MAX`/`clamp`/`bandOf` devenus inutilisés) dans `merchant-refund`. Un remboursement marchand ne touche plus jamais `credit_score_events`.
- **Prévention** : avant d'appliquer une pénalité de score, vérifier que la cause racine est bien un manquement de l'**acheteur** (échéance manquée) et non une décision d'un tiers (marchand, support) — ne jamais inférer la responsabilité à partir du seul effet financier observé (« de l'argent est revenu »).

### 2026-06-16 — [credit] `checkout-confirm` lisait le score sans consentement ni trace (violation CLAUDE.md §5)
- **Symptôme** : aucun symptôme visible côté UI — le flux marchand (`Sensei Pay` à la caisse) fonctionnait et approuvait correctement les achats. Le problème est apparu en relisant le code : `checkout-confirm` lit `credit_profiles.current_score` pour décider de l'éligibilité BNPL, **sans vérifier ni créer aucun `consent`**, et sans écrire dans `credit_inquiries`/`audit_logs`. Exactement le piège déjà listé en préventif plus haut (« [credit] Accès à un score sans consentement / sans trace »), mais réellement en prod.
- **Contexte** : `supabase/functions/checkout-confirm/index.ts`, étape 2 du flux intégrateur marchand (livré le 2026-06-15). Le marchand n'est pas un `lender` : c'est un tiers qui déclenche une lecture de score au nom de l'acheteur à la caisse, via Sensei Pay.
- **Cause racine** : le schéma `consents`/`credit_inquiries` ne modélisait que le cas **lender** (B2B, V2) — `consents.granted_to` et `credit_inquiries.requested_by` étaient des FK strictes vers `lenders.id`. Aucune table ne pouvait représenter « le marchand X a obtenu/lu le score ». `FEATURE_BACKLOG.md` affirmait par erreur que le journal d'audit sur les accès au score était déjà livré.
- **Correction** : migration `0006_credit_access_audit_trail.sql` — généralisation de `consents.granted_to` → `granted_to_type`/`granted_to_id` et `credit_inquiries.requested_by` → `requested_by_type`/`requested_by_id`, en `actor_type` polymorphique (même motif que `audit_logs.actor_type`/`actor_id`, déjà dans `0001_init.sql`), couvrant `lender` ET `merchant`. `checkout-confirm` cherche/crée un `consent` actif (`scope=credit_score_read`, `granted_to_type=merchant`) avant de lire le score, puis écrit systématiquement une ligne `credit_inquiries` (`inquiry_type=soft`) et une ligne `audit_logs` (`action=credit_score.read`) — **avant** la décision d'éligibilité, donc peu importe approuvé/refusé. UI : disclosure de consentement ajoutée sur `/checkout` (bnpl-web) juste avant le bouton de confirmation. Vérifié en bout en bout : un même acheteur/marchand réutilise le consentement existant (pas de doublon) mais génère bien une nouvelle `credit_inquiries` à chaque achat.
- **Piège de déploiement rencontré en cours de route** : un premier déploiement de `checkout-confirm` via copier-coller dans l'éditeur du dashboard Supabase **n'a silencieusement pas pris effet** — la fonction qui répondait restait l'ancienne version (réponse `approved:true` correcte côté métier, mais zéro ligne écrite dans `consents`/`credit_inquiries`/`audit_logs`). Le redéploiement via `supabase functions deploy checkout-confirm --project-ref <ref>` (CLI) a résolu le problème immédiatement.
- **Prévention** : tout accès à un score par un acteur tiers (lender, marchand, futur partenaire) passe par la vérification/création de `consent` + écriture `credit_inquiries` + `audit_logs`, **avant** toute logique métier qui en dépend — jamais après, jamais conditionnel à l'issue. Pour vérifier qu'une Edge Function redéployée via le **dashboard** (copier-coller) a bien pris effet, ne pas se fier à la réponse HTTP seule : interroger directement les tables que le nouveau code est censé écrire. En cas de doute sur un déploiement dashboard, préférer la CLI (`supabase functions deploy`) qui donne une confirmation fiable.

### 2026-06-16 — [supabase] Intégrateur marchand « livré » mais jamais déployé (404 sur toutes les Edge Functions marchand)
- **Symptôme** : le formulaire d'onboarding marchand (`Configurer votre compte marchand`) échoue avec « Erreur lors de la création du compte marchand. Réessayez. ». Réseau : `OPTIONS .../functions/v1/merchant-setup → 404`.
- **Contexte** : `bnpl-web`, après le correctif de redirection marchand (entrée du jour ci-dessous). `FEATURE_BACKLOG.md` indiquait l'intégrateur marchand façon Affirm comme **livré le 2026-06-15** (8 Edge Functions : `merchant-setup`, `merchant-checkout`, `merchant-authorize`, `merchant-capture`, `merchant-void`, `merchant-refund`, `checkout-confirm`, `webhook-dispatch`).
- **Cause racine** : le code des 8 fonctions existait bien dans `supabase/functions/`, mais **aucune n'avait été déployée** sur le projet cloud (seules `bnpl-decision` et `pay-installment`, plus anciennes, répondaient). Vérifié par `OPTIONS` direct sur chaque endpoint — 404 partout sauf ces deux-là. La doc du backlog décrivait une livraison qui n'avait jamais quitté le poste de dev.
- **Correction** : déploiement via `supabase functions deploy <slug> --project-ref phqdzsqoyifxwogrkdqc` (CLI, token `SUPABASE_ACCESS_TOKEN`, sans Docker — la CLI moderne bundle elle-même les imports relatifs, y compris `_shared/merchant.ts`). Les 8 fonctions répondent désormais `200`. Note : `tools/deploy-function.mjs` (API de gestion, fichier unique) ne convient **pas** à ces fonctions car il n'embarque pas `_shared/` — préférer la CLI pour tout ce qui importe du code partagé.
- **Piège additionnel** : la CLI active `verify_jwt` par défaut au déploiement. Or `merchant-checkout`, `merchant-authorize`, `merchant-capture`, `merchant-void`, `merchant-refund` sont appelées par le **backend du marchand** avec sa clé publique/secrète (`findMerchantByPublicKey`/`findMerchantBySecretKey`), jamais avec un JWT Supabase — `verify_jwt: true` les aurait bloquées à la passerelle avec 401 avant même d'exécuter le code. Redéployées avec `--no-verify-jwt`. `merchant-setup` et `checkout-confirm` gardent `verify_jwt: true` à raison (ils lisent le JWT de l'utilisateur Sensei connecté) ; `webhook-dispatch` aussi (appelée en interne/cron avec la clé `service_role`).
- **Prévention** : une feature marquée « livrée » dans `FEATURE_BACKLOG.md` doit inclure une vérification **post-déploiement** (ping des endpoints réels), pas seulement la présence du code dans le repo. Pour toute Edge Function authentifiée par clé API marchand (pas par JWT Supabase), déployer explicitement avec `--no-verify-jwt` — sinon la passerelle Supabase rejette l'appel avant que le code ne voie la clé.

### 2026-06-16 — [bnpl] Marchand connecté bloqué sur un stub « bientôt disponible » après login
- **Symptôme** : un compte avec `role=merchant` qui se connecte (ou s'inscrit) sur `bnpl-web` arrive sur `/` et voit une carte statique « Votre tableau de bord marchand arrive bientôt », sans aucun lien vers le vrai portail marchand. Le header ne propose non plus aucune navigation vers `/merchant`.
- **Contexte** : `apps/bnpl-web/src/routes/-home.tsx`, composant `HomePage`. Le portail marchand complet (`/merchant` : KPIs, transactions, clés API, webhooks, onboarding première connexion) existait déjà et fonctionnait, mais rien ne s'y connectait.
- **Cause racine** : `HomePage` rendait un composant `MerchantWelcome` (stub figé) pour `role === "merchant"` au lieu de rediriger vers `/merchant`. `login.tsx`/`signup.tsx` naviguent toujours vers `/` après succès, quel que soit le rôle — donc tout marchand atterrissait sur ce mur.
- **Correction** : `HomePage` redirige désormais via `useNavigate` + `useEffect` (`role === "merchant"` → `navigate({ to: "/merchant" })`), avec un spinner pendant `loading`/la redirection. Suppression de `MerchantWelcome` et de ses clés i18n mortes (`merchant.welcome.*` en FR/EN). Vérifié en navigateur (préview) avec un compte marchand de test : connexion → redirection automatique → onboarding (« Configurer votre compte marchand ») s'affiche correctement pour un nouveau marchand sans profil.
- **Prévention** : toute page « post-connexion » (`/`) qui dépend du `role` doit gérer explicitement les deux rôles (`consumer`/`merchant`) — ne jamais laisser un rôle retomber sur un placeholder pendant que l'autre a un flux complet. Si une zone applicative dédiée existe (`/merchant`), `/` doit y rediriger plutôt que dupliquer/mocker son contenu.

### 2026-06-15 — [build] `TS4023` en cascade : `RouterContext` non exporté (TanStack Router)
- **Symptôme** : `tsc --noEmit` échoue avec ~28 erreurs `TS4023: Exported variable 'Route'/'routeTree'/… has or is using name 'RouterContext' from external module ".../routes/__root" but cannot be named.` réparties sur tous les fichiers de routes et `routeTree.gen.ts`.
- **Contexte** : `bnpl-web`, routing fichier TanStack Router. `__root.tsx` déclarait `interface RouterContext { queryClient }` passée à `createRootRouteWithContext<RouterContext>()`.
- **Cause racine** : l'interface du contexte n'était pas **exportée**. Comme l'arbre de routes généré et chaque `createFileRoute` référencent ce type dans leur signature publique, TypeScript ne peut pas le « nommer » et propage l'erreur partout.
- **Correction** : `export interface RouterContext` dans `apps/bnpl-web/src/routes/__root.tsx`. Une seule ligne corrige toutes les occurrences.
- **Prévention** : tout type utilisé dans le contexte d'une route (`createRootRouteWithContext<T>`) doit être **exporté**. Vaut pour `credit-web` et `flights-web` (même stack).

### 2026-06-15 — [tanstack] `useQuery<T>(...)` + spread de `queryOptions` → « No overload matches this call »
- **Symptôme** : `error TS2769: No overload matches this call` + `Property 'x' does not exist on type 'NonNullable<TQueryFnData>'`, alors que `useQuery({ ...options, enabled })` voisin compile sans souci.
- **Contexte** : page `score.tsx`, appel `useQuery<CreditProfile>({ ...creditProfileOptions(supabase, userId), enabled: !!userId })`.
- **Cause racine** : passer **un seul** paramètre de type générique à `useQuery<T>` fige `TQueryFnData=T` mais laisse la clé (`TQueryKey`) à `readonly unknown[]`, ce qui entre en conflit avec la **clé typée en tuple** (`["credit","profile",string]`) portée par l'objet issu de `queryOptions(...)`.
- **Correction** : ne PAS annoter `useQuery` quand on étale un `queryOptions(...)`. Laisser l'inférence faire, puis caster le résultat : `const profile = data as CreditProfile | undefined`.
- **Prévention** : avec `queryOptions`/options préfabriquées, on n'ajoute jamais de générique explicite sur `useQuery`. On type le `data` par cast en aval si besoin.

### 2026-06-14 — [expo] `Cannot assign to read-only property 'NONE'` (RN 0.81 New Architecture)
- **Symptôme** : crash au démarrage de bnpl-mobile / flights-mobile sur React Native 0.81 avec New Architecture activée. Message exact : `TypeError: Cannot assign to read-only property 'NONE' of object '#<Object>'`.
- **Contexte** : apps Expo sous New Arch (Hermes + JSI). Une bibliothèque tente d'écrire sur une propriété figée par le mode strict JSI.
- **Cause racine** : mutation d'un objet partagé en lecture seule exposé par JSI — incompatible avec les garanties d'immutabilité de New Arch.
- **Correction** : patch appliqué dans `apps/bnpl-mobile` et `apps/flights-mobile` (commit `152b567`).
- **Prévention** : toute lib qui écrit sur des objets JSI doit être vérifiée avant upgrade RN. Tester New Arch explicitement dans les pipelines CI mobile.

### 2026-06-14 — [expo] Metro ne bundle pas sous pnpm + Hermes (credit-mobile)
- **Symptôme** : `pnpm --filter credit-mobile start` échoue, Metro ne résout pas les modules du monorepo. Erreur de résolution Hermes.
- **Contexte** : credit-mobile, Expo SDK 54, pnpm workspaces.
- **Cause racine** : Metro ne remonte pas les `node_modules` hoistés par pnpm ; Hermes a besoin d'un `metro.config.js` qui déclare explicitement les répertoires du workspace.
- **Correction** : ajout / correction du `metro.config.js` avec `watchFolders` pointant vers la racine du monorepo (commit `f468ff5`).
- **Prévention** : tout nouveau projet Expo dans le monorepo doit inclure un `metro.config.js` avec `watchFolders: [path.resolve(__dirname, '../..')]`.

### 2026-06-14 — [expo] Incompatibilité Expo SDK 52 → 54 (credit-mobile)
- **Symptôme** : credit-mobile ne s'ouvre plus dans Expo Go après la montée de SDK.
- **Contexte** : Expo Go ne supporte qu'une version de SDK à la fois ; la version installée sur les devices était encore SDK 52.
- **Cause racine** : Expo Go sur les appareils de test n'avait pas été mis à jour avant la montée de SDK côté code.
- **Correction** : mise à jour Expo Go + ajustement des dépendances peer (commit `16c2ee2`).
- **Prévention** : avant toute montée de SDK Expo, vérifier la version Expo Go disponible sur les stores. Documenter la version cible dans le README de l'app mobile.

### 2026-06-13 — [build] `ERR_PNPM_IGNORED_BUILDS` : esbuild non construit (Vite ne démarre pas)
- **Symptôme** : `pnpm install` / `pnpm --filter` échoue (exit 1) avec `Ignored build scripts: esbuild`. Toute commande `pnpm run` bloque.
- **Cause racine** : pnpm v11 ne lance plus les scripts de build des dépendances par défaut, et ne lit plus le champ `pnpm` du `package.json`.
- **Correction** : autoriser le build dans `pnpm-workspace.yaml` → `allowBuilds:\n  esbuild: true`.
- **Prévention** : déclarer tout paquet à build natif (esbuild…) dans `pnpm-workspace.yaml`, pas dans `package.json`.

### 2026-06-13 — [build] Imports relatifs en `.js` non résolus par le bundler
- **Symptôme** : risque d'échec de bundling (Vite/Metro) sur `import "./x.js"` alors que le fichier est `x.ts`.
- **Cause racine** : la convention TS NodeNext (`.js` pointant vers `.ts`) n'est pas comprise par esbuild/Vite au runtime.
- **Correction** : imports relatifs **sans extension** dans les packages (`import "./x"`). Compatible `tsc` (Bundler), Vite ET Metro/Expo.
- **Prévention** : pas d'extension sur les imports relatifs inter-fichiers des packages partagés.

### 2026-06-13 — [auth] Connexion directe Postgres impossible (`db.<ref>.supabase.co` introuvable)
- **Symptôme** : `getaddrinfo ENOTFOUND db.<ref>.supabase.co` à l'application des migrations.
- **Cause racine** : les nouveaux projets Supabase n'exposent plus ce hostname direct (pooler IPv4, ou IPv6 only).
- **Correction** : migrations via **SQL Editor** ou **API de gestion** (PAT). Connexion directe : utiliser le **pooler** `aws-0-<région>.pooler.supabase.com`.
- **Prévention** : ne pas présumer du hostname direct.

### 2026-06-13 — [credit] Nouvel utilisateur refusé au BNPL (score par défaut trop bas)
- **Symptôme** : un compte fraîchement créé (score 500 par défaut en base) est systématiquement refusé (`score_too_low`).
- **Cause racine** : le défaut de colonne `credit_profiles.current_score` (500 = "poor") < seuil 580.
- **Correction** : le trigger `handle_new_user` (migration 0003) initialise le profil à **600** ("fair"), permettant un BNPL d'entrée de gamme (plafond 500 $).
- **Prévention** : le score de départ est une décision **produit** ; ne pas se fier au défaut de colonne.

<!-- Ex :
### 2026-06-20 — [expo] Build EAS échoue sur ...
- **Symptôme** : ...
- **Contexte** : ...
- **Cause racine** : ...
- **Correction** : ...
- **Prévention** : ...
-->
