import { createBrowserClient } from "@sensei/database";

/** Client Supabase unique de l'app (clé anon + RLS). */
export const supabase = createBrowserClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
