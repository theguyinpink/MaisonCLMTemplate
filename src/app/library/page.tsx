import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUserId, userHasActiveSubscription } from "@/lib/access";
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

export default async function LibraryPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/auth");
  }

  const supabase = await createServerSupabaseClient();
  const hasSubscription = await userHasActiveSubscription(userId);

  let list: TemplateRow[] = [];

  if (hasSubscription) {
    const { data: templates, error } = await supabase
      .from("templates")
      .select("id, slug, title, short_description, category, tags")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      return (
        <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <p className="text-slate-600">Erreur bibliothèque : {error.message}</p>
          </Card>
        </main>
      );
    }

    list = (templates ?? []) as TemplateRow[];
  } else {
    const { data: entitlements, error } = await supabase
      .from("entitlements")
      .select(`
        template_id,
        templates (
          id,
          slug,
          title,
          short_description,
          category,
          tags,
          is_published
        )
      `)
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      return (
        <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <p className="text-slate-600">Erreur bibliothèque : {error.message}</p>
          </Card>
        </main>
      );
    }

    list = (entitlements ?? [])
      .map((row: any) => row.templates)
      .filter((template: any) => template && template.is_published) as TemplateRow[];
  }

  const ids = list.map((t) => t.id);
  const thumbsById = new Map<string, string>();

  if (ids.length > 0) {
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
        const aScore = (a.is_thumbnail ? 100 : 0) + (a.role === "home" ? 50 : 0);
        const bScore = (b.is_thumbnail ? 100 : 0) + (b.role === "home" ? 50 : 0);
        if (aScore !== bScore) return bScore - aScore;
        return (a.position ?? 0) - (b.position ?? 0);
      });

      if (sorted[0]?.url) {
        thumbsById.set(tid, sorted[0].url);
      }
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-[34px] border border-[#eddce4] bg-[linear-gradient(135deg,rgba(248,238,243,0.95)_0%,rgba(255,255,255,0.96)_45%,rgba(252,244,248,0.95)_100%)] px-6 py-10 shadow-[0_20px_60px_rgba(20,20,43,0.05)] sm:px-10 sm:py-14">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.28em] text-[#d86aa2]">
            Ma bibliothèque
          </p>

          <h1
            className="mt-4 text-4xl leading-tight text-slate-900 sm:text-5xl"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {hasSubscription
              ? "Tous les templates disponibles dans ton accès"
              : "Les templates que tu as achetés"}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            {hasSubscription
              ? "Ton abonnement est actif : tu peux parcourir toute la bibliothèque publiée."
              : "Tu retrouves ici uniquement les templates associés à tes achats."}
          </p>
        </div>
      </section>

      <section className="mt-8">
        {list.length === 0 ? (
          <Card>
            <h2
              className="text-2xl text-slate-900"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Ta bibliothèque est vide
            </h2>

            <p className="mt-3 text-slate-600">
              Tu n’as encore aucun template dans ta bibliothèque.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-6 py-3 text-sm font-medium text-white"
              >
                Explorer les templates
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-[#ead6df] px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
              >
                Voir la Formule Studio
              </Link>
            </div>
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
                        Ouvrir le template
                      </div>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[#ecdfe5] bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}