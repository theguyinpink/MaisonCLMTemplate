"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Est-ce que je peux modifier les couleurs, textes et images ?",
    a: "Oui. Les templates sont pensés pour être personnalisés rapidement : textes, visuels, palette et ambiance globale.",
  },
  {
    q: "Est-ce que les templates sont responsive ?",
    a: "Oui. Ils sont pensés pour téléphone, tablette et desktop avec une base propre dès le départ.",
  },
  {
    q: "Qu’est-ce que je reçois après paiement ?",
    a: "Après achat, le template est lié à ton compte et tu peux le retrouver dans ta bibliothèque pour démarrer ton projet.",
  },
  {
    q: "Quelle est la différence entre l’achat unitaire et les formules ?",
    a: "L’achat unitaire te donne l’accès permanent à un template précis. Les formules donnent accès à toute la bibliothèque avec davantage d’outils d’édition et d’accompagnement.",
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
              {isOpen ? (
                <p className="mt-2 text-sm leading-relaxed text-black/60">
                  {f.a}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
