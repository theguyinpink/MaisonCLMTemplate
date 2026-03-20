import JSZip from "jszip";
import { saveAs } from "file-saver";

type ProjectFile = {
  path: string;
  content: string | null;
};

type ProjectForZip = {
  id: string;
  name: string;
  files: ProjectFile[];
};

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function getFileExtensionFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const lastPart = pathname.split("/").pop() || "";
    const parts = lastPart.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
  } catch {
    // rien
  }
  return "png";
}

function extractImageUrlsFromHtml(html: string) {
  const regex = /<img[^>]+src=["']([^"']+)["']/gi;
  const urls: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const src = match[1];
    if (src && /^https?:\/\//i.test(src) && !urls.includes(src)) {
      urls.push(src);
    }
  }

  return urls;
}

async function fetchImageAsArrayBuffer(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Impossible de télécharger l'image : ${url}`);
  }

  return response.arrayBuffer();
}

export async function exportProjectZip(project: ProjectForZip) {
  const zip = new JSZip();
  const folderName = sanitizeFileName(project.name) || "project";
  const projectFolder = zip.folder(folderName);

  if (!projectFolder) {
    throw new Error("Impossible de créer le dossier du projet dans le ZIP.");
  }

  const fileMap = new Map(
    project.files.map((file) => [file.path, file.content || ""])
  );

  let html = fileMap.get("index.html") || "";
  const css = fileMap.get("style.css") || "";
  const js = fileMap.get("main.js") || "";
  const readme = fileMap.get("README.md") || "";

  const imageUrls = extractImageUrlsFromHtml(html);
  const imagesFolder = projectFolder.folder("images");

  if (imagesFolder && imageUrls.length > 0) {
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];

      try {
        const extension = getFileExtensionFromUrl(imageUrl);
        const localFileName = `image-${i + 1}.${extension}`;
        const localPath = `images/${localFileName}`;

        const arrayBuffer = await fetchImageAsArrayBuffer(imageUrl);
        imagesFolder.file(localFileName, arrayBuffer);

        html = html.split(imageUrl).join(localPath);
      } catch (error) {
        console.error("Erreur export image :", imageUrl, error);
      }
    }
  }

  projectFolder.file("index.html", html);
  projectFolder.file("style.css", css);
  projectFolder.file("main.js", js);

  if (readme.trim()) {
    projectFolder.file("README.md", readme);
  }

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  saveAs(blob, `${folderName}.zip`);
}