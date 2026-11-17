import { Star } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useEventStars } from "@/hooks/use-event-stars";
import { useAuthSession } from "./AuthContext";

export function EventStarButton({ eventId, className = "" }) {
  const [showLoginHint, setShowLoginHint] = useState(false);
  const { status } = useAuthSession();
  const { starCount, hasStarred, toggleStar } = useEventStars();
  const authenticated = status === "authenticated";
  const starred = authenticated && hasStarred(eventId);
  const count = starCount(eventId);

  return (
    <span className="relative z-10 inline-flex">
      <button
        type="button"
        aria-label={`${starred ? "Retirar" : "Dar"} estrela ao evento; ${count} ${count === 1 ? "estrela" : "estrelas"}`}
        aria-pressed={starred}
        title={`${count} ${count === 1 ? "estrela" : "estrelas"}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!authenticated) {
            setShowLoginHint((visible) => !visible);
            return;
          }
          setShowLoginHint(false);
          toggleStar(eventId);
        }}
        className={`relative inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full bg-background/90 px-2 text-[11px] font-bold shadow-sm transition-transform hover:scale-105 active:scale-95 ${starred ? "text-primary" : "text-muted-foreground"} ${className}`}
      >
        <Star className={`size-4 ${starred ? "fill-primary text-primary" : ""}`} />
        <span>{count}</span>
      </button>
      {showLoginHint ? (
        <span
          role="status"
          className="absolute bottom-full right-0 mb-2 w-44 rounded-xl border border-border bg-card p-3 text-left text-[11px] font-medium text-foreground shadow-lg"
        >
          Inicia sessão para guardar este evento.
          <Link to="/login" className="mt-1 block font-bold text-primary">
            Entrar
          </Link>
        </span>
      ) : null}
    </span>
  );
}
