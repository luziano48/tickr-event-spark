import { events } from "./events";
import festival from "@/assets/festival.jpg";

// DADOS DO PAINEL DE EVENTOS: estatisticas, series dos graficos, ingressos e transacoes.
// Cada organizador tem 3 eventos; os numeros variam por evento.

const BUYERS = [
  "Maria Silva",
  "João Pedro",
  "Carla Mendes",
  "Rafael Costa",
  "Ana Souza",
  "Domingos Neto",
  "Lúcia Ferraz",
  "Paulo Bengui",
  "Sofia Kiala",
  "Hélder Malungo",
  "Teresa Cassoma",
  "Bruno Vunge",
];

const TYPES = ["VIP", "Regular", "Passaporte", "Regular", "VIP", "Passaporte", "Regular", "VIP", "Regular", "Passaporte", "VIP", "Regular"];

const PRICES = [40000, 30000, 60000, 30000, 40000, 60000, 30000, 40000, 30000, 60000, 40000, 30000];

const STATUS_CYCLE = ["Usado", "Usado", "Usado", "Vendido", "Usado", "Vendido", "Usado", "Vendido", "Cancelado", "Vendido", "Usado", "Vendido"];

const TRANSACTION_TIMES = ["22:18", "22:16", "22:12", "21:47", "21:30", "21:05"];

// Serie base das 10h as 22h (12 pontos).
const SALES_SERIES = [30, 80, 150, 240, 300, 420, 380, 470, 560, 500, 640, 760];
const CHECKINS_SERIES = [0, 10, 60, 120, 140, 220, 190, 260, 330, 300, 420, 520];

function scaleSeries(series, factor) {
  return series.map((value) => Math.round(value * factor));
}

function buildTickets(event, factor) {
  return BUYERS.map((name, index) => ({
    id: `${event.id}-ticket-${index}`,
    name,
    initials: name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join(""),
    type: TYPES[index],
    price: Math.round(PRICES[index] * factor),
    status: STATUS_CYCLE[index],
  }));
}

function buildTransactions(event, factor) {
  return TRANSACTION_TIMES.map((time, index) => ({
    id: `${event.id}-tx-${index}`,
    time,
    name: BUYERS[index],
    type: TYPES[index],
    price: Math.round(PRICES[index] * factor),
  }));
}

export const organizerDashboardEvents = [
  {
    id: "festival-verao",
    title: "Festival de Verão",
    meta: "Música · Cultura · Luanda",
    date: "26 Jul - 28 Jul 2025",
    time: "16:00",
    venue: "Marginal de Luanda",
    image: festival,
    category: "FESTIVAL",
    status: "Ativo",
    capacity: 1000,
    sold: 750,
    checkins: 650,
    salesGrowth: "+25% hoje",
    salesFactor: 1,
  },
  {
    ...events[2],
    meta: `${events[2].category} · ${events[2].city}`,
    image: events[2].image,
    date: events[2].date,
    status: "Ativo",
    capacity: 800,
    sold: 520,
    checkins: 410,
    salesGrowth: "+12% hoje",
    salesFactor: 0.75,
  },
  {
    ...events[3],
    meta: `${events[3].category} · ${events[3].city}`,
    image: events[3].image,
    date: events[3].date,
    status: "Pausado",
    capacity: 1200,
    sold: 310,
    checkins: 95,
    salesGrowth: "+8% hoje",
    salesFactor: 0.6,
  },
].map((event) => ({
  ...event,
  salesSeries: scaleSeries(SALES_SERIES, event.salesFactor),
  checkinsSeries: scaleSeries(CHECKINS_SERIES, event.salesFactor),
  tickets: buildTickets(event, event.salesFactor),
  transactions: buildTransactions(event, event.salesFactor),
}));

export function getEventDashboard(id) {
  return (
    organizerDashboardEvents.find((event) => event.id === id) ||
    organizerDashboardEvents[0]
  );
}
