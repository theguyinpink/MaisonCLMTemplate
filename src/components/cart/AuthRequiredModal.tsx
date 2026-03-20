"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AuthRequiredModal({
  open,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-lg rounded-[30px] border border-[#ecd8e2] bg-white p-6 shadow-2xl sm:p-8">
        <p className="text-sm uppercase tracking-[0.24em] text-[#d86aa2]">
          Maison CLM
        </p>

        <h2
          className="mt-3 text-3xl text-slate-900"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Connexion requise
        </h2>

        <p className="mt-4 text-base leading-8 text-slate-600">
          Pour finaliser votre commande, veuillez vous connecter ou créer un
          compte.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-[#ead6df] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fcf6f9]"
          >
            Plus tard
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#0f172a] px-6 py-3 text-sm font-medium text-white"
          >
            Se connecter / S’inscrire
          </button>
        </div>
      </div>
    </div>
  );
}