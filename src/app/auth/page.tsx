"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const [showEmailNotice, setShowEmailNotice] = useState(false);

  async function submit() {
    setMsg(null);
    setShowEmailNotice(false);
    setBusy(true);

    try {
      if (mode === "login") {
        const { error } = await supabaseBrowser.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMsg(error.message);
          return;
        }

        setMsg("Connecté ✅");
        router.push("/");
        return;
      }

      const { error } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        setMsg(error.message);
        return;
      }

      setShowEmailNotice(true);
      setMsg(null);
      setMode("login");
      setPassword("");
    } catch (e: any) {
      setMsg(e?.message ?? "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <main className="mx-auto w-full max-w-380 px-4 py-10 sm:px-6 lg:px-10">
        <section className="grid gap-6 lg:grid-cols-[1fr_470px] lg:items-center">
          <div className="section-shell rounded-[34px] p-6 sm:p-8 lg:p-10">
            <div className="relative z-10 max-w-2xl">
              <p className="inline-flex rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-xs font-semibold text-black/55">
                Compte Maison CLM
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-black/90 sm:text-5xl">
                Accède à ton espace, à ta bibliothèque et à tes futurs achats.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-black/62 sm:text-base">
                L’auth reprend maintenant le style premium du site principal :
                plus clair, plus cohérent, et plus rassurant pour un utilisateur
                qui veut simplement se connecter sans friction.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <SmallCard
                  title="Connexion simple"
                  text="Accès rapide à ton espace."
                />
                <SmallCard title="Bibliothèque" text="Retrouve tes templates." />
                <SmallCard
                  title="Suite logique"
                  text="Parfait pour préparer le checkout plus tard."
                />
              </div>
            </div>
          </div>

          <div className="soft-card rounded-[34px] p-5 sm:p-6">
            <div className="rounded-[28px] border border-[var(--border)] bg-white p-5 sm:p-6">
              <div className="flex gap-2 rounded-full bg-[var(--accent-soft)] p-1">
                <button
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    mode === "login"
                      ? "bg-white text-black shadow-sm"
                      : "text-black/58"
                  }`}
                  onClick={() => setMode("login")}
                >
                  Connexion
                </button>
                <button
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    mode === "signup"
                      ? "bg-white text-black shadow-sm"
                      : "text-black/58"
                  }`}
                  onClick={() => setMode("signup")}
                >
                  Inscription
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-black/72">
                    Email
                  </span>
                  <input
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--border-strong)] focus:ring-4 focus:ring-[rgba(216,106,162,0.08)]"
                    placeholder="ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-black/72">
                    Mot de passe
                  </span>
                  <input
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 outline-none transition focus:border-[var(--border-strong)] focus:ring-4 focus:ring-[rgba(216,106,162,0.08)]"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>

                <button
                  className="w-full rounded-2xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:opacity-60"
                  onClick={submit}
                  disabled={busy}
                >
                  {busy
                    ? "Chargement..."
                    : mode === "login"
                      ? "Se connecter"
                      : "Créer mon compte"}
                </button>

                {msg ? (
                  <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-black/72">
                    {msg}
                  </p>
                ) : null}

                <Link
                  href="/shop"
                  className="block text-center text-sm font-medium text-black/56 transition hover:text-black"
                >
                  Retour à la boutique
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showEmailNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-[var(--border)] bg-white p-6 shadow-xl">
            <h2
              className="text-2xl text-black/90"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Vérifie ton email
            </h2>

            <p className="mt-3 text-sm leading-7 text-black/65">
              Merci, ton compte a bien été créé.
              <br />
              Pour l’activer, vérifie maintenant tes emails et pense aussi à
              regarder dans les spams.
            </p>

            <button
              type="button"
              onClick={() => setShowEmailNotice(false)}
              className="mt-5 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
            >
              J’ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function SmallCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[22px] border border-[var(--border)] bg-white/85 p-4 shadow-sm">
      <p className="text-sm font-semibold text-black/82">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-black/58">{text}</p>
    </div>
  );
}