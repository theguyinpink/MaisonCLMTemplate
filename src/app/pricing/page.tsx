import Link from "next/link";
import { getCurrentUserId, getActiveSubscription } from "@/lib/access";
import CheckoutButton from "@/components/stripe/CheckoutButton";

export default async function PricingPage() {
  const userId = await getCurrentUserId();
  const isLoggedIn = !!userId;
  const subscription = userId ? await getActiveSubscription(userId) : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.28em] text-[#d86aa2]">
          Formules Maison CLM
        </p>

        <h1
          className="text-5xl text-slate-900 md:text-6xl"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Choisis la formule qui correspond à ta façon de créer
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Tous les templates restent accessibles, et tu choisis ensuite ton niveau
          de liberté dans l’édition.
        </p>
      </div>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <article className="rounded-[32px] border border-[#edd7e2] bg-white/80 p-10 shadow-[0_20px_60px_rgba(20,20,43,0.06)] backdrop-blur">
          <div className="border-b border-[#f2e4eb] pb-8">
            <h2
              className="text-3xl text-slate-900"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Formule Pro
            </h2>
            <p className="mt-2 text-slate-600">
              Pour les personnes à l’aise avec le code.
            </p>

            <div className="mt-6">
              <div className="text-4xl font-semibold text-slate-900">30€</div>
              <div className="text-sm text-slate-500">/ mois</div>
            </div>
          </div>

          <ul className="mt-8 grid gap-4 text-slate-700">
            <li>Bibliothèque complète</li>
            <li>Éditeur intégré</li>
            <li>Guides clairs</li>
            <li>Sauvegarde des projets</li>
            <li>Export ZIP</li>
            <li>Sans mode visuel</li>
          </ul>

          <div className="mt-10">
            {!isLoggedIn && (
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-6 py-3 text-sm font-medium text-white"
              >
                Se connecter pour s’abonner
              </Link>
            )}

            {isLoggedIn && !subscription && (
              <CheckoutButton
                plan="pro"
                className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-6 py-3 text-sm font-medium text-white"
              >
                Souscrire à la formule Pro
              </CheckoutButton>
            )}

            {subscription?.plan === "pro" && (
              <span className="rounded-full bg-[#f7e5ee] px-4 py-2 text-sm text-[#a64f7d]">
                Formule active
              </span>
            )}
          </div>
        </article>

        <article className="rounded-[32px] border border-[#edd7e2] bg-white/80 p-10 shadow-[0_20px_60px_rgba(20,20,43,0.06)] backdrop-blur">
          <div className="border-b border-[#f2e4eb] pb-8">
            <h2
              className="text-3xl text-slate-900"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Formule Studio
            </h2>
            <p className="mt-2 text-slate-600">
              La formule premium avec preview live et édition visuelle.
            </p>

            <div className="mt-6">
              <div className="text-4xl font-semibold text-slate-900">50€</div>
              <div className="text-sm text-slate-500">/ mois</div>
            </div>
          </div>

          <ul className="mt-8 grid gap-4 text-slate-700">
            <li>Bibliothèque complète</li>
            <li>Éditeur intégré</li>
            <li>Preview live</li>
            <li>Guides clairs</li>
            <li>Sauvegarde des projets</li>
            <li>Export ZIP</li>
          </ul>

          <div className="mt-10">
            {!isLoggedIn && (
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-6 py-3 text-sm font-medium text-white"
              >
                Se connecter pour s’abonner
              </Link>
            )}

            {isLoggedIn && !subscription && (
              <CheckoutButton
                plan="studio"
                className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-6 py-3 text-sm font-medium text-white"
              >
                Souscrire à la formule Studio
              </CheckoutButton>
            )}

            {subscription?.plan === "studio" && (
              <span className="rounded-full bg-[#f7e5ee] px-4 py-2 text-sm text-[#a64f7d]">
                Formule active
              </span>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}