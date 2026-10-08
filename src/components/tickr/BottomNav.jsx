import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Plus, QrCode, Search, User } from "lucide-react";
import { useEffect, useState } from "react";
const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/explorar", label: "Explorar", icon: Search },
  { to: "/criar", label: "Criar", icon: Plus },
  { to: "/eventos", label: "Eventos", icon: QrCode },
  { to: "/perfil", label: "Perfil", icon: User },
];
export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    let previousY = Math.max(0, window.scrollY);
    let accumulated = 0;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight));
        const delta = y - previousY;
        previousY = y;
        if (y < 48) {
          accumulated = 0;
          setHidden(false);
          return;
        }
        if (Math.sign(delta) !== Math.sign(accumulated)) accumulated = 0;
        accumulated += delta;
        if (Math.abs(accumulated) >= 12) {
          setHidden(accumulated > 0);
          accumulated = 0;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [path]);

  return (
    <nav
      aria-label="Navegação principal"
      onFocusCapture={() => setHidden(false)}
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 grid w-1/2 min-w-[260px] max-w-md -translate-x-1/2 grid-cols-[minmax(0,1fr)_48px] items-center gap-2 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${hidden ? "translate-y-[calc(100%+3rem)] opacity-0" : "translate-y-0 opacity-100"}`}
    >
      <ul className="grid min-w-0 grid-cols-4 items-center rounded-full border border-border bg-card/95 p-1.5 glow backdrop-blur-xl">
        {items.filter(({ to }) => to !== "/criar").map(({ to, label, icon: Icon }) => {
          const active = path === to || (to === "/eventos" && path.startsWith("/evento/"));
          return (
            <li key={to} className="min-w-0">
              <Link
                to={to}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                title={label}
                className={`group relative grid h-11 place-items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${active ? "bg-success-soft text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
              >
                <Icon className="size-5 shrink-0" strokeWidth={active ? 2.4 : 1.8} />
                <span className="pointer-events-none absolute bottom-full mb-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        to="/criar"
        aria-label="Criar evento"
        aria-current={path === "/criar" ? "page" : undefined}
        title="Criar evento"
        className="group relative grid size-12 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary text-primary-foreground glow transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none"
      >
        <Plus className="size-6" strokeWidth={2.4} />
        <span className="pointer-events-none absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Criar evento</span>
      </Link>
    </nav>
  );
}
