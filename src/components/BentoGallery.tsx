export function BentoGallery({ images }: { images: string[] }) {
  const items = images.slice(0, 8);

  return (
    <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-6 auto-rows-[140px] md:auto-rows-[170px]">
      {items.map((src, i) => {
        const cls =
          i === 0 ? "col-span-2 md:col-span-4 row-span-2" :
          i === 1 ? "col-span-2 md:col-span-2 row-span-2" :
          i === 2 ? "col-span-1 md:col-span-2 row-span-1" :
          i === 3 ? "col-span-1 md:col-span-2 row-span-1" :
          i === 4 ? "col-span-2 md:col-span-3 row-span-1" :
          i === 5 ? "col-span-2 md:col-span-3 row-span-1" :
          "col-span-2 md:col-span-3 row-span-1";

        return (
          <div key={src + i} className={`group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm ${cls}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
          </div>
        );
      })}
    </div>
  );
}
