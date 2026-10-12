import { events } from "./events";
import festival from "@/assets/festival.jpg";

const CHART_POINTS = 12;

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
    sold: 0,
    checkins: 0,
    salesGrowth: "Sem vendas ainda",
  },
  {
    ...events[2],
    meta: `${events[2].category} · ${events[2].city}`,
    image: events[2].image,
    date: events[2].date,
    status: "Ativo",
    capacity: 800,
    sold: 0,
    checkins: 0,
    salesGrowth: "Sem vendas ainda",
  },
  {
    ...events[3],
    meta: `${events[3].category} · ${events[3].city}`,
    image: events[3].image,
    date: events[3].date,
    status: "Pausado",
    capacity: 1200,
    sold: 0,
    checkins: 0,
    salesGrowth: "Sem vendas ainda",
  },
].map((event) => ({
  ...event,
  salesSeries: Array(CHART_POINTS).fill(0),
  checkinsSeries: Array(CHART_POINTS).fill(0),
  tickets: [],
  transactions: [],
}));

export function getEventDashboard(id) {
  return (
    organizerDashboardEvents.find((event) => event.id === id) ||
    organizerDashboardEvents[0]
  );
}
