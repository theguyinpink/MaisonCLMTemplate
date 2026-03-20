"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Est-ce que je peux modifier les couleurs et le texte ?",
    a: "Oui. Le template est pensé pour être facilement personnalisable : couleurs, textes, images et ambiance globale.",
  },
  {
    q: "Est-ce responsive mobile ?",
    a: "Oui, le design est pensé pour téléphone, tablette et desktop avec une structure propre dès le départ.",
  },
  {
    q: "Je reçois quoi après paiement ?",
    a: "La logique d’achat est en place. Le checkout final sera branché ensuite pour livrer les accès dans le compte client.",
  },
  {
    q: "Est-ce que je peux acheter plusieurs fois le même template ?",
    a: "Pas besoin : un achat correspond à un template. L’idée est de garder une expérience simple et claire.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-black/80">FAQ</h2>
        <div className="ml-4 h-px flex-1 bg-[var(--border)]" />
      </div>

      <div className="space-y-2">
        {FAQS.map((f, idx) => {
          const isOpen = open === idx;
          return (
            <button
              key={f.q}
              type="button"
              onClick={() => setOpen(isOpen ? null : idx)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-left transition hover:bg-white"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{f.q}</p>
                <span className="text-black/50">{isOpen ? "−" : "+"}</span>
              </div>
              {isOpen ? <p className="mt-2 text-sm leading-relaxed text-black/60">{f.a}</p> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
