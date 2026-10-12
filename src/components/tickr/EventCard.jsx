import { Link } from "@tanstack/react-router";
import { Calendar, MapPin, Star } from "lucide-react";
export function EventCard({ event }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-card">
      <Link to="/evento/$id" params={{ id: event.id }} className="block">
        <div className="relative">
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            className="h-32 w-full object-cover"
          />
          <span className="absolute bottom-2 left-2 rounded-md bg-background/80 px-2 py-1 text-[10px] font-semibold tracking-wide">
            {event.category}
          </span>
          <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-background/70">
            <Star className="size-3.5" />
          </span>
        </div>
        <div className="space-y-1.5 px-3 pt-3">
          <h3 className="text-sm leading-snug font-semibold">{event.title}</h3>
        </div>
      </Link>
      <div className="space-y-1.5 p-3">
        {event.organizer ? (
          <Link to="/perfil" className="block text-[11px] font-medium text-primary">
            Publicado por {event.organizer}
          </Link>
        ) : null}
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Calendar className="size-3" /> {event.date}
          <MapPin className="ml-1 size-3" /> {event.city}
        </p>
        <p className="pt-0.5 text-sm font-bold text-primary">{event.price}</p>
      </div>
    </article>
  );
}
