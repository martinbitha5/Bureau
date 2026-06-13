# 07 — Error Log (Sensei Group)

> **But du document.** Chaque bug documenté **une fois**, pour éviter que l'IA (et l'équipe)
> refasse la même erreur en boucle. Quand tu codes sans documentation, tu improvises. Quand tu
> codes avec un système, tu construis.

- **Version** : 0.1
- **Dernière mise à jour** : 2026-06-13

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
