export type CartItem = {
  id: string;
  slug: string;
  title: string;
  price_label: string | null;
};

const KEY = "clm_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addToCart(item: CartItem) {
  const cart = getCart();

  // pas de doublon
  if (cart.find((c) => c.id === item.id)) return;

  cart.push(item);
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function removeFromCart(id: string) {
  const cart = getCart().filter((c) => c.id !== id);
  localStorage.setItem(KEY, JSON.stringify(cart));
}

export function subscribeCart(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
