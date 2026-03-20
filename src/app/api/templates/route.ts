import { NextResponse } from "next/server";
import { readTemplates } from "@/lib/templates";

export async function GET() {
  const templates = await readTemplates();
  return NextResponse.json({ templates });
}
