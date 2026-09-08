import { CalendarDays, Ticket, Wallet } from "lucide-react";
import { events } from "./events";

export const profileStats = [
  { icon: CalendarDays, value: "124", label: "Total de eventos" },
  { icon: Ticket, value: "48.5k", label: "Ingressos vendidos" },
  { icon: Wallet, value: "Kz 2.4M", label: "Receita total" },
];

export const organizerEvents = [
  { event: events[0], sold: "2.8k ingressos", status: "Ativo" },
  { event: events[3], sold: "1.2k ingressos", status: "Ativo" },
  { event: events[4], sold: "800 ingressos", status: "Rascunho" },
];
