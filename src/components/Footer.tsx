import Link from "next/link";

const maisonClmUrl = "https://www.maisonclm.fr";

const mainLinks = [
  { href: "/shop", label: "Templates" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/library", label: "Bibliothèque" },
];

const legalLinks = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Politique de confidentialité" },
  { href: "/cgv", label: "CGV" },
];

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-[var(--border)] bg-white/72 px-4 py-10 backdrop-blur-sm sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-md">
          <p className="font-display text-2xl text-[var(--foreground)]">
            Maison CLM
          </p>

          <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/58">
            Templates élégants, sobres et personnalisables pour créer une
            présence en ligne plus propre, plus cohérente et plus premium.
          </p>

          <a
            href={maisonClmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm font-medium text-[var(--accent)] transition hover:text-[var(--foreground)]"
          >
            Visiter aussi maisonclm.fr ↗
          </a>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
              Navigation
            </p>

            <div className="mt-4 flex flex-col gap-3">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--foreground)]/62 transition hover:text-[var(--foreground)]"
                >
                  {link.label}
                </Link>
              ))}

              <a
                href={maisonClmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--foreground)]/62 transition hover:text-[var(--foreground)]"
              >
                Site Maison CLM ↗
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
              Informations
            </p>

            <div className="mt-4 flex flex-col gap-3">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--foreground)]/62 transition hover:text-[var(--foreground)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-[1400px] flex-col gap-2 border-t border-[var(--border)] pt-5 text-xs text-[var(--foreground)]/46 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Maison CLM. Tous droits réservés.</p>
        <p>Paiement sécurisé via Stripe • Templates accessibles dans ton compte</p>
      </div>
    </footer>
  );
}