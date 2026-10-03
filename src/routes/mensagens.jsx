import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Mail,
  MessageSquare,
  Phone,
  UsersRound,
  UserRound,
  X,
} from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { pendingMessageCount, sponsorRequests, ticketRequests } from "@/data/messages";

export const Route = createFileRoute("/mensagens")({
  head: () => ({
    meta: [
      { title: "Mensagens e pedidos | Tickr" },
      {
        name: "description",
        content: "Pedidos de ingressos e contactos de patrocinadores do seu evento.",
      },
      { property: "og:title", content: "Mensagens e pedidos | Tickr" },
      {
        property: "og:description",
        content: "Acompanhe pedidos de ingressos e propostas de patrocinadores na Tickr.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Mensagens,
});

function Mensagens() {
  const [ticketStates, setTicketStates] = useState({});
  const [sponsorStates, setSponsorStates] = useState({});

  const setTicketStatus = (id, status) => {
    setTicketStates((current) => ({ ...current, [id]: status }));
  };

  const setSponsorStatus = (id, status) => {
    setSponsorStates((current) => ({ ...current, [id]: status }));
  };

  return (
    <Screen>
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 pt-5 pb-4">
        <Link
          to="/perfil"
          aria-label="Voltar ao perfil"
          className="grid size-10 place-items-center rounded-full bg-surface transition-colors hover:bg-surface-2"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase text-primary">Central do organizador</p>
          <h1 className="mt-1 text-xl font-extrabold">Mensagens</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold text-muted-foreground">Por responder</p>
          <span className="mt-1 inline-grid min-w-7 place-items-center rounded-full bg-primary px-2 py-1 text-xs font-extrabold text-primary-foreground">
            {pendingMessageCount}
          </span>
        </div>
      </header>

      <main className="space-y-8 px-4 pt-5 pb-10">
        <section aria-labelledby="tickets-title">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-success-soft text-success">
              <MessageSquare className="size-4" />
            </span>
            <div>
              <h2 id="tickets-title" className="text-base font-extrabold leading-tight">
                Pedidos de ingressos
              </h2>
               <p className="mt-1 text-xs text-muted-foreground">Clientes aguardando confirmação.</p>
            </div>
            </div>
            <span className="shrink-0 rounded-full bg-success-soft px-3 py-2 text-[11px] font-bold text-success">
              {ticketRequests.length} pedidos <ChevronRight className="ml-1 inline size-3.5" />
            </span>
          </div>

          <ul className="space-y-3">
            {ticketRequests.map((request) => (
              <li key={request.id}>
                <article className="rounded-3xl border border-border bg-card p-4 shadow-sm shadow-primary/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                       <span className="grid size-11 place-items-center rounded-full bg-info-soft font-extrabold text-info">
                        <UserRound className="size-4" />
                      </span>
                      <div>
                         <h3 className="text-sm font-extrabold">{request.name}</h3>
                         <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><Clock3 className="size-3" /> {request.time}</p>
                      </div>
                    </div>
                     <span className="shrink-0 rounded-full bg-warning-soft px-2 py-1 text-[10px] font-bold text-warning">
                       {ticketStates[request.id] || request.status}
                    </span>
                  </div>
                   <div className="mt-4 rounded-2xl bg-surface p-3">
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
                   <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
                    <a
                      href={`tel:${request.phone}`}
                       className="flex items-center justify-center gap-1.5 rounded-full border border-primary/40 px-3 py-2.5 text-xs font-bold text-primary"
                    >
                       <Phone className="size-3.5" /> Contactar
                    </a>
                     <button
                       type="button"
                       onClick={() => setTicketStatus(request.id, "Aprovado")}
                       disabled={ticketStates[request.id] === "Aprovado"}
                       className="flex items-center justify-center gap-1 rounded-full bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/15 disabled:opacity-60"
                     >
                       <Check className="size-3.5" /> {ticketStates[request.id] === "Aprovado" ? "Aprovado" : "Aprovar"}
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sponsors-title">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-success-soft text-success">
              <UsersRound className="size-5" />
            </span>
            <div>
               <h2 id="sponsors-title" className="text-base font-extrabold leading-tight">
                Propostas de patrocinadores
              </h2>
              <p className="text-xs text-muted-foreground">Contactos de marcas e parceiros.</p>
            </div>
            </div>
            <span className="shrink-0 rounded-full bg-success-soft px-3 py-2 text-[11px] font-bold text-success">
              {sponsorRequests.length} propostas <ChevronRight className="ml-1 inline size-3.5" />
            </span>
          </div>

          <ul className="space-y-3">
            {sponsorRequests.map((request) => (
              <li key={request.id}>
                <article className="rounded-3xl border border-border bg-card p-4 shadow-sm shadow-primary/5">
                  <div className="flex items-start justify-between gap-3">
                     <div className="flex items-center gap-3">
                       <span className="grid size-12 shrink-0 place-items-center rounded-full bg-foreground font-extrabold text-primary-foreground">
                         {request.name.slice(0, 1)}
                       </span>
                       <div>
                         <h3 className="text-sm font-extrabold">{request.name}</h3>
                         <p className="mt-1 text-xs font-bold text-primary">{request.social}</p>
                       </div>
                    </div>
                     <span className="shrink-0 rounded-full bg-info-soft px-2 py-1 text-[10px] font-bold text-info">
                       {sponsorStates[request.id] || request.status}
                    </span>
                  </div>
                   <div className="mt-4 flex items-center gap-2">
                     <p className="flex-1 rounded-2xl bg-success-soft p-3 text-xs leading-relaxed text-muted-foreground">{request.presentation}</p>
                     <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                   </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Mail className="size-3.5 shrink-0" /> {request.email}
                  </div>
                   <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                     <Phone className="size-3.5" /> {request.phone}
                   </div>
                   <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
                    <a
                       href={`https://wa.me/${request.phone.replace(/\D/g, "")}`}
                       target="_blank"
                       rel="noreferrer"
                       className="flex items-center justify-center gap-1.5 rounded-full border border-primary/40 px-3 py-2.5 text-xs font-bold text-primary"
                    >
                       <MessageSquare className="size-3.5" /> WhatsApp
                    </a>
                     <button
                       type="button"
                       onClick={() => setSponsorStatus(request.id, "Aceite")}
                       disabled={sponsorStates[request.id] === "Aceite"}
                       className="flex items-center justify-center gap-1 rounded-full bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/15 disabled:opacity-60"
                     >
                       <Check className="size-3.5" /> {sponsorStates[request.id] === "Aceite" ? "Aceite" : "Aceitar"}
                     </button>
                     <button
                       type="button"
                       onClick={() => setSponsorStatus(request.id, "Recusado")}
                       disabled={sponsorStates[request.id] === "Recusado"}
                       className="col-span-2 flex items-center justify-center gap-1 rounded-full bg-destructive px-3 py-2.5 text-xs font-bold text-destructive-foreground disabled:opacity-60"
                     >
                       <X className="size-3.5" /> {sponsorStates[request.id] === "Recusado" ? "Recusado" : "Recusar"}
                     </button>
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
