import { CalendarDays, Ticket, Wallet } from "lucide-react";
import { events } from "./events";
import artist from "@/assets/artist.jpg";

export const organizerProfile = {
  name: "Luziano Domingos",
  username: "@luziano.events",
  location: "Luanda, Angola",
  rating: 0,
  reviewCount: 0,
  photo: artist,
  initials: "LD",
};

export const profileStats = [
  { icon: CalendarDays, value: "4", label: "Total de eventos" },
  { icon: Ticket, value: "0", label: "Ingressos vendidos" },
  { icon: Wallet, value: "Kz 0", label: "Receita total" },
];

const eventDetails = [
  { sold: "0 ingressos", status: "Ativo" },
  { sold: "0 ingressos", status: "Ativo" },
  { sold: "0 ingressos", status: "Ativo" },
  { sold: "0 ingressos", status: "Ativo" },
];

export const organizerEvents = events.map((event, index) => ({
  event,
  ...eventDetails[index],
}));

export const publishedEvents = organizerEvents.filter(({ status }) => status === "Ativo");

export const draftEvents = organizerEvents.filter(({ status }) => status === "Rascunho");

export const organizerReviews = [];
