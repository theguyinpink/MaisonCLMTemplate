"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function FavoriteButton({ templateId }: { templateId: string }) {
  const [loading, setLoading] = useState(true);
  const [favId, setFavId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabaseBrowser.auth.getUser();
      const user = data.user;
      if (!user) {
        setLoading(false);
        setFavId(null);
        return;
      }

      const { data: row } = await supabaseBrowser
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("template_id", templateId)
        .maybeSingle();

      if (!cancelled) {
        setFavId((row as any)?.id ?? null);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  async function toggle() {
    const { data } = await supabaseBrowser.auth.getUser();
    const user = data.user;

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    setLoading(true);

    if (favId) {
      await supabaseBrowser.from("favorites").delete().eq("id", favId);
      setFavId(null);
    } else {
      const { data: ins } = await supabaseBrowser
        .from("favorites")
        .insert({ user_id: user.id, template_id: templateId })
        .select("id")
        .single();
      setFavId((ins as any)?.id ?? null);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
        favId
          ? "border-transparent bg-[var(--accent)] text-white"
          : "border-[var(--border)] bg-white text-black/65 hover:bg-[var(--accent-soft)]"
      }`}
      aria-label="Ajouter aux favoris"
      title="Favori"
    >
      {favId ? "♥" : "♡"}
    </button>
  );
}
