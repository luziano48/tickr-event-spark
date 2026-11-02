// Compras simuladas guardadas no aparelho — usadas para verificar quem
// pode avaliar um evento (só participantes com ingresso válido).

const KEY = "tickr-my-purchases";

export function loadMyPurchases() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMyPurchase(purchase) {
  if (typeof window === "undefined") return;
  try {
    const list = loadMyPurchases();
    list.push({
      id: `p-${Date.now().toString(36)}`,
      eventId: purchase.eventId,
      eventTitle: purchase.eventTitle,
      ticket: purchase.ticket,
      quantity: purchase.quantity,
      buyer: purchase.buyer,
      total: purchase.total,
      date: new Date().toISOString(),
    });
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* armazenamento indisponível */
  }
}

export function hasMyPurchase(eventId) {
  return loadMyPurchases().some((p) => p.eventId === eventId);
}
