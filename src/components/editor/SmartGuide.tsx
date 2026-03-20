"use client";

import type { SmartGuideResult } from "@/lib/smart-guide";

type Guide = {
  id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  find_text: string | null;
};

type ProjectFile = {
  id: string;
  path: string;
  content: string | null;
  updated_at?: string | null;
};

type SmartGuideProps = {
  selectedFile: ProjectFile | null;
  guides: Guide[];
  analysis: SmartGuideResult | null;
};

export default function SmartGuide({
  selectedFile,
  guides,
  analysis,
}: SmartGuideProps) {
  if (!selectedFile) {
    return (
      <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-[#ecdfe5] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
        <div className="border-b border-[#f0e5eb] px-5 py-4">
          <h2
            className="text-2xl text-slate-900"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Guide intelligent
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Assistance contextuelle
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5">
          <div className="rounded-[20px] border border-[#f0e6eb] bg-[#fcfafb] p-4 text-sm leading-7 text-slate-600">
            Sélectionne un fichier dans l’explorateur puis place ton curseur dans
            le code pour afficher une aide simple et concrète.
          </div>
        </div>
      </aside>
    );
  }

  const relatedGuides = guides.filter(
    (guide) => guide.file_path === selectedFile.path
  );

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border border-[#ecdfe5] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
      <div className="border-b border-[#f0e5eb] px-5 py-4">
        <h2
          className="text-2xl text-slate-900"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Guide intelligent
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Fichier actuel : <span className="font-medium">{selectedFile.path}</span>
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-5">
        <div className="space-y-5">
          {analysis ? (
            <section className="rounded-[22px] border border-[#f0e6eb] bg-[#fcfafb] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-medium text-slate-900">
                    {analysis.title}
                  </h3>

                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#b8618e]">
                    {analysis.contextLabel}
                  </p>
                </div>

                <span className="rounded-full border border-[#eadfe5] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                  {analysis.detectedType}
                </span>
              </div>

              <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                <div>
                  <p className="mb-1 font-medium text-slate-900">À quoi ça sert</p>
                  <p>{analysis.role}</p>
                </div>

                <div>
                  <p className="mb-1 font-medium text-slate-900">
                    Ce que tu peux modifier
                  </p>
                  <p>{analysis.editable}</p>
                </div>

                {analysis.examples && analysis.examples.length > 0 ? (
                  <div>
                    <p className="mb-2 font-medium text-slate-900">Exemples</p>
                    <div className="space-y-2">
                      {analysis.examples.map((example, index) => (
                        <pre
                          key={`${example}-${index}`}
                          className="overflow-auto rounded-2xl border border-[#f2e8ed] bg-white p-3 text-xs leading-6 text-slate-600 whitespace-pre-wrap break-words"
                        >
                          {example}
                        </pre>
                      ))}
                    </div>
                  </div>
                ) : null}

                {analysis.caution ? (
                  <div>
                    <p className="mb-1 font-medium text-slate-900">Important</p>
                    <p>{analysis.caution}</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Extrait détecté
                </p>

                <pre className="overflow-auto rounded-2xl border border-[#f2e8ed] bg-white p-3 text-xs leading-6 text-slate-600 whitespace-pre-wrap break-words">
                  {analysis.snippet}
                </pre>
              </div>
            </section>
          ) : (
            <section className="rounded-[20px] border border-[#f0e6eb] bg-[#fcfafb] p-4 text-sm leading-7 text-slate-600">
              Déplace ton curseur dans le code pour afficher une explication plus
              concrète de l’élément actuel.
            </section>
          )}

          {relatedGuides.length > 0 ? (
            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900">
                  Guides associés
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Conseils ajoutés spécifiquement pour ce fichier.
                </p>
              </div>

              {relatedGuides.map((guide) => (
                <article
                  key={guide.id}
                  className="rounded-[20px] border border-[#f0e6eb] bg-[#fcfafb] p-4"
                >
                  <h4 className="text-base font-medium text-slate-900">
                    {guide.title}
                  </h4>

                  {guide.description ? (
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {guide.description}
                    </p>
                  ) : null}

                  {guide.find_text ? (
                    <div className="mt-3 rounded-2xl border border-[#f2e8ed] bg-white px-3 py-2 text-xs leading-6 text-slate-500">
                      Texte repère : <code>{guide.find_text}</code>
                    </div>
                  ) : null}
                </article>
              ))}
            </section>
          ) : null}
        </div>
      </div>
    </aside>
  );
}