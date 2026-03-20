import Link from "next/link";
import { supabaseServerPublic } from "@/lib/supabase/public";
import { FavoriteButton } from "@/components/FavoriteButton";

type TemplateRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  category: string | null;
  tags: string[] | null;
};

type ImageRow = {
  template_id: string;
  url: string;
  position: number;
  is_thumbnail: boolean;
  role: string | null;
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category ? normalize(sp.category) : "all";
  const q = sp.q ? sp.q.trim() : "";
  const sort = sp.sort ? normalize(sp.sort) : "new";

  const supabase = supabaseServerPublic();

  let query = supabase
    .from("templates")
    .select("id, slug, title, short_description, category, tags")
    .eq("is_published", true);

  if (category !== "all") {
    query = query.ilike("category", category);
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,short_description.ilike.%${q}%`);
  }

  if (sort === "title") {
    query = query.order("title", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: templates, error: tErr } = await query;

  if (tErr) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <p className="text-slate-600">Erreur boutique : {tErr.message}</p>
        </Card>
      </main>
    );
  }

  const list = (templates ?? []) as TemplateRow[];

  const ids = list.map((t) => t.id);
  const thumbsById = new Map<string, string>();

  if (ids.length) {
    const { data: imgs } = await supabase
      .from("template_images")
      .select("template_id, url, position, is_thumbnail, role")
      .in("template_id", ids);

    const images = (imgs ?? []) as ImageRow[];

    const grouped = new Map<string, ImageRow[]>();

    for (const im of images) {
      if (!grouped.has(im.template_id)) grouped.set(im.template_id, []);
      grouped.get(im.template_id)!.push(im);
    }

    for (const [tid, arr] of grouped.entries()) {
      const sorted = [...arr].sort((a, b) => {
        const aScore =
          (a.is_thumbnail ? 100 : 0) + (a.role === "home" ? 50 : 0);
        const bScore =
          (b.is_thumbnail ? 100 : 0) + (b.role === "home" ? 50 : 0);
        if (aScore !== bScore) return bScore - aScore;
        return (a.position ?? 0) - (b.position ?? 0);
      });

      if (sorted[0]?.url) thumbsById.set(tid, sorted[0].url);
    }
  }

  const categories = uniq(
    list
      .map((t) => t.category || "Autre")
      .map((c) => c.trim())
      .filter(Boolean),
  );

  const activeChip = "border-[#e8d4df] bg-[#f8edf2] text-[#b8618e]";
  const idleChip =
    "border-[#eadfe5] bg-white text-slate-600 hover:bg-[#fcf6f9]";

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* HERO */}
      <section className="rounded-[34px] border border-[#eddce4] bg-[linear-gradient(135deg,rgba(248,238,243,0.95)_0%,rgba(255,255,255,0.96)_45%,rgba(252,244,248,0.95)_100%)] px-6 py-10 shadow-[0_20px_60px_rgba(20,20,43,0.05)] sm:px-10 sm:py-14">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.28em] text-[#d86aa2]">
            Bibliothèque Maison CLM
          </p>

          <h1
            className="mt-4 text-4xl leading-tight text-slate-900 sm:text-5xl"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Des templates sobres, élégants et prêts à personnaliser
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Explore une sélection de bases premium pensées pour aller vite,
            garder une vraie cohérence visuelle et construire un site propre
            sans partir de zéro.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <StatPill>
              {list.length} template{list.length > 1 ? "s" : ""}
            </StatPill>
            <StatPill>Responsive</StatPill>
            <StatPill>Élégant</StatPill>
            <StatPill>Personnalisable</StatPill>
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="mt-8 rounded-[28px] border border-[#ecdfe5] bg-white p-5 shadow-sm sm:p-6">
        <form className="flex flex-col gap-3 lg:flex-row">
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher un template..."
            className="w-full rounded-2xl border border-[#eadfe5] bg-[#fcfafb] px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#dfbfd0]"
          />

          <select
            name="sort"
            defaultValue={sort}
            className="w-full rounded-2xl border border-[#eadfe5] bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#dfbfd0] lg:w-48"
          >
            <option value="new">Nouveautés</option>
            <option value="title">A-Z</option>
          </select>

          {category !== "all" ? (
            <input type="hidden" name="category" value={category} />
          ) : null}

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-[#0f172a] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Rechercher
          </button>
        </form>
      </section>

      {/* FILTERS */}
      <section className="mt-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildUrl({ category: "all", q, sort })}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              category === "all" ? activeChip : idleChip
            }`}
          >
            Tous
          </Link>

          {categories.map((c) => {
            const key = normalize(c);
            const isActive = category === key;

            return (
              <Link
                key={c}
                href={buildUrl({ category: key, q, sort })}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive ? activeChip : idleChip
                }`}
              >
                {c}
              </Link>
            );
          })}
        </div>
      </section>

      {/* GRID */}
      <section className="mt-8">
        {list.length === 0 ? (
          <Card>
            <p className="text-slate-600">
              Aucun template trouvé pour cette recherche.
            </p>

            <Link
              href={buildUrl({ category: "all", q: "", sort: "new" })}
              className="mt-4 inline-flex rounded-full border border-[#eadfe5] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
            >
              Réinitialiser
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((t) => {
              const thumb = thumbsById.get(t.id) || null;

              return (
                <article
                  key={t.id}
                  className="group overflow-hidden rounded-[30px] border border-[#ecdfe5] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.08)]"
                >
                  <div className="relative">
                    <div className="absolute right-4 top-4 z-20">
                      <FavoriteButton templateId={t.id} />
                    </div>

                    <Link href={`/shop/${t.slug}`} className="block">
                      <div className="relative aspect-[16/11] border-b border-[#f2e8ed] bg-[#fbf8fa]">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt={t.title}
                            className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.01]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                            Aucune image
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap gap-2">
                      {t.category ? (
                        <span className="rounded-full border border-[#eadfe5] bg-[#fcf6f9] px-3 py-1 text-xs font-medium text-[#b8618e]">
                          {t.category}
                        </span>
                      ) : null}

                      {t.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#ece7ea] bg-white px-3 py-1 text-xs text-slate-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link href={`/shop/${t.slug}`} className="block">
                      <h2
                        className="mt-4 text-2xl leading-snug text-slate-900"
                        style={{ fontFamily: '"Playfair Display", serif' }}
                      >
                        {t.title}
                      </h2>

                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                        {t.short_description}
                      </p>

                      <div className="mt-5 inline-flex items-center text-sm font-medium text-[#d86aa2]">
                        Voir le template
                      </div>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mt-12">
        <div className="rounded-[32px] border border-[#eadbe3] bg-[#0f172a] px-6 py-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:px-8 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2
                className="text-3xl"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Besoin d’un rendu encore plus personnalisé ?
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/75 sm:text-base">
                Tu peux partir d’une base existante puis l’adapter à ton
                activité, ton univers et ton contenu, tout en gardant une
                structure propre.
              </p>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full bg-[#f3d7e4] px-6 py-3 text-sm font-medium text-[#8f436a] transition hover:opacity-90"
            >
              Voir la Formule Studio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function buildUrl({
  category,
  q,
  sort,
}: {
  category: string;
  q: string;
  sort: string;
}) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (q) params.set("q", q);
  if (sort && sort !== "new") params.set("sort", sort);

  const s = params.toString();
  return s ? `/shop?${s}` : "/shop";
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[#ecdfe5] bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

function StatPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#eadfe5] bg-white/90 px-3 py-1 text-xs text-slate-600">
      {children}
    </span>
  );
}
