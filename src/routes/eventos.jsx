import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Lock,
  LockOpen,
  MoreVertical,
  QrCode,
  RefreshCw,
  ScanLine,
  Ticket as TicketIcon,
  TrendingUp,
  Users,
} from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import {
  getEventDashboard,
  organizerDashboardEvents,
} from "@/data/eventos";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Painel do evento | Tickr" },
      {
        name: "description",
        content:
          "Acompanhe vendas, check-ins, ingressos e transações do seu evento em tempo real na Tickr.",
      },
      { property: "og:title", content: "Painel do evento | Tickr" },
      {
        property: "og:description",
        content: "Gestão de vendas, check-ins e ingressos do seu evento na Tickr.",
      },
    ],
  }),
  component: Eventos,
});

const fmt = (value) => new Intl.NumberFormat("pt-PT").format(value);
const fmtKz = (value) => `Kz ${fmt(value)}`;

const ticketFilters = [
  { id: "vendidos", label: "Vendidos" },
  { id: "escaneados", label: "Escaneados" },
  { id: "porUsar", label: "Por Usar" },
  { id: "cancelados", label: "Cancelados" },
];

const statusStyles = {
  Vendido: "bg-primary/15 text-primary",
  Usado: "bg-teal/15 text-teal",
  Cancelado: "bg-destructive/10 text-destructive",
};

const eventStatusStyles = {
  Ativo: "bg-primary/15 text-primary",
  Pausado: "bg-amber-500/15 text-amber-600",
  Encerrado: "bg-surface-2 text-muted-foreground",
};

const eventStatusDot = {
  Ativo: "bg-primary",
  Pausado: "bg-amber-500",
  Encerrado: "bg-muted-foreground",
};

function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function AreaChart({ data }) {
  const gradientId = `chart-fill-${data.length}-${data[0]}`;
  const W = 320;
  const H = 150;
  const padL = 26;
  const padR = 10;
  const padT = 10;
  const padB = 16;
  const max = 800;
  const x = (i) => padL + (i * (W - padL - padR)) / (data.length - 1);
  const y = (v) => padT + (1 - Math.min(v, max) / max) * (H - padT - padB);
  const points = data.map((v, i) => [x(i), y(v)]);
  const line = smoothPath(points);
  const area = `${line} L ${x(data.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`;
  const last = points[points.length - 1];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 200, 400, 600, 800].map((tick) => (
          <g key={tick}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-border"
              strokeDasharray={tick === 0 ? "0" : "3 4"}
              strokeWidth="1"
            />
            <text
              x={padL - 4}
              y={y(tick) + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[8px]"
            >
              {tick}
            </text>
          </g>
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={last[0]} cy={last[1]} r="4" fill="var(--primary)" />
        <circle cx={last[0]} cy={last[1]} r="7" fill="var(--primary)" opacity="0.2" />
      </svg>
      <div className="mt-1 flex justify-between pl-6 pr-1 text-[9px] text-muted-foreground">
        <span>10h</span>
        <span>14h</span>
        <span>18h</span>
        <span>22h</span>
      </div>
    </div>
  );
}

function Donut({ percent }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const gradientId = `donut-${percent}`;
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--mint)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="9"
          className="stroke-border"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-xl font-extrabold leading-none">{percent}%</p>
          <p className="text-[10px] text-muted-foreground">Ocupado</p>
        </div>
      </div>
    </div>
  );
}

function Eventos() {
  const [eventId, setEventId] = useState(organizerDashboardEvents[0].id);
  const [eventMenuOpen, setEventMenuOpen] = useState(false);
  const [filter, setFilter] = useState("vendidos");
  const [openTicketMenu, setOpenTicketMenu] = useState(null);
  const [ticketState, setTicketState] = useState(null);
  const [salesState, setSalesState] = useState({});
  const [confirmClose, setConfirmClose] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const event = getEventDashboard(eventId);
  const closed = Boolean(salesState[event.id]);
  const tickets = ticketState
    ? ticketState.filter((t) => t.eventId === event.id)
    : event.tickets;
  const currentStatus = closed ? "Encerrado" : event.status;

  const sold = tickets.filter((t) => t.status !== "Cancelado").length;
  const capacity = event.capacity;
  const percent = Math.min(
    100,
    Math.round(((closed ? event.sold : event.sold) / capacity) * 100),
  );

  const visibleTickets = tickets.filter((ticket) => {
    if (filter === "escaneados") return ticket.status === "Usado";
    if (filter === "cancelados") return ticket.status === "Cancelado";
    if (filter === "porUsar") return ticket.status === "Vendido";
    return ticket.status !== "Cancelado";
  });

  const transactions = showAllTransactions
    ? event.transactions
    : event.transactions.slice(0, 3);

  const filterCount = (id) =>
    tickets.filter((ticket) => {
      if (id === "escaneados") return ticket.status === "Usado";
      if (id === "cancelados") return ticket.status === "Cancelado";
      if (id === "porUsar") return ticket.status === "Vendido";
      return ticket.status !== "Cancelado";
    }).length;

  const updateTicket = (id, status) => {
    setTicketState(
      (tickets.map((t) => (t.eventId ? t : { ...t, eventId: event.id })) || []).map(
        (t) => (t.id === id ? { ...t, status } : t),
      ),
    );
    setOpenTicketMenu(null);
  };

  return (
    <Screen>
      <header className="flex items-center justify-between px-4 pt-5 pb-4">
        <div>
          <p className="text-sm font-bold">Meus eventos</p>
          <p className="text-[11px] text-muted-foreground">Painel de gestão em tempo real</p>
        </div>
        <Link
          to="/ingressos"
          aria-label="Ver o meu ingresso com QR Code"
          className="grid size-9 place-items-center rounded-full bg-surface-2 text-primary"
        >
          <QrCode className="size-4" />
        </Link>
      </header>

      <main className="px-4">
        {/* CABECALHO DO EVENTO: imagem, titulo, meta e seletor de estado/evento. */}
        <section className="rounded-3xl bg-card p-4">
          <div className="flex items-start gap-3">
            <img
              src={event.image}
              alt={event.title}
              className="size-20 shrink-0 rounded-2xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 className="truncate text-lg font-extrabold leading-tight">{event.title}</h1>
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEventMenuOpen((open) => !open);
                      setOpenTicketMenu(null);
                    }}
                    aria-expanded={eventMenuOpen}
                    aria-label="Mudar de evento"
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${eventStatusStyles[currentStatus]}`}
                  >
                    <span className={`size-1.5 rounded-full ${eventStatusDot[currentStatus]}`} />
                    {currentStatus}
                    <ChevronDown className="size-3" />
                  </button>
                  {eventMenuOpen ? (
                    <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                      <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-muted-foreground">
                        Mudar de evento
                      </p>
                      {organizerDashboardEvents.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setEventId(item.id);
                            setEventMenuOpen(false);
                            setFilter("vendidos");
                            setConfirmClose(false);
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs hover:bg-surface ${
                            item.id === event.id ? "bg-surface-2 font-bold" : ""
                          }`}
                        >
                          <span
                            className={`size-1.5 shrink-0 rounded-full ${
                              eventStatusDot[closed && item.id === event.id ? "Encerrado" : item.status]
                            }`}
                          />
                          <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          {item.id === event.id ? (
                            <CheckCircle2 className="size-3.5 text-primary" />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{event.meta}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold">
                <Calendar className="size-3.5 text-primary" /> {event.date}
              </p>
            </div>
          </div>
        </section>

        {/* OCUPACAO: donut animado + pessoas, capacidade e status do evento. */}
        <section className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-card p-4 sm:col-span-2">
            <div className="flex items-center gap-4">
              <Donut percent={percent} />
              <div className="flex-1">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/15">
                  <Users className="size-4 text-primary" />
                </span>
                <p className="mt-2 text-2xl font-extrabold leading-none">
                  {fmt(event.sold)} <span className="text-sm font-semibold text-muted-foreground">/ {fmt(capacity)}</span>
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Pessoas · ingressos vendidos</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-3xl bg-card p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                <span className={`size-1.5 rounded-full ${eventStatusDot[currentStatus]}`} /> Capacidade
              </p>
              <p className="mt-2 flex items-center gap-2 text-xl font-extrabold">
                <Users className="size-4 text-primary" /> {fmt(capacity)}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Total de lugares</p>
            </div>
            <div className="rounded-3xl bg-card p-4">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                <Activity className="size-3.5 text-primary" /> Status do Evento
              </p>
              <p className="mt-2 text-xl font-extrabold">{currentStatus}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {closed ? "Vendas fechadas" : currentStatus === "Pausado" ? "Vendas pausadas" : "Em andamento"}
              </p>
            </div>
          </div>
        </section>

        {/* GRAFICOS: vendas e check-ins com serie suave e gradiente. */}
        <section className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-bold">
                <TrendingUp className="size-4 text-primary" /> Gráfico de Vendas
              </p>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                <TrendingUp className="size-3" /> {event.salesGrowth}
              </span>
            </div>
            <AreaChart data={event.salesSeries} />
          </div>
          <div className="rounded-3xl bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-bold">
                <ScanLine className="size-4 text-primary" /> Gráfico de Check-ins
              </p>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary">
                <BadgeCheck className="size-3" /> {fmt(event.checkins)} Check-ins
              </span>
            </div>
            <AreaChart data={event.checkinsSeries} />
          </div>
        </section>

        {/* LISTA DE INGRESSOS: filtros funcionais e menu de acoes por ingresso. */}
        <section className="mt-3 rounded-3xl bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-bold">
              <TicketIcon className="size-4 text-primary" /> Lista de Ingressos Vendidos
            </p>
          </div>
          <nav aria-label="Filtrar ingressos" className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {ticketFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                aria-pressed={filter === item.id}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                  filter === item.id
                    ? "grad-primary text-primary-foreground"
                    : "border border-border text-muted-foreground"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    filter === item.id ? "bg-primary-foreground" : "bg-muted-foreground"
                  }`}
                />
                {item.label}
                <span className={filter === item.id ? "opacity-80" : ""}>{filterCount(item.id)}</span>
              </button>
            ))}
          </nav>

          <ul className="mt-2 divide-y divide-border">
            {visibleTickets.map((ticket) => (
              <li key={ticket.id} className="relative flex items-center gap-3 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {ticket.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{ticket.name}</p>
                  <p className="text-[10px] text-muted-foreground">{ticket.type}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusStyles[ticket.status]}`}
                >
                  {ticket.status}
                </span>
                <span className="w-20 shrink-0 text-right text-xs font-extrabold">
                  {fmtKz(ticket.price)}
                </span>
                <button
                  type="button"
                  aria-label={`Ações para ${ticket.name}`}
                  onClick={() => {
                    setOpenTicketMenu((current) => (current === ticket.id ? null : ticket.id));
                    setEventMenuOpen(false);
                  }}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-surface-2"
                >
                  <MoreVertical className="size-4" />
                </button>
                {openTicketMenu === ticket.id ? (
                  <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                    <button
                      type="button"
                      onClick={() => updateTicket(ticket.id, "Usado")}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs hover:bg-surface"
                    >
                      <ScanLine className="size-3.5 text-primary" /> Marcar como escaneado
                    </button>
                    {ticket.status !== "Cancelado" ? (
                      <button
                        type="button"
                        onClick={() => updateTicket(ticket.id, "Cancelado")}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs hover:bg-surface"
                      >
                        <RefreshCw className="size-3.5 text-destructive" /> Cancelar ingresso
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateTicket(ticket.id, "Vendido")}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs hover:bg-surface"
                      >
                        <RefreshCw className="size-3.5 text-primary" /> Reativar ingresso
                      </button>
                    )}
                  </div>
                ) : null}
              </li>
            ))}
            {visibleTickets.length === 0 ? (
              <li className="py-6 text-center text-xs text-muted-foreground">
                Nenhum ingresso nesta categoria.
              </li>
            ) : null}
          </ul>
        </section>

        {/* ULTIMAS TRANSACOES: lista com alternancia ver todas. */}
        <section className="mt-3 rounded-3xl bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-bold">
              <RefreshCw className="size-4 text-primary" /> Últimas Transações
            </p>
            <button
              type="button"
              onClick={() => setShowAllTransactions((value) => !value)}
              className="flex items-center gap-1 text-[11px] font-bold text-primary"
            >
              {showAllTransactions ? "Ver menos" : "Ver todas"}
              <ChevronDown
                className={`size-3 transition-transform ${showAllTransactions ? "rotate-180" : ""}`}
              />
            </button>
          </div>
          <ul className="mt-2 divide-y divide-border">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center gap-3 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15">
                  <TicketIcon className="size-3.5 text-primary" />
                </span>
                <p className="w-20 shrink-0 text-[10px] text-muted-foreground">{tx.time}</p>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{tx.name}</p>
                </div>
                <p className="hidden text-[11px] text-muted-foreground sm:block">{tx.type}</p>
                <p className="w-20 shrink-0 text-right text-xs font-extrabold">{fmtKz(tx.price)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* FECHAR VENDAS: confirmacao antes de encerrar, com botao de reabertura. */}
        <section className="mt-3 mb-2">
          {confirmClose && !closed ? (
            <div className="rounded-3xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-xs font-bold">Fechar as vendas de “{event.title}”?</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Ninguém consegue comprar ingressos depois do fecho. Pode reabrir mais tarde.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClose(false)}
                  className="rounded-full border border-border py-2.5 text-xs font-bold"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSalesState((state) => ({ ...state, [event.id]: true }));
                    setConfirmClose(false);
                  }}
                  className="grad-primary glow rounded-full py-2.5 text-xs font-bold text-primary-foreground"
                >
                  Fechar vendas
                </button>
              </div>
            </div>
          ) : null}
          {!confirmClose ? (
            closed ? (
              <button
                type="button"
                onClick={() => setSalesState((state) => ({ ...state, [event.id]: false }))}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-4 text-sm font-bold"
              >
                <LockOpen className="size-4 text-primary" /> Reabrir Vendas
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClose(true)}
                className="grad-primary glow flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-bold text-primary-foreground"
              >
                <Lock className="size-4" />
                <span className="opacity-60">|</span>
                <span className="opacity-60">✕</span> Fechar Vendas
              </button>
            )
          ) : null}
        </section>
      </main>
    </Screen>
  );
}
