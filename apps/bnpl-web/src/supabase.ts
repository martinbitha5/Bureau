import { createBrowserClient } from "@sensei/database";

export const supabase = createBrowserClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
