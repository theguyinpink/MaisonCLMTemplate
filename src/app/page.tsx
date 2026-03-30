import Link from "next/link";
import { FAQ } from "@/components/FAQ";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type TemplateRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  category: string | null;
  tags: string[] | null;
};

type TemplateImageRow = {
  template_id: string;
  url: string;
  position: number | null;
  is_thumbnail: boolean | null;
  role: string | null;
};

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: templates } = await supabase
    .from("templates")
    .select("id, slug, title, short_description, category, tags")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(2);

  const heroTemplates = (templates ?? []) as TemplateRow[];
  const templateIds = heroTemplates.map((template) => template.id);

  const { data: images } =
    templateIds.length > 0
      ? await supabase
          .from("template_images")
          .select("template_id, url, position, is_thumbnail, role")
          .in("template_id", templateIds)
      : { data: [] };

  const templateImages = (images ?? []) as TemplateImageRow[];
  const imagesByTemplateId = new Map<string, TemplateImageRow[]>();

  for (const image of templateImages) {
    const current = imagesByTemplateId.get(image.template_id) ?? [];
    current.push(image);
    imagesByTemplateId.set(image.template_id, current);
  }

  const previewCards = heroTemplates.map((template) => {
    const relatedImages = imagesByTemplateId.get(template.id) ?? [];

    const sortedImages = [...relatedImages].sort((a, b) => {
      const aScore = (a.is_thumbnail ? 100 : 0) + (a.role === "home" ? 50 : 0);
      const bScore = (b.is_thumbnail ? 100 : 0) + (b.role === "home" ? 50 : 0);

      if (aScore !== bScore) return bScore - aScore;
      return (a.position ?? 0) - (b.position ?? 0);
    });

    return {
      ...template,
      imageUrl: sortedImages[0]?.url ?? null,
    };
  });

  const heroMain = previewCards[0] ?? null;
  const heroSecondary = previewCards[1] ?? null;

  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
      <section className="hero-shell overflow-hidden rounded-[32px] px-6 py-12 sm:px-10 lg:px-12 lg:py-14">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center xl:gap-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-[var(--accent)]/15 bg-[var(--accent)]/8 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
              Templates Maison CLM
            </span>

            <h1 className="mt-6 font-display text-5xl leading-[0.96] text-[var(--foreground)] sm:text-6xl">
              Des templates pensés pour créer
              <span className="mt-2 block italic text-[var(--accent)]">
                une présence plus crédible, plus élégante, plus désirable
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[var(--foreground)]/60">
              Tu ne pars pas d’une page blanche. Tu choisis une base premium,
              claire et bien structurée, conçue pour t’aider à lancer un site
              plus vite sans sacrifier l’image, la cohérence ni l’impact visuel.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ReassurancePill text="Base prête à personnaliser" />
              <ReassurancePill text="Design premium et structuré" />
              <ReassurancePill text="Pensé pour aller plus vite" />
            </div>

            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/shop"
                className="classic-button-primary min-w-56 px-8 py-4 text-base"
              >
                Explorer les templates
              </Link>

              <Link
                href="/pricing"
                className="classic-button-secondary min-w-56 px-8 py-4 text-base"
              >
                Voir les formules
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <StatCard value="Moins de friction" label="pour démarrer" />
              <StatCard value="Plus de cohérence" label="dans le rendu" />
              <StatCard value="Plus rapide" label="à adapter" />
            </div>
          </div>

          <div className="grid gap-4">
            {heroMain ? (
              <Link
                href={`/shop/${heroMain.slug}`}
                className="group overflow-hidden rounded-[24px] border border-[#eadfe5] bg-white p-4 shadow-[0_22px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1"
              >
                <div className="overflow-hidden rounded-[20px] border border-[#f1e7ec] bg-white">
                  <div className="aspect-[16/10]">
                    {heroMain.imageUrl ? (
                      <img
                        src={heroMain.imageUrl}
                        alt={heroMain.title}
                        className="h-full w-full bg-white object-contain p-3 transition duration-300 group-hover:scale-[1.01]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                        Aperçu indisponible
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  {heroMain.category ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                      {heroMain.category}
                    </p>
                  ) : null}

                  <h2 className="mt-2 font-display text-3xl text-[var(--foreground)]">
                    {heroMain.title}
                  </h2>

                  {heroMain.short_description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--foreground)]/58">
                      {heroMain.short_description}
                    </p>
                  ) : null}

                  <p className="mt-4 text-sm font-medium text-[var(--accent)]">
                    Voir le template
                  </p>
                </div>
              </Link>
            ) : (
              <div className="rounded-[24px] border border-[#eadfe5] bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
                <div className="flex aspect-[16/10] items-center justify-center rounded-[20px] border border-dashed border-[#eadfe5] bg-[#fffafd] text-sm text-[var(--foreground)]/45">
                  Ajoute un premier template publié pour afficher un aperçu ici
                </div>
              </div>
            )}

            {heroSecondary ? (
              <Link
                href={`/shop/${heroSecondary.slug}`}
                className="group grid gap-4 rounded-[22px] border border-[#eadfe5] bg-white/88 p-4 shadow-sm transition hover:-translate-y-1 sm:grid-cols-[180px_1fr] sm:items-center"
              >
                <div className="overflow-hidden rounded-[18px] border border-[#f1e7ec] bg-white">
                  <div className="aspect-[16/11]">
                    {heroSecondary.imageUrl ? (
                      <img
                        src={heroSecondary.imageUrl}
                        alt={heroSecondary.title}
                        className="h-full w-full bg-white object-contain p-2 transition duration-300 group-hover:scale-[1.01]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        Aperçu indisponible
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {heroSecondary.category ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                      {heroSecondary.category}
                    </p>
                  ) : null}

                  <h3 className="mt-2 font-display text-2xl text-[var(--foreground)]">
                    {heroSecondary.title}
                  </h3>

                  {heroSecondary.short_description ? (
                    <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/58">
                      {heroSecondary.short_description}
                    </p>
                  ) : null}

                  <p className="mt-4 text-sm font-medium text-[var(--accent)]">
                    Découvrir
                  </p>
                </div>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="section-shell rounded-[32px] border border-[#eadfe5] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-[var(--accent)]/15 bg-[var(--accent)]/8 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
              Pourquoi cette boutique existe
            </span>

            <h2 className="mt-5 font-display text-4xl leading-tight text-[var(--foreground)] sm:text-5xl">
              Offrir des bases plus justes,
              <br className="hidden sm:block" />
              plus sobres et plus désirables
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-[var(--foreground)]/60">
              Maison CLM Templates prolonge l’univers Maison CLM avec une idée
              simple : aider à lancer un site plus crédible sans repartir de
              zéro, grâce à des bases visuelles propres, premium et pensées pour
              de vrais usages.
            </p>

            <p className="mt-4 text-base leading-8 text-[var(--foreground)]/56">
              Le but n’est pas seulement de vendre un design. Le but est de te
              faire gagner du temps, de t’éviter les débuts flous et de te donner
              une structure plus convaincante dès les premières secondes.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <BenefitCard
              title="Une direction plus premium"
              desc="Une composition plus posée, plus aérée et plus cohérente pour inspirer davantage confiance."
            />
            <BenefitCard
              title="Pensé pour de vrais projets"
              desc="Des sections utiles, compréhensibles et faciles à adapter à une activité réelle."
            />
            <BenefitCard
              title="Une base solide, puis ton univers"
              desc="Tu pars d’un cadre propre, puis tu ajoutes tes contenus, tes couleurs et ton identité."
            />
          </div>
        </div>
      </section>

      <section className="mt-14 overflow-hidden rounded-[32px] border border-[#eadfe5] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-[var(--accent)]/15 bg-[var(--accent)]/8 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
              Comment ça marche
            </span>

            <h2 className="mt-5 font-display text-4xl leading-tight text-[var(--foreground)] sm:text-5xl">
              Un parcours simple,
              <br className="hidden sm:block" />
              pensé pour aller vite sans te perdre
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--foreground)]/60">
              Tu explores les templates, tu choisis la formule qui te convient,
              puis tu récupères une base élégante et prête à personnaliser pour
              ton projet.
            </p>
          </div>

          <div className="rounded-[22px] border border-[#f0e4ea] bg-[#fff9fc] px-5 py-4 text-sm text-[var(--foreground)]/66 shadow-sm">
            Clair, rapide, premium
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <StepCard
            number="1"
            title="Tu explores"
            desc="Tu parcours les templates, tu regardes les aperçus, les styles et les catégories pour trouver une base cohérente avec ton projet."
            helper="Aperçus clairs • styles variés • choix plus rapide"
          />
          <StepCard
            number="2"
            title="Tu choisis"
            desc="Tu prends un template à l’unité ou une formule selon ton besoin, ton rythme et la manière dont tu veux construire ton site."
            helper="Achat simple • formule adaptée • décision plus claire"
          />
          <StepCard
            number="3"
            title="Tu personnalises"
            desc="Tu retrouves ton template dans ta bibliothèque et tu pars d’une base déjà propre, plus élégante et plus rapide à adapter à ton activité."
            helper="Base prête • gain de temps • rendu plus premium"
          />
        </div>

        <div className="mt-8 grid gap-4 rounded-[28px] border border-[#eadfe5] bg-[linear-gradient(135deg,#fff8fb_0%,#ffffff_100%)] p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
              Ce que ça change concrètement
            </p>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--foreground)]/62">
              Tu ne pars pas d’une page blanche. Tu gagnes du temps, tu gardes une
              vraie cohérence visuelle, et tu avances avec une base plus crédible
              dès les premières secondes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="classic-button-primary inline-flex items-center justify-center px-6 py-3 text-sm"
            >
              Explorer les templates
            </Link>

            <Link
              href="/pricing"
              className="classic-button-secondary inline-flex items-center justify-center px-6 py-3 text-sm"
            >
              Voir les formules
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-14 overflow-hidden rounded-[32px] border border-[#eadfe5] bg-[linear-gradient(135deg,#fff7fb_0%,#ffffff_55%,#fffafc_100%)] p-6 shadow-[0_18px_60px_rgba(216,106,162,0.08)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-[var(--accent)]/15 bg-[var(--accent)]/8 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
              Besoin de plus que d’un template ?
            </span>

            <h2 className="mt-5 font-display text-4xl leading-tight text-[var(--foreground)] sm:text-5xl">
              Tu veux un site créé de zéro,
              <br className="hidden sm:block" />
              pensé uniquement pour ton identité ?
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--foreground)]/62">
              Les templates sont parfaits pour lancer un projet plus vite. Mais
              si tu veux une image de marque forte, une structure sur mesure et un
              site qui reflète vraiment ton univers, alors il vaut mieux passer
              sur une création dédiée.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <ReassurancePill text="Identité visuelle personnalisée" />
              <ReassurancePill text="Structure pensée pour ton activité" />
              <ReassurancePill text="Expérience plus premium et unique" />
            </div>
          </div>

          <div className="rounded-[28px] border border-[#eadfe5] bg-white/92 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.07)] sm:p-7">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--accent)]">
              Création sur mesure
            </p>

            <h3 className="mt-3 font-display text-3xl leading-tight text-[var(--foreground)]">
              Découvrir Maison CLM
            </h3>

            <p className="mt-4 text-sm leading-7 text-[var(--foreground)]/60">
              Pour un site vitrine, une refonte ou une présence en ligne
              entièrement construite autour de ton projet.
            </p>

            <div className="mt-5 space-y-3">
              <FeatureLine text="Une direction créative plus poussée" />
              <FeatureLine text="Un accompagnement pensé pour ton activité" />
              <FeatureLine text="Un site vraiment différenciant" />
            </div>

            <Link
              href="https://maisonclm.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="classic-button-primary mt-6 inline-flex w-full items-center justify-center px-6 py-4 text-base"
            >
              Aller sur maisonclm.fr
            </Link>

            <p className="mt-3 text-center text-xs leading-6 text-[var(--foreground)]/45">
              Idéal si tu veux une présence en ligne plus unique qu’un template
              prêt à l’emploi.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <FAQ />
      </section>
    </main>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[20px] border border-[#eadfe5] bg-white/86 px-5 py-4 shadow-sm">
      <p className="text-2xl font-semibold text-[var(--foreground)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--foreground)]/54">{label}</p>
    </div>
  );
}

function BenefitCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#eadfe5] bg-white/90 p-6 shadow-sm">
      <h3 className="font-display text-2xl text-[var(--foreground)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/58">{desc}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  desc,
  helper,
}: {
  number: string;
  title: string;
  desc: string;
  helper: string;
}) {
  return (
    <div className="rounded-[26px] border border-[#eadfe5] bg-[linear-gradient(180deg,#fffafd_0%,#ffffff_100%)] p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-lg font-semibold text-white shadow-[0_12px_30px_rgba(216,106,162,0.28)]">
        {number}
      </div>

      <h3 className="mt-5 font-display text-2xl text-[var(--foreground)]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/60">
        {desc}
      </p>

      <div className="mt-5 rounded-2xl border border-[#f1e6ec] bg-white/90 px-4 py-3 text-sm text-[var(--foreground)]/68">
        {helper}
      </div>
    </div>
  );
}

function ReassurancePill({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-[#eadfe5] bg-white/90 px-4 py-2 text-sm text-[var(--foreground)]/70 shadow-sm">
      {text}
    </span>
  );
}

function FeatureLine({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-[#f1e6ec] bg-[#fffafd] px-4 py-3 text-sm text-[var(--foreground)]/72">
      {text}
    </div>
  );
}