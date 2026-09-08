import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Heart,
  MapPin,
  MessageCircle,
  MessageSquare,
  Search,
} from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { Logo } from "@/components/tickr/Logo";
import { EventCard } from "@/components/tickr/EventCard";
import { featuredEvent, secondaryEvents } from "@/data/home";
import { tickrAnnouncements } from "@/data/tickr-profile";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tickr" },
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
function Home() {
  return (
    <Screen>
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <Logo />
        <div className="flex items-center gap-3">
          <Link to="/explorar" aria-label="Procurar">
            <Search className="size-5" />
          </Link>
          <Link to="/mensagens" aria-label="Abrir mensagens">
            <MessageSquare className="size-5" />
          </Link>
        </div>
      </header>

      <section className="px-4">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={featuredEvent.image}
            alt={featuredEvent.title}
            width={1280}
            height={800}
            className="h-60 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-3 p-4 text-white">
            <span className="inline-block rounded-md bg-black/45 px-2 py-1 text-[10px] font-bold tracking-wider text-primary">
              TICKR EVENT
            </span>
            <h1 className="text-2xl leading-tight font-extrabold">{featuredEvent.title}</h1>
            <p className="flex items-center gap-1.5 text-xs text-white/85">
              <Calendar className="size-3.5" /> {featuredEvent.date}
              <MapPin className="ml-1.5 size-3.5" /> {featuredEvent.city}
            </p>
            <Link
              to="/evento/$id"
              params={{ id: featuredEvent.id }}
              className="grad-primary glow flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-primary-foreground"
            >
              Ver perfil <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6" aria-labelledby="announcements-title">
        <div className="mb-3 flex items-end justify-between px-4">
          <div>
            <p className="text-xs font-bold tracking-wider text-primary">PERFIL VERIFICADO</p>
            <h2 id="announcements-title" className="mt-1 text-lg font-extrabold">
              Novidades da Tickr
            </h2>
          </div>
          <Link to="/evento/$id" params={{ id: featuredEvent.id }} className="text-xs font-bold text-primary">
            Ver perfil
          </Link>
        </div>

        <div className="space-y-3 px-4">
          {tickrAnnouncements.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
                    T
                  </span>
                  <span className="text-sm font-bold">Tickr Eventos</span>
                  <BadgeCheck className="size-4 text-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground">{post.date}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-md bg-primary/15 px-2 py-1 text-[10px] font-bold tracking-wider text-primary">
                  {post.category}
                </span>
                <div className="flex gap-2 text-muted-foreground">
                  <Heart className="size-3.5" />
                  <MessageCircle className="size-3.5" />
                </div>
              </div>
              <h3 className="mt-3 text-base font-bold leading-snug">{post.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{post.text}</p>
              <Link to={post.href} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
                Saber mais <ArrowRight className="size-3" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Eventos em destaque</h2>
          <Link to="/explorar" className="flex items-center gap-1 text-xs text-primary">
            Ver todos <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {secondaryEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </Screen>
  );
}
