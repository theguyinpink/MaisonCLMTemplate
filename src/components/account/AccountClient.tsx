"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

/* ===================== Types (simples & robustes) ===================== */

type Profile = {
  id: string;
  email: string;
  civility: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: string | null; // yyyy-mm-dd
  created_at?: string | null;
  subscription_status?: string | null;
  current_period_end?: string | null;
};

type Stats = { orders: number; favorites: number };

type TemplateLite = {
  id: string;
  slug: string;
  title: string;
  thumb: string | null;
};

type FavoriteRow = {
  template_id: string;
  templates?: { id: string; slug: string; title: string } | null;
};

type Address = {
  id: string;
  user_id: string;
  type: string | null; // billing
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  created_at?: string | null;
};

type OrderLite = {
  id: string;
  status: string | null;
  created_at: string;
};

type ProjectLite = {
  id: string;
  name: string;
  created_at: string;
  template?: { slug: string; title: string } | null;
  thumb: string | null;
};

/* ===================== Helpers ===================== */

function formatDateFR(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AccountClient() {
  /* ===================== Hooks (ordre stable) ===================== */
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ orders: 0, favorites: 0 });

  const [tab, setTab] = useState<
    "home" | "projects" | "orders" | "favorites" | "addresses" | "profile" | "help"
  >("home");

  // Data account
  const [lastOrder, setLastOrder] = useState<OrderLite | null>(null);
  const [favorites, setFavorites] = useState<TemplateLite[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [lastProject, setLastProject] = useState<ProjectLite | null>(null);

  // Profil form
  const [form, setForm] = useState({
    civility: "",
    first_name: "",
    last_name: "",
    phone: "",
    birth_date: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Address form
  const [addrEditingId, setAddrEditingId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({
    type: "billing",
    address_line1: "",
    address_line2: "",
    postal_code: "",
    city: "",
    country: "France",
  });
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrMsg, setAddrMsg] = useState<string | null>(null);

  const memberSince = useMemo(() => {
    const d = profile?.created_at ? new Date(profile.created_at) : null;
    return d
      ? d.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
      : null;
  }, [profile?.created_at]);

  /* ===================== Load everything (client auth) ===================== */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const { data: uData } = await supabaseBrowser.auth.getUser();
      const u = uData.user;
      if (cancelled) return;

      setUser(u);

      if (!u) {
        setProfile(null);
        setStats({ orders: 0, favorites: 0 });
        setFavorites([]);
        setAddresses([]);
        setLastOrder(null);
        setLoading(false);
        return;
      }

      // Profile
      const { data: p, error: pErr } = await supabaseBrowser
        .from("profiles")
        .select("*, subscription_status, current_period_end")
        .eq("id", u.id)
        .single();

      if (pErr) console.error("profiles select:", pErr);
      if (cancelled) return;
      setProfile((p as Profile) ?? null);

      // Stats
      const { count: favs } = await supabaseBrowser
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", u.id);

      const { count: ords } = await supabaseBrowser
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", u.id);

      if (cancelled) return;
      setStats({ favorites: favs ?? 0, orders: ords ?? 0 });

      // Last order
      const { data: lo } = await supabaseBrowser
        .from("orders")
        .select("id, status, created_at")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      setLastOrder((lo as OrderLite) ?? null);

      // Favorites list (avec templates)
      const { data: favRows, error: favErr } = await supabaseBrowser
        .from("favorites")
        .select("template_id, templates:templates(id, slug, title)")
        .eq("user_id", u.id)
        .limit(12);

      if (favErr) console.error("favorites list:", favErr);

      const baseFavs: TemplateLite[] =
        (favRows as FavoriteRow[] | null)?.map((r) => ({
          id: r.templates?.id ?? r.template_id,
          slug: r.templates?.slug ?? "",
          title: r.templates?.title ?? "Template",
          thumb: null,
        })) ?? [];

      // Thumbnails pour favoris (via template_images)
      const favIds = baseFavs.map((t) => t.id).filter(Boolean);
      let thumbs = new Map<string, string>();

      if (favIds.length) {
        const { data: imgs } = await supabaseBrowser
          .from("template_images")
          .select("template_id, url, is_thumbnail, position, role")
          .in("template_id", favIds);

        (imgs ?? []).forEach((im: any) => {
          // on prend la meilleure image par template
          const current = thumbs.get(im.template_id);
          const score =
            (im.is_thumbnail ? 100 : 0) + (im.role === "home" ? 50 : 0) - (im.position ?? 0);
          // si pas d’image, on met direct
          if (!current) {
            thumbs.set(im.template_id, im.url);
            (thumbs as any).__score ??= new Map<string, number>();
            (thumbs as any).__score.set(im.template_id, score);
          } else {
            const prevScore = (thumbs as any).__score?.get(im.template_id) ?? -999;
            if (score > prevScore) {
              thumbs.set(im.template_id, im.url);
              (thumbs as any).__score.set(im.template_id, score);
            }
          }
        });
      }

      const favsWithThumb = baseFavs.map((t) => ({
        ...t,
        thumb: thumbs.get(t.id) ?? null,
      }));

      if (cancelled) return;
      setFavorites(favsWithThumb);

      // Addresses
      const { data: addrRows, error: addrErr } = await supabaseBrowser
        .from("addresses")
        .select("*")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });

      if (addrErr) console.error("addresses:", addrErr);
      if (cancelled) return;
      setAddresses((addrRows as Address[]) ?? []);

      // Projects (éditeur)
      const { data: projRows, error: projErr } = await supabaseBrowser
        .from("user_projects")
        .select("id, name, created_at, templates:templates(slug, title)")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (projErr) console.error("projects:", projErr);

      const baseProjects: ProjectLite[] =
        (projRows as any[] | null)?.map((r) => ({
          id: r.id,
          name: r.name,
          created_at: r.created_at,
          template: r.templates ?? null,
          thumb: null,
        })) ?? [];

      // thumbs pour projets (via template_images)
      const templateIds = baseProjects
        .map((r) => (r as any)?.template_id)
        .filter(Boolean);

      // On n'a pas template_id dans le select ci-dessus (selon ton schéma), donc on fait simple :
      // si tu veux les thumbs projets, on les récupère à partir du slug via les templates.
      // MVP : on garde thumb null (le plus important, c’est l’accès au studio).

      setProjects(baseProjects);
      setLastProject(baseProjects[0] ?? null);

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Hydrate profile form when profile changes
  useEffect(() => {
    if (!profile) return;
    setForm({
      civility: profile.civility ?? "",
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      phone: profile.phone ?? "",
      birth_date: profile.birth_date ?? "",
    });
  }, [profile]);

  /* ===================== Actions ===================== */

  async function logout() {
    await supabaseBrowser.auth.signOut();
    window.location.href = "/shop";
  }

  async function saveProfile() {
    if (!user) return;
    setSavingProfile(true);
    setSaveMsg(null);

    const payload = {
      civility: form.civility || null,
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      phone: form.phone || null,
      birth_date: form.birth_date || null,
    };

    const { error } = await supabaseBrowser.from("profiles").update(payload).eq("id", user.id);

    if (error) {
      console.error("profiles update:", error);
      setSaveMsg("Erreur lors de l’enregistrement.");
      setSavingProfile(false);
      return;
    }

    setProfile((prev) => (prev ? ({ ...prev, ...payload } as Profile) : prev));
    setSaveMsg("Enregistré ✅");
    setSavingProfile(false);
  }

  function startEditAddress(a: Address) {
    setAddrEditingId(a.id);
    setAddrMsg(null);
    setAddrForm({
      type: a.type ?? "billing",
      address_line1: a.address_line1 ?? "",
      address_line2: a.address_line2 ?? "",
      postal_code: a.postal_code ?? "",
      city: a.city ?? "",
      country: a.country ?? "France",
    });
  }

  function startNewAddress() {
    setAddrEditingId(null);
    setAddrMsg(null);
    setAddrForm({
      type: "billing",
      address_line1: "",
      address_line2: "",
      postal_code: "",
      city: "",
      country: "France",
    });
  }

  async function saveAddress() {
    if (!user) return;
    setSavingAddr(true);
    setAddrMsg(null);

    const payload = {
      user_id: user.id,
      type: addrForm.type || "billing",
      address_line1: addrForm.address_line1 || null,
      address_line2: addrForm.address_line2 || null,
      postal_code: addrForm.postal_code || null,
      city: addrForm.city || null,
      country: addrForm.country || null,
    };

    if (addrEditingId) {
      const { error } = await supabaseBrowser.from("addresses").update(payload).eq("id", addrEditingId);
      if (error) {
        console.error("addresses update:", error);
        setAddrMsg("Erreur lors de la mise à jour.");
        setSavingAddr(false);
        return;
      }
      setAddresses((prev) => prev.map((a) => (a.id === addrEditingId ? ({ ...a, ...payload } as Address) : a)));
      setAddrMsg("Adresse mise à jour ✅");
    } else {
      const { data, error } = await supabaseBrowser.from("addresses").insert(payload).select("*").single();
      if (error) {
        console.error("addresses insert:", error?.message, error);
        setAddrMsg("Erreur lors de l’ajout.");
        setSavingAddr(false);
        return;
      }
      setAddresses((prev) => [data as Address, ...prev]);
      setAddrMsg("Adresse ajoutée ✅");
    }

    setSavingAddr(false);
  }

  async function deleteAddress(id: string) {
    if (!confirm("Supprimer cette adresse ?")) return;

    const { error } = await supabaseBrowser.from("addresses").delete().eq("id", id);
    if (error) {
      console.error("addresses delete:", error);
      alert("Impossible de supprimer.");
      return;
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  /* ===================== Guards ===================== */

  if (loading) return <div className="p-10">Chargement...</div>;
  if (!user) return <div className="p-10">Vous devez être connecté.</div>;
  if (!profile) return <div className="p-10">Profil introuvable.</div>;

  const subActive = profile.subscription_status === "active" || profile.subscription_status === "trialing";

  /* ===================== UI ===================== */

  return (
    <main className="mx-auto w-full max-w-380 px-4 sm:px-6 lg:px-10 py-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-black/90">Mon compte</h1>
          <p className="text-sm text-black/55 mt-1">{profile.email}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-black/10 bg-white px-3 py-1">
              {stats.orders} commandes
            </span>
            <span className="rounded-full border border-black/10 bg-white px-3 py-1">
              {stats.favorites} favoris
            </span>
            <span className="rounded-full border border-black/10 bg-white px-3 py-1">
              Membre depuis {memberSince ?? "—"}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Se déconnecter
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        <TabButton active={tab === "home"} onClick={() => setTab("home")}>Accueil</TabButton>
        <TabButton active={tab === "projects"} onClick={() => setTab("projects")}>Mes sites</TabButton>
        <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>Mes commandes</TabButton>
        <TabButton active={tab === "favorites"} onClick={() => setTab("favorites")}>Favoris</TabButton>
        <TabButton active={tab === "addresses"} onClick={() => setTab("addresses")}>Adresses</TabButton>
        <TabButton active={tab === "profile"} onClick={() => setTab("profile")}>Profil</TabButton>
        <TabButton active={tab === "help"} onClick={() => setTab("help")}>Aide</TabButton>
      </div>

      {/* Content */}
      <div className="mt-8 space-y-10">
        {/* ===================== HOME ===================== */}
        {tab === "home" && (
          <div className="space-y-8">
            {/* Subscription banner */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">Abonnement</h2>
                  <p className="text-sm text-black/55 mt-1">
                    {subActive ? "Actif ✅ — tu peux sauvegarder et exporter tes sites." : "Inactif — l’éditeur est verrouillé pour sauvegarde/export."}
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#e0b5cb] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  Voir l’offre
                </Link>
              </div>
            </div>

            {/* Last project */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">Mon dernier site</h2>
                <button onClick={() => setTab("projects")} className="text-sm font-semibold text-[#e0b5cb]">
                  Voir mes sites →
                </button>
              </div>

              {!lastProject ? (
                <div className="mt-3">
                  <p className="text-sm text-black/55">Tu n’as pas encore créé de projet.</p>
                  <Link
                    href="/library"
                    className="mt-4 inline-flex rounded-2xl bg-[#e0b5cb] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Créer mon premier site
                  </Link>
                </div>
              ) : (
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="text-sm text-black/55">{formatDateFR(lastProject.created_at)}</div>
                    <div className="mt-1 font-semibold text-black/85">{lastProject.name}</div>
                    {lastProject.template?.title ? (
                      <div className="text-sm text-black/55">Template : {lastProject.template.title}</div>
                    ) : null}
                  </div>
                  <Link
                    href={`/studio/${lastProject.id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/75 hover:bg-black/5 transition"
                  >
                    Ouvrir l’éditeur
                  </Link>
                </div>
              )}
            </div>

            {/* Last order */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Dernière commande</h2>
                <Link href="/account" onClick={() => setTab("orders")} className="text-sm font-semibold text-[#e0b5cb]">
                  Voir tout →
                </Link>
              </div>

              {!lastOrder ? (
                <p className="text-sm text-black/55 mt-2">Aucune commande pour le moment.</p>
              ) : (
                <div className="mt-3 text-sm text-black/60">
                  <div>Commande du {formatDateFR(lastOrder.created_at)}</div>
                  <div>Statut : {lastOrder.status ?? "—"}</div>
                </div>
              )}
            </div>

            {/* Favorites preview */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black/85">Mes articles favoris</h2>
                <button
                  onClick={() => setTab("favorites")}
                  className="text-sm font-semibold text-[#e0b5cb]"
                >
                  Voir tout →
                </button>
              </div>

              {favorites.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-black/5 bg-[#f7fbff] p-6">
                  <p className="text-sm text-black/55">
                    Tu n’as encore aucun favori.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-4 inline-flex rounded-2xl bg-[#e0b5cb] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Explorer la boutique
                  </Link>
                </div>
              ) : (
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                  {favorites.slice(0, 6).map((t) => (
                    <Link
                      key={t.id}
                      href={`/product/${t.slug}`}
                      className="min-w-55 rounded-2xl border border-black/5 bg-white p-4 shadow-sm hover:bg-black/2"
                    >
                      <div className="h-28 overflow-hidden rounded-xl bg-black/5">
                        {t.thumb ? (
                          <img src={t.thumb} alt={t.title} className="h-full w-full object-contain p-2" />
                        ) : null}
                      </div>
                      <p className="mt-3 font-semibold">{t.title}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="text-lg font-semibold text-black/85">Accès rapides</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/contact" className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                  <p className="font-semibold">Me contacter</p>
                  <p className="text-sm text-black/50 mt-1">Support & questions</p>
                </Link>

                <button
                  onClick={() => setTab("favorites")}
                  className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm text-left"
                >
                  <p className="font-semibold">Mes favoris</p>
                  <p className="text-sm text-black/50 mt-1">Retrouver mes listes</p>
                </button>

                <Link href="/shop" className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                  <p className="font-semibold">Templates stars</p>
                  <p className="text-sm text-black/50 mt-1">Les plus populaires</p>
                </Link>

                <button
                  onClick={() => setTab("profile")}
                  className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm text-left"
                >
                  <p className="font-semibold">Mes informations</p>
                  <p className="text-sm text-black/50 mt-1">Modifier mon profil</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== ORDERS ===================== */}
        {tab === "orders" && (
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Mes commandes</h2>
            <p className="text-sm text-black/55 mt-2">
              On branche la liste complète (avec order_items + téléchargements) juste après.
              Déjà, ton espace est prêt et non vide.
            </p>
          </div>
        )}

        {/* ===================== PROJECTS ===================== */}
        {tab === "projects" && (
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Mes sites</h2>
                <p className="text-sm text-black/55 mt-1">
                  Tes projets personnalisés (éditeur + preview + export ZIP).
                </p>
              </div>
              <Link
                href="/library"
                className="inline-flex items-center justify-center rounded-2xl bg-[#e0b5cb] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Créer un nouveau site
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-black/10 bg-[#f7fbff] p-6">
                <p className="text-sm text-black/55">Aucun projet pour l’instant.</p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
                  >
                    <div className="text-xs text-black/45">Créé le {formatDateFR(p.created_at)}</div>
                    <div className="mt-1 font-semibold text-black/85">{p.name}</div>
                    {p.template?.title ? (
                      <div className="mt-1 text-sm text-black/55">Template : {p.template.title}</div>
                    ) : null}
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/studio/${p.id}`}
                        className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#e0b5cb] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
                      >
                        Ouvrir
                      </Link>
                      <a
                        href={`/api/projects/${p.id}/download`}
                        className={`inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/75 hover:bg-black/5 transition ${
                          subActive ? "" : "pointer-events-none opacity-50"
                        }`}
                      >
                        ZIP
                      </a>
                    </div>
                    {!subActive ? (
                      <p className="mt-2 text-xs text-black/45">🔒 Abonnement requis pour l’export.</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== FAVORITES (full) ===================== */}
        {tab === "favorites" && (
          <div>
            <h2 className="text-lg font-semibold text-black/85">Mes articles favoris</h2>

            {favorites.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-black/5 bg-[#f7fbff] p-6">
                <p className="text-sm text-black/55">Aucun favori.</p>
                <Link
                  href="/shop"
                  className="mt-4 inline-flex rounded-2xl bg-[#e0b5cb] px-4 py-2 text-sm font-semibold text-white"
                >
                  Explorer
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {favorites.map((t) => (
                  <Link
                    key={t.id}
                    href={`/product/${t.slug}`}
                    className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm hover:bg-black/2"
                  >
                    <div className="h-36 overflow-hidden rounded-xl bg-black/5">
                      {t.thumb ? (
                        <img src={t.thumb} alt={t.title} className="h-full w-full object-contain p-2" />
                      ) : null}
                    </div>
                    <p className="mt-3 font-semibold">{t.title}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== ADDRESSES ===================== */}
        {tab === "addresses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black/85">Mes adresses</h2>
              <button
                onClick={startNewAddress}
                className="rounded-2xl bg-[#e0b5cb] px-4 py-2 text-sm font-semibold text-white"
              >
                Ajouter une adresse
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-[#f7fbff] p-6">
                <p className="text-sm text-black/55">
                  Aucune adresse enregistrée.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
                    <p className="font-semibold">
                      {a.type === "billing" ? "Facturation" : a.type ?? "Adresse"}
                    </p>
                    <p className="text-sm text-black/60 mt-2">
                      {a.address_line1 ?? ""} {a.address_line2 ? `• ${a.address_line2}` : ""}
                      <br />
                      {(a.postal_code ?? "")} {(a.city ?? "")}
                      <br />
                      {a.country ?? ""}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => startEditAddress(a)}
                        className="rounded-xl border border-black/10 px-3 py-1 text-sm hover:bg-black/2"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteAddress(a.id)}
                        className="rounded-xl border border-black/10 px-3 py-1 text-sm hover:bg-black/2"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Editor */}
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold">
                  {addrEditingId ? "Modifier l’adresse" : "Nouvelle adresse"}
                </h3>
                {addrMsg ? <span className="text-xs text-black/60">{addrMsg}</span> : null}
              </div>

              <Input
                label="Type"
                value={addrForm.type}
                onChange={(v: string) => setAddrForm((s) => ({ ...s, type: v }))}
              />
              <Input
                label="Adresse"
                value={addrForm.address_line1}
                onChange={(v: string) => setAddrForm((s) => ({ ...s, address_line1: v }))}
              />
              <Input
                label="Complément"
                value={addrForm.address_line2}
                onChange={(v: string) => setAddrForm((s) => ({ ...s, address_line2: v }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Code postal"
                  value={addrForm.postal_code}
                  onChange={(v: string) => setAddrForm((s) => ({ ...s, postal_code: v }))}
                />
                <Input
                  label="Ville"
                  value={addrForm.city}
                  onChange={(v: string) => setAddrForm((s) => ({ ...s, city: v }))}
                />
              </div>
              <Input
                label="Pays"
                value={addrForm.country}
                onChange={(v: string) => setAddrForm((s) => ({ ...s, country: v }))}
              />

              <button
                onClick={saveAddress}
                disabled={savingAddr}
                className="rounded-2xl bg-[#e0b5cb] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingAddr ? "Enregistrement..." : "Enregistrer l’adresse"}
              </button>
            </div>
          </div>
        )}

        {/* ===================== PROFILE ===================== */}
        {tab === "profile" && (
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-semibold">Mes informations</h2>
              {saveMsg ? <span className="text-xs text-black/60">{saveMsg}</span> : null}
            </div>

            <Input
              label="Civilité (mr / mrs / other)"
              value={form.civility}
              onChange={(v: string) => setForm((s) => ({ ...s, civility: v }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Prénom"
                value={form.first_name}
                onChange={(v: string) => setForm((s) => ({ ...s, first_name: v }))}
              />
              <Input
                label="Nom"
                value={form.last_name}
                onChange={(v: string) => setForm((s) => ({ ...s, last_name: v }))}
              />
            </div>
            <Input
              label="Téléphone"
              value={form.phone}
              onChange={(v: string) => setForm((s) => ({ ...s, phone: v }))}
            />
            <Input
              label="Date de naissance"
              type="date"
              value={form.birth_date}
              onChange={(v: string) => setForm((s) => ({ ...s, birth_date: v }))}
            />

            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className="rounded-2xl bg-[#e0b5cb] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {savingProfile ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        )}

        {/* ===================== HELP ===================== */}
        {tab === "help" && <HelpTab />}
      </div>
    </main>
  );
}

/* ===================== Help (accordion) ===================== */

function HelpTab() {
  return (
    <div className="space-y-4">
      <FaqItem
        q="Comment télécharger mon template ?"
        a="Après paiement, le bouton de téléchargement apparaît dans Mes commandes."
      />
      <FaqItem
        q="Puis-je modifier les couleurs ?"
        a="Oui. Tous les templates sont personnalisables (texte, couleurs, sections)."
      />
      <FaqItem
        q="Vous pouvez m’aider à installer le template ?"
        a="Oui. Contacte le support et explique ton besoin, on te guide."
      />

      <Link
        href="/contact"
        className="inline-flex rounded-2xl bg-[#e0b5cb] px-4 py-2 text-sm font-semibold text-white"
      >
        Contacter le support
      </Link>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-black/10 bg-white">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full text-left px-4 py-3 font-semibold"
      >
        {q}
      </button>
      {open ? <p className="px-4 pb-4 text-sm text-black/60">{a}</p> : null}
    </div>
  );
}

/* ===================== UI ===================== */

function TabButton({ active, children, ...props }: any) {
  return (
    <button
      {...props}
      className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
        active
          ? "bg-[#e0b5cb] text-white border-transparent"
          : "bg-white text-black/70 border-black/10 hover:bg-black/2"
      }`}
    >
      {children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <p className="text-sm text-black/50">{label}</p>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
      />
    </div>
  );
}
