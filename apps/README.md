# apps/

Les applications de l'écosystème. **Créées au fur et à mesure de la tranche verticale V1**, pas
toutes d'un coup (cf. docs/FEATURE_BACKLOG.md).

Structure cible :

```
apps/
├── credit-web/      credit-mobile/     # bureau de crédit (web TanStack / mobile Expo)
├── bnpl-web/        bnpl-mobile/       # paiement échelonné
└── flights-web/     flights-mobile/    # vente de billets (1er produit construit)
```

Chaque app consomme les `packages/` partagés et n'appelle **jamais** Supabase en direct
(toujours via `@sensei/api-client`). Voir CLAUDE.md §3.
