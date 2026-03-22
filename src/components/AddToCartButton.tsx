"use client";

import { useState } from "react";
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
  const [added, setAdded] = useState(isInCart(item.id));

  const handleAdd = () => {
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
  };

  

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={added}
      className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#0f172a] px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {added ? "Ajouté au panier" : "Acheter ce template"}
    </button>
  );
}