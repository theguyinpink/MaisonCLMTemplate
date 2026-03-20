"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

type ProfileValues = {
  email: string | null;
  civility: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: string | null;
};

type Props = {
  userId: string;
  profile: ProfileValues | null;
};

export default function EditProfileModal({ userId, profile }: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    civility: "",
    first_name: "",
    last_name: "",
    phone: "",
    birth_date: "",
  });

  useEffect(() => {
    setForm({
      civility: profile?.civility ?? "",
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      phone: profile?.phone ?? "",
      birth_date: profile?.birth_date ?? "",
    });
  }, [profile, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "birth_date" ? value.slice(0, 10) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const firstName = form.first_name.trim();
    const lastName = form.last_name.trim();
    const phone = form.phone.trim();

    if (!firstName) {
      setErrorMsg("Le prénom est requis.");
      return;
    }

    if (!lastName) {
      setErrorMsg("Le nom est requis.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabaseBrowser
        .from("profiles")
        .update({
          civility: form.civility || null,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          birth_date: form.birth_date || null,
        })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMsg("Impossible d’enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-8 inline-flex items-center justify-center rounded-full border border-[#ead6df] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
      >
        Modifier mes informations
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-[#ecd8e2] bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-[#d86aa2]">
                  Espace personnel
                </p>
                <h3
                  className="mt-2 text-3xl text-slate-900"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  Modifier mes informations
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[#ead6df] px-3 py-2 text-sm text-slate-600 transition hover:bg-[#fcf6f9]"
              >
                Fermer
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-600">
                    Civilité
                  </label>
                  <select
                    name="civility"
                    value={form.civility}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#ead6df] bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#d86aa2]"
                  >
                    <option value="">Non renseigné</option>
                    <option value="M.">M.</option>
                    <option value="Mme">Mme</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-600">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={form.birth_date}
                    onChange={handleChange}
                    onFocus={(e) => {
                      if ("showPicker" in e.currentTarget) {
                        (
                          e.currentTarget as HTMLInputElement & {
                            showPicker?: () => void;
                          }
                        ).showPicker?.();
                      }
                    }}
                    className="w-full rounded-2xl border border-[#ead6df] bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#d86aa2]"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-600">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#ead6df] bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#d86aa2]"
                    placeholder="Ton prénom"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-600">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#ead6df] bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#d86aa2]"
                    placeholder="Ton nom"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-600">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-[#ead6df] bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-[#d86aa2]"
                    placeholder="Ton numéro"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-600">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email ?? ""}
                    disabled
                    className="w-full rounded-2xl border border-[#ead6df] bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                  />
                </div>
              </div>

              {errorMsg ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMsg}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-[#ead6df] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-6 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
