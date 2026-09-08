import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Mail,
  MessageSquare,
  Phone,
  UserRound,
} from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { pendingMessageCount, sponsorRequests, ticketRequests } from "@/data/messages";

export const Route = createFileRoute("/mensagens")({
  head: () => ({
    meta: [
      { title: "Tickr" },
      {
        name: "description",
        content: "Pedidos de ingressos e contactos de patrocinadores do seu evento.",
      },
    ],
  }),
  component: Mensagens,
});

function Mensagens() {
  return (
    <Screen>
      <header className="flex items-center gap-3 px-4 pt-5 pb-3">
        <Link
          to="/perfil"
          aria-label="Voltar ao perfil"
          className="grid size-9 place-items-center rounded-full bg-surface-2"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <p className="text-xs font-bold tracking-wider text-primary">CENTRAL DO ORGANIZADOR</p>
          <h1 className="mt-1 text-xl font-extrabold">Mensagens e pedidos</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold text-muted-foreground">Pendentes</p>
          <span className="text-lg font-extrabold text-primary">{pendingMessageCount}</span>
        </div>
      </header>

      <main className="space-y-7 px-4 pb-10">
        <section aria-labelledby="tickets-title">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <MessageSquare className="size-4" />
            </span>
            <div>
              <h2 id="tickets-title" className="text-lg font-bold">
                Pedidos de ingressos
              </h2>
              <p className="text-xs text-muted-foreground">Clientes aguardando aprovação ou contacto.</p>
            </div>
            </div>
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
              {ticketRequests.length} pedidos
            </span>
          </div>

          <ul className="space-y-3">
            {ticketRequests.map((request) => (
              <li key={request.id}>
                <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-primary">
                        <UserRound className="size-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold">{request.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{request.time}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-1 text-[10px] font-bold text-amber-700">
                      {request.status}
                    </span>
                  </div>
                  <div className="mt-4 rounded-xl border border-border bg-surface p-3">
                    <p className="text-xs font-semibold">{request.event.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-md bg-card px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                        {request.quantity}
                      </span>
                      <span className="rounded-md bg-primary/15 px-2 py-1 text-[10px] font-semibold text-primary">
                        {request.type}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Phone className="size-3.5" />
                    <span>{request.phone}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${request.phone}`}
                      className="flex items-center justify-center rounded-full border border-primary/40 px-3 py-2 text-xs font-bold text-primary"
                    >
                      Contactar
                    </a>
                    <button type="button" className="flex items-center justify-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">
                      <Check className="size-3.5" /> Aprovar
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sponsors-title">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <BadgeCheck className="size-4" />
            </span>
            <div>
              <h2 id="sponsors-title" className="text-lg font-bold">
                Propostas de patrocinadores
              </h2>
              <p className="text-xs text-muted-foreground">Contactos de marcas e parceiros.</p>
            </div>
            </div>
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
              {sponsorRequests.length} propostas
            </span>
          </div>

          <ul className="space-y-3">
            {sponsorRequests.map((request) => (
              <li key={request.id}>
                <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold">{request.name}</h3>
                      <p className="mt-1 text-[11px] text-primary">{request.social}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-500/15 px-2 py-1 text-[10px] font-bold text-blue-700">
                      {request.status}
                    </span>
                  </div>
                  <p className="mt-4 rounded-xl bg-surface p-3 text-xs leading-relaxed text-muted-foreground">
                    {request.presentation}
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Mail className="size-3.5 shrink-0" /> {request.email}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Phone className="size-3.5" /> {request.phone}
                    </span>
                    <a
                      href={`mailto:${request.email}`}
                      className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                    >
                      Responder
                    </a>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </Screen>
  );
}
