import festival from "@/assets/festival.jpg";
import artist from "@/assets/artist.jpg";
import cultura from "@/assets/cultura.jpg";
import afro from "@/assets/afro.jpg";
import tech from "@/assets/tech.jpg";
export const events = [
  {
    id: "festival-luanda",
    title: "Crie um evento do zero com a Tickr!",
    category: "FESTIVAL",
    date: "A melhor data!",
    time: "16:00",
    city: "Em qualquer lugar",
    venue: "Marginal de Luanda",
    price: "Kz 10.000",
    image: festival,
    description:
      "Encontre os melhores fornecedores, serviços e soluções para criar o seu evento perfeito.",
  },
  {
    id: "ninho-live",
    title: "Ninho Live in Luanda",
    category: "MÚSICA",
    date: "18 Jul 2025",
    time: "20:00",
    city: "Luanda",
    venue: "Palácio de Congressos",
    price: "Kz 25.000",
    image: artist,
    description:
      "O maior artista da nova geração francesa chega a Luanda para um espetáculo inesquecível. Prepare-se para uma noite de emoções, hits e muita energia!",
  },
  {
    id: "semba-raizes",
    title: "Semba & Raízes",
    category: "CULTURA",
    date: "26 Jul 2025",
    time: "19:00",
    city: "Luanda",
    venue: "Cine Atlântico",
    price: "Kz 15.000",
    image: cultura,
    description: "Uma noite dedicada às raízes do semba, com mestres e novas vozes no mesmo palco.",
  },
  {
    id: "afro-beats-night",
    title: "Afro Beats Night",
    category: "MÚSICA",
    date: "26 Jul 2025",
    time: "22:00",
    city: "Luanda",
    venue: "Clube Naval",
    price: "Kz 12.000",
    image: afro,
    description: "A melhor seleção afrobeats da cidade, com DJs residentes e convidados.",
  },
  {
    id: "tech-summit",
    title: "Tech & Business Summit",
    category: "NEGÓCIOS",
    date: "15 Ago 2025",
    time: "09:00",
    city: "Luanda",
    venue: "Talatona Convention Center",
    price: "Kz 30.000",
    image: tech,
    description:
      "Dois dias de painéis, networking e workshops com líderes de tecnologia e negócios.",
  },
];
export const getEvent = (id) => events.find((e) => e.id === id);
