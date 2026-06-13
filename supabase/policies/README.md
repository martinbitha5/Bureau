# supabase/policies

> **Important.** Les politiques RLS réellement **appliquées** vivent dans une migration
> (`supabase/migrations/0002_rls.sql`) car la CLI Supabase n'exécute que `migrations/`.

Ce dossier sert de **référence organisationnelle** : ici on documente l'intention des
politiques, les cas limites, et les décisions d'accès (qui voit quoi, pourquoi).

## Principes (docs/CLAUDE.md §5)
- RLS activée sur **toutes** les tables. Une table sans policy = bug.
- Le **consumer** ne voit que **ses** données (`app_user_id()`).
- L'accès B2B au score (`lenders`) passe **uniquement** par une Edge Function en
  `service_role` qui vérifie un `consent` actif et écrit un `audit_log` + une `credit_inquiry`.
- `lenders`, `merchants`, `audit_logs` : aucune politique consumer → invisibles côté client (voulu).

## Quand on ajoute une table
1. La déclarer dans une migration `migrations/`.
2. Ajouter `enable row level security` + au moins une policy dans la même PR.
3. Documenter ici l'intention si l'accès n'est pas trivial.
