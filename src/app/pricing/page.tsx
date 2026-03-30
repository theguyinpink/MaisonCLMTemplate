import Link from "next/link";
import type { ReactNode } from "react";
import { getActiveSubscription, getCurrentUserId } from "@/lib/access";
import CheckoutButton from "@/components/stripe/CheckoutButton";
import { FAQ } from "@/components/FAQ";

export default async function PricingPage() {
  const userId = await getCurrentUserId();
  const isLoggedIn = !!userId;
  const subscription = userId ? await getActiveSubscription(userId) : null;
  const activePlan = subscription?.plan ?? null;

  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
      <section className="overflow-hidden rounded-[36px] border border-[#eddce4] bg-[linear-gradient(135deg,rgba(248,238,243,0.96)_0%,rgba(255,255,255,0.99)_48%,rgba(252,244,248,0.96)_100%)] px-6 py-10 shadow-[0_24px_70px_rgba(20,20,43,0.05)] sm:px-10 sm:py-14">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-[#edcfe0] bg-white/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-[#c06293]">
            Formules Maison CLM
          </span>

          <h1
            className="mt-5 text-5xl leading-tight text-slate-900 md:text-6xl"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Choisis la formule
            <span className="mt-2 block text-[#d86aa2]">
              qui correspond vraiment à ta façon de créer
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Achat unitaire si tu veux un template précis. Abonnement si tu veux
            accéder à toute la bibliothèque, travailler plus confortablement et
            avancer plus vite sur plusieurs projets.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <HeroPill>Accès dans ton compte</HeroPill>
            <HeroPill>Paiement sécurisé Stripe</HeroPill>
            <HeroPill>Bibliothèque plus simple à gérer</HeroPill>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-2xl bg-[#0f172a] px-6 py-4 text-sm font-medium text-white transition hover:opacity-90"
            >
              Explorer les templates
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
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <TrustCard
          title="Paiement plus rassurant"
          desc="Le checkout passe par Stripe pour une étape de paiement plus claire et plus sécurisée."
        />
        <TrustCard
          title="Tout reste centralisé"
          desc="Après achat ou abonnement, tes templates et projets sont réunis dans ton espace."
        />
        <TrustCard
          title="Choix plus souple"
          desc="Tu peux acheter un template précis ou choisir une formule selon ton rythme et tes besoins."
        />
      </section>

      <section className="mt-14 grid gap-6 xl:grid-cols-3 xl:items-stretch">
        <article className="rounded-[32px] border border-[#ecdfe5] bg-white p-8 shadow-[0_18px_60px_rgba(20,20,43,0.05)]">
          <div className="border-b border-[#f2e4eb] pb-8">
            <span className="inline-flex rounded-full bg-[#f8edf2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#b34f82]">
              Achat flexible
            </span>

            <h2
              className="mt-4 text-3xl text-slate-900"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Achat unitaire
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Le bon choix si tu veux un template précis, avec un accès
              permanent, sans engagement mensuel.
            </p>

            <div className="mt-6">
              <div className="text-4xl font-semibold text-slate-900">
                Selon le template
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Prix affiché sur chaque fiche produit
              </div>
            </div>
          </div>

          <ul className="mt-8 grid gap-3 text-sm text-slate-700">
            <CheckItem>Choix d’un template précis</CheckItem>
            <CheckItem>Accès permanent après achat</CheckItem>
            <CheckItem>Template retrouvé dans ton compte</CheckItem>
            <CheckItem>Parfait pour un besoin ciblé</CheckItem>
            <CheckItem>Aucun engagement mensuel</CheckItem>
          </ul>

          <div className="mt-8 rounded-[24px] border border-[#f0e6eb] bg-[#fffafd] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#c06293]">
              Idéal si…
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Tu veux aller vite sur un seul projet, avec une base premium déjà
              prête à personnaliser.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/shop"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-[#eadfe5] bg-white px-6 py-4 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
            >
              Voir la boutique
            </Link>
          </div>
        </article>

        <article className="rounded-[32px] border border-[#edd7e2] bg-white/85 p-8 shadow-[0_20px_60px_rgba(20,20,43,0.06)] backdrop-blur">
          <div className="border-b border-[#f2e4eb] pb-8">
            <span className="inline-flex rounded-full bg-[#f8e4ee] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#b34f82]">
              Recommandé si tu codes déjà
            </span>

            <h2
              className="mt-4 text-3xl text-slate-900"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Formule Pro
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Pour les personnes à l’aise avec le code qui veulent accéder à
              toute la bibliothèque et travailler plus librement.
            </p>

            <div className="mt-6">
              <div className="text-4xl font-semibold text-slate-900">39€</div>
              <div className="mt-1 text-sm text-slate-500">/ mois</div>
            </div>
          </div>

          <ul className="mt-8 grid gap-3 text-sm text-slate-700">
            <CheckItem>Bibliothèque complète</CheckItem>
            <CheckItem>Éditeur intégré</CheckItem>
            <CheckItem>Guides clairs</CheckItem>
            <CheckItem>Sauvegarde des projets</CheckItem>
            <CheckItem>Export ZIP</CheckItem>
            <CheckItem>Configuration section contact</CheckItem>
            <CheckItem>Support technique</CheckItem>
          </ul>

          <div className="mt-8 rounded-[24px] border border-[#f0e6eb] bg-[#fffafd] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#c06293]">
              Idéal si…
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Tu veux accéder à toute la bibliothèque et tu es suffisamment à
              l’aise pour personnaliser tes projets avec le code.
            </p>
          </div>

          <div className="mt-8">
            {!isLoggedIn ? (
              <Link
                href="/auth"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0f172a] px-6 py-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                Se connecter pour s’abonner
              </Link>
            ) : activePlan === "pro" ? (
              <div className="space-y-3">
                <span className="inline-flex w-full items-center justify-center rounded-2xl bg-[#f7e5ee] px-6 py-4 text-sm font-medium text-[#a64f7d]">
                  Formule active
                </span>
                <Link
                  href="/library"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[#eadfe5] px-6 py-4 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
                >
                  Aller à ma bibliothèque
                </Link>
              </div>
            ) : (
              <CheckoutButton
                plan="pro"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0f172a] px-6 py-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                Souscrire à la formule Pro
              </CheckoutButton>
            )}
          </div>
        </article>

        <article className="relative rounded-[32px] border-2 border-[#e8bfd2] bg-white p-8 shadow-[0_26px_80px_rgba(20,20,43,0.08)] backdrop-blur xl:-translate-y-3">
          <div className="border-b border-[#f2e4eb] pb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex rounded-full bg-[#f8edf2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#b34f82]">
                Expérience premium
              </span>

              <span className="inline-flex rounded-full bg-[#0f172a] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-white">
                Le plus complet
              </span>
            </div>

            <h2
              className="mt-4 text-3xl text-slate-900"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Formule Studio
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              La formule la plus confortable pour personnaliser plus vite, avec
              preview live et mode visuel.
            </p>

            <div className="mt-6">
              <div className="text-4xl font-semibold text-slate-900">69€</div>
              <div className="mt-1 text-sm text-slate-500">/ mois</div>
            </div>
          </div>

          <ul className="mt-8 grid gap-3 text-sm text-slate-700">
            <CheckItem>Bibliothèque complète</CheckItem>
            <CheckItem>Éditeur intégré</CheckItem>
            <CheckItem>Preview live</CheckItem>
            <CheckItem>Guides clairs</CheckItem>
            <CheckItem>Sauvegarde des projets</CheckItem>
            <CheckItem>Export ZIP</CheckItem>
            <CheckItem>Mode visuel</CheckItem>
            <CheckItem>Configuration section contact</CheckItem>
            <CheckItem>SEO de base</CheckItem>
            <CheckItem>Support prioritaire</CheckItem>
            <CheckItem>Aide sur l’hébergement</CheckItem>
          </ul>

          <div className="mt-8 rounded-[24px] border border-[#f0e6eb] bg-[#fffafd] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#c06293]">
              Idéal si…
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Tu veux l’expérience la plus fluide, la plus guidée et la plus
              agréable pour lancer plusieurs projets plus vite.
            </p>
          </div>

          <div className="mt-8">
            {!isLoggedIn ? (
              <Link
                href="/auth"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0f172a] px-6 py-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                Se connecter pour s’abonner
              </Link>
            ) : activePlan === "studio" ? (
              <div className="space-y-3">
                <span className="inline-flex w-full items-center justify-center rounded-2xl bg-[#f7e5ee] px-6 py-4 text-sm font-medium text-[#a64f7d]">
                  Formule active
                </span>
                <Link
                  href="/library"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[#eadfe5] px-6 py-4 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
                >
                  Aller à ma bibliothèque
                </Link>
              </div>
            ) : (
              <CheckoutButton
                plan="studio"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0f172a] px-6 py-4 text-sm font-medium text-white transition hover:opacity-90"
              >
                Souscrire à la formule Studio
              </CheckoutButton>
            )}
          </div>
        </article>
      </section>

      <section className="mt-12 rounded-[32px] border border-[#ecdfe5] bg-[#fcfafb] p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <h2
            className="text-3xl text-slate-900"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Tu hésites entre achat unitaire et abonnement ?
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Voilà la manière la plus simple de choisir selon ton besoin réel.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ComparisonCard
            title="Achat unitaire"
            desc="Le bon choix si tu veux un seul template précis, avec un accès permanent et sans engagement mensuel."
          />
          <ComparisonCard
            title="Pro"
            desc="Le bon choix si tu veux toute la bibliothèque et que tu es déjà à l’aise pour personnaliser avec le code."
          />
          <ComparisonCard
            title="Studio"
            desc="Le bon choix si tu veux la formule la plus confortable pour personnaliser plus vite avec preview live et mode visuel."
          />
        </div>
      </section>

      <section className="mt-12 grid gap-5 xl:grid-cols-2">
        <div className="rounded-[32px] border border-[#eadbe3] bg-[#0f172a] px-6 py-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] sm:px-8 sm:py-10">
          <div className="max-w-2xl">
            <h2
              className="text-3xl"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Tu veux commencer par un template ?
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/75 sm:text-base">
              Explore la boutique et choisis la base qui correspond le mieux à
              ton projet, puis décide ensuite si l’achat unitaire ou une formule
              est le plus adapté.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#f3d7e4] px-6 py-3 text-sm font-medium text-[#8f436a] transition hover:opacity-90"
            >
              Explorer la boutique
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
              Les templates et les formules sont parfaits pour aller vite. Mais
              si tu veux un site entièrement construit autour de ton image, de
              ton activité et de ton univers, le sur-mesure est plus adapté.
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

      <section className="mt-12">
        <FAQ />
      </section>
    </main>
  );
}

function TrustCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[24px] border border-[#ecdfe5] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">{desc}</p>
    </div>
  );
}

function ComparisonCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[24px] border border-[#eadfe5] bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{desc}</p>
    </div>
  );
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-[#f0e6eb] bg-[#fcfafb] px-4 py-3">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f3d7e4] text-xs font-bold text-[#9c4d75]">
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

function HeroPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#eadfe5] bg-white/90 px-4 py-2 text-sm text-slate-600 shadow-sm">
      {children}
    </span>
  );
}
