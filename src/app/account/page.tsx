import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import DownloadProjectZipButton from "@/components/account/DownloadProjectZipButton";
import EditProfileModal from "@/components/account/EditProfileModal";

type ProjectFile = {
  project_id: string;
  path: string;
  content: string | null;
};

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select(`
      *,
      subscription_plans:plan_id (
        id,
        slug,
        name
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: projects } = await supabase
    .from("user_projects")
    .select("id, name, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const projectIds = projects?.map((project) => project.id) ?? [];

  let projectFiles: ProjectFile[] = [];

  if (projectIds.length > 0) {
    const { data: files } = await supabase
      .from("project_files")
      .select("project_id, path, content")
      .in("project_id", projectIds);

    projectFiles = (files ?? []) as ProjectFile[];
  }

  const filesByProjectId = new Map<string, { path: string; content: string | null }[]>();

  for (const file of projectFiles) {
    const existing = filesByProjectId.get(file.project_id) ?? [];
    existing.push({
      path: file.path,
      content: file.content,
    });
    filesByProjectId.set(file.project_id, existing);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-10">
        <p className="mb-4 text-sm uppercase tracking-[0.24em] text-[#d86aa2]">
          Espace personnel
        </p>

        <h1
          className="text-5xl text-slate-900"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Mon compte
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-[28px] border border-[#ecd8e2] bg-white p-8">
          <h2
            className="text-2xl text-slate-900"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Mes informations
          </h2>

          <div className="mt-6 space-y-4 text-slate-700">
            <div>
              <p className="text-sm text-slate-500">Prénom</p>
              <p>{profile?.first_name || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Nom</p>
              <p>{profile?.last_name || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p>{profile?.email || user.email || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Téléphone</p>
              <p>{profile?.phone || "—"}</p>
            </div>
          </div>

          <EditProfileModal
            userId={user.id}
            profile={{
              email: profile?.email ?? user.email ?? null,
              civility: profile?.civility ?? null,
              first_name: profile?.first_name ?? null,
              last_name: profile?.last_name ?? null,
              phone: profile?.phone ?? null,
              birth_date: profile?.birth_date ?? null,
            }}
          />
        </section>

        <section className="rounded-[28px] border border-[#ecd8e2] bg-white p-8">
          <h2
            className="text-2xl text-slate-900"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Mon abonnement
          </h2>

          {subscription?.status === "active" || subscription?.status === "trialing" ? (
            <div className="mt-6 space-y-3 text-slate-700">
              <p>
                Formule : <strong>{subscription?.subscription_plans?.name || "—"}</strong>
              </p>
              <p>
                Statut : <strong>{subscription.status}</strong>
              </p>
              <p>
                Début de période :{" "}
                <strong>
                  {subscription.current_period_start
                    ? new Date(subscription.current_period_start).toLocaleDateString("fr-FR")
                    : "—"}
                </strong>
              </p>
              <p>
                Renouvellement / fin de période :{" "}
                <strong>
                  {subscription.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString("fr-FR")
                    : "—"}
                </strong>
              </p>

              {subscription.cancel_at_period_end ? (
                <p className="text-sm text-[#a64f7d]">
                  Ton abonnement est programmé pour s’arrêter à la fin de la période en cours.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-6 text-slate-600">
              Aucun abonnement actif pour le moment.
            </p>
          )}

          <button
            type="button"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#0f172a] px-6 py-3 text-sm font-medium text-white"
          >
            Gérer mon abonnement
          </button>
        </section>
      </div>

      <section className="mt-6 rounded-[28px] border border-[#ecd8e2] bg-white p-8">
        <h2
          className="text-2xl text-slate-900"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Mes projets
        </h2>

        <div className="mt-6 grid gap-4">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <article
                key={project.id}
                className="rounded-2xl border border-[#f1dfe8] p-5"
              >
                <h3 className="text-lg font-medium text-slate-900">
                  {project.name}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Dernière modification{" "}
                  <span className="font-medium text-slate-700">
                    {project.updated_at
                      ? new Date(project.updated_at).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </span>
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/editor/${project.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-[#0f172a] px-5 py-3 text-sm font-medium text-white"
                  >
                    Ouvrir l’éditeur
                  </Link>

                  <DownloadProjectZipButton
                    project={{
                      id: project.id,
                      name: project.name,
                      files: filesByProjectId.get(project.id) ?? [],
                    }}
                  />
                </div>
              </article>
            ))
          ) : (
            <p className="text-slate-600">Tu n’as encore aucun projet.</p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <LogoutButton />
      </section>
    </main>
  );
}