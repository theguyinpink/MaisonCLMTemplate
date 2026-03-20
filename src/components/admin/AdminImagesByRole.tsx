"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { compressToWebp } from "@/lib/images/compress";
import { uploadPreviewImage } from "@/lib/supabase/upload";

type ImgRow = {
  id: string;
  url: string;
  role: string | null;
  position: number;
  is_thumbnail: boolean;
};

const ROLES: { key: string; label: string; isThumb?: boolean }[] = [
  { key: "home", label: "Homepage (miniature)", isThumb: true },
  { key: "shop", label: "Shop" },
  { key: "product", label: "Product" },
  { key: "cart", label: "Panier" },
  { key: "checkout", label: "Checkout" },
  { key: "contact", label: "Contact" },
  { key: "about", label: "À propos" },
  { key: "legal", label: "Mentions légales" },
  { key: "other1", label: "Autre 1" },
  { key: "other2", label: "Autre 2" },
];

export function AdminImagesByRole({
  templateId,
  templateSlug,
  maxTotal = 10,
}: {
  templateId: string;
  templateSlug: string;
  maxTotal?: number;
}) {
  const [images, setImages] = useState<ImgRow[]>([]);
  const [busyRole, setBusyRole] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const total = images.length;

  const byRole = useMemo(() => {
    const map = new Map<string, ImgRow>();
    for (const img of images) {
      const r = img.role ?? "";
      // si plusieurs pour un role, on garde la plus petite position
      if (!map.has(r) || img.position < (map.get(r)!.position ?? 999999)) {
        map.set(r, img);
      }
    }
    return map;
  }, [images]);

  async function load() {
    const { data, error } = await supabaseBrowser
      .from("template_images")
      .select("id,url,role,position,is_thumbnail")
      .eq("template_id", templateId)
      .order("position", { ascending: true });

    if (error) setMsg(error.message);
    setImages((data as any) ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  function nextPosition() {
    if (!images.length) return 0;
    return Math.max(...images.map((i) => i.position)) + 1;
  }

  async function setThumbnail(imageId: string) {
    // 1) tout à false
    const { error: e1 } = await supabaseBrowser
      .from("template_images")
      .update({ is_thumbnail: false })
      .eq("template_id", templateId);

    if (e1) throw new Error(e1.message);

    // 2) celle-ci à true + role=home
    const { error: e2 } = await supabaseBrowser
      .from("template_images")
      .update({ is_thumbnail: true, role: "home" })
      .eq("id", imageId);

    if (e2) throw new Error(e2.message);
  }

  async function uploadForRole(role: string, file: File) {
    setMsg(null);
    setBusyRole(role);

    try {
      // si rôle déjà rempli, on remplace (delete row + insert new)
      const existing = byRole.get(role);

      // limite totale (sauf si on remplace)
      if (!existing && total >= maxTotal) {
        throw new Error(`Limite atteinte (${maxTotal} images).`);
      }

      const webp = await compressToWebp(file, 1600, 0.75);
      const url = await uploadPreviewImage(webp, templateSlug);

      // si remplace : delete l'ancienne row (simple)
      if (existing) {
        const { error: delErr } = await supabaseBrowser
          .from("template_images")
          .delete()
          .eq("id", existing.id);
        if (delErr) throw new Error(delErr.message);
      }

      const pos = nextPosition();

      const { data: inserted, error: insErr } = await supabaseBrowser
        .from("template_images")
        .insert({
          template_id: templateId,
          url,
          role,
          position: pos,
          is_thumbnail: role === "home",
        })
        .select("id")
        .single();

      if (insErr) throw new Error(insErr.message);

      // Si role=home → s'assurer que c'est LA seule miniature
      if (role === "home" && inserted?.id) {
        await setThumbnail(inserted.id);
      }

      await load();
      setMsg("Image enregistrée ✅");
    } catch (e: any) {
      setMsg(e?.message ?? "Erreur upload");
    } finally {
      setBusyRole(null);
    }
  }

  async function removeRole(role: string) {
    setMsg(null);
    const existing = byRole.get(role);
    if (!existing) return;

    const { error } = await supabaseBrowser.from("template_images").delete().eq("id", existing.id);
    if (error) return setMsg(error.message);

    await load();
    setMsg("Image supprimée ✅");
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Images par page (max {maxTotal})</h3>
          <p className="mt-1 text-sm text-black/60">
            La miniature de la boutique = l’image <b>Homepage</b>.
          </p>
        </div>
        <span className="text-sm text-black/50">{total}/{maxTotal}</span>
      </div>

      {msg ? <p className="mt-3 text-sm text-black/70">{msg}</p> : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((r) => {
          const img = byRole.get(r.key);
          const busy = busyRole === r.key;

          return (
            <div key={r.key} className="rounded-3xl border border-black/5 bg-[#f7fbff] p-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <p className="text-sm font-semibold text-black/80">{r.label}</p>
                {r.isThumb ? (
                  <span className="rounded-full bg-[#f2cfe0] px-2 py-1 text-[11px] font-semibold text-black/70">
                    Miniature
                  </span>
                ) : null}
              </div>

              <div className="mt-2 overflow-hidden rounded-2xl border border-black/5 bg-white">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt="" className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 items-center justify-center text-sm text-black/40">
                    Pas d’image
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <label className="flex-1 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-[#e0b5cb] px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition">
                  {busy ? "..." : img ? "Remplacer" : "Ajouter"}
                  <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadForRole(r.key, f);
                    }}
                    disabled={busy}
                  />
                </label>

                <button
                  onClick={() => removeRole(r.key)}
                  disabled={!img || busy}
                  className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/80 hover:bg-black/5 disabled:opacity-40"
                >
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-xs text-black/45">
        Conseil : mets des screenshots “viewport desktop” (largeur ~1400–1600px) pour garder un storage léger.
      </p>
    </div>
  );
}
