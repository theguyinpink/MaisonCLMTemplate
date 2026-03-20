export type CartItem = {
  id: string;
  slug: string;
  title: string;
  price_label?: string | null;
  price_amount?: number | null;
  currency?: string | null;
  image_url?: string | null;
};

const CART_KEY = "maison-clm-cart";
const CART_EVENT = "maison-clm-cart-updated";

type CartListener = (items: CartItem[]) => void;

function emitCartUpdate(items: CartItem[]) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<CartItem[]>(CART_EVENT, {
      detail: items,
    })
  );
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CART_KEY, JSON.stringify(items));
  emitCartUpdate(items);
}

export function addToCart(item: CartItem) {
  const items = getCart();
  const exists = items.some((cartItem) => cartItem.id === item.id);

  if (exists) {
    emitCartUpdate(items);
    return;
  }

  saveCart([...items, item]);
}

export function removeFromCart(id: string) {
  const items = getCart().filter((item) => item.id !== id);
  saveCart(items);
}

export function clearCart() {
  saveCart([]);
}

export function isInCart(id: string) {
  return getCart().some((item) => item.id === id);
}

export function subscribeCart(listener: CartListener) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<CartItem[]>;
    listener(customEvent.detail ?? getCart());
  };

  window.addEventListener(CART_EVENT, handler);
  window.addEventListener("storage", () => listener(getCart()));

  return () => {
    window.removeEventListener(CART_EVENT, handler);
  };
}