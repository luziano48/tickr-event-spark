import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Check, Clock, Headset, Loader2, Mail, MapPin, MessageCircle, Minus, Plus, ShieldCheck, X } from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { getEvent } from "@/data/events";
import { loadCreatedEvents } from "@/data/created-events";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/evento/$id")({
  beforeLoad: ({ params }) => {
    if (params.id === "festival-luanda") throw redirect({ to: "/tickr", replace: true });
  },
  head: ({ params }) => ({
    meta: [
      { title: `${getEvent(params.id)?.title || "Detalhes do evento"} | Tickr` },
      {
        name: "description",
        content:
          "Veja data, local, regras e ingressos para esta experiência na Tickr.",
      },
      { property: "og:title", content: `${getEvent(params.id)?.title || "Detalhes do evento"} | Tickr` },
      {
        property: "og:description",
        content: "Descubra os detalhes desta experiência e escolha o seu ingresso.",
      },
    ],
  }),
  component: EventoPage,
});

function EventoPage() {
  const { id } = Route.useParams();
  const event = getEvent(id);
  const [created, setCreated] = useState(undefined);
  useEffect(() => {
    setCreated(loadCreatedEvents().find((item) => item.id === id) || null);
  }, [id]);
  if (event) return <EventDetail event={event} />;
  if (created === undefined) return <Screen nav={false}><div className="min-h-screen" /></Screen>;
  if (created) return <EventDetail event={created} />;
  return (
    <Screen nav={false}>
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-extrabold">Evento não encontrado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Este evento já não está disponível.</p>
        <Link to="/explorar" className="mt-4 text-sm font-bold text-primary">Ver outros eventos</Link>
      </main>
    </Screen>
  );
}

const fmtPrice = (p) => (Number(p) ? `Kz ${Number(p).toLocaleString("pt-PT")}` : "Grátis");

function EventDetail({ event }) {
  const tickets = event.tickets?.length
    ? event.tickets
    : [{ name: "Normal", price: String(event.price).replace(/\D/g, "") || "0", quantity: "—" }];
  const [buying, setBuying] = useState(false);
  const info = [
    { icon: CalendarDays, label: "Data", value: event.date },
    { icon: Clock, label: "Horário", value: event.time || "A confirmar" },
    { icon: MapPin, label: "Local", value: [event.venue, event.city].filter(Boolean).join(", ") },
    { icon: ShieldCheck, label: "Idade", value: event.age || "Livre" },
  ];
  return (
    <Screen nav={false}>
      <div className="relative">
        <img src={event.image} alt={event.title} className="h-72 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <Link to="/explorar" aria-label="Voltar" className="absolute top-5 left-4 grid size-9 place-items-center rounded-full bg-card/90">
          <ArrowLeft className="size-4" />
        </Link>
        <span className="absolute top-6 right-4 rounded-full bg-card/90 px-3 py-1 text-[10px] font-bold tracking-wider text-primary">
          {event.category}
        </span>
      </div>
      <main className="-mt-10 relative px-4 pb-32">
        <h1 className="text-2xl leading-tight font-extrabold">{event.title}</h1>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {info.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl bg-card p-3 shadow-sm">
              <Icon className="size-4 text-primary" />
              <p className="mt-2 text-[10px] font-semibold uppercase text-muted-foreground">{label}</p>
              <p className="text-xs font-bold">{value}</p>
            </div>
          ))}
        </div>
        {event.description ? (
          <section className="mt-6">
            <h2 className="text-sm font-bold">Sobre o evento</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
          </section>
        ) : null}
        <section className="mt-6 space-y-2">
          <h2 className="text-sm font-bold">Ingressos</h2>
          {tickets.map((t) => (
            <div key={t.name} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 text-sm">
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.quantity} lugares</p>
              </div>
              <span className="font-bold text-primary">{fmtPrice(t.price)}</span>
            </div>
          ))}
        </section>
        {event.rules ? (
          <section className="mt-6 rounded-2xl bg-warning-soft p-4">
            <h2 className="text-sm font-bold">Regras</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{event.rules}</p>
          </section>
        ) : null}
        {event.contactName || event.whatsapp ? (
          <section className="mt-6 flex items-center justify-between rounded-2xl bg-surface-2 p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Organizador</p>
              <p className="text-sm font-bold">{event.contactName}</p>
            </div>
            {event.whatsapp ? (
              <a href={`https://wa.me/${event.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-2 text-xs font-bold text-primary">
                <MessageCircle className="size-3.5" /> WhatsApp
              </a>
            ) : null}
          </section>
        ) : null}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-border bg-card/95 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground">A partir de</p>
            <p className="text-lg font-extrabold text-primary">{event.price}</p>
          </div>
          <button onClick={() => setBuying(true)} className="grad-primary glow flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-primary-foreground">
            Comprar ingresso <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
      {buying ? <PurchaseSheet event={event} tickets={tickets} onClose={() => setBuying(false)} /> : null}
    </Screen>
  );
}

const inputCls = "mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60";

function PurchaseSheet({ event, tickets, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", age: "", ticket: tickets[0].name, qty: 1 });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const selected = tickets.find((t) => t.name === form.ticket) || tickets[0];
  const total = (Number(selected.price) || 0) * form.qty;

  const submit = (e) => {
    e.preventDefault();
    if (status !== "idle") return;
    const er = {};
    if (form.name.trim().length < 3) er.name = "Indique o nome completo";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = "E-mail inválido";
    if (form.whatsapp.replace(/\D/g, "").length < 9) er.whatsapp = "Número de WhatsApp inválido";
    const age = Number(form.age);
    if (!age || age < 1 || age > 120) er.age = "Idade inválida";
    else if (/18/.test(event.age || "") && age < 18) er.age = "Evento para maiores de 18";
    setErrors(er);
    if (Object.keys(er).length) return;
    setStatus("sending");
    setTimeout(() => setStatus("done"), 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 animate-in fade-in duration-200" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-background p-5 animate-in slide-in-from-bottom duration-300">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-primary">COMPRAR INGRESSO</p>
            <h2 className="text-lg font-extrabold leading-tight">{event.title}</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="grid size-9 place-items-center rounded-full bg-surface-2"><X className="size-4" /></button>
        </div>
        {status === "done" ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-primary"><Check className="size-7" /></span>
            <h3 className="mt-4 text-lg font-extrabold">Compra confirmada!</h3>
            <p className="mt-1 text-sm text-muted-foreground">Enviámos o ingresso {selected.name} para {form.email}.</p>
            <Link to="/ingressos" className="grad-primary glow mt-5 flex w-full items-center justify-center rounded-full py-3 text-sm font-bold text-primary-foreground">Ver os meus ingressos</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3" noValidate>
            <Input label="Nome completo" error={errors.name}><input className={inputCls} maxLength={100} value={form.name} onChange={set("name")} placeholder="Ex.: Ana Domingos" autoComplete="name" /></Input>
            <Input label="E-mail" error={errors.email}><input className={inputCls} type="email" maxLength={255} value={form.email} onChange={set("email")} placeholder="ana@email.com" autoComplete="email" /></Input>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2"><Input label="WhatsApp" error={errors.whatsapp}><input className={inputCls} type="tel" maxLength={20} value={form.whatsapp} onChange={set("whatsapp")} placeholder="+244 9xx xxx xxx" /></Input></div>
              <Input label="Idade" error={errors.age}><input className={inputCls} type="number" inputMode="numeric" min={1} max={120} value={form.age} onChange={set("age")} placeholder="25" /></Input>
            </div>
            <div>
              <span className="text-xs font-semibold">Tipo de ingresso</span>
              <div className="mt-1 space-y-2">
                {tickets.map((t) => (
                  <button type="button" key={t.name} onClick={() => setForm((f) => ({ ...f, ticket: t.name }))}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-sm ${form.ticket === t.name ? "border-primary bg-success-soft" : "border-border bg-card"}`}>
                    <span className="font-semibold">{t.name}</span>
                    <span className="font-bold text-primary">{fmtPrice(t.price)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface p-3">
              <span className="text-xs font-semibold">Quantidade</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm((f) => ({ ...f, qty: Math.max(1, f.qty - 1) }))} className="grid size-8 place-items-center rounded-full bg-card"><Minus className="size-3.5" /></button>
                <span className="w-4 text-center text-sm font-bold">{form.qty}</span>
                <button type="button" onClick={() => setForm((f) => ({ ...f, qty: Math.min(10, f.qty + 1) }))} className="grid size-8 place-items-center rounded-full bg-card"><Plus className="size-3.5" /></button>
              </div>
            </div>
            <button type="submit" disabled={status === "sending"} className="grad-primary glow flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {status === "sending" ? (<><Loader2 className="size-4 animate-spin" /> A processar…</>) : `Pagar ${fmtPrice(total)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Input({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[11px] text-destructive">{error}</span> : null}
    </label>
  );
}
