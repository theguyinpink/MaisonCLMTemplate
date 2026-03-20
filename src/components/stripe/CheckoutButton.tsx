"use client";

import { useState } from "react";

type Props = {
  plan: "studio" | "pro";
  children: React.ReactNode;
  className?: string;
};

export default function CheckoutButton({
  plan,
  children,
  className,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur Stripe.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Impossible de créer la session Stripe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`${className ?? ""} cursor-pointer disabled:cursor-not-allowed`}
    >
      {loading ? "Redirection..." : children}
    </button>
  );
}