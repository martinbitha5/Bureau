# credit-mobile (Expo)

App mobile « Mon score » — **réutilise les mêmes packages partagés** que le web
(`@sensei/auth`, `@sensei/api-client`, `@sensei/payments`, `@sensei/ui`…). Seule l'UI diffère
(React Native au lieu du DOM). C'est exactement l'intérêt du monorepo (cf. CLAUDE.md §3).

## Lancer (sur ta machine, avec un appareil/émulateur)
```bash
pnpm install                 # depuis la racine du monorepo
cp apps/credit-mobile/.env.example apps/credit-mobile/.env   # puis remplir
pnpm --filter credit-mobile start   # ou: cd apps/credit-mobile && pnpm start
```
Puis : scanner le QR code avec **Expo Go** (iOS/Android), ou `i` (simulateur iOS) / `a` (émulateur Android).

## Écrans
- `app/login.tsx` — connexion e-mail (auth partagée Supabase).
- `app/index.tsx` — score Sensei + jauge + historique des événements (sous RLS).

## Notes
- Session persistée via `@react-native-async-storage/async-storage`.
- Variables : `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Config Metro monorepo dans `metro.config.js` (watchFolders + nodeModulesPaths).
