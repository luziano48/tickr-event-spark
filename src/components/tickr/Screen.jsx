import { BottomNav } from "./BottomNav";
import { useRouterState } from "@tanstack/react-router";

export function Screen({ children, nav = true }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="mx-auto min-h-screen max-w-md border-x border-border bg-background shadow-2xl shadow-primary/5">
      {/* CONTENEDOR DA TELA: largura central e fundo. CSS: classes Tailwind + src/styles.css. */}
      <div key={pathname} className={nav ? "tickr-page-content pb-28" : "tickr-page-content"}>
        {children}
      </div>
      {nav ? <BottomNav /> : null}
    </div>
  );
}
