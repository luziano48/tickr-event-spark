import { CalendarDays, Image, MapPin, Tag } from "lucide-react";
import artist from "@/assets/artist.jpg";
import cultura from "@/assets/cultura.jpg";
import tech from "@/assets/tech.jpg";

export const eventBasics = [
  { icon: Tag, label: "Nome do evento", value: "Ex.: Festival Luanda Música" },
  { icon: Image, label: "Imagem de capa", value: "Adicione uma imagem marcante" },
  { icon: CalendarDays, label: "Data e horário", value: "Escolha quando acontece" },
  { icon: MapPin, label: "Local do evento", value: "Defina o bairro e o espaço" },
];

export const suppliers = [
  {
    name: "Telma Sousa",
    service: "Decoradora de eventos",
    neighborhood: "Talatona",
    availability: "Disponível para contratar",
    image: cultura,
    contact: "Contactar",
  },
  {
    name: "DJ Kapiro",
    service: "DJ e animação musical",
    neighborhood: "Maianga",
    availability: "Disponível este mês",
    image: artist,
    contact: "Contactar",
  },
  {
    name: "Som & Luz Luanda",
    service: "Aluguer de aparelhagem",
    neighborhood: "Viana",
    availability: "Resposta em até 1h",
    image: tech,
    contact: "Contactar",
  },
];
