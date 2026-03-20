import { promises as fs } from "fs";
import path from "path";

export type TemplateItem = {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  priceLabel?: string; // ex: "49€" (optionnel)
  coverImage?: string; // ex: "/templates/mon-template/cover.png"
  screenshots: string[]; // ex: ["/templates/mon-template/1.png", ...]
  tags?: string[];
  createdAt: string; // ISO
};

const dataPath = path.join(process.cwd(), "data", "templates.json");

type DBShape = { templates: TemplateItem[] };

export async function readTemplates(): Promise<TemplateItem[]> {
  const raw = await fs.readFile(dataPath, "utf-8");
  const json = JSON.parse(raw) as DBShape;
  return json.templates ?? [];
}

export async function writeTemplates(templates: TemplateItem[]) {
  const payload: DBShape = { templates };
  await fs.writeFile(dataPath, JSON.stringify(payload, null, 2), "utf-8");
}

export async function getTemplateBySlug(slug: string) {
  const templates = await readTemplates();
  return templates.find((t) => t.slug === slug) ?? null;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
