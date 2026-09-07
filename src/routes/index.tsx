import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bell, Calendar, MapPin, Search } from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { Logo } from "@/components/tickr/Logo";
import { EventCard } from "@/components/tickr/EventCard";
import { events } from "@/data/events";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tickr — Grandes eventos, mais perto de ti" },
      {
        name: "description",
        content:
          "Descubra festivais, concertos e conferências em Angola e compre o seu ingresso em segundos com a Tickr.",
      },
      { property: "og:title", content: "Tickr — Grandes eventos, mais perto de ti" },
      {
        property: "og:description",
        content: "Descubra e compre ingressos para os melhores eventos de Luanda.",
      },
    ],
  }),
  component: Home,
});

const categories = ["Todos", "Música", "Cultura", "Festival", "Negócios"];

function Home() {
  const featured = events[0]!;
  const rest = events.slice(1);

  return (
    <Screen>
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <Logo className="text-2xl" />
        <div className="flex items-center gap-3">
          <Link to="/explorar" aria-label="Procurar">
            <Search className="size-5" />
          </Link>
          <Bell className="size-5" />
        </div>
      </header>

      <section className="px-4">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={featured.image}
            alt={featured.title}
            width={1280}
            height={800}
            className="h-60 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-3 p-4">
            <span className="inline-block rounded-md bg-primary/15 px-2 py-1 text-[10px] font-bold tracking-wider text-primary">
              EM DESTAQUE
            </span>
            <h1 className="text-2xl leading-tight font-extrabold">{featured.title}</h1>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="size-3.5" /> {featured.date}
              <MapPin className="ml-1.5 size-3.5" /> {featured.city}
            </p>
            <Link
              to="/evento/$id"
              params={{ id: featured.id }}
              className="grad-primary glow flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-primary-foreground"
            >
              Ver detalhes <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto px-4">
        {categories.map((c, i) => (
          <span
            key={c}
            className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap ${
              i === 0
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2 text-muted-foreground"
            }`}
          >
            {c}
          </span>
        ))}
      </div>

      <section className="mt-6 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Eventos em destaque</h2>
          <Link to="/explorar" className="flex items-center gap-1 text-xs text-primary">
            Ver todos <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {rest.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
    </Screen>
  );
}
