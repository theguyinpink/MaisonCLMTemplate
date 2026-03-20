import { supabaseBrowser } from "@/lib/supabase/browser";

export async function uploadPreviewImage(file: File, templateSlug: string) {
  const bucket = "template-previews";
  const filePath = `${templateSlug}/${Date.now()}-${file.name}`;

  const { error } = await supabaseBrowser.storage
    .from(bucket)
    .upload(filePath, file, { upsert: false, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = supabaseBrowser.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
