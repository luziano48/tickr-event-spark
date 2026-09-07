import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  MoreHorizontal,
  PlusCircle,
  Ticket,
  Wallet,
} from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { events } from "@/data/events";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Painel do organizador | Tickr" },
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

const stats = [
  { icon: CalendarDays, value: "124", label: "Total de eventos" },
  { icon: Ticket, value: "48.5k", label: "Ingressos vendidos" },
  { icon: Wallet, value: "Kz 2.4M", label: "Receita total" },
];

const mine = [
  { id: events[0]!.id, sold: "2.8k ingressos", status: "Ativo" },
  { id: events[3]!.id, sold: "1.2k ingressos", status: "Ativo" },
  { id: events[4]!.id, sold: "800 ingressos", status: "Rascunho" },
];

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
        <Bell className="size-5" />
      </header>

      <div className="grid grid-cols-3 gap-2 px-4">
        {stats.map(({ icon: Icon, value, label }) => (
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
          {mine.map((m) => {
            const e = events.find((x) => x.id === m.id)!;
            return (
              <li key={m.id}>
                <Link
                  to="/evento/$id"
                  params={{ id: e.id }}
                  className="flex items-center gap-3 rounded-2xl bg-card p-3"
                >
                  <img
                    src={e.image}
                    alt={e.title}
                    loading="lazy"
                    className="size-14 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{e.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {e.date} · {e.city}
                    </p>
                    <p className="mt-1 text-[11px] text-primary">{m.sold}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        m.status === "Ativo"
                          ? "bg-primary/15 text-primary"
                          : "bg-surface-2 text-muted-foreground"
                      }`}
                    >
                      {m.status}
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
