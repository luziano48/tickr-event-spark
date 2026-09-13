import { CalendarDays, Ticket, Wallet } from "lucide-react";
import { events } from "./events";
import artist from "@/assets/artist.jpg";

export const organizerProfile = {
  name: "Luziano Domingos",
  username: "@luziano.events",
  location: "Luanda, Angola",
  rating: 4.8,
  reviewCount: 126,
  photo: artist,
  initials: "LD",
};

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

export const publishedEvents = organizerEvents.filter(({ status }) => status === "Ativo");

export const draftEvents = organizerEvents.filter(({ status }) => status === "Rascunho");

export const organizerReviews = [
  {
    id: "rev-1",
    author: "Marta Caculo",
    initials: "MC",
    rating: 5,
    date: "Há 2 dias",
    text: "Organização impecável. A entrada com QR Code foi super rápida e o evento começou à hora marcada.",
  },
  {
    id: "rev-2",
    author: "Pedro N'Gola",
    initials: "PN",
    rating: 5,
    date: "Há 1 semana",
    text: "Comprei o ingresso em minutos e o suporte respondeu logo no WhatsApp. Recomendo.",
  },
  {
    id: "rev-3",
    author: "Adalberto Lima",
    initials: "AL",
    rating: 4,
    date: "Há 3 semanas",
    text: "Boa experiência geral. Só gostava de ter recebido o mapa do local com mais antecedência.",
  },
];
