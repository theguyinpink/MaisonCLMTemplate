export function TestimonialCard() {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-black/80">Témoignage</p>
          <p className="mt-1 text-sm text-black/55">Ce que les gens pensent</p>
        </div>
        <div className="text-sm text-[var(--accent-dark)]">★★★★★</div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-black/65 sm:text-base">
        “Template super propre, facile à modifier et rendu très pro. Ça donne vraiment confiance.”
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full border border-[var(--border)] bg-[var(--accent-light)]" />
        <div>
          <p className="text-sm font-semibold">Inès</p>
          <p className="text-xs text-black/50">Cliente</p>
        </div>
      </div>
    </div>
  );
}
