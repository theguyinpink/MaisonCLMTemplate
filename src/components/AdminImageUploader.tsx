"use client";

import { useState } from "react";
import { compressToWebp } from "@/lib/images/compress";
import { uploadPreviewImage } from "@/lib/supabase/upload";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function AdminImageUploader({ templateId, templateSlug }: { templateId: string; templateSlug: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMsg(null);

    try {
      // récupère dernière position existante
      const { data: existing } = await supabaseBrowser
        .from("template_images")
        .select("position")
        .eq("template_id", templateId)
        .order("position", { ascending: false })
        .limit(1);

      let pos = (existing?.[0]?.position ?? -1) + 1;

      for (const original of Array.from(files)) {
        const webp = await compressToWebp(original, 1600, 0.75);
        const url = await uploadPreviewImage(webp, templateSlug);

        const { error } = await supabaseBrowser.from("template_images").insert({
          template_id: templateId,
          url,
          position: pos,
        });

        if (error) throw new Error(error.message);
        pos++;
      }

      setMsg("Images ajoutées ✅");
    } catch (e: any) {
      setMsg(e?.message ?? "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Images (previews)</h3>
      <p className="mt-1 text-sm text-black/60">
        Upload compressé en WebP (léger). Idéalement 6 à 8 images max.
      </p>

      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#e0b5cb] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition">
        {busy ? "Upload..." : "Ajouter des images"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onPick(e.target.files)}
          disabled={busy}
        />
      </label>

      {msg ? <p className="mt-3 text-sm text-black/70">{msg}</p> : null}
    </div>
  );
}
