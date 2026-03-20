import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-black/70">Connecte-toi pour accéder à l’admin.</p>
        <Link className="mt-4 inline-block rounded-2xl bg-black px-4 py-2 text-white" href="/auth">
          Aller à la connexion
        </Link>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-black/70">Accès refusé.</p>
        <Link className="mt-4 inline-block rounded-2xl border border-black/10 px-4 py-2" href="/shop">
          Retour boutique
        </Link>
      </main>
    );
  }

  return <AdminDashboard />;
}
