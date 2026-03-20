"use client";

type Props = {
  srcDoc: string;
};

export default function PreviewFrame({ srcDoc }: Props) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-[#ecdfe5] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
      <iframe
        title="Aperçu visuel"
        srcDoc={srcDoc}
        className="block h-[72vh] min-h-[620px] w-full bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
}