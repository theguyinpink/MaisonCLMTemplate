"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type ImgRow = { id: string; url: string; position: number };

export function AdminImagesList({ templateId }: { templateId: string }) {
  const [images, setImages] = useState<ImgRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabaseBrowser
      .from("template_images")
      .select("id,url,position")
      .eq("template_id", templateId)
      .order("position", { ascending: true });

    if (error) return setMsg(error.message);
    setImages((data as any) ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  async function remove(id: string) {
    setMsg(null);
    const { error } = await supabaseBrowser.from("template_images").delete().eq("id", id);
    if (error) return setMsg(error.message);
    await load();
  }

  async function move(id: string, dir: -1 | 1) {
    setMsg(null);
    const idx = images.findIndex((i) => i.id === id);
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= images.length) return;

    const a = images[idx];
    const b = images[swapWith];

    // swap positions
    const { error: e1 } = await supabaseBrowser.from("template_images").update({ position: b.position }).eq("id", a.id);
    if (e1) return setMsg(e1.message);
    const { error: e2 } = await supabaseBrowser.from("template_images").update({ position: a.position }).eq("id", b.id);
    if (e2) return setMsg(e2.message);

    await load();
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Images</h3>
        <button
          onClick={load}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/70 hover:bg-black/5"
        >
          Rafraîchir
        </button>
      </div>

      {msg ? <p className="mt-3 text-sm text-black/70">{msg}</p> : null}

      {images.length === 0 ? (
        <p className="mt-4 text-sm text-black/60">Aucune image.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, idx) => (
            <div key={img.id} className="overflow-hidden rounded-3xl border border-black/5 bg-[#f7fbff]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-40 w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => move(img.id, -1)}
                    disabled={idx === 0}
                    className="rounded-xl border border-black/10 bg-white px-2 py-1 text-xs hover:bg-black/5 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(img.id, 1)}
                    disabled={idx === images.length - 1}
                    className="rounded-xl border border-black/10 bg-white px-2 py-1 text-xs hover:bg-black/5 disabled:opacity-40"
                  >
                    ↓
                  </button>
                </div>

                <button
                  onClick={() => remove(img.id)}
                  className="rounded-xl bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:opacity-90"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
