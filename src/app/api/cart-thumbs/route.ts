import { NextResponse } from "next/server";
import { supabaseServerPublic } from "@/lib/supabase/public";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = (searchParams.get("ids") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!ids.length) return NextResponse.json({});

  const supabase = supabaseServerPublic();

  const { data } = await supabase
    .from("template_images")
    .select("template_id, url, position, is_thumbnail, role")
    .in("template_id", ids);

  const byId: Record<string, any[]> = {};
  for (const r of data || []) {
    if (!byId[r.template_id]) byId[r.template_id] = [];
    byId[r.template_id].push(r);
  }

  const out: Record<string, string | null> = {};
  for (const id of ids) {
    const arr = byId[id] || [];
    const sorted = [...arr].sort((a, b) => {
      const aScore = (a.is_thumbnail ? 100 : 0) + (a.role === "home" ? 50 : 0);
      const bScore = (b.is_thumbnail ? 100 : 0) + (b.role === "home" ? 50 : 0);
      if (aScore !== bScore) return bScore - aScore;
      return (a.position ?? 0) - (b.position ?? 0);
    });
    out[id] = sorted[0]?.url ?? null;
  }

  return NextResponse.json(out);
}
