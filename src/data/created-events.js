import festival from "@/assets/festival.jpg";

const STORAGE_KEY = "tickr-created-events";
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function loadCreatedEvents() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

function formatDate(value) {
  const [y, m, d] = value.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

export function saveCreatedEvent(form, imageData) {
  const prices = form.tickets.map((t) => Number(t.price) || 0);
  const min = Math.min(...prices);
  const event = {
    id: `${slugify(form.title) || "evento"}-${Date.now().toString(36)}`,
    title: form.title.trim(),
    category: form.category,
    date: formatDate(form.date),
    time: form.time,
    city: form.city.trim(),
    venue: form.venue.trim(),
    price: min === 0 ? "Grátis" : `Kz ${min.toLocaleString("pt-PT")}`,
    image: imageData || festival,
    description: form.description.trim(),
    age: form.age,
    rules: form.rules.trim(),
    contactName: form.contactName.trim(),
    whatsapp: form.whatsapp,
    tickets: form.tickets.map(({ name, price, quantity }) => ({ name, price, quantity })),
    createdByUser: true,
  };
  const list = [event, ...loadCreatedEvents()];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...event, image: festival }]));
    event.image = festival;
  }
  return event;
}
