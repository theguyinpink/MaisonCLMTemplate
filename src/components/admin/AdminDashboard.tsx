"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { AdminImageUploader } from "@/components/admin/AdminImageUploader";
import { AdminImagesByRole } from "@/components/admin/AdminImagesByRole";

type TemplateRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  long_description: string | null;
  price_label: string | null;
  category: string | null;
  tags: string[];
  is_published: boolean;
  created_at: string;
};

export function AdminDashboard() {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [view, setView] = useState<"edit" | "new">("new");

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId],
  );

  async function load() {
    const { data, error } = await supabaseBrowser
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return setMsg(error.message);
    setTemplates((data as any) ?? []);
    if (view === "edit" && !selectedId && data?.[0]?.id) {
      setSelectedId(data[0].id);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function togglePublish(t: TemplateRow) {
    setMsg(null);

    const next = !t.is_published;
    const { error } = await supabaseBrowser
      .from("templates")
      .update({ is_published: next })
      .eq("id", t.id);

    if (error) return setMsg(error.message);

    await load();

    if (next) {
      setSelectedId(null);
      setView("new");
      setMsg("Publié ✅");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setMsg("Dépublié ✅");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="mt-1 text-sm text-black/60">
            Ajoute tes templates, gère les images (Storage), publie/dépublie.
          </p>
        </div>

        <button
          onClick={() =>
            supabaseBrowser.auth
              .signOut()
              .then(() => (window.location.href = "/shop"))
          }
          className="w-fit rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/80 hover:bg-black/5 transition"
        >
          Se déconnecter
        </button>
      </div>

      {msg ? (
        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-4 shadow-sm text-sm text-black/70">
          {msg}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Templates</h2>
            <button
              onClick={() => {
                setSelectedId(null);
                setView("new");
              }}
              className="rounded-xl bg-[#e0b5cb] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              + Nouveau
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedId(t.id);
                  setView("edit");
                }}
                className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                  selectedId === t.id
                    ? "border-[#e0b5cb] bg-[#f7fbff]"
                    : "border-black/10 hover:bg-black/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{t.title}</p>
                    <p className="text-xs text-black/50 mt-1">{t.slug}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      t.is_published
                        ? "bg-green-100 text-green-700"
                        : "bg-black/5 text-black/60"
                    }`}
                  >
                    {t.is_published ? "Publié" : "Brouillon"}
                  </span>
                </div>
              </button>
            ))}
            {templates.length === 0 ? (
              <p className="text-sm text-black/60">Aucun template.</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <AdminTemplateForm
            existing={selected}
            onSaved={async (id) => {
              await load();
              setSelectedId(id);
              setMsg("Enregistré ✅");
            }}
          />

          {selected ? (
            <>
              <AdminImagesByRole
                templateId={selected.id}
                templateSlug={selected.slug}
                maxTotal={10}
              />

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => togglePublish(selected)}
                  className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  {selected.is_published ? "Dépublier" : "Publier"}
                </button>

                <a
                  href={`/product/${encodeURIComponent(selected.slug)}`}
                  target="_blank"
                  className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black/80 hover:bg-black/5 transition"
                >
                  Voir la fiche →
                </a>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function AdminTemplateForm({
  existing,
  onSaved,
}: {
  existing: TemplateRow | null;
  onSaved: (id: string) => void;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const finalSlug = slugify(slug || title);
  const [shortDesc, setShortDesc] = useState(existing?.short_description ?? "");
  const [longDesc, setLongDesc] = useState(existing?.long_description ?? "");
  const [priceLabel, setPriceLabel] = useState(existing?.price_label ?? "");
  const [category, setCategory] = useState(existing?.category ?? "");
  const [tags, setTags] = useState((existing?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setTitle(existing?.title ?? "");
    setSlug(existing?.slug ?? "");
    setShortDesc(existing?.short_description ?? "");
    setLongDesc(existing?.long_description ?? "");
    setPriceLabel(existing?.price_label ?? "");
    setCategory(existing?.category ?? "");
    setTags((existing?.tags ?? []).join(", "));
    setMsg(null);
  }, [existing?.id]);

  async function save() {
    setMsg(null);
    setSaving(true);

    try {
      const finalSlug = (slug || slugify(title)).trim();
      if (!title.trim()) throw new Error("Titre obligatoire");
      if (!finalSlug) throw new Error("Slug invalide");
      if (!shortDesc.trim()) throw new Error("Description courte obligatoire");

      const payload = {
        title: title.trim(),
        slug: finalSlug,
        short_description: shortDesc.trim(),
        long_description: longDesc?.trim() || null,
        price_label: priceLabel?.trim() || null,
        category: category?.trim() || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (existing) {
        const { error } = await supabaseBrowser
          .from("templates")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
        onSaved(existing.id);
      } else {
        const { data, error } = await supabaseBrowser
          .from("templates")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        onSaved(data!.id);
      }
    } catch (e: any) {
      setMsg(e?.message ?? "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        {existing ? "Modifier le template" : "Nouveau template"}
      </h2>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field
          label="Titre"
          value={title}
          onChange={setTitle}
          placeholder="Ex: Portfolio Minimal"
        />
        <Field
          label="Slug"
          value={slug}
          onChange={setSlug}
          placeholder="auto si vide"
        />

        <Field
          label="Prix (label)"
          value={priceLabel}
          onChange={setPriceLabel}
          placeholder="Ex: 49€"
        />
        <Field
          label="Catégorie"
          value={category}
          onChange={setCategory}
          placeholder="Ex: Portfolio"
        />
      </div>

      <div className="mt-3">
        <Field
          label="Tags (séparés par ,)"
          value={tags}
          onChange={setTags}
          placeholder="ex: minimal, pink, pro"
        />
      </div>

      <div className="mt-3 grid gap-3">
        <Textarea
          label="Description courte"
          value={shortDesc}
          onChange={setShortDesc}
          rows={3}
        />
        <Textarea
          label="Description longue"
          value={longDesc ?? ""}
          onChange={setLongDesc}
          rows={5}
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-4 w-full rounded-2xl bg-[#e0b5cb] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>

      {msg ? <p className="mt-3 text-sm text-black/70">{msg}</p> : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-black/60">{label}</label>
      <input
        className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-black/60">{label}</label>
      <textarea
        className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
    </div>
  );
}
