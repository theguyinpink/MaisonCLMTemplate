"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart";

type Props = {
  enabled: boolean;
};

export default function ClearCartOnSuccess({ enabled }: Props) {
  useEffect(() => {
    if (!enabled) return;
    clearCart();
  }, [enabled]);

  return null;
}