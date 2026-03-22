import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-380 px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <section className="hero-shell rounded-[38px] px-6 py-16 sm:px-10 lg:px-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 left-0 w-40 bg-[linear-gradient(90deg,rgba(245,227,236,0.85),transparent)]" />
          <div className="absolute inset-y-0 right-0 w-40 bg-[linear-gradient(270deg,rgba(245,227,236,0.85),transparent)]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="font-display text-5xl leading-none text-[var(--foreground)] sm:text-6xl lg:text-7xl">
            Templates de sites web
            <span className="mt-3 block italic text-[var(--accent)]">modernes & élégants</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[var(--foreground)]/58">
            Une base premium pour lancer un site plus vite, avec le même esprit que Maison CLM :
            sobre, classe, lisible et pensé pour mettre en valeur ton activité.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/shop" className="classic-button-primary min-w-52 px-8 py-4 text-base">
              Voir les templates
            </Link>
            <Link href="/library" className="classic-button-secondary min-w-52 px-8 py-4 text-base">
              Ouvrir la bibliothèque
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="section-shell grid rounded-[34px] p-6 sm:p-8 lg:grid-cols-[1.05fr_0.8fr] lg:items-center lg:gap-10 lg:p-12">
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-4xl leading-tight text-[var(--foreground)] sm:text-5xl">
              L’art du détail au service du web
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--foreground)]/60">
              Chaque template est pensé pour donner une impression professionnelle immédiatement :
              structure claire, typographie élégante, hiérarchie lisible et ambiance douce.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[var(--foreground)]/60">
              L’idée n’est pas de faire un site chargé ou trop démonstratif, mais une base rassurante,
              moderne et facile à personnaliser pour tes futurs clients ou tes propres projets.
            </p>
          </div>

          <div className="rose-panel relative z-10 mt-8 rounded-[30px] p-8 text-center lg:mt-0 lg:p-10">
            <div className="space-y-8">
              <div>
                <p className="text-6xl font-semibold text-[var(--foreground)]">+20</p>
                <p className="mt-2 text-sm uppercase tracking-[0.32em] text-[var(--accent-dark)]/80">univers cohérent</p>
              </div>
              <div className="mx-auto h-px w-20 bg-white/70" />
              <div>
                <p className="text-6xl font-semibold text-[var(--foreground)]">100%</p>
                <p className="mt-2 text-sm uppercase tracking-[0.32em] text-[var(--accent-dark)]/80">personnalisable</p>
              </div>
              <div className="mx-auto h-px w-20 bg-white/70" />
              <div>
                <p className="text-4xl font-semibold text-[var(--foreground)]">1 objectif</p>
                <p className="mt-2 text-sm uppercase tracking-[0.28em] text-[var(--accent-dark)]/80">t’aider à lancer plus vite</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-4xl text-[var(--foreground)] sm:text-5xl">Pourquoi cette boutique existe</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--foreground)]/56 sm:text-lg">
            Proposer des modèles prêts à l’emploi, dans un style plus intemporel et plus premium que les interfaces trop chargées.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <FeatureCard title="Élégant" desc="Une direction artistique claire, féminine et haut de gamme, avec ton rose pastel en fil conducteur." />
          <FeatureCard title="Simple à adapter" desc="Tu remplaces les textes, les images, les couleurs principales et tu obtiens vite un site cohérent." />
          <FeatureCard title="Pensé pour vendre" desc="Les sections sont faites pour rassurer, présenter l’offre et guider vers la prise de contact ou l’achat." />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="soft-card rounded-[28px] p-6 sm:p-7">
      <h3 className="font-display text-3xl text-[var(--foreground)]">{title}</h3>
      <p className="mt-4 text-base leading-relaxed text-[var(--foreground)]/58">{desc}</p>
    </div>
  );
}
