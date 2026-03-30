"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addToCart, isInCart } from "@/lib/cart";

type Props = {
  item: {
    id: string;
    slug: string;
    title: string;
    price_label?: string | null;
    price_amount?: number | null;
    currency?: string | null;
    image_url?: string | null;
  };
};

export default function AddToCartButton({ item }: Props) {
  const [added, setAdded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setAdded(isInCart(item.id));
    setJustAdded(false);
  }, [item.id]);

  useEffect(() => {
    if (!justAdded) return;

    const timer = window.setTimeout(() => {
      setJustAdded(false);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [justAdded]);

  function handleAdd() {
    if (isInCart(item.id)) {
      setAdded(true);
      setJustAdded(false);
      return;
    }

    addToCart({
      id: item.id,
      slug: item.slug,
      title: item.title,
      price_label: item.price_label ?? null,
      price_amount: item.price_amount ?? null,
      currency: item.currency ?? "EUR",
      image_url: item.image_url ?? null,
    });

    setAdded(true);
    setJustAdded(true);
  }

  if (added) {
    return (
      <div className="space-y-3" aria-live="polite">
        <div className="rounded-[24px] border border-[#f0e6eb] bg-[#fffafd] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#c06293]">
            {justAdded ? "Ajouté au panier" : "Déjà dans ton panier"}
          </p>

          <p className="mt-2 text-sm leading-7 text-slate-600">
            {justAdded
              ? "Ton template a bien été ajouté. Tu peux passer au panier ou continuer à explorer la boutique."
              : "Ce template est déjà présent dans ton panier. Tu peux le retrouver à tout moment avant paiement."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/cart"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0f172a] px-6 py-4 text-sm font-medium text-white transition hover:opacity-90"
          >
            Voir le panier
          </Link>

          <Link
            href="/shop"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-[#ead6df] px-6 py-4 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-[#0f172a] px-6 py-4text-sm font-medium text-white transition hover:opacity-90"
      >
        Ajouter au panier
      </button>

      <p className="text-center text-xs leading-6 text-slate-400">
        Achat unitaire avec accès permanent après paiement.
      </p>
    </div>
  );
}