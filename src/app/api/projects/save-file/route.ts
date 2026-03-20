import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { fileId, projectId, content } = body ?? {};

  if (!fileId || !projectId || typeof content !== "string") {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { data: project } = await supabase
    .from("user_projects")
    .select("id, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  }

  const now = new Date().toISOString();

  const { error: fileError } = await supabase
    .from("project_files")
    .update({
      content,
      updated_at: now,
    })
    .eq("id", fileId)
    .eq("project_id", projectId);

  if (fileError) {
    return NextResponse.json({ error: fileError.message }, { status: 500 });
  }

  const { error: projectError } = await supabase
    .from("user_projects")
    .update({
      updated_at: now,
    })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}