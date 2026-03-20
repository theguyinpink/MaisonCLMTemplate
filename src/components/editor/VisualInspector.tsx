"use client";

import { useEffect, useState } from "react";
import type { VisualSelection } from "@/lib/visual-editor";

type Props = {
  selectedElement: VisualSelection | null;
  onTextChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onBackgroundChange: (value: string) => void;
  onImageChange: (value: string) => void;
  canEditText: boolean;
  canEditImage: boolean;
};

export default function VisualInspector({
  selectedElement,
  onTextChange,
  onColorChange,
  onBackgroundChange,
  onImageChange,
  canEditText,
  canEditImage,
}: Props) {
  const [textValue, setTextValue] = useState("");
  const [imageValue, setImageValue] = useState("");
  const [colorValue, setColorValue] = useState("#111111");
  const [backgroundValue, setBackgroundValue] = useState("#ffffff");

  useEffect(() => {
    setTextValue(selectedElement?.text ?? "");
    setImageValue(selectedElement?.src ?? "");

    const color = rgbToHex(selectedElement?.computed?.color || "rgb(17, 17, 17)");
    const background = rgbToHex(
      selectedElement?.computed?.backgroundColor || "rgb(255, 255, 255)"
    );

    setColorValue(color);
    setBackgroundValue(background);
  }, [selectedElement]);

  return (
    <aside className="flex h-[72vh] min-h-[620px] flex-col overflow-hidden rounded-[26px] border border-[#ecdfe5] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
      <div className="border-b border-[#f0e5eb] px-5 py-4">
        <h2
          className="text-2xl text-slate-900"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Inspecteur visuel
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-5 py-5">
        {!selectedElement ? (
          <p className="text-sm leading-7 text-slate-500">
            Clique sur un élément dans l’aperçu pour afficher ses informations et
            commencer à le modifier.
          </p>
        ) : (
          <div className="space-y-5 text-sm leading-7 text-slate-600">
            <div>
              <p className="font-medium text-slate-900">Type d’élément</p>
              <p>{selectedElement.tag}</p>
            </div>

            <div>
              <p className="font-medium text-slate-900">Sélecteur</p>
              <p className="break-words">{selectedElement.selector}</p>
            </div>

            {selectedElement.id ? (
              <div>
                <p className="font-medium text-slate-900">ID</p>
                <p>{selectedElement.id}</p>
              </div>
            ) : null}

            {selectedElement.className ? (
              <div>
                <p className="font-medium text-slate-900">Classes</p>
                <p>{selectedElement.className}</p>
              </div>
            ) : null}

            {canEditText ? (
              <div className="space-y-2">
                <p className="font-medium text-slate-900">Texte</p>
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-[#eadfe5] bg-[#fcfafb] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#d9bfd0]"
                />
                <button
                  type="button"
                  onClick={() => onTextChange(textValue)}
                  className="rounded-full bg-[#0f172a] px-4 py-2 text-sm font-medium text-white"
                >
                  Appliquer le texte
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#f0e6eb] bg-[#fcfafb] p-4 text-sm text-slate-500">
                Cet élément n’est pas encore éditable en texte dans ce premier mode visuel.
              </div>
            )}

            {canEditImage ? (
              <div className="space-y-3">
                <p className="font-medium text-slate-900">Image</p>
                <input
                  type="text"
                  value={imageValue}
                  onChange={(e) => setImageValue(e.target.value)}
                  placeholder="Colle ici l’URL de ton image"
                  className="w-full rounded-2xl border border-[#eadfe5] bg-[#fcfafb] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#d9bfd0]"
                />

                <button
                  type="button"
                  onClick={() => onImageChange(imageValue)}
                  className="rounded-full bg-[#0f172a] px-4 py-2 text-sm font-medium text-white"
                >
                  Appliquer l’image
                </button>

                <p className="text-xs leading-6 text-slate-500">
                  Tu peux remplacer une vraie image ou remplir un bloc placeholder avec une image de fond.
                </p>
              </div>
            ) : null}

            <div className="space-y-3">
              <p className="font-medium text-slate-900">Couleur du texte</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={colorValue}
                  onChange={(e) => setColorValue(e.target.value)}
                  className="h-11 w-14 rounded-xl border border-[#eadfe5] bg-white p-1"
                />
                <input
                  type="text"
                  value={colorValue}
                  onChange={(e) => setColorValue(e.target.value)}
                  className="flex-1 rounded-2xl border border-[#eadfe5] bg-[#fcfafb] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#d9bfd0]"
                />
              </div>

              <button
                type="button"
                onClick={() => onColorChange(colorValue)}
                className="rounded-full border border-[#ead6df] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
              >
                Appliquer la couleur du texte
              </button>
            </div>

            <div className="space-y-3">
              <p className="font-medium text-slate-900">Couleur de fond</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={backgroundValue}
                  onChange={(e) => setBackgroundValue(e.target.value)}
                  className="h-11 w-14 rounded-xl border border-[#eadfe5] bg-white p-1"
                />
                <input
                  type="text"
                  value={backgroundValue}
                  onChange={(e) => setBackgroundValue(e.target.value)}
                  className="flex-1 rounded-2xl border border-[#eadfe5] bg-[#fcfafb] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#d9bfd0]"
                />
              </div>

              <button
                type="button"
                onClick={() => onBackgroundChange(backgroundValue)}
                className="rounded-full border border-[#ead6df] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
              >
                Appliquer la couleur de fond
              </button>
            </div>

            <div>
              <p className="font-medium text-slate-900">HTML détecté</p>
              <pre className="mt-2 overflow-auto rounded-2xl border border-[#f2e8ed] bg-[#fcfafb] p-3 text-xs leading-6 text-slate-600 whitespace-pre-wrap break-words">
                {selectedElement.html}
              </pre>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function rgbToHex(rgb: string) {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return "#111111";

  const r = Number(match[1]).toString(16).padStart(2, "0");
  const g = Number(match[2]).toString(16).padStart(2, "0");
  const b = Number(match[3]).toString(16).padStart(2, "0");

  return `#${r}${g}${b}`;
}