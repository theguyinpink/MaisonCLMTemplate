export function TestimonialSingle() {
  return (
    <section className="mt-14 rounded-3xl border border-[var(--border)] bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold text-black/60">Témoignage</p>

      <div className="mt-4 flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-[var(--accent-light)]" />
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">Inès</p>
            <span className="text-sm text-black/50">— Site de photographie</span>
          </div>

          <p className="mt-2 leading-relaxed text-black/70">
            “Franchement, les templates sont super clean. Tout est fluide, moderne, et ça fait pro direct.”
          </p>

          <p className="mt-3 text-sm font-semibold text-[var(--accent)]">★★★★★</p>
        </div>
      </div>
    </section>
  );
}
