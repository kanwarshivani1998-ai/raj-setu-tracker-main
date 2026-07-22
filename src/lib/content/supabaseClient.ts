import { createClient } from "@supabase/supabase-js";

// .env (project root) me ye 2 values daalni hain:
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...
// Supabase project ke "Settings -> API" page se milengi.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY set nahi hai — online study content load nahi hoga."
  );
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
