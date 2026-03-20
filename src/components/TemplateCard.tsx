import Link from "next/link";

export default function TemplateCard({
  slug,
  title,
  shortDescription,
}: {
  slug: string;
  title: string;
  shortDescription: string;
}) {
  return (
    <Link href={`/product/${slug}`}>
      <div className="group rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1">
        <h3 className="text-lg font-semibold text-(--color-text)">
          {title}
        </h3>
        <p className="mt-2 text-sm text-(--color-light-text)">
          {shortDescription}
        </p>
      </div>
    </Link>
  );
}
