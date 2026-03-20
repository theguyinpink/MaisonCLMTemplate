"use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabaseBrowser.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-full border border-red-200 px-6 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
    >
      Se déconnecter
    </button>
  );
}