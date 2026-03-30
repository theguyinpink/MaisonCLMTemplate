import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import AddToCartButton from "@/components/AddToCartButton";
import {
  userHasAccessToTemplate,
  userHasActiveSubscription,
} from "@/lib/access";
import TemplateGallery from "@/components/shop/TemplateGallery";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type TemplateImage = {
  id: string;
  url: string;
  position: number | null;
  is_thumbnail: boolean | null;
  role: string | null;
};

type TemplateGuide = {
  id: string;
  title: string;
  description: string | null;
};

export default async function ShopSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: template, error } = await supabase
    .from("templates")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !template) {
    notFound();
  }

  const [{ data: images }, { data: guides }, accessResult, subscriptionResult] =
    await Promise.all([
      supabase
        .from("template_images")
        .select("id, url, position, is_thumbnail, role")
        .eq("template_id", template.id)
        .order("position", { ascending: true }),
      supabase
        .from("template_guides")
        .select("id, title, description")
        .eq("template_id", template.id)
        .order("created_at", { ascending: true }),
      userHasAccessToTemplate(template.id),
      userHasActiveSubscription(),
    ]);

  const templateImages = (images ?? []) as TemplateImage[];
  const templateGuides = (guides ?? []) as TemplateGuide[];

  const mainImage =
    templateImages.find((img) => img.is_thumbnail) ??
    templateImages.find((img) => img.role === "home") ??
    templateImages[0] ??
    null;

  const hasAccess = accessResult;
  const hasSubscription = subscriptionResult;

  const price =
    typeof template.price_amount === "number"
      ? new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: (template.currency || "EUR").toUpperCase(),
        }).format(template.price_amount)
      : template.price_label || "29,99 €";

  const tags = Array.isArray(template.tags) ? template.tags : [];

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="transition hover:text-slate-800">
          Accueil
        </Link>
        <span>/</span>
        <Link href="/shop" className="transition hover:text-slate-800">
          Boutique
        </Link>
        <span>/</span>
        <span className="text-slate-800">{template.title}</span>
      </nav>

      <section className="overflow-hidden rounded-[34px] border border-[#eddce4] bg-[linear-gradient(135deg,rgba(248,238,243,0.96)_0%,rgba(255,255,255,0.99)_48%,rgba(252,244,248,0.96)_100%)] px-6 py-8 shadow-[0_22px_70px_rgba(20,20,43,0.05)] sm:px-8 sm:py-10 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start xl:gap-10">
          <div>
            <span className="inline-flex items-center rounded-full border border-[#edcfe0] bg-white/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-[#c06293]">
              Template Maison CLM
            </span>

            <h1
              className="mt-5 text-4xl leading-tight text-slate-900 sm:text-5xl lg:text-[3.45rem]"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              {template.title}
            </h1>

            {template.short_description ? (
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                {template.short_description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              {template.category ? (
                <span className="rounded-full border border-[#eadfe5] bg-[#fcf6f9] px-4 py-2 text-sm font-medium text-[#b8618e]">
                  {template.category}
                </span>
              ) : null}

              {tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#ece7ea] bg-white px-4 py-2 text-sm text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              <TopPill>Responsive</TopPill>
              <TopPill>Base prête à personnaliser</TopPill>
              <TopPill>Guides inclus</TopPill>
              <TopPill>Accès dans ton compte</TopPill>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <MiniInfo value="Premium" label="direction" />
              <MiniInfo value="Clair" label="structure" />
              <MiniInfo value="Rapide" label="prise en main" />
            </div>
          </div>

          <div className="rounded-[30px] border border-[#ecdfe5] bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-7 lg:sticky lg:top-24">
            {hasAccess ? (
              <>
                <span className="inline-flex items-center rounded-full border border-[#dceedd] bg-[#f6fdf7] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-[#5d9d6c]">
                  Déjà disponible dans ton compte
                </span>

                <h2
                  className="mt-4 text-3xl text-slate-900"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  Tu peux l’utiliser dès maintenant
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {hasSubscription
                    ? "Tu y as accès grâce à ton abonnement actif. Tu peux le retrouver dans ta bibliothèque et créer ton projet à partir de cette base."
                    : "Ce template fait déjà partie de ta bibliothèque. Tu peux le relancer quand tu veux depuis ton espace."}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <InfoPill label="Statut" value="Déjà acquis" />
                  <InfoPill label="Accès" value="Depuis ta bibliothèque" />
                </div>

                <div className="mt-6 space-y-3">
                  <form action="/api/projects/create-from-template" method="post">
                    <input
                      type="hidden"
                      name="templateId"
                      value={template.id}
                    />
                    <input
                      type="hidden"
                      name="projectName"
                      value={`${template.title} - Mon projet`}
                    />
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0f172a] px-6 py-3.5 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      Utiliser ce template
                    </button>
                  </form>

                  <Link
                    href="/library"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-[#ead6df] px-6 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
                  >
                    Voir ma bibliothèque
                  </Link>
                </div>
              </>
            ) : (
              <>
                <span className="inline-flex items-center rounded-full border border-[#edcfe0] bg-[#fff7fb] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-[#c06293]">
                  Achat unitaire
                </span>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Prix du template</p>
                    <p className="mt-1 text-4xl font-semibold leading-none text-slate-900">
                      {price}
                    </p>
                  </div>

                  <div className="rounded-full border border-[#eadfe5] bg-[#fcf6f9] px-4 py-2 text-sm font-medium text-[#b8618e]">
                    Accès permanent
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Une base premium pour lancer ton site plus vite, avec une
                  structure plus claire, une image plus propre et un rendu plus
                  crédible dès le départ.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <InfoPill label="Livraison" value="Bibliothèque client" />
                  <InfoPill label="Paiement" value="Sécurisé Stripe" />
                  <InfoPill label="Usage" value="Personnalisable" />
                </div>

                <div className="mt-5 rounded-[24px] border border-[#f0e6eb] bg-[#fffafd] p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#c06293]">
                    Ce que tu gagnes
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    <li>• Une base élégante et plus rassurante</li>
                    <li>• Une structure déjà pensée pour avancer plus vite</li>
                    <li>• Un rendu plus cohérent avant même la personnalisation</li>
                  </ul>
                </div>

                <div className="mt-6 space-y-3">
                  <AddToCartButton
                    item={{
                      id: template.id,
                      slug: template.slug,
                      title: template.title,
                      price_label: price,
                      price_amount: template.price_amount ?? null,
                      currency: template.currency ?? "EUR",
                      image_url: mainImage?.url ?? null,
                    }}
                  />

                  <Link
                    href="/pricing"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-[#ead6df] px-6 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
                  >
                    Voir aussi les formules
                  </Link>
                </div>

                <p className="mt-3 text-center text-xs leading-6 text-slate-400">
                  Idéal si tu veux démarrer vite avec une base plus premium qu’un
                  site commencé de zéro.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div>
          <TemplateGallery title={template.title} images={templateImages} />
        </div>

        <div className="space-y-6">
          <SectionCard>
            <SectionTitle>Pourquoi ce template aide vraiment</SectionTitle>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <FeatureCard
                title="Base prête à personnaliser"
                description="Tu pars d’une structure déjà pensée, plus simple à adapter à ton activité."
              />
              <FeatureCard
                title="Responsive"
                description="Une base conçue pour desktop, tablette et mobile sans repartir de zéro."
              />
              <FeatureCard
                title="Guides inclus"
                description="Des repères utiles pour comprendre plus vite le template et le modifier plus sereinement."
              />
              <FeatureCard
                title="Accès dans ton compte"
                description="Après achat, tu retrouves ton template dans ta bibliothèque quand tu veux."
              />
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Pour quel type de projet ?</SectionTitle>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              Ce template convient particulièrement si tu veux une base plus
              propre, plus lisible et plus premium pour construire une présence
              en ligne crédible sans passer des heures sur une page blanche.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <SoftTag>Site vitrine</SoftTag>
              <SoftTag>Image plus soignée</SoftTag>
              <SoftTag>Gain de temps</SoftTag>
              <SoftTag>Structure claire</SoftTag>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Tu veux aller plus loin ?</SectionTitle>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              Si tu préfères accéder à plus de templates ou si tu veux un site
              entièrement construit pour ton identité, tu peux aussi explorer les
              autres options Maison CLM.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0f172a] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Voir les formules
              </Link>

              <Link
                href="https://maisonclm.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[#eadfe5] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
              >
                Site sur mesure
              </Link>
            </div>
          </SectionCard>
        </div>
      </section>

      {template.long_description ? (
        <section className="mt-10 rounded-[30px] border border-[#ecdfe5] bg-white p-6 shadow-sm sm:p-8">
          <SectionTitle>À propos du template</SectionTitle>

          <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">
            {template.long_description}
          </p>
        </section>
      ) : null}

      {templateGuides.length > 0 ? (
        <section className="mt-8 rounded-[30px] border border-[#ecdfe5] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionTitle>Guides inclus</SectionTitle>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                De quoi prendre le template en main plus vite et adapter le
                contenu plus sereinement.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {templateGuides.map((guide) => (
              <article
                key={guide.id}
                className="rounded-[22px] border border-[#f0e6eb] bg-[#fcfafb] p-5"
              >
                <h3 className="text-lg font-medium text-slate-900">
                  {guide.title}
                </h3>

                {guide.description ? (
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {guide.description}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-[#ecdfe5] bg-white p-6 shadow-sm sm:p-7">
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      className="text-3xl text-slate-900"
      style={{ fontFamily: '"Playfair Display", serif' }}
    >
      {children}
    </h2>
  );
}

function TopPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#eadfe5] bg-white/90 px-4 py-2 text-sm text-slate-600 shadow-sm">
      {children}
    </span>
  );
}

function SoftTag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#eadfe5] bg-[#fcf6f9] px-4 py-2 text-sm text-[#b8618e]">
      {children}
    </span>
  );
}

function MiniInfo({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[22px] border border-[#eadfe5] bg-white/86 px-5 py-4 shadow-sm">
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.26em] text-[#c3759d]">
        {label}
      </p>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[#f0e6eb] bg-[#fcfafb] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#f0e6eb] bg-white p-5">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}