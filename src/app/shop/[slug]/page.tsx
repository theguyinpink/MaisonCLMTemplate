import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import AddToCartButton from "@/components/AddToCartButton";
import {
  userHasAccessToTemplate,
  userHasActiveSubscription,
} from "@/lib/access";

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

  const [{ data: images }, { data: guides }] = await Promise.all([
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
  ]);

  const templateImages = (images ?? []) as TemplateImage[];
  const templateGuides = (guides ?? []) as TemplateGuide[];

  const mainImage =
    templateImages.find((img) => img.is_thumbnail) ??
    templateImages.find((img) => img.role === "home") ??
    templateImages[0] ??
    null;

  const secondaryImages = mainImage
    ? templateImages.filter((img) => img.id !== mainImage.id)
    : templateImages;

  const hasAccess = await userHasAccessToTemplate(template.id);
  const hasSubscription = await userHasActiveSubscription();

  const price =
    typeof template.price_amount === "number"
      ? new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: (template.currency || "EUR").toUpperCase(),
        }).format(template.price_amount)
      : template.price_label || "29,99 €";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        {/* Texte */}
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#d86aa2]">
            Template Maison CLM
          </p>

          <h1
            className="mt-4 text-4xl leading-tight text-slate-900 sm:text-5xl"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {template.title}
          </h1>

          {template.short_description ? (
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {template.short_description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {template.category ? (
              <span className="rounded-full border border-[#eadfe5] bg-[#fcf6f9] px-4 py-2 text-sm font-medium text-[#b8618e]">
                {template.category}
              </span>
            ) : null}

            {Array.isArray(template.tags) &&
              template.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#ece7ea] bg-white px-4 py-2 text-sm text-slate-600"
                >
                  {tag}
                </span>
              ))}
          </div>

          <div className="mt-8 rounded-[28px] border border-[#ecdfe5] bg-white p-6 shadow-sm">
            {hasAccess ? (
              <>
                <p className="text-sm text-slate-500">
                  {hasSubscription
                    ? "Tu y as accès grâce à ton abonnement actif."
                    : "Ce template fait déjà partie de ta bibliothèque."}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <form
                    action="/api/projects/create-from-template"
                    method="post"
                  >
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
                      className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-6 py-3 text-sm font-medium text-white"
                    >
                      Utiliser ce template
                    </button>
                  </form>

                  <Link
                    href="/library"
                    className="inline-flex items-center justify-center rounded-full border border-[#ead6df] px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
                  >
                    Voir ma bibliothèque
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Achat à l’unité</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {price}
                    </p>
                  </div>

                  <div className="rounded-full border border-[#eadfe5] bg-[#fcf6f9] px-4 py-2 text-sm text-[#b8618e]">
                    Accès permanent
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
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
                    className="inline-flex items-center justify-center rounded-full border border-[#ead6df] px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
                  >
                    Voir aussi les Formules
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Visuels */}
        <div>
          {mainImage ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[30px] border border-[#ecdfe5] bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
                <img
                  src={mainImage.url}
                  alt={template.title}
                  className="h-auto w-full object-cover"
                />
              </div>

              {secondaryImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {secondaryImages.slice(0, 4).map((image) => (
                    <div
                      key={image.id}
                      className="overflow-hidden rounded-[22px] border border-[#ecdfe5] bg-white"
                    >
                      <img
                        src={image.url}
                        alt={template.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[30px] border border-[#ecdfe5] bg-[#fbf8fa] p-12 text-center text-slate-500">
              Aucun visuel disponible pour ce template.
            </div>
          )}
        </div>
      </section>

      {/* Description */}
      {template.long_description ? (
        <section className="mt-12 rounded-[30px] border border-[#ecdfe5] bg-white p-6 shadow-sm sm:p-8">
          <h2
            className="text-3xl text-slate-900"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            À propos du template
          </h2>

          <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">
            {template.long_description}
          </p>
        </section>
      ) : null}

      {/* Guides */}
      {templateGuides.length > 0 ? (
        <section className="mt-8 rounded-[30px] border border-[#ecdfe5] bg-white p-6 shadow-sm sm:p-8">
          <h2
            className="text-3xl text-slate-900"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Guides inclus
          </h2>

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
