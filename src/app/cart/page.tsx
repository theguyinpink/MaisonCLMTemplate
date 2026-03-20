"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCart, removeFromCart, CartItem } from "@/lib/cart";
import AuthRequiredModal from "@/components/cart/AuthRequiredModal";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setItems(getCart());
  }, []);

  function remove(id: string) {
    removeFromCart(id);
    setItems(getCart());
  }

  const summaryText = useMemo(() => {
    if (items.length === 0) return "Ton panier est vide pour le moment.";
    if (items.length === 1)
      return "1 template prêt à passer à l’étape suivante.";
    return `${items.length} templates prêts à passer à l’étape suivante.`;
  }, [items]);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      const res = await fetch("/api/stripe/checkout-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            price_amount: item.price_amount,
            currency: item.currency,
          })),
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        setShowAuthModal(true);
        return;
      }

      if (!res.ok) {
        console.error("Erreur checkout template :", data);
        alert(data.error || "Impossible de lancer le paiement.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue pendant la création du paiement.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-380 px-4 py-10 sm:px-6 lg:px-10">
      <section className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="section-shell rounded-[34px] p-6 sm:p-8">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-xs font-semibold text-black/55">
                Panier Maison CLM
              </p>
              <h1 className="mt-4 text-4xl font-display text-black/90 sm:text-5xl">
                Ton panier
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-black/60 sm:text-base">
                {summaryText}
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-black/75 transition hover:border-[var(--border-strong)] hover:bg-[var(--accent-soft)]"
            >
              Continuer mes achats
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="relative z-10 mt-8 rounded-[28px] border border-[var(--border)] bg-white/85 p-6">
              <p className="text-lg font-semibold text-black/82">
                Aucun template pour l’instant.
              </p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-black/58">
                Quand tu ajouteras un template depuis la boutique, il apparaîtra
                ici avec une présentation plus claire et plus premium.
              </p>
            </div>
          ) : (
            <div className="relative z-10 mt-8 space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="grid gap-4 rounded-[28px] border border-[var(--border)] bg-white/88 p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/38">
                      Template {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-black/88">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm text-black/56">
                      {item.price_label || "Sur devis"}
                    </p>
                  </div>

                  <button
                    onClick={() => remove(item.id)}
                    className="cursor-pointer rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-black/72 transition hover:border-[var(--border-strong)] hover:bg-[var(--accent-soft)]"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="soft-card rounded-[34px] p-5 sm:p-6 lg:sticky lg:top-28">
          <div className="rounded-[28px] border border-[var(--border)] bg-white p-5">
            <h2 className="text-xl font-semibold text-black/85">Résumé</h2>
            <div className="mt-5 space-y-3">
              <SummaryRow label="Templates" value={String(items.length)} />
              <SummaryRow label="Checkout" value="Sécurisé Stripe" />
              <SummaryRow label="Accès" value="Compte client" />
            </div>

            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="mt-5 inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Payer
            </button>
          </div>
        </aside>
      </section>

      <AuthRequiredModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onConfirm={() => {
          window.location.href = "/auth?redirect=/cart";
        }}
      />
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
      <span className="text-sm text-black/58">{label}</span>
      <span className="text-sm font-semibold text-black/80">{value}</span>
    </div>
  );
}