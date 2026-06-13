# CLAUDE.md — Manuel d'instruction (Sensei Group)

> **Ceci est le premier fichier que je (Claude Code) lis à chaque session.** Sans lui, je repars
> de zéro. Il dit *comment travailler sur ce repo*. Le *quoi/pourquoi* est dans les autres docs.

---

## 0. Lecture obligatoire avant de coder

Avant toute tâche, je lis dans cet ordre :
1. **`CLAUDE.md`** (ce fichier) — comment travailler.
2. [`APP_SPEC.md`](docs/APP_SPEC.md) — quoi/pour qui/pourquoi.
3. [`DATA_DICTIONARY.md`](docs/DATA_DICTIONARY.md) — **avant tout schéma ou requête**. Source de vérité des noms de champs.
4. [`FEATURE_BACKLOG.md`](docs/FEATURE_BACKLOG.md) — est-ce dans la V1 ?
5. [`INTEGRATIONS.md`](docs/INTEGRATIONS.md) — avant de toucher à un service externe.
6. [`ERROR_LOG.md`](docs/ERROR_LOG.md) — **a-t-on déjà rencontré ce bug ?** Avant de débugger.
7. [`BRAND_BRIEF.md`](docs/BRAND_BRIEF.md) — avant tout travail visuel ou de copy.

---

## 1. Ce qu'est le projet (résumé)

**Sensei** = écosystème financier RDC, 3 produits liés en une boucle de données :
- `credit` — bureau de crédit (score + rapport), inspiration Equifax.
- `bnpl` — paiement échelonné, inspiration Affirm, alimenté par le score `credit`.
- `flights` — vente de billets multi-paiement (dont BNPL), inspiration Alternative Airlines.

Détails : [`APP_SPEC.md`](docs/APP_SPEC.md).

---

## 2. Stack technique

| Couche | Choix |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Web | TanStack Start / Router + TanStack Query, React, TypeScript |
| Mobile | **Expo** (React Native), TanStack Query, expo-router |
| Données / backend | **Supabase** — Postgres, Auth, Storage, Edge Functions, RLS |
| State serveur | **TanStack Query** partout (jamais de fetch brut dispersé) |
| Validation | Zod (schemas partagés dans `packages/types`) |
| i18n | FR (base), EN, Lingala (`ln`), Swahili (`sw`) |
| Langue du code | TypeScript strict partout |

---

## 3. Architecture du monorepo

```
sensei-group/
├── apps/
│   ├── credit-web/        credit-mobile/
│   ├── bnpl-web/          bnpl-mobile/
│   └── flights-web/       flights-mobile/
├── packages/
│   ├── ui/            # design system (tokens du BRAND_BRIEF), composants partagés
│   ├── auth/          # logique d'auth Supabase, sessions, gardes
│   ├── database/      # client Supabase typé, accès données, génération de types
│   ├── api-client/    # hooks TanStack Query (la SEULE façon d'appeler le backend)
│   ├── notifications/ # SMS / push / email
│   ├── payments/      # abstraction des moyens de paiement (mobile money, carte, bnpl)
│   ├── types/         # types & schémas Zod partagés (alignés sur DATA_DICTIONARY)
│   └── utils/         # helpers purs (argent, dates, i18n…)
├── supabase/
│   ├── migrations/    # toute évolution de schéma (jamais de modif manuelle en prod)
│   ├── functions/     # Edge Functions (décision BNPL, webhooks paiement…)
│   ├── policies/      # politiques RLS
│   └── seeds/         # données de démo
├── docs/              # les 7 documents de fondation
└── tools/             # scripts internes
```

> ⚠️ Note : pour l'instant les 7 docs vivent à la **racine de ce dossier de travail**. Quand le
> monorepo sera initialisé, ils seront déplacés dans `docs/` (sauf ce `CLAUDE.md`, qui reste à la racine).

### Règles d'architecture
- **Aucune app ne parle à Supabase directement.** Tout passe par `packages/api-client` (hooks
  TanStack Query) qui s'appuie sur `packages/database`.
- **Le code partagé vit dans `packages/`**, pas dupliqué dans les apps.
- **Web et mobile partagent la logique** (`api-client`, `auth`, `types`, `payments`) et divergent
  seulement sur l'UI (`ui` expose des primitives ; le rendu natif vs web peut différer).
- **`packages/types` est aligné mot pour mot sur `DATA_DICTIONARY.md`.**

---

## 4. Conventions de code

- **Nommage données** : strictement celui du [`DATA_DICTIONARY.md`](docs/DATA_DICTIONARY.md). Pas de synonyme.
- **Argent** : toujours entier `*_cents`, devise `USD`. Jamais de float. Helpers dans `packages/utils`.
- **Dates** : `timestamptz` UTC en base ; formatage à l'affichage seulement.
- **Pas de texte en dur** dans l'UI → clés i18n.
- **Pas de secret en dur** → variables d'environnement (voir `INTEGRATIONS.md`).
- **TypeScript strict**, pas de `any` non justifié.
- **Validation Zod** aux frontières (entrées API, formulaires, webhooks).
- Composants : petits, composables, testables. Logique métier hors des composants UI.

---

## 5. Données & sécurité (cœur du projet)

Sensei manipule de la donnée de crédit → la rigueur prime sur la vitesse.

- **RLS activé sur toutes les tables.** Une nouvelle table sans policy = bug.
- **Pas de donnée de crédit sans `consent` actif** (cf. dictionnaire §3, §4.4).
- **Tout accès à un score par un tiers est tracé** (`credit_inquiries` + `audit_logs`).
- **Score & rapport = append-only.** On empile des événements, on n'écrase jamais.
- **PII chiffrée au repos**, documents en Storage privé.
- Idempotence sur les webhooks de paiement (`provider_ref`).

---

## 6. Workflow Git & livraisons

- Pas de commit/push sans demande explicite de l'utilisateur.
- Jamais directement sur la branche par défaut : créer une branche d'abord.
- Messages de commit clairs, terminés par :
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- Une feature livrée = testée + dans le périmètre du backlog. Sinon on n'élargit pas le scope.

---

## 7. Boucle de travail attendue de Claude

1. Lire les docs pertinents (§0).
2. Vérifier que la tâche est dans le périmètre V1 ([`FEATURE_BACKLOG.md`](docs/FEATURE_BACKLOG.md)).
3. Vérifier les noms de champs ([`DATA_DICTIONARY.md`](docs/DATA_DICTIONARY.md)).
4. Vérifier le journal d'erreurs avant de débugger ([`ERROR_LOG.md`](docs/ERROR_LOG.md)).
5. Implémenter dans le bon package/app.
6. **Documenter tout nouveau bug résolu dans `ERROR_LOG.md`.**
7. Mettre à jour le dictionnaire si un champ est ajouté.

---

## 8. Commandes (à compléter une fois le repo initialisé)

```bash
pnpm install            # installer
pnpm dev                # lancer les apps en dev (Turborepo)
pnpm lint               # lint
pnpm typecheck          # vérif TypeScript
pnpm test               # tests
pnpm db:types           # générer les types depuis Supabase
supabase db push        # appliquer les migrations
```
> ⚠️ À remplacer par les commandes réelles dès que `package.json` / scripts existent.

---

## 9. Ce qu'il ne faut JAMAIS faire

- ❌ Inventer un nom de champ hors dictionnaire.
- ❌ Appeler Supabase hors de `api-client`.
- ❌ Stocker de l'argent en float.
- ❌ Exposer une donnée de crédit sans consentement + audit.
- ❌ Élargir le scope au-delà de la V1 sans validation.
- ❌ Mettre du texte en dur (pas d'i18n) ou un secret dans le code.
- ❌ Refaire un bug déjà listé dans `ERROR_LOG.md` sans le consulter.
