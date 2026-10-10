import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Check, ChevronDown, LockKeyhole, LockKeyholeOpen, MapPin, MoreHorizontal, Plus, QrCode, ScanLine, Search, Ticket, TrendingUp, Users, Wallet, X } from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { Button } from "@/components/ui/button";
import { getEventDashboard, organizerDashboardEvents } from "@/data/eventos";

export const Route = createFileRoute("/eventos")({
  head: () => ({ meta: [
    { title: "Meus eventos · Gestão | Tickr" },
    { name: "description", content: "Gerencie os seus eventos, acompanhe vendas e consulte ingressos e entradas na Tickr." },
    { property: "og:title", content: "Meus eventos · Gestão | Tickr" },
    { property: "og:description", content: "Os seus eventos, vendas e participantes organizados num só lugar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Eventos,
});

const fmt = (value) => new Intl.NumberFormat("pt-PT").format(value);
const fmtKz = (value) => `Kz ${fmt(value)}`;
const statusStyles = {
  Vendido: "bg-success-soft text-primary",
  Usado: "bg-info-soft text-info",
  Cancelado: "bg-danger-soft text-destructive",
};
const statusLabels = { Vendido: "Por usar", Usado: "Entrada validada", Cancelado: "Cancelado" };
const tabs = [{ id: "resumo", label: "Resumo" }, { id: "ingressos", label: "Ingressos" }, { id: "atividade", label: "Atividade" }];
const filters = [{ id: "todos", label: "Todos" }, { id: "Vendido", label: "Por usar" }, { id: "Usado", label: "Validados" }, { id: "Cancelado", label: "Cancelados" }];

function TrendChart({ event, mode }) {
  const data = mode === "vendas" ? event.salesSeries : event.checkinsSeries;
  const max = Math.max(...data, 1);
  const points = data.map((value, index) => `${24 + index * 288 / (data.length - 1)},${128 - value / max * 104}`).join(" ");
  return <div className="mt-5">
    <svg viewBox="0 0 336 152" role="img" aria-label={mode === "vendas" ? "Evolução das vendas das 10h às 22h" : "Evolução das entradas das 10h às 22h"} className="w-full overflow-visible">
      {[24, 76, 128].map((y, index) => <g key={y}>
        <line x1="24" x2="312" y1={y} y2={y} className="stroke-border" strokeDasharray="3 5" />
        <text x="20" y={y + 3} textAnchor="end" className="fill-muted-foreground text-[8px]">{fmt(Math.round(max * (1 - index / 2)))}</text>
      </g>)}
      <polygon points={`24,128 ${points} 312,128`} className={mode === "vendas" ? "fill-success-soft" : "fill-info-soft"} />
      <polyline points={points} fill="none" className={mode === "vendas" ? "stroke-primary" : "stroke-info"} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {["10h", "14h", "18h", "22h"].map((label, index) => <text key={label} x={24 + index * 96} y="148" textAnchor="middle" className="fill-muted-foreground text-[9px]">{label}</text>)}
    </svg>
  </div>;
}

function Eventos() {
  const [eventId, setEventId] = useState(organizerDashboardEvents[0].id);
  const [tab, setTab] = useState("resumo");
  const [chartMode, setChartMode] = useState("vendas");
  const [filter, setFilter] = useState("todos");
  const [query, setQuery] = useState("");
  const [salesState, setSalesState] = useState({});
  const [ticketsByEvent, setTicketsByEvent] = useState({});
  const [confirmClose, setConfirmClose] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const event = getEventDashboard(eventId);
  const tickets = ticketsByEvent[event.id] ?? event.tickets;
  const closed = salesState[event.id] ?? event.status !== "Ativo";
  const percent = Math.min(100, Math.round(event.sold / event.capacity * 100));
  const currentStatus = closed ? "Vendas pausadas" : "Vendas abertas";
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId);
  const visibleTickets = tickets.filter((ticket) => (filter === "todos" || ticket.status === filter) && `${ticket.name} ${ticket.type}`.toLocaleLowerCase("pt-PT").includes(query.trim().toLocaleLowerCase("pt-PT")));

  function changeEvent(id) {
    setEventId(id);
    setQuery("");
    setFilter("todos");
    setSelectedTicketId(null);
    setConfirmClose(false);
  }
  function updateTicket(status) {
    setTicketsByEvent((state) => ({ ...state, [event.id]: tickets.map((ticket) => ticket.id === selectedTicketId ? { ...ticket, status } : ticket) }));
    setSelectedTicketId(null);
  }

  return <Screen>
    <header className="flex items-center justify-between gap-3 px-5 pb-5 pt-6">
      <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">Área do organizador</p><h1 className="text-2xl font-bold">Meus eventos</h1></div>
      <Button asChild className="size-10 rounded-full bg-primary text-primary-foreground" title="Criar evento"><Link to="/criar" aria-label="Criar evento"><Plus className="size-5" /></Link></Button>
    </header>
    <main className="px-5 pb-6">
      <div className="relative">
        <label htmlFor="managed-event" className="sr-only">Selecionar evento</label>
        <select id="managed-event" value={eventId} onChange={(e) => changeEvent(e.target.value)} className="w-full appearance-none rounded-lg border border-border bg-card py-3 pl-4 pr-10 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring">
          {organizerDashboardEvents.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-3.5 size-4 text-muted-foreground" />
      </div>

      <section className="flex items-center gap-4 py-6">
        <img src={event.image} alt={event.title} className="size-20 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0">
          <p className={`mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold ${closed ? "text-warning" : "text-primary"}`}><span className={`size-1.5 rounded-full ${closed ? "bg-warning" : "bg-primary"}`} />{currentStatus}</p>
          <h2 className="text-lg font-bold leading-snug">{event.title}</h2>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground"><CalendarDays className="size-3.5 shrink-0" />{event.date}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"><MapPin className="size-3.5 shrink-0" />{event.venue || event.meta}</p>
        </div>
      </section>

      <div className="grid grid-cols-3 divide-x divide-border border-y border-border py-4">
        {[{ icon: Ticket, value: fmt(event.sold), label: "Vendidos", color: "text-primary" }, { icon: ScanLine, value: fmt(event.checkins), label: "Entradas", color: "text-info" }, { icon: Users, value: fmt(event.capacity), label: "Capacidade", color: "text-foreground" }].map(({ icon: Icon, value, label, color }) => <div key={label} className="px-2 first:pl-0 last:pr-0">
          <Icon className={`mb-2 size-4 ${color}`} /><p className="text-xl font-bold tabular-nums">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{label}</p>
        </div>)}
      </div>

      <nav aria-label="Gestão do evento" className="mt-5 grid grid-cols-3 border-b border-border">
        {tabs.map((item) => <Button key={item.id} onClick={() => setTab(item.id)} aria-pressed={tab === item.id} className={`min-h-11 border-b-2 text-xs ${tab === item.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{item.label}{item.id === "ingressos" && <span className="text-[10px] text-muted-foreground">{tickets.length}</span>}</Button>)}
      </nav>

      {tab === "resumo" && <div className="pt-6">
        <section>
          <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold">Ocupação do evento</h3><span className="text-lg font-bold text-primary">{percent}%</span></div>
          <progress value={event.sold} max={event.capacity} aria-label="Ingressos vendidos em relação à capacidade" className="event-capacity mt-3 h-2 w-full overflow-hidden rounded-full" />
          <div className="mt-2 flex justify-between gap-2 text-[11px] text-muted-foreground"><span>{fmt(event.sold)} vendidos</span><span>{fmt(Math.max(0, event.capacity - event.sold))} disponíveis</span></div>
        </section>
        <section className="mt-7 border-t border-border pt-5">
          <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold">Movimento do dia</h3><span className="flex items-center gap-1 text-[10px] font-semibold text-primary"><TrendingUp className="size-3" />{event.salesGrowth}</span></div>
          <div className="mt-4 flex gap-1 rounded-lg bg-surface-2 p-1">
            {[{ id: "vendas", label: "Vendas", icon: Ticket }, { id: "entradas", label: "Entradas", icon: ScanLine }].map(({ id, label, icon: Icon }) => <Button key={id} onClick={() => setChartMode(id)} aria-pressed={chartMode === id} className={`min-h-9 flex-1 rounded-md text-xs ${chartMode === id ? "bg-card text-foreground" : "text-muted-foreground"}`}><Icon className="size-3.5" />{label}</Button>)}
          </div>
          <TrendChart event={event} mode={chartMode} />
        </section>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button asChild className="min-h-11 rounded-lg bg-primary px-3 text-xs text-primary-foreground"><Link to="/scanner"><ScanLine className="size-4" />Validar entrada</Link></Button>
          <Button onClick={() => setTab("ingressos")} className="min-h-11 rounded-lg border border-border bg-card px-3 text-xs"><Users className="size-4" />Participantes</Button>
        </div>
        <section className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
          <div><h3 className="text-xs font-bold">Vendas de ingressos</h3><p className="mt-1 text-[11px] text-muted-foreground">{closed ? "Pausadas neste painel" : "Abertas neste painel"}</p></div>
          <Button onClick={() => closed ? setSalesState((state) => ({ ...state, [event.id]: false })) : setConfirmClose(true)} className={`min-h-10 shrink-0 rounded-lg border border-border px-3 text-xs ${closed ? "text-primary" : "text-muted-foreground"}`}>
            {closed ? <LockKeyholeOpen className="size-3.5" /> : <LockKeyhole className="size-3.5" />}{closed ? "Reabrir vendas" : "Pausar vendas"}
          </Button>
        </section>
      </div>}

      {tab === "ingressos" && <section className="pt-5">
        <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-bold">Participantes</h3><span className="text-[11px] text-muted-foreground">{visibleTickets.length} de {tickets.length}</span></div>
        <div className="relative mt-4"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input type="search" aria-label="Pesquisar participante" placeholder="Nome ou tipo de ingresso" value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" /></div>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Filtrar participantes">
          {filters.map((item) => <Button key={item.id} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={`min-h-8 shrink-0 rounded-md px-2.5 text-[11px] ${filter === item.id ? "bg-success-soft text-primary" : "text-muted-foreground hover:bg-accent"}`}>{item.label}</Button>)}
        </div>
        <ul className="mt-2 divide-y divide-border">
          {visibleTickets.map((ticket) => <li key={ticket.id} className="flex items-center gap-3 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-[11px] font-bold text-primary">{ticket.initials}</span>
            <div className="min-w-0 flex-1"><p className="text-xs font-bold">{ticket.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{ticket.type} · {fmtKz(ticket.price)}</p><span className={`mt-1.5 inline-flex rounded px-1.5 py-0.5 text-[9px] font-semibold ${statusStyles[ticket.status]}`}>{statusLabels[ticket.status]}</span></div>
            <Button aria-label={`Gerir ingresso de ${ticket.name}`} onClick={() => setSelectedTicketId(ticket.id)} className="size-9 shrink-0 rounded-md text-muted-foreground hover:bg-accent"><MoreHorizontal className="size-5" /></Button>
          </li>)}
        </ul>
        {visibleTickets.length === 0 && <div className="py-12 text-center"><Users className="mx-auto mb-3 size-7 text-muted-foreground" /><p className="text-sm font-semibold">Nenhum participante encontrado</p><Button onClick={() => { setQuery(""); setFilter("todos"); }} className="mt-3 text-xs text-primary">Limpar filtros</Button></div>}
      </section>}

      {tab === "atividade" && <section className="pt-5">
        <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Últimas transações</h3><Wallet className="size-4 text-primary" /></div>
        <ul className="mt-3 divide-y divide-border">{event.transactions.map((tx) => <li key={tx.id} className="flex items-center gap-3 py-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-success-soft text-primary"><ArrowDownLeft className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-xs font-bold">{tx.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{tx.type} · {tx.time}</p></div><span className="shrink-0 text-xs font-bold tabular-nums">+ {fmtKz(tx.price)}</span></li>)}</ul>
      </section>}
      <Button asChild className="mt-7 min-h-10 w-full gap-2 text-xs text-muted-foreground"><Link to="/ingressos"><QrCode className="size-4" />Meus ingressos pessoais<ArrowUpRight className="size-3.5" /></Link></Button>
    </main>

    <Dialog.Root open={confirmClose} onOpenChange={setConfirmClose}>
      <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6">
        <Dialog.Title className="pr-6 text-lg font-bold">Pausar vendas?</Dialog.Title><Dialog.Description className="mt-3 text-sm text-muted-foreground">As vendas de {event.title} ficarão pausadas neste painel. Pode reabrir a qualquer momento.</Dialog.Description>
        <div className="mt-6 flex gap-3"><Button onClick={() => setConfirmClose(false)} className="min-h-10 flex-1 rounded-lg border border-border text-xs">Voltar</Button><Button onClick={() => { setSalesState((state) => ({ ...state, [event.id]: true })); setConfirmClose(false); }} className="min-h-10 flex-1 rounded-lg bg-primary text-xs text-primary-foreground">Pausar vendas</Button></div>
        <Dialog.Close asChild><Button aria-label="Fechar confirmação" className="absolute right-3 top-3 size-8 rounded-md text-muted-foreground"><X className="size-4" /></Button></Dialog.Close>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
    <Dialog.Root open={Boolean(selectedTicket)} onOpenChange={(open) => { if (!open) setSelectedTicketId(null); }}>
      <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6">
        <Dialog.Title className="pr-6 text-lg font-bold">{selectedTicket?.name}</Dialog.Title><Dialog.Description className="mt-2 text-xs text-muted-foreground">{selectedTicket?.type} · {selectedTicket ? statusLabels[selectedTicket.status] : ""}</Dialog.Description>
        <div className="mt-5 grid gap-2">
          {selectedTicket?.status === "Vendido" && <Button onClick={() => updateTicket("Usado")} className="min-h-11 justify-start rounded-lg bg-success-soft px-3 text-xs text-primary"><Check className="size-4" />Validar entrada</Button>}
          {selectedTicket?.status === "Cancelado" ? <Button onClick={() => updateTicket("Vendido")} className="min-h-11 justify-start rounded-lg bg-success-soft px-3 text-xs text-primary"><Ticket className="size-4" />Reativar ingresso</Button> : <Button onClick={() => updateTicket("Cancelado")} className="min-h-11 justify-start rounded-lg bg-danger-soft px-3 text-xs text-destructive"><X className="size-4" />Cancelar ingresso</Button>}
        </div>
        <Dialog.Close asChild><Button aria-label="Fechar ações do ingresso" className="absolute right-3 top-3 size-8 rounded-md text-muted-foreground"><X className="size-4" /></Button></Dialog.Close>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
  </Screen>;
}
