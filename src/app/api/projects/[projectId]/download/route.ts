import { NextResponse } from "next/server";
import JSZip from "jszip";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  // ⚠️ Ici on a besoin d’identifier le user côté serveur
  // → Solution simple : passer userId en query (temporaire) OU
  // mieux : mettre en place supabase server cookies.
  // Je te mets la version “userId en query” pour MVP propre (tu pourras sécuriser ensuite).

  // Exemple: /api/projects/xxx/download?userId=yyy
  // (On sécurisera ensuite avec cookies)
  return NextResponse.json(
    { error: "MVP: ajoute userId en query + on sécurise ensuite" },
    { status: 400 }
  );
}
