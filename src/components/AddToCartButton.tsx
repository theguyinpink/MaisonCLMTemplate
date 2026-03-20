"use client";

import { addToCart } from "@/lib/cart";

export function AddToCartButton({ item }: { item: any }) {
  function handle() {
    addToCart(item);
    window.location.href = "/cart";
  }

  return (
    <button
      onClick={handle}
      className="mt-4 w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
    >
      Ajouter au panier
    </button>
  );
}
