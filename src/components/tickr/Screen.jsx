import { BottomNav } from "./BottomNav";
export function Screen({ children, nav = true }) {
  return (
    <div className="mx-auto min-h-screen max-w-md border-x border-border bg-background shadow-2xl shadow-primary/5">
      {/* CONTENEDOR DA TELA: largura central e fundo. CSS: classes Tailwind + src/styles.css. */}
      <div className={nav ? "tickr-page-content pb-28" : "tickr-page-content"}>{children}</div>
      {nav ? <BottomNav /> : null}
    </div>
  );
}
