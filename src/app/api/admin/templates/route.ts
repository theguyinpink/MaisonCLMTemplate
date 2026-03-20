import { NextResponse } from "next/server";
import { readTemplates, writeTemplates, slugify, type TemplateItem } from "@/lib/templates";

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => null)) as Partial<TemplateItem> | null;

  if (!payload?.title) {
    return NextResponse.json({ error: "Titre manquant" }, { status: 400 });
  }

  const templates = await readTemplates();

  const slug = payload.slug?.trim() || slugify(payload.title);
  if (templates.some((t) => t.slug === slug)) {
    return NextResponse.json({ error: "Slug déjà utilisé" }, { status: 400 });
  }

  const item: TemplateItem = {
    slug,
    title: payload.title,
    shortDescription: payload.shortDescription ?? "À compléter",
    longDescription: payload.longDescription ?? "",
    priceLabel: payload.priceLabel ?? "",
    coverImage: payload.coverImage ?? "",
    screenshots: payload.screenshots ?? [],
    tags: payload.tags ?? [],
    createdAt: new Date().toISOString(),
  };

  templates.unshift(item);
  await writeTemplates(templates);

  return NextResponse.json({ ok: true, template: item });
}
