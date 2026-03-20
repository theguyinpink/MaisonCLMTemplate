"use client";

import { useMemo, useState } from "react";

export function ImageCarousel({ images }: { images: string[] }) {
  const list = useMemo(() => images.filter(Boolean), [images]);
  const [current, setCurrent] = useState(0);

  if (!list.length) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-6 text-black/60">
        Aucune image disponible pour le moment.
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c === 0 ? list.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === list.length - 1 ? 0 : c + 1));

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]">
        <img src={list[current]} alt="Aperçu template" className="h-full w-full object-contain" />

        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-white/88 px-3 py-2 text-sm font-semibold text-black/75 shadow-sm"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-white/88 px-3 py-2 text-sm font-semibold text-black/75 shadow-sm"
            >
              →
            </button>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {list.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => setCurrent(index)}
              className={`overflow-hidden rounded-2xl border transition ${
                index === current
                  ? "border-[var(--border-strong)] bg-white accent-ring"
                  : "border-[var(--border)] bg-white/80"
              }`}
            >
              <img src={src} alt="Miniature template" className="h-20 w-28 object-contain bg-[var(--surface-soft)]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
