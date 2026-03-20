"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { getCart, subscribeCart } from "@/lib/cart";

const navLinks = [
  { href: "/shop", label: "Templates" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/library", label: "Bibliothèque" },
];

export function Navbar() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabaseBrowser.auth.getUser();
      setUser(data.user ?? null);
      setLoading(false);
    }
    load();

    function refresh() {
      setCount(getCart().length);
    }

    refresh();
    const unsub = subscribeCart(refresh);
    return () => unsub();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleAccount() {
    if (!user) return;
    const { data } = await supabaseBrowser.from("profiles").select("is_admin").eq("id", user.id).single();
    window.location.href = data?.is_admin ? "/admin" : "/account";
  }

  const accountCta = loading ? null : user ? (
    <button onClick={handleAccount} className="classic-button-primary px-5 py-3 text-sm">
      Mon compte
    </button>
  ) : (
    <Link href="/auth" className="classic-button-primary px-5 py-3 text-sm">
      Se connecter
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/76 backdrop-blur-xl">
      <div className="mx-auto flex max-w-380 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Maison CLM" width={34} height={34} style={{ width: "auto", height: "auto" }} priority />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm font-medium text-[var(--foreground)]/82 transition hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]">
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className="relative ml-1 rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--foreground)]/82 transition hover:border-[var(--border-strong)]">
            Panier
            {count > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-bold text-white">{count}</span>}
          </Link>
          <div className="ml-3">{accountCta}</div>
        </nav>

        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-lg lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Ouvrir le menu">
          {open ? "×" : "☰"}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/15 px-4 pt-24 backdrop-blur-sm lg:hidden">
          <div className="mx-auto max-w-md rounded-[28px] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)]/78">
                  <span>{link.label}</span>
                  <span className="text-black/30">→</span>
                </Link>
              ))}
              <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]/82">
                <span>Panier</span>
                <span>{count} article{count > 1 ? "s" : ""}</span>
              </Link>
              <div className="pt-2" onClick={() => setOpen(false)}>{accountCta}</div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
