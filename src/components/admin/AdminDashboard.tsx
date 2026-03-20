"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { AdminImagesByRole } from "@/components/admin/AdminImagesByRole";

type TemplateRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  long_description: string | null;
  price_amount: number | null;
  category: string | null;
  tags: string[];
  is_published: boolean;
  created_at: string;
};

type TemplateFilePath = "index.html" | "style.css" | "main.js";

export function AdminDashboard() {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [view, setView] = useState<"edit" | "new">("new");

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId]
  );

  async function load() {
    const { data, error } = await supabaseBrowser
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMsg(error.message);
      return;
    }

    setTemplates((data as TemplateRow[]) ?? []);

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

    if (error) {
      setMsg(error.message);
      return;
    }

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
            Ajoute tes templates, gère les images, le code, puis publie/dépublie.
          </p>
        </div>

        <button
          onClick={() =>
            supabaseBrowser.auth
              .signOut()
              .then(() => (window.location.href = "/shop"))
          }
          className="w-fit rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/80 transition hover:bg-black/5"
        >
          Se déconnecter
        </button>
      </div>

      {msg ? (
        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-4 text-sm text-black/70 shadow-sm">
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
                    <p className="mt-1 text-xs text-black/50">{t.slug}</p>
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
              setView("edit");
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
                  className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {selected.is_published ? "Dépublier" : "Publier"}
                </button>

                <a
                  href={`/shop/${encodeURIComponent(selected.slug)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black/80 transition hover:bg-black/5"
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
  const [shortDesc, setShortDesc] = useState(existing?.short_description ?? "");
  const [longDesc, setLongDesc] = useState(existing?.long_description ?? "");
  const [priceAmount, setPriceAmount] = useState(
    existing?.price_amount?.toString() ?? ""
  );
  const [category, setCategory] = useState(existing?.category ?? "");
  const [tags, setTags] = useState((existing?.tags ?? []).join(", "));

  const [htmlCode, setHtmlCode] = useState(defaultHtmlTemplate());
  const [cssCode, setCssCode] = useState(defaultCssTemplate());
  const [jsCode, setJsCode] = useState(defaultJsTemplate());

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    setTitle(existing?.title ?? "");
    setSlug(existing?.slug ?? "");
    setShortDesc(existing?.short_description ?? "");
    setLongDesc(existing?.long_description ?? "");
    setPriceAmount(existing?.price_amount?.toString() ?? "");
    setCategory(existing?.category ?? "");
    setTags((existing?.tags ?? []).join(", "));
    setMsg(null);

    if (!existing) {
      setHtmlCode(defaultHtmlTemplate());
      setCssCode(defaultCssTemplate());
      setJsCode(defaultJsTemplate());
      return;
    }

    void loadTemplateFiles(existing.id);
  }, [existing?.id]);

  async function loadTemplateFiles(templateId: string) {
    setLoadingFiles(true);

    const { data, error } = await supabaseBrowser
      .from("template_files")
      .select("path, content")
      .eq("template_id", templateId);

    if (error) {
      setMsg(error.message);
      setLoadingFiles(false);
      return;
    }

    const files = data ?? [];

    const html = files.find((f) => f.path === "index.html")?.content;
    const css = files.find((f) => f.path === "style.css")?.content;
    const js = files.find((f) => f.path === "main.js")?.content;

    setHtmlCode(html || defaultHtmlTemplate());
    setCssCode(css || defaultCssTemplate());
    setJsCode(js || defaultJsTemplate());
    setLoadingFiles(false);
  }

  async function saveTemplateFile(params: {
    templateId: string;
    path: TemplateFilePath;
    content: string;
  }) {
    const { templateId, path, content } = params;

    const { data: existingFile, error: findError } = await supabaseBrowser
      .from("template_files")
      .select("id")
      .eq("template_id", templateId)
      .eq("path", path)
      .maybeSingle();

    if (findError) {
      throw new Error(findError.message);
    }

    if (existingFile?.id) {
      const { error: updateError } = await supabaseBrowser
        .from("template_files")
        .update({
          content,
        })
        .eq("id", existingFile.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return;
    }

    const { error: insertError } = await supabaseBrowser
      .from("template_files")
      .insert({
        template_id: templateId,
        path,
        content,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  async function save() {
    setMsg(null);
    setSaving(true);

    try {
      const computedSlug = (slug || slugify(title)).trim();

      if (!title.trim()) throw new Error("Titre obligatoire");
      if (!computedSlug) throw new Error("Slug invalide");
      if (!shortDesc.trim()) throw new Error("Description courte obligatoire");

      const parsedPrice =
        priceAmount.trim() === "" ? null : Number(priceAmount.replace(",", "."));

      if (parsedPrice !== null && Number.isNaN(parsedPrice)) {
        throw new Error("Le prix doit être un nombre valide");
      }

      const payload = {
        title: title.trim(),
        slug: computedSlug,
        short_description: shortDesc.trim(),
        long_description: longDesc?.trim() || null,
        price_amount: parsedPrice,
        category: category?.trim() || null,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      let templateId: string;

      if (existing) {
        const { error } = await supabaseBrowser
          .from("templates")
          .update(payload)
          .eq("id", existing.id);

        if (error) throw new Error(error.message);
        templateId = existing.id;
      } else {
        const { data, error } = await supabaseBrowser
          .from("templates")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw new Error(error.message);
        templateId = data.id;
      }

      await Promise.all([
        saveTemplateFile({
          templateId,
          path: "index.html",
          content: htmlCode,
        }),
        saveTemplateFile({
          templateId,
          path: "style.css",
          content: cssCode,
        }),
        saveTemplateFile({
          templateId,
          path: "main.js",
          content: jsCode,
        }),
      ]);

      onSaved(templateId);
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
          label="Prix (€)"
          value={priceAmount}
          onChange={setPriceAmount}
          placeholder="Ex: 29.99"
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

      <div className="mt-8 space-y-5">
        <h3 className="text-base font-semibold text-black/80">Code du template</h3>

        {loadingFiles ? (
          <p className="text-sm text-black/60">Chargement des fichiers...</p>
        ) : null}

        <CodeEditor
          label="index.html"
          value={htmlCode}
          onChange={setHtmlCode}
          rows={16}
        />

        <CodeEditor
          label="style.css"
          value={cssCode}
          onChange={setCssCode}
          rows={16}
        />

        <CodeEditor
          label="main.js"
          value={jsCode}
          onChange={setJsCode}
          rows={14}
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-6 w-full rounded-2xl bg-[#e0b5cb] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
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

function CodeEditor({
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
        spellCheck={false}
        className="mt-2 min-h-[180px] w-full rounded-2xl border border-black/10 bg-[#0f172a] px-4 py-3 font-mono text-sm text-white outline-none focus:border-black/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
    </div>
  );
}

function defaultHtmlTemplate() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mon template</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main>
    <h1>Bonjour Maison CLM</h1>
    <p>Commence ici ton template.</p>
  </main>

  <script src="main.js"></script>
</body>
</html>`;
}

function defaultCssTemplate() {
  return `:root {
  --bg: #ffffff;
  --text: #111827;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
}

main {
  padding: 40px;
}`;
}

function defaultJsTemplate() {
  return `document.addEventListener("DOMContentLoaded", () => {
  console.log("Template prêt 🚀");
});`;
}