import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const formData = await request.formData();
  const templateId = String(formData.get("templateId") || "");
  const projectName = String(formData.get("projectName") || "").trim();

  if (!templateId) {
    return NextResponse.json(
      { error: "templateId manquant." },
      { status: 400 }
    );
  }

  // Vérifier que le template existe
  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select("id, title, is_published")
    .eq("id", templateId)
    .eq("is_published", true)
    .maybeSingle();

  if (templateError || !template) {
    return NextResponse.json(
      { error: "Template introuvable." },
      { status: 404 }
    );
  }

  // Vérifier accès : abonnement OU achat
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, status, current_period_end")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasActiveSubscription =
    !!subscription &&
    ["active", "trialing"].includes(subscription.status) &&
    (!subscription.current_period_end ||
      new Date(subscription.current_period_end).getTime() > Date.now());

  let hasPurchaseAccess = false;

  if (!hasActiveSubscription) {
    const { data: entitlement } = await supabase
      .from("entitlements")
      .select("id")
      .eq("user_id", user.id)
      .eq("template_id", templateId)
      .eq("is_active", true)
      .maybeSingle();

    hasPurchaseAccess = !!entitlement;
  }

  if (!hasActiveSubscription && !hasPurchaseAccess) {
    return NextResponse.json(
      { error: "Accès refusé à ce template." },
      { status: 403 }
    );
  }

  // 1) Vérifier si un projet existe déjà pour ce user + ce template
  const { data: existingProject, error: existingProjectError } = await supabase
    .from("user_projects")
    .select("id, name, template_id, user_id")
    .eq("user_id", user.id)
    .eq("template_id", templateId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingProjectError) {
    return NextResponse.json(
      { error: existingProjectError.message },
      { status: 500 }
    );
  }

  // Si un projet existe déjà, on reprend directement celui-là
  if (existingProject) {
    return NextResponse.redirect(
      new URL(`/editor/${existingProject.id}`, request.url)
    );
  }

  // 2) Sinon on crée un nouveau projet
  const { data: project, error: projectError } = await supabase
    .from("user_projects")
    .insert({
      user_id: user.id,
      template_id: templateId,
      name: projectName || `${template.title} - Mon projet`,
    })
    .select("id, name")
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: projectError?.message || "Impossible de créer le projet." },
      { status: 500 }
    );
  }

  // 3) Récupérer les fichiers source du template
  const { data: templateFiles, error: filesError } = await supabase
    .from("template_files")
    .select("path, content")
    .eq("template_id", templateId)
    .order("path", { ascending: true });

  if (filesError) {
    return NextResponse.json(
      { error: filesError.message },
      { status: 500 }
    );
  }

  // 4) Copier vers project_files uniquement à la création
  if (templateFiles && templateFiles.length > 0) {
    const rows = templateFiles.map((file) => ({
      project_id: project.id,
      path: file.path,
      content: file.content,
      updated_at: new Date().toISOString(),
    }));

    const { error: copyError } = await supabase
      .from("project_files")
      .insert(rows);

    if (copyError) {
      return NextResponse.json(
        { error: copyError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.redirect(
    new URL(`/editor/${project.id}`, request.url)
  );
}