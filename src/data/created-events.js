import festival from "@/assets/festival.jpg";

const STORAGE_KEY = "tickr-created-events";
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function loadCreatedEvents() {
  if (typeof window === "undefined") return [];
  try {
    const storedEvents = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(storedEvents)) return [];
    return storedEvents.map((event) => ({
      ...event,
      organizer:
        event.organizer === "Luziano Domingos" || !event.organizer
          ? "Tickr Eventos"
          : event.organizer,
      organizerUsername:
        event.organizerUsername === "@luziano.events" || !event.organizerUsername
          ? "@tickr.eventos"
          : event.organizerUsername,
    }));
  } catch {
    return [];
  }
}

function formatDate(value) {
  const [y, m, d] = value.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

export function saveCreatedEvent(form, storedEvent) {
  const prices = form.tickets.map((t) => Number(t.price) || 0);
  const min = Math.min(...prices);
  const event = {
    id: storedEvent.id,
    slug: storedEvent.slug,
    ownerId: storedEvent.ownerId,
    status: storedEvent.status,
    title: form.title.trim(),
    category: form.category,
    date: formatDate(form.date),
    time: form.time,
    city: form.city.trim(),
    venue: form.venue.trim(),
    price: min === 0 ? "Grátis" : `Kz ${min.toLocaleString("pt-PT")}`,
    organizer: storedEvent.organizer,
    organizerUsername: storedEvent.organizerUsername,
    image: storedEvent.imageUrl || festival,
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
    console.warn("O evento foi guardado no Supabase, mas não foi possível guardar a cópia local.");
  }
  return event;
}
