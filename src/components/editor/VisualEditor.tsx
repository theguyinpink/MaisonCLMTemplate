"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import PreviewFrame from "@/components/editor/PreviewFrame";
import VisualInspector from "@/components/editor/VisualInspector";
import {
  buildPreviewDocument,
  canEditImage,
  canEditText,
  findHtmlFile,
  updateFilesHtmlContent,
  updateSelectedElementImage,
  updateSelectedElementStyle,
  updateSelectedElementText,
  type VisualSelection,
} from "@/lib/visual-editor";

type ProjectFile = {
  id: string;
  path: string;
  content: string | null;
  updated_at?: string | null;
};

type Props = {
  files: ProjectFile[];
  setFiles: React.Dispatch<React.SetStateAction<ProjectFile[]>>;
  projectId: string;
};

export default function VisualEditor({ files, setFiles, projectId }: Props) {
  const preview = useMemo(() => buildPreviewDocument(files), [files]);
  const [selectedElement, setSelectedElement] = useState<VisualSelection | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "clm-preview-select") {
        setSelectedElement(event.data.payload);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function applyTextChange(value: string) {
    if (!selectedElement) return;

    const htmlFile = findHtmlFile(files);
    if (!htmlFile?.content) return;

    const updatedHtml = updateSelectedElementText(
      htmlFile.content,
      selectedElement.selector,
      value
    );

    setFiles((prev) => updateFilesHtmlContent(prev, updatedHtml));
    setSelectedElement((prev) => (prev ? { ...prev, text: value } : prev));
    setSaveMessage("Texte modifié localement.");
  }

  function applyColorChange(value: string) {
    if (!selectedElement) return;

    const htmlFile = findHtmlFile(files);
    if (!htmlFile?.content) return;

    const updatedHtml = updateSelectedElementStyle(
      htmlFile.content,
      selectedElement.selector,
      "color",
      value
    );

    setFiles((prev) => updateFilesHtmlContent(prev, updatedHtml));
    setSaveMessage("Couleur du texte modifiée localement.");
  }

  function applyBackgroundChange(value: string) {
    if (!selectedElement) return;

    const htmlFile = findHtmlFile(files);
    if (!htmlFile?.content) return;

    const updatedHtml = updateSelectedElementStyle(
      htmlFile.content,
      selectedElement.selector,
      "backgroundColor",
      value
    );

    setFiles((prev) => updateFilesHtmlContent(prev, updatedHtml));
    setSaveMessage("Couleur de fond modifiée localement.");
  }

  function applyImageChange(value: string) {
    if (!selectedElement) return;

    const htmlFile = findHtmlFile(files);
    if (!htmlFile?.content) return;

    const updatedHtml = updateSelectedElementImage(
      htmlFile.content,
      selectedElement.selector,
      value
    );

    setFiles((prev) => updateFilesHtmlContent(prev, updatedHtml));
    setSelectedElement((prev) => (prev ? { ...prev, src: value } : prev));
    setSaveMessage("Image modifiée localement.");
  }

  async function saveVisualChanges() {
    const htmlFile = findHtmlFile(files);
    if (!htmlFile) return;

    setSaveMessage("");

    startTransition(async () => {
      const response = await fetch("/api/projects/save-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: htmlFile.id,
          projectId,
          content: htmlFile.content ?? "",
        }),
      });

      if (!response.ok) {
        setSaveMessage("Erreur pendant la sauvegarde visuelle.");
        return;
      }

      setSaveMessage("Modifications visuelles enregistrées.");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#d86aa2]">
            Mode visuel
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Clique sur un élément dans l’aperçu puis modifie son texte, ses couleurs ou son image.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveMessage ? (
            <span className="text-sm text-slate-500">{saveMessage}</span>
          ) : null}

          <button
            type="button"
            onClick={saveVisualChanges}
            disabled={isPending}
            className="rounded-full bg-[#0f172a] px-5 py-3 text-sm font-medium text-white transition disabled:opacity-50"
          >
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <PreviewFrame srcDoc={preview.srcDoc} />

        <VisualInspector
          selectedElement={selectedElement}
          onTextChange={applyTextChange}
          onColorChange={applyColorChange}
          onBackgroundChange={applyBackgroundChange}
          onImageChange={applyImageChange}
          canEditText={selectedElement ? canEditText(selectedElement.tag) : false}
          canEditImage={canEditImage(selectedElement)}
        />
      </div>
    </div>
  );
}