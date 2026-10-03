import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Plus, QrCode, Search, User } from "lucide-react";
const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/explorar", label: "Explorar", icon: Search },
  { to: "/criar", label: "Criar", icon: Plus },
  { to: "/eventos", label: "Eventos", icon: QrCode },
  { to: "/perfil", label: "Perfil", icon: User },
];
export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card/95 shadow-[0_-12px_36px_-24px_var(--primary)] backdrop-blur-xl">
      {/* NAVEGACAO INFERIOR: JSX neste arquivo; visual definido pelas classes Tailwind. */}
      <ul className="flex items-center justify-around px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, label, icon: Icon }) => {
          const active = path === to;
          const isCreate = to === "/criar";
          return (
            <li key={to} className={isCreate ? "-mt-3" : ""}>
              <Link
                to={to}
                className={
                  isCreate
                      ? "flex w-20 flex-col items-center gap-1 text-[10px] font-bold text-primary"
                      : `flex w-20 flex-col items-center gap-1 text-[10px] ${active ? "font-bold text-primary" : "text-muted-foreground"}`
                }
              >
                <span
                  className={
                    isCreate
                      ? "grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-surface"
                      : active
                        ? "grid size-8 place-items-center rounded-full bg-success-soft"
                        : "grid size-8 place-items-center"
                  }
                >
                  <Icon
                    className={isCreate ? "size-6" : "size-5"}
                    strokeWidth={isCreate || active ? 2.4 : 1.8}
                  />
                </span>
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
