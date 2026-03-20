"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import dynamic from "next/dynamic";
import FileTree from "@/components/editor/FileTree";
import SmartGuide from "@/components/editor/SmartGuide";
import VisualEditor from "@/components/editor/VisualEditor";
import {
  analyzeCodeAtCursor,
  type SmartGuideResult,
} from "@/lib/smart-guide";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

type Project = {
  id: string;
  name: string;
  template_id: string;
  user_id: string;
};

type ProjectFile = {
  id: string;
  path: string;
  content: string | null;
  updated_at?: string | null;
};

type Guide = {
  id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  find_text: string | null;
};

type Props = {
  project: Project;
  initialFiles: ProjectFile[];
  guides: Guide[];
};

function getLanguageFromPath(path: string) {
  const clean = (path || "").toLowerCase();

  if (clean.endsWith(".html")) return "html";
  if (clean.endsWith(".css")) return "css";
  if (clean.endsWith(".js")) return "javascript";
  if (clean.endsWith(".ts")) return "typescript";
  if (clean.endsWith(".tsx")) return "typescript";
  if (clean.endsWith(".json")) return "json";
  if (clean.endsWith(".md")) return "markdown";

  return "plaintext";
}

export default function EditorWorkspace({
  project,
  initialFiles,
  guides,
}: Props) {
  const [files, setFiles] = useState(initialFiles);
  const [selectedPath, setSelectedPath] = useState(initialFiles[0]?.path ?? "");
  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState("");
  const [analysis, setAnalysis] = useState<SmartGuideResult | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"files" | "guide" | null>(
    null
  );
  const [editorMode, setEditorMode] = useState<"code" | "visual">("code");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedFile = useMemo(
    () => files.find((file) => file.path === selectedPath) ?? null,
    [files, selectedPath]
  );

  const selectedFileRef = useRef<ProjectFile | null>(selectedFile);

  useEffect(() => {
    selectedFileRef.current = selectedFile;
  }, [selectedFile]);

  useEffect(() => {
    if (!selectedFile) {
      setAnalysis(null);
      return;
    }

    const content = selectedFile.content ?? "";
    const initial = analyzeCodeAtCursor(selectedFile.path, content, 1, 1);
    setAnalysis(initial);
  }, [selectedFile]);

  function runAnalysis(lineNumber: number, column: number) {
    const currentFile = selectedFileRef.current;
    if (!currentFile) return;

    const content = currentFile.content ?? "";
    const result = analyzeCodeAtCursor(
      currentFile.path,
      content,
      lineNumber,
      column
    );

    setAnalysis(result);
  }

  async function saveCurrentFile() {
    if (!selectedFile) return;

    setSaveMessage("");

    startTransition(async () => {
      const response = await fetch("/api/projects/save-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: selectedFile.id,
          projectId: project.id,
          content: selectedFile.content ?? "",
        }),
      });

      if (!response.ok) {
        setSaveMessage("Erreur pendant la sauvegarde.");
        return;
      }

      setSaveMessage("Fichier enregistré.");
    });
  }

  return (
    <main className="min-h-[calc(100vh-80px)] px-3 py-3 sm:px-5 lg:h-[calc(100vh-80px)] lg:px-6 lg:py-4">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.24em] text-[#d86aa2]">
            Éditeur
          </p>

          <h1
            className="truncate text-2xl text-slate-900 sm:text-3xl"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            {project.name}
          </h1>

          {editorMode === "code" && selectedFile ? (
            <p className="mt-1 truncate text-sm text-slate-500">
              Fichier actif :{" "}
              <span className="font-medium">{selectedFile.path}</span>
            </p>
          ) : editorMode === "visual" ? (
            <p className="mt-1 text-sm text-slate-500">
              Mode visuel du projet
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-full bg-[#f8edf2] p-1">
            <button
              type="button"
              onClick={() => setEditorMode("code")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                editorMode === "code"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              Code
            </button>

            <button
              type="button"
              onClick={() => setEditorMode("visual")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                editorMode === "visual"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              Visuel
            </button>
          </div>

          {editorMode === "code" && (
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobilePanel("files")}
                className="rounded-full border border-[#ead6df] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
              >
                Fichiers
              </button>

              <button
                type="button"
                onClick={() => setMobilePanel("guide")}
                className="rounded-full border border-[#ead6df] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
              >
                Guide
              </button>
            </div>
          )}

          {saveMessage ? (
            <span className="text-sm text-slate-500">{saveMessage}</span>
          ) : null}

          {editorMode === "code" && (
            <button
              onClick={saveCurrentFile}
              disabled={!selectedFile || isPending}
              className="rounded-full bg-[#0f172a] px-5 py-3 text-sm font-medium text-white transition disabled:opacity-50"
            >
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
          )}
        </div>
      </div>

      {editorMode === "code" ? (
        <div className="flex flex-col gap-4 lg:grid lg:h-[calc(100%-88px)] lg:grid-cols-[280px_minmax(0,1fr)_360px]">
          <div className="hidden lg:block lg:min-h-0">
            <FileTree
              files={files}
              selectedPath={selectedPath}
              onSelect={setSelectedPath}
            />
          </div>

          <section className="min-h-[60vh] overflow-hidden rounded-[26px] border border-[#ecdfe5] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)] lg:min-h-0">
            {selectedFile ? (
              <MonacoEditor
                key={selectedFile.id}
                height="calc(100vh - 220px)"
                theme="vs-light"
                language={getLanguageFromPath(selectedFile.path)}
                value={selectedFile.content ?? ""}
                onMount={(editor) => {
                  editor.onDidChangeCursorPosition((event) => {
                    if (debounceRef.current) {
                      clearTimeout(debounceRef.current);
                    }

                    debounceRef.current = setTimeout(() => {
                      runAnalysis(
                        event.position.lineNumber,
                        event.position.column
                      );
                    }, 500);
                  });
                }}
                onChange={(value) => {
                  setFiles((prev) =>
                    prev.map((file) =>
                      file.id === selectedFile.id
                        ? { ...file, content: value ?? "" }
                        : file
                    )
                  );
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-10 text-slate-400">
                Aucun fichier sélectionné
              </div>
            )}
          </section>

          <div className="hidden lg:block lg:min-h-0">
            <SmartGuide
              selectedFile={selectedFile}
              guides={guides}
              analysis={analysis}
            />
          </div>
        </div>
      ) : (
        <VisualEditor files={files} setFiles={setFiles} projectId={project.id} />
      )}

      {editorMode === "code" && mobilePanel === "files" && (
        <div className="fixed inset-0 z-50 bg-black/35 p-3 sm:p-4 lg:hidden">
          <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#ecdfe5] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#f0e5eb] px-5 py-4">
              <h2
                className="text-2xl text-slate-900"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Fichiers
              </h2>

              <button
                type="button"
                onClick={() => setMobilePanel(null)}
                className="rounded-full border border-[#ead6df] px-4 py-2 text-sm text-slate-600"
              >
                Fermer
              </button>
            </div>

            <div className="min-h-0 flex-1 p-4">
              <FileTree
                files={files}
                selectedPath={selectedPath}
                onSelect={(path) => {
                  setSelectedPath(path);
                  setMobilePanel(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {editorMode === "code" && mobilePanel === "guide" && (
        <div className="fixed inset-0 z-50 bg-black/35 p-3 sm:p-4 lg:hidden">
          <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#ecdfe5] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#f0e5eb] px-5 py-4">
              <h2
                className="text-2xl text-slate-900"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Guide
              </h2>

              <button
                type="button"
                onClick={() => setMobilePanel(null)}
                className="rounded-full border border-[#ead6df] px-4 py-2 text-sm text-slate-600"
              >
                Fermer
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto p-4">
              <SmartGuide
                selectedFile={selectedFile}
                guides={guides}
                analysis={analysis}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}