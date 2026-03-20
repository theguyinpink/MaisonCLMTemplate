"use client";

import { useState } from "react";
import { exportProjectZip } from "@/lib/exportProjectZip";

type ProjectFile = {
  path: string;
  content: string | null;
};

type ProjectForZip = {
  id: string;
  name: string;
  files: ProjectFile[];
};

type Props = {
  project: ProjectForZip;
};

export default function DownloadProjectZipButton({ project }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await exportProjectZip(project);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue pendant la création du ZIP.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className="inline-flex items-center justify-center rounded-full border border-[#ead6df] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isDownloading ? "Préparation..." : "Télécharger en ZIP"}
    </button>
  );
}