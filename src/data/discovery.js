export function normalizeSearch(value = "") {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function matchesSearch(query, ...values) {
  return normalizeSearch(values.filter(Boolean).join(" ")).includes(normalizeSearch(query));
}

export function discoverEvents(events, query = "", category = "Todos") {
  return events.filter((event) => event.id !== "festival-luanda" && event.kind !== "official" &&
    (category === "Todos" || normalizeSearch(event.category) === normalizeSearch(category)) &&
    matchesSearch(query, event.title, event.category, event.city, event.venue));
}
