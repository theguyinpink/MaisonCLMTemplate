import { createClient } from "@supabase/supabase-js";

export function supabaseServerPublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !anon) {
    throw new Error("Supabase env manquantes (PUBLIC)");
  }

  // Client serveur "stateless" : aucune gestion de cookies → pas de set cookie
  return createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
