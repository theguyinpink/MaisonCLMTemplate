import Link from "next/link";
import type { ReactNode } from "react";
import { supabaseServerPublic } from "@/lib/supabase/public";
import { FavoriteButton } from "@/components/FavoriteButton";

type TemplateRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  category: string | null;
  tags: string[] | null;
  price_amount: number | null;
  currency: string | null;
};

type CategoryRow = {
  category: string | null;
};

type ImageRow = {
  template_id: string;
  url: string;
  position: number;
  is_thumbnail: boolean;
  role: string | null;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function formatPrice(template: Pick<TemplateRow, "price_amount" | "currency">) {
  if (typeof template.price_amount === "number") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: (template.currency || "EUR").toUpperCase(),
    }).format(template.price_amount);
  }

  return "Prix sur demande";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  const sp = await searchParams;
  const category = sp.category ? normalize(sp.category) : "all";
  const q = sp.q ? sp.q.trim() : "";
  const sort = sp.sort ? normalize(sp.sort) : "new";

  const supabase = supabaseServerPublic();

  const { data: categoryRows } = await supabase
    .from("templates")
    .select("category")
    .eq("is_published", true);

  let query = supabase
    .from("templates")
    .select(
      "id, slug, title, short_description, category, tags, price_amount, currency",
    )
    .eq("is_published", true);

  if (category !== "all") {
    query = query.ilike("category", category);
  }

  if (q) {
    query = query.or(`title.ilike.%${q}%,short_description.ilike.%${q}%`);
  }

  if (sort === "title") {
    query = query.order("title", { ascending: true });
  } else if (sort === "price-asc") {
    query = query.order("price_amount", { ascending: true, nullsFirst: false });
  } else if (sort === "price-desc") {
    query = query.order("price_amount", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: templates, error: tErr } = await query;

  if (tErr) {
    return (
      <main className="mx-auto w-full max-w-[1400px] px-6 py-12 sm:px-8 lg:px-10">
        <Card>
          <p className="text-slate-600">Erreur boutique : {tErr.message}</p>
        </Card>
      </main>
    );
  }

  const list = (templates ?? []) as TemplateRow[];
  const allCategories = uniq(
    ((categoryRows ?? []) as CategoryRow[])
      .map((row) => row.category || "Autre")
      .map((value) => value.trim())
      .filter(Boolean),
  );

  const ids = list.map((t) => t.id);
  const thumbsById = new Map<string, string>();

  if (ids.length) {
    const { data: imgs } = await supabase
      .from("template_images")
      .select("template_id, url, position, is_thumbnail, role")
      .in("template_id", ids);

    const images = (imgs ?? []) as ImageRow[];
    const grouped = new Map<string, ImageRow[]>();

    for (const image of images) {
      const current = grouped.get(image.template_id) ?? [];
      current.push(image);
      grouped.set(image.template_id, current);
    }

    for (const [templateId, arr] of grouped.entries()) {
      const sorted = [...arr].sort((a, b) => {
        const aScore =
          (a.is_thumbnail ? 100 : 0) + (a.role === "home" ? 50 : 0);
        const bScore =
          (b.is_thumbnail ? 100 : 0) + (b.role === "home" ? 50 : 0);

        if (aScore !== bScore) return bScore - aScore;
        return (a.position ?? 0) - (b.position ?? 0);
      });

      if (sorted[0]?.url) {
        thumbsById.set(templateId, sorted[0].url);
      }
    }
  }

  const hasFilters = category !== "all" || !!q || sort !== "new";
  const activeChip = "border-[#e8d4df] bg-[#f8edf2] text-[#b8618e]";
  const idleChip =
    "border-[#eadfe5] bg-white text-slate-600 hover:bg-[#fcf6f9]";

  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 py-12 sm:px-8 lg:px-10">
      <section className="overflow-hidden rounded-[36px] border border-[#eddce4] bg-[linear-gradient(135deg,rgba(248,238,243,0.96)_0%,rgba(255,255,255,0.99)_45%,rgba(252,244,248,0.96)_100%)] px-6 py-10 shadow-[0_24px_70px_rgba(20,20,43,0.06)] sm:px-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-[#edcfe0] bg-white/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-[#c06293]">
              Bibliothèque Maison CLM
            </span>

            <h1
              className="mt-5 text-4xl leading-tight text-slate-900 sm:text-5xl lg:text-[3.6rem]"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Des templates pensés pour aller plus vite,
              <span className="mt-2 block text-[#d86aa2]">
                sans perdre en image ni en crédibilité
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Explore des bases premium, sobres et prêtes à personnaliser pour
              lancer un site plus propre, plus cohérent et plus désirable dès les
              premières secondes.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <StatPill>
                {list.length} template{list.length > 1 ? "s" : ""}
              </StatPill>
              <StatPill>Responsive</StatPill>
              <StatPill>Guides inclus</StatPill>
              <StatPill>Paiement sécurisé</StatPill>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl bg-[#0f172a] px-6 py-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                Voir les formules
              </Link>

              <Link
                href="https://maisonclm.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-[#eadfe5] bg-white px-6 py-4 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
              >
                Besoin d’un site sur mesure ?
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <MiniStat value="Premium" label="direction" />
            <MiniStat value="Clair" label="parcours" />
            <MiniStat value="Rapide" label="mise en ligne" />
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[30px] border border-[#ecdfe5] bg-white p-5 shadow-sm sm:p-6">
        <form className="grid gap-3 lg:grid-cols-[1fr_220px_160px]">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              Rechercher
            </label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Nom, style, ambiance..."
              className="w-full rounded-2xl border border-[#eadfe5] bg-[#fcfafb] px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#dfbfd0]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              Trier
            </label>
            <select
              name="sort"
              defaultValue={sort}
              className="w-full rounded-2xl border border-[#eadfe5] bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#dfbfd0]"
            >
              <option value="new">Nouveautés</option>
              <option value="title">A-Z</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-[0.22em] text-transparent">
              Action
            </label>

            {category !== "all" ? (
              <input type="hidden" name="category" value={category} />
            ) : null}

            <button
              type="submit"
              className="inline-flex h-[50px] items-center justify-center rounded-2xl bg-[#0f172a] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Afficher les résultats
            </button>
          </div>
        </form>

        <div className="mt-5 flex flex-col gap-3 border-t border-[#f2e8ed] pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              href={buildUrl({ category: "all", q, sort })}
              active={category === "all"}
              activeChip={activeChip}
              idleChip={idleChip}
            >
              Tous
            </FilterChip>

            {allCategories.map((c) => {
              const key = normalize(c);

              return (
                <FilterChip
                  key={c}
                  href={buildUrl({ category: key, q, sort })}
                  active={category === key}
                  activeChip={activeChip}
                  idleChip={idleChip}
                >
                  {c}
                </FilterChip>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>
              {list.length} résultat{list.length > 1 ? "s" : ""}
            </span>

            {hasFilters ? (
              <Link
                href="/shop"
                className="inline-flex items-center rounded-full border border-[#eadfe5] px-4 py-2 font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
              >
                Réinitialiser
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[24px] border border-[#ecdfe5] bg-[#fffafd] px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">
              Des templates conçus pour t’éviter le départ flou.
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Tu gagnes une base plus propre, plus crédible et plus rapide à
              transformer en vrai projet.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <SmallBadge>Base prête à personnaliser</SmallBadge>
            <SmallBadge>Design sobre et premium</SmallBadge>
            <SmallBadge>Lecture claire</SmallBadge>
          </div>
        </div>
      </section>

      <section className="mt-8">
        {list.length === 0 ? (
          <Card>
            <p className="text-lg font-medium text-slate-900">
              Aucun template trouvé pour cette recherche.
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Essaie une recherche plus large, enlève un filtre, ou découvre les
              formules si tu veux accéder plus facilement à toute la bibliothèque.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-2xl bg-[#0f172a] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Voir tous les templates
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl border border-[#eadfe5] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
              >
                Découvrir les formules
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((template) => {
              const thumb = thumbsById.get(template.id) || null;
              const price = formatPrice(template);

              return (
                <article
                  key={template.id}
                  className="group overflow-hidden rounded-[30px] border border-[#ecdfe5] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_70px_rgba(15,23,42,0.10)]"
                >
                  <div className="relative">
                    <div className="absolute right-4 top-4 z-20">
                      <FavoriteButton templateId={template.id} />
                    </div>

                    <Link href={`/shop/${template.slug}`} className="block">
                      <div className="relative aspect-[16/11] border-b border-[#f2e8ed] bg-[linear-gradient(180deg,#fff,#fbf8fa)]">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={template.title}
                            className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
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
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {template.category ? (
                          <span className="rounded-full border border-[#eadfe5] bg-[#fcf6f9] px-3 py-1 text-xs font-medium text-[#b8618e]">
                            {template.category}
                          </span>
                        ) : null}

                        {template.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[#ece7ea] bg-white px-3 py-1 text-xs text-slate-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                          Achat unitaire
                        </p>
                        <p className="mt-1 text-xl font-semibold text-slate-900">
                          {price}
                        </p>
                      </div>
                    </div>

                    <Link href={`/shop/${template.slug}`} className="block">
                      <h2
                        className="mt-4 text-2xl leading-snug text-slate-900"
                        style={{ fontFamily: '"Playfair Display", serif' }}
                      >
                        {template.title}
                      </h2>

                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                        {template.short_description}
                      </p>
                    </Link>

                    <div className="mt-5 rounded-[22px] border border-[#f1e6ec] bg-[#fffafd] p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#c06293]">
                        Ce que tu gagnes
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        <li>• Une base plus propre pour démarrer</li>
                        <li>• Une structure plus claire à personnaliser</li>
                        <li>• Un rendu plus crédible dès le départ</li>
                      </ul>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={`/shop/${template.slug}`}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0f172a] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                      >
                        Voir le template
                      </Link>

                      <Link
                        href={`/shop/${template.slug}`}
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-[#eadfe5] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
                      >
                        Voir les détails
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-12 grid gap-5 xl:grid-cols-2">
        <div className="rounded-[32px] border border-[#eadbe3] bg-[#0f172a] px-6 py-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:px-8 sm:py-10">
          <div className="max-w-2xl">
            <h2
              className="text-3xl"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Tu veux aller plus loin que l’achat unitaire ?
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/75 sm:text-base">
              Les formules donnent accès à plus de liberté, plus d’outils et une
              manière plus simple de construire plusieurs projets sans repartir
              à zéro à chaque fois.
            </p>

            <Link
              href="/pricing"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#f3d7e4] px-6 py-3 text-sm font-medium text-[#8f436a] transition hover:opacity-90"
            >
              Voir les formules
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-[#eadfe5] bg-[linear-gradient(135deg,#fff7fb_0%,#ffffff_60%,#fffafc_100%)] px-6 py-8 shadow-[0_18px_60px_rgba(216,106,162,0.08)] sm:px-8 sm:py-10">
          <div className="max-w-2xl">
            <h2
              className="text-3xl text-slate-900"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Tu veux un site 100% pensé pour ton identité ?
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Les templates sont parfaits pour aller plus vite. Mais si tu veux
              un site entièrement construit autour de ton image, de ton activité
              et de ton univers, le sur-mesure est plus adapté.
            </p>

            <Link
              href="https://maisonclm.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center rounded-2xl border border-[#eadfe5] bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
            >
              Aller sur maisonclm.fr
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

  const queryString = params.toString();
  return queryString ? `/shop?${queryString}` : "/shop";
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[#ecdfe5] bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

function StatPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#eadfe5] bg-white/90 px-3 py-1 text-xs text-slate-600">
      {children}
    </span>
  );
}

function SmallBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#eadfe5] bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm">
      {children}
    </span>
  );
}

function FilterChip({
  href,
  active,
  activeChip,
  idleChip,
  children,
}: {
  href: string;
  active: boolean;
  activeChip: string;
  idleChip: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active ? activeChip : idleChip
      }`}
    >
      {children}
    </Link>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[24px] border border-[#eadfe5] bg-white/88 px-5 py-4 text-center shadow-sm">
      <p className="text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.28em] text-[#c3759d]">
        {label}
      </p>
    </div>
  );
}