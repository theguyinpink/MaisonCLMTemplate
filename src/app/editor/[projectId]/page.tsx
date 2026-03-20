import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import EditorWorkspace from "@/components/editor/EditorWorkspace";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function EditorPage({ params }: PageProps) {
  const { projectId } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: project } = await supabase
    .from("user_projects")
    .select("id, name, template_id, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const { data: files } = await supabase
    .from("project_files")
    .select("id, path, content, updated_at")
    .eq("project_id", projectId)
    .order("path", { ascending: true });

  const { data: guides } = await supabase
    .from("template_guides")
    .select("id, title, description, file_path, find_text")
    .eq("template_id", project.template_id)
    .order("created_at", { ascending: true });

  return (
    <EditorWorkspace
      project={project}
      initialFiles={files ?? []}
      guides={guides ?? []}
    />
  );
}