import { Star } from "lucide-react";
import { useEventStars } from "@/hooks/use-event-stars";

export function EventStarButton({ eventId, className = "" }) {
  const { starCount, hasStarred, toggleStar } = useEventStars();
  const starred = hasStarred(eventId);
  const count = starCount(eventId);

  return (
    <button
      type="button"
      aria-label={`${starred ? "Retirar" : "Dar"} estrela ao evento; ${count} ${count === 1 ? "estrela" : "estrelas"}`}
      aria-pressed={starred}
      title={`${count} ${count === 1 ? "estrela" : "estrelas"}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleStar(eventId);
      }}
      className={`relative z-10 inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full bg-background/90 px-2 text-[11px] font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 ${starred ? "text-primary" : "text-muted-foreground"} ${className}`}
    >
      <Star className={`size-4 ${starred ? "fill-primary text-primary" : ""}`} />
      <span>{count}</span>
    </button>
  );
}
