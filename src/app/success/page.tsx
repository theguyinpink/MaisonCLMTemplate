import Link from "next/link";
import ClearCartOnSuccess from "@/components/cart/ClearCartOnSuccess";

type PageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const type = params.type;

  const isSubscription = type === "subscription";
  const isTemplate = type === "template";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-20">
      <ClearCartOnSuccess enabled={isTemplate} />

      <section className="w-full rounded-[32px] border border-[#ecdfe5] bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm uppercase tracking-[0.28em] text-[#d86aa2]">
          Maison CLM
        </p>

        <h1
          className="mt-4 text-4xl text-slate-900 sm:text-5xl"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Merci pour votre commande
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
          {isSubscription
            ? "Votre abonnement est maintenant actif. Vous pouvez découvrir et utiliser les templates disponibles dans votre bibliothèque."
            : "Votre achat a bien été pris en compte. Vous pouvez retrouver votre template dans votre bibliothèque et commencer votre projet."}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/library"
            className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-6 py-3 text-sm font-medium text-white"
          >
            Voir la bibliothèque
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full border border-[#ead6df] px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
          >
            Continuer mes achats
          </Link>
        </div>
      </section>
    </main>
  );
}