# Sensei Group

Écosystème de crédit grand public pour la RDC — **une seule boucle de données** :

```
[ credit ]  ──score──►  [ bnpl ]  ──finance──►  [ flights ]
    ▲                                                │
    └────────── comportement de remboursement ───────┘
```

- **`credit`** — bureau de crédit (score + rapport), inspiration Equifax.
- **`bnpl`** — paiement échelonné, inspiration Affirm, alimenté par le score.
- **`flights`** — vente de billets multi-paiement (dont BNPL), 1er cas d'usage.

## Démarrer ici
1. **[CLAUDE.md](CLAUDE.md)** — manuel de travail (à lire en premier).
2. **[docs/](docs/)** — les 7 documents de fondation (spec, brand, dictionnaire, backlog, intégrations, journal d'erreurs).

## Stack
Monorepo Turborepo + pnpm · TanStack (Query/Router/Start) · Expo (mobile) · Supabase (Postgres + Auth + RLS + Edge Functions) · TypeScript strict.

## Structure
```
apps/        # credit-* / bnpl-* / flights-* (web + mobile) — ajoutées au fil de la V1
packages/    # ui, auth, database, api-client, notifications, payments, types, utils
supabase/    # migrations, functions, policies, seeds
docs/        # documents de fondation
tools/       # scripts internes
```

## Commandes
```bash
pnpm install        # installer le monorepo
pnpm typecheck      # vérifier les types (tous les packages)
pnpm dev            # lancer les apps en dev
pnpm db:start       # Supabase local (Docker requis)
pnpm db:reset       # appliquer migrations + seed en local
pnpm db:types       # générer les types TS depuis le schéma
```

## État actuel
✅ Fondation : docs, packages (`types`, `utils`, `database`, `api-client`, `auth`, `payments`,
`notifications`, `ui`), schéma Supabase complet (`migrations/0001_init.sql`) + RLS (`0002_rls.sql`).
✅ **Migrations appliquées** sur le projet cloud Supabase (20 tables + RLS vérifiées).
✅ **Boucle V1 prouvée** de bout en bout contre la base cloud (`tools/demo-loop.mjs`) :
profil crédit → vol → décision BNPL → échéancier → réservation → paiement → **le score bouge**.
✅ Moteur de décision BNPL pur (`@sensei/payments`), provider vols mocké + checkout + hooks
(`@sensei/api-client`), Edge Function `bnpl-decision` (à déployer).
✅ **`apps/flights-web`** (Vite + React + TanStack Router/Query) : recherche de vols → offres
→ checkout avec **échéancier BNPL en direct** (3×/4×, sans frais), multilingue FR/EN, design
institutionnel. Typecheck + build de production OK.
✅ **Auth e-mail** (OTP téléphone prêt) + **persistance réelle du checkout** sous RLS : trigger de
bootstrap de profil, politiques d'écriture, score réel à la décision. Prouvé E2E (navigateur + DB).
✅ **Edge Function `bnpl-decision` déployée** (ACTIVE) et testée.
🔜 Prochaine étape : `credit-web` (« Mon score ») et le mobile Expo.

> Devise V1 : **USD**. Langues : FR (base), EN, Lingala, Swahili. Ton : confiance institutionnelle.
