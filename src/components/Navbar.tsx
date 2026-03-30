"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { getCart, subscribeCart } from "@/lib/cart";

const navLinks = [
  { href: "/shop", label: "Templates" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/library", label: "Bibliothèque" },
];

const maisonClmUrl = "https://www.maisonclm.fr";

export function Navbar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabaseBrowser.auth.getUser();
      setUserId(data.user?.id ?? null);
      setLoading(false);
    }

    loadUser();

    const { data: authListener } = supabaseBrowser.auth.onAuthStateChange(
      async (_event, session) => {
        setUserId(session?.user?.id ?? null);
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function refreshCart() {
      setCount(getCart().length);
    }

    refreshCart();
    const unsubscribe = subscribeCart(refreshCart);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleAccount() {
    if (!userId) return;

    const { data } = await supabaseBrowser
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    window.location.href = data?.is_admin ? "/admin" : "/account";
  }

  const accountCta = useMemo(() => {
    if (loading) {
      return (
        <div className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-[var(--foreground)]/45">
          Chargement...
        </div>
      );
    }

    if (userId) {
      return (
        <button
          onClick={handleAccount}
          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Mon compte
        </button>
      );
    }

    return (
      <Link
        href="/auth"
        className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        Se connecter
      </Link>
    );
  }, [loading, userId]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/78 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-white shadow-sm transition group-hover:border-[var(--border-strong)] group-hover:bg-[var(--accent-soft)]">
              <Image
                src="/logo.png"
                alt="Maison CLM"
                width={30}
                height={30}
                style={{ width: "auto", height: "auto" }}
                priority
              />
            </div>

            <div className="hidden min-[430px]:block">
              <p className="text-sm font-semibold text-[var(--foreground)]/88">
                Maison CLM Templates
              </p>
              <p className="text-xs text-[var(--foreground)]/52">
                Premium templates & bibliothèque
              </p>
            </div>
          </Link>

          <a
            href={maisonClmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-sm font-medium text-[var(--foreground)]/62 transition hover:border-[var(--border-strong)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)] xl:inline-flex"
          >
            maisonclm.fr ↗
          </a>
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-white/88 px-2 py-2 shadow-sm">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-[var(--accent-soft)] text-[var(--foreground)]"
                      : "text-[var(--foreground)]/75 hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <Link
            href="/cart"
            className={`relative inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition ${
              pathname === "/cart"
                ? "bg-[var(--accent-soft)] text-[var(--foreground)]"
                : "text-[var(--foreground)]/75 hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
            }`}
          >
            Panier
            {count > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[11px] font-bold text-white shadow-sm">
                {count}
              </span>
            ) : null}
          </Link>

          <div className="ml-1">{accountCta}</div>
        </nav>

        <button
          type="button"
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-white text-lg text-[var(--foreground)]/82 shadow-sm transition hover:border-[var(--border-strong)] hover:bg-[var(--accent-soft)] lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/18 px-4 pt-24 backdrop-blur-sm lg:hidden">
          <div className="mx-auto max-w-md rounded-[30px] border border-[var(--border)] bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
            <div className="mb-4 rounded-[24px] border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-4">
              <p className="text-sm font-semibold text-[var(--foreground)]/88">
                Navigation Maison CLM
              </p>
              <p className="mt-1 text-sm text-[var(--foreground)]/58">
                Accède rapidement à la boutique, à tes formules et à ton compte.
              </p>
            </div>

            <div className="space-y-2">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex min-h-[56px] items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "border-[var(--border-strong)] bg-[var(--accent-soft)] text-[var(--foreground)]"
                        : "border-[var(--border)] bg-white text-[var(--foreground)]/78"
                    }`}
                  >
                    <span>{link.label}</span>
                    <span className="text-black/30">→</span>
                  </Link>
                );
              })}

              <a
                href={maisonClmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[56px] items-center justify-between rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)]/78"
              >
                <span>Site Maison CLM</span>
                <span className="text-black/30">↗</span>
              </a>

              <Link
                href="/cart"
                className="flex min-h-[56px] items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]/82"
              >
                <span>Panier</span>
                <span>
                  {count} article{count > 1 ? "s" : ""}
                </span>
              </Link>

              <div className="pt-2">{accountCta}</div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
