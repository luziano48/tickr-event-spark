const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function request(path, { method = "GET", body, headers = {}, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...headers },
      ...(body ? { body: JSON.stringify(body) } : {}),
      ...options,
    });
  } catch {
    throw new Error("Não foi possível ligar ao serviço. Tenta novamente mais tarde.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 501) throw new Error("Este serviço ainda não está ligado ao backend.");
    throw new Error(payload?.message || "Não foi possível concluir o pedido. Tenta novamente.");
  }
  return payload;
}
