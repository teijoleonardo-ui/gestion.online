/** Evento al agregar ítems al carrito (sidebar y otras vistas pueden escuchar). */
export const CART_ADDED_EVENT = "gestion:cart-added";

export function dispatchCartAdded(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_ADDED_EVENT));
}
