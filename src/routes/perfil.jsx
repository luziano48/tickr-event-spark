import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquare, MoreHorizontal, PlusCircle } from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { organizerEvents, profileStats } from "@/data/profile";
import { pendingMessageCount } from "@/data/messages";
export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Tickr" },
      {
        name: "description",
        content: "Acompanhe eventos, ingressos vendidos e receita total no painel Tickr.",
      },
      { property: "og:title", content: "Painel do organizador | Tickr" },
      {
        property: "og:description",
        content: "Acompanhe eventos, vendas e receita no painel Tickr.",
      },
    ],
  }),
  component: Perfil,
});
function Perfil() {
  return (
    <Screen>
      <header className="flex items-center justify-between px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-surface-2 text-sm font-bold text-primary">
            LD
          </span>
          <div>
            <p className="text-sm font-bold">Organizador</p>
            <p className="text-xs text-muted-foreground">Eventos · Tickr</p>
          </div>
        </div>
        <Link
          to="/mensagens"
          aria-label={`Abrir mensagens, ${pendingMessageCount} pendentes`}
          className="relative grid size-9 place-items-center rounded-full bg-surface-2 text-primary"
        >
          <MessageSquare className="size-4" />
          <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {pendingMessageCount}
          </span>
        </Link>
      </header>

      <div className="grid grid-cols-3 gap-2 px-4">
        {profileStats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="rounded-2xl bg-card p-3">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/15">
              <Icon className="size-4 text-primary" />
            </span>
            <p className="mt-3 text-lg font-extrabold">{value}</p>
            <p className="text-[10px] leading-tight text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">Meus eventos</h1>
          <Link to="/explorar" className="flex items-center gap-1 text-xs text-primary">
            Ver todos <ArrowRight className="size-3" />
          </Link>
        </div>

        <ul className="space-y-3">
          {organizerEvents.map(({ event, sold, status }) => {
            return (
              <li key={event.id}>
                <Link
                  to="/evento/$id"
                  params={{ id: event.id }}
                  className="flex items-center gap-3 rounded-2xl bg-card p-3"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    loading="lazy"
                    className="size-14 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{event.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {event.date} · {event.city}
                    </p>
                    <p className="mt-1 text-[11px] text-primary">{sold}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        status === "Ativo"
                          ? "bg-primary/15 text-primary"
                          : "bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      {status}
                    </span>
                    <MoreHorizontal className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <button className="grad-primary glow mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-bold text-primary-foreground">
          <PlusCircle className="size-4" /> Criar novo evento
        </button>

        <Link
          to="/scanner"
          className="mt-3 flex w-full items-center justify-center rounded-full border border-border py-3 text-sm font-semibold"
        >
          Validar entradas
        </Link>
      </section>
    </Screen>
  );
}
