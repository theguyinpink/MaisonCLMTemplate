"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CartItem, getCart, removeFromCart } from "@/lib/cart";
import AuthRequiredModal from "@/components/cart/AuthRequiredModal";

function formatPrice(value: number, currency = "EUR") {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(value);
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    setItems(getCart());
  }, []);

  function remove(id: string) {
    removeFromCart(id);
    setItems(getCart());
  }

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      if (typeof item.price_amount !== "number") return total;
      return total + item.price_amount;
    }, 0);
  }, [items]);

  const currency = items[0]?.currency ?? "EUR";
  const formattedSubtotal = formatPrice(subtotal, currency);

  const summaryText = useMemo(() => {
    if (items.length === 0) {
      return "Ton panier est vide pour le moment.";
    }

    if (items.length === 1) {
      return `1 template prêt à être payé pour ${formattedSubtotal}.`;
    }

    return `${items.length} templates prêts à être payés pour ${formattedSubtotal}.`;
  }, [formattedSubtotal, items.length]);

  async function handleCheckout() {
    if (items.length === 0 || isCheckingOut) return;

    setCheckoutError(null);
    setIsCheckingOut(true);

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
        setIsCheckingOut(false);
        return;
      }

      if (!res.ok) {
        setCheckoutError(data.error || "Impossible de lancer le paiement.");
        setIsCheckingOut(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setCheckoutError("Impossible de rediriger vers le paiement.");
      setIsCheckingOut(false);
    } catch (error) {
      console.error(error);
      setCheckoutError("Une erreur est survenue pendant la création du paiement.");
      setIsCheckingOut(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
      <section className="overflow-hidden rounded-[36px] border border-[#eddce4] bg-[linear-gradient(135deg,rgba(248,238,243,0.96)_0%,rgba(255,255,255,0.99)_48%,rgba(252,244,248,0.96)_100%)] px-6 py-8 shadow-[0_24px_70px_rgba(20,20,43,0.05)] sm:px-8 sm:py-10 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-[#edcfe0] bg-white/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-[#c06293]">
              Panier Maison CLM
            </span>

            <h1
              className="mt-5 text-4xl leading-tight text-slate-900 sm:text-5xl lg:text-[3.4rem]"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Ton panier,
              <span className="mt-2 block text-[#d86aa2]">
                avant un passage au paiement simple et rassurant
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {summaryText}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <HeroPill>Accès dans ton compte</HeroPill>
              <HeroPill>Achat permanent</HeroPill>
              <HeroPill>Paiement sécurisé Stripe</HeroPill>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <MiniStat value={String(items.length)} label="templates" />
            <MiniStat value={formattedSubtotal} label="total" />
            <MiniStat value="Simple" label="checkout" />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_390px] lg:items-start">
        <div className="rounded-[32px] border border-[#ecdfe5] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 border-b border-[#f1e6ec] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                className="text-3xl text-slate-900"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Templates sélectionnés
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Vérifie ton panier avant paiement. Tu pourras retrouver tes
                achats directement dans ta bibliothèque après la commande.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-2xl border border-[#eadfe5] bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
              >
                Continuer mes achats
              </Link>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl bg-[#0f172a] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Voir les formules
              </Link>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="mt-8 rounded-[28px] border border-[#eadfe5] bg-[#fffafd] p-6 sm:p-8">
              <p className="text-xl font-semibold text-slate-900">
                Ton panier est vide pour l’instant.
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Quand tu ajouteras un template depuis la boutique, il apparaîtra
                ici avec son prix, son résumé et un accès direct au paiement.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#0f172a] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Explorer la boutique
                </Link>

                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#eadfe5] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
                >
                  Découvrir les formules
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {items.map((item, index) => {
                const imageUrl =
                  "image_url" in item
                    ? (item as CartItem & { image_url?: string | null }).image_url
                    : null;

                return (
                  <article
                    key={item.id}
                    className="grid gap-5 rounded-[28px] border border-[#eadfe5] bg-[linear-gradient(180deg,#fffafd_0%,#ffffff_100%)] p-5 shadow-sm sm:grid-cols-[140px_1fr_auto] sm:items-center"
                  >
                    <div className="overflow-hidden rounded-[22px] border border-[#f1e6ec] bg-white">
                      <div className="aspect-[4/3]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.title}
                            className="h-full w-full object-contain p-3"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-slate-400">
                            Aperçu du template
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Template {String(index + 1).padStart(2, "0")}
                      </p>

                      <h3 className="mt-2 text-xl font-semibold text-slate-900">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Base premium prête à être ajoutée à ton compte après le
                        paiement, pour démarrer plus vite avec une structure plus
                        claire et plus crédible.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <ItemPill>Accès permanent</ItemPill>
                        <ItemPill>Compte client</ItemPill>
                        <ItemPill>Paiement sécurisé</ItemPill>
                      </div>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                          Prix
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">
                          {item.price_label || "Prix à confirmer"}
                        </p>
                      </div>

                      <button
                        onClick={() => remove(item.id)}
                        className="rounded-2xl border border-[#eadfe5] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
                      >
                        Supprimer
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-[32px] border border-[#ecdfe5] bg-white p-5 shadow-sm sm:p-6">
            <h2
              className="text-3xl text-slate-900"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Résumé
            </h2>

            <div className="mt-5 space-y-3">
              <SummaryRow label="Templates" value={String(items.length)} />
              <SummaryRow label="Sous-total" value={formattedSubtotal} />
              <SummaryRow label="Paiement" value="Sécurisé Stripe" />
              <SummaryRow label="Accès" value="Bibliothèque client" />
            </div>

            <div className="mt-5 rounded-[24px] border border-[#f0e6eb] bg-[#fffafd] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#c06293]">
                Ce que tu reçois après paiement
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                <li>• Accès à tes templates dans ton compte</li>
                <li>• Achat permanent pour les templates unitaires</li>
                <li>• Une base prête à personnaliser pour ton projet</li>
              </ul>
            </div>

            {checkoutError ? (
              <div className="mt-5 rounded-2xl border border-[#f4d7dd] bg-[#fff7f8] px-4 py-3 text-sm text-[#a54d63]">
                {checkoutError}
              </div>
            ) : null}

            <button
              onClick={handleCheckout}
              disabled={items.length === 0 || isCheckingOut}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#0f172a] px-5 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCheckingOut
                ? "Redirection vers le paiement..."
                : `Payer${items.length > 0 ? ` • ${formattedSubtotal}` : ""}`}
            </button>

            <p className="mt-3 text-center text-xs leading-6 text-slate-400">
              Le paiement s’effectue via Stripe dans un environnement sécurisé.
            </p>

            <div className="mt-6 border-t border-[#f1e6ec] pt-5">
              <p className="text-sm font-medium text-slate-800">
                Tu hésites encore ?
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Les formules sont plus adaptées si tu veux accéder à davantage de
                templates et construire plusieurs projets plus facilement.
              </p>

              <Link
                href="/pricing"
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-[#eadfe5] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
              >
                Voir les formules
              </Link>
            </div>
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
    <div className="flex items-center justify-between rounded-2xl border border-[#f0e6eb] bg-[#fcfafb] px-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function HeroPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#eadfe5] bg-white/90 px-4 py-2 text-sm text-slate-600 shadow-sm">
      {children}
    </span>
  );
}

function ItemPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#eadfe5] bg-white px-3 py-1.5 text-xs text-slate-600">
      {children}
    </span>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[24px] border border-[#eadfe5] bg-white/88 px-5 py-4 text-center shadow-sm">
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.28em] text-[#c3759d]">
        {label}
      </p>
    </div>
  );
}