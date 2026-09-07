import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Share2,
  Ticket,
} from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { getEvent } from "@/data/events";

export const Route = createFileRoute("/evento/$id")({
  loader: ({ params }) => {
    const event = getEvent(params.id);
    if (!event) throw notFound();
    return event;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Evento"} | Tickr` },
      {
        name: "description",
        content: loaderData?.description ?? "Detalhes do evento na Tickr.",
      },
      { property: "og:title", content: `${loaderData?.title ?? "Evento"} | Tickr` },
      {
        property: "og:description",
        content: loaderData?.description ?? "Detalhes do evento na Tickr.",
      },
    ],
  }),
  component: EventoDetalhe,
});

function EventoDetalhe() {
  const event = Route.useLoaderData();

  return (
    <Screen nav={false}>
      <div className="relative">
        <img
          src={event.image}
          alt={event.title}
          className="h-80 w-full object-cover"
          width={1024}
          height={1024}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/30" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link
            to="/"
            className="grid size-9 place-items-center rounded-full bg-background/60 backdrop-blur"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-background/60 backdrop-blur">
              <Heart className="size-4" />
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-background/60 backdrop-blur">
              <Share2 className="size-4" />
            </span>
          </div>
        </div>
      </div>

      <div className="-mt-8 space-y-5 px-4 pb-10">
        <span className="inline-block rounded-md bg-primary/15 px-2 py-1 text-[10px] font-bold tracking-wider text-primary">
          {event.category}
        </span>
        <h1 className="text-2xl leading-tight font-extrabold">{event.title}</h1>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" /> {event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {event.time}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="size-4" /> {event.venue} · {event.city}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-foreground/85">{event.description}</p>

        <div className="flex items-center justify-between rounded-2xl bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-surface-2">
              <Ticket className="size-4 text-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold">Bilhetes</p>
              <p className="text-xs text-muted-foreground">A partir de {event.price}</p>
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>

        <Link
          to="/ingressos"
          className="grad-primary glow flex w-full items-center justify-center rounded-full py-4 text-sm font-bold text-primary-foreground"
        >
          Comprar ingresso
        </Link>

        <details className="border-t border-border pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold">
            Informações <ChevronDown className="size-4 text-muted-foreground" />
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Abertura de portas 1 hora antes do início.</li>
            <li>Entrada permitida a maiores de 16 anos.</li>
            <li>Ingresso pessoal e intransmissível, validado por QR Code.</li>
          </ul>
        </details>
      </div>
    </Screen>
  );
}
