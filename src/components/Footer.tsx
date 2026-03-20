import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white/72 px-4 py-10 backdrop-blur-sm sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-380 flex-col gap-6 text-sm text-[var(--foreground)]/58 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-lg text-[var(--foreground)]">Maison CLM</p>
          <p className="mt-1 max-w-md text-sm leading-relaxed">
            Templates élégants, sobres et personnalisables dans le même univers que le site principal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link href="/shop" className="transition hover:text-[var(--foreground)]">Templates</Link>
          <Link href="/pricing" className="transition hover:text-[var(--foreground)]">Tarifs</Link>
          <Link href="/mentions-legales" className="transition hover:text-[var(--foreground)]">Mentions légales</Link>
          <Link href="/confidentialite" className="transition hover:text-[var(--foreground)]">Politique de confidentialité</Link>
          <Link href="/cgv" className="transition hover:text-[var(--foreground)]">CGV</Link>
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-380 border-t border-[var(--border)] pt-4 text-xs text-[var(--foreground)]/46">
        © 2026 Maison CLM. Tous droits réservés.
      </div>
    </footer>
  );
}
