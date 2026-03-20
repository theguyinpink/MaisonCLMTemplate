"use client";

import { useState } from "react";

type Props = {
  className?: string;
};

export default function ManageSubscriptionButton({ className }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/customer-portal", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur portail abonnement.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Impossible d’ouvrir la gestion de l’abonnement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? "Ouverture..." : "Gérer mon abonnement"}
    </button>
  );
}