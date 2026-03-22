"use client";

import { useMemo, useState } from "react";

type TemplateImage = {
  id: string;
  url: string;
  position: number | null;
  is_thumbnail: boolean | null;
  role: string | null;
};

type Props = {
  title: string;
  images: TemplateImage[];
};

export default function TemplateGallery({ title, images }: Props) {
  const orderedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      const aScore = (a.is_thumbnail ? 100 : 0) + (a.role === "home" ? 50 : 0);
      const bScore = (b.is_thumbnail ? 100 : 0) + (b.role === "home" ? 50 : 0);

      if (aScore !== bScore) return bScore - aScore;
      return (a.position ?? 0) - (b.position ?? 0);
    });
  }, [images]);

  const [activeId, setActiveId] = useState<string | null>(
    orderedImages[0]?.id ?? null
  );

  const activeImage =
    orderedImages.find((img) => img.id === activeId) ?? orderedImages[0] ?? null;

  if (!activeImage) {
    return (
      <div className="rounded-[30px] border border-[#ecdfe5] bg-[#fbf8fa] p-12 text-center text-slate-500">
        Aucun visuel disponible pour ce template.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[30px] border border-[#ecdfe5] bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
        <img
          src={activeImage.url}
          alt={title}
          className="w-full max-h-[650px] object-contain mx-auto bg-white"
        />
      </div>

      {orderedImages.length > 1 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {orderedImages.map((image) => {
            const isActive = image.id === activeImage.id;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveId(image.id)}
                className={`cursor-pointer overflow-hidden rounded-[22px] border bg-white transition ${
                  isActive
                    ? "border-[#d86aa2] ring-2 ring-[#f3cfe0]"
                    : "border-[#ecdfe5] hover:border-[#d9c2cf]"
                }`}
              >
                <div className="aspect-[16/11]">
                  <img
                    src={image.url}
                    alt={title}
                    className="h-full w-full object-contain bg-white"
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}