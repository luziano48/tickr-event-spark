import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, Headset, Mail, MessageCircle } from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { eventSteps, supportContacts, tickrPosts } from "@/data/tickr-profile";
import { getEvent } from "@/data/events";
import { loadCreatedEvents } from "@/data/created-events";
import { useEffect, useState } from "react";
import festivalImage from "@/assets/tick perfil.PNG";

export const Route = createFileRoute("/evento/$id")({
  head: () => ({
    meta: [
      { title: "Tickr" },
      {
        name: "description",
        content:
          "Conheça a Tickr, fale com o suporte e descubra como criar o seu próximo evento.",
      },
      { property: "og:title", content: "Tickr Oficial | Eventos em Angola" },
      {
        property: "og:description",
        content: "A plataforma angolana para criar, vender e validar ingressos.",
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
  if (event && id !== "festival-luanda") return <EventDetail event={event} />;
  if (id === "festival-luanda") return <TickrProfile />;
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

function EventDetail({ event }) {
  return (
    <Screen nav={false}>
      <header className="flex items-center justify-between px-4 pt-5 pb-4">
        <Link to="/explorar" aria-label="Voltar" className="grid size-9 place-items-center rounded-full bg-surface-2">
          <ArrowLeft className="size-4" />
        </Link>
        <span className="text-xs font-semibold text-primary">{event.category}</span>
      </header>
      <main className="px-4 pb-10">
        <img src={event.image} alt={event.title} className="h-56 w-full rounded-3xl object-cover" />
        <h1 className="mt-5 text-2xl font-extrabold">{event.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {event.date} · {event.time} · {event.venue}, {event.city}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
        {event.tickets?.length ? (
          <div className="mt-5 space-y-2">
            <h2 className="text-sm font-bold">Ingressos</h2>
            {event.tickets.map((t) => (
              <div key={t.name} className="flex items-center justify-between rounded-2xl bg-card p-3 text-sm">
                <span className="font-semibold">{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.quantity} lugares</span>
                <span className="font-bold text-primary">{Number(t.price) ? `Kz ${Number(t.price).toLocaleString("pt-PT")}` : "Grátis"}</span>
              </div>
            ))}
          </div>
        ) : null}
        {event.createdByUser ? (
          <div className="mt-5 space-y-2 rounded-2xl bg-surface-2 p-4 text-xs text-muted-foreground">
            <p><span className="font-bold text-foreground">Idade:</span> {event.age}</p>
            {event.rules ? <p><span className="font-bold text-foreground">Regras:</span> {event.rules}</p> : null}
            <p><span className="font-bold text-foreground">Contacto:</span> {event.contactName}</p>
            <a href={`https://wa.me/${event.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-primary">
              <MessageCircle className="size-3.5" /> Falar no WhatsApp
            </a>
          </div>
        ) : null}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-card p-4">
          <span className="text-xs text-muted-foreground">A partir de</span>
          <span className="text-lg font-extrabold text-primary">{event.price}</span>
        </div>
        <Link to="/ingressos" className="grad-primary glow mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-primary-foreground">
          Comprar ingresso <ArrowRight className="size-4" />
        </Link>
      </main>
    </Screen>
  );
}

function TickrProfile() {
  return (
    <Screen nav={false}>
      <header className="flex items-center justify-between px-4 pt-5 pb-4">
        <Link
          to="/"
          aria-label="Voltar para início"
          className="grid size-9 place-items-center rounded-full bg-surface-2"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <BadgeCheck className="size-4" /> Oficial
        </span>
      </header>

      <main>
        <section className="px-4">
          <div className="relative min-h-[25rem] overflow-hidden rounded-3xl bg-card">
            <img
              src={festivalImage}
              alt="Público a celebrar num evento"
              width={1280}
              height={800}
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            <div className="relative flex min-h-[25rem] flex-col justify-end gap-4 p-5 text-white">
              <span className="w-fit rounded-md bg-black/45 px-2 py-1 text-[10px] font-bold tracking-wider text-primary">
                TICKR OFICIAL
              </span>
              <h1 className="max-w-sm text-3xl leading-tight font-extrabold">
                Crie experiências que ficam na memória.
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-white/85">
                A plataforma angolana para criar eventos, vender ingressos e receber o seu público
                com mais controlo.
              </p>
              <a
                href="mailto:suporte@tickr.ao"
                className="grad-primary glow flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-primary-foreground"
              >
                Falar com a Tickr <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="mt-6 px-4" aria-labelledby="support-title">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <Headset className="size-4" />
            </span>
            <div>
              <h2 id="support-title" className="text-lg font-bold">
                Suporte técnico
              </h2>
              <p className="text-xs text-muted-foreground">Estamos aqui para ajudar.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {supportContacts.map((contact) => (
              <a
                key={contact.label}
                href={contact.href}
                className="rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-surface-2"
              >
                {contact.label === "WhatsApp" ? (
                  <MessageCircle className="size-4 text-primary" />
                ) : (
                  <Mail className="size-4 text-primary" />
                )}
                <p className="mt-3 text-xs font-semibold">{contact.label}</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground">{contact.value}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 px-4" aria-labelledby="posts-title">
          <p className="text-xs font-bold tracking-wider text-primary">NO PERFIL DA TICKR</p>
          <h2 id="posts-title" className="mt-1 text-xl font-extrabold">
            Informação para criar melhor
          </h2>
          <div className="mt-4 space-y-3">
            {tickrPosts.map((post) => (
              <article key={post.category} className="rounded-2xl bg-card p-4">
                <span className="text-[10px] font-bold tracking-wider text-primary">
                  {post.category}
                </span>
                <h3 className="mt-2 text-base font-bold">{post.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.text}</p>
                {post.href.startsWith("/") ? (
                  <Link to={post.href} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
                    {post.action} <ArrowRight className="size-3" />
                  </Link>
                ) : (
                  <a href={post.href} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary">
                    {post.action} <ArrowRight className="size-3" />
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 px-4 pb-10" aria-labelledby="steps-title">
          <p className="text-xs font-bold tracking-wider text-primary">COMO FUNCIONA</p>
          <h2 id="steps-title" className="mt-1 text-xl font-extrabold">
            Do plano ao público
          </h2>
          <div className="mt-4 space-y-3">
            {eventSteps.map((step) => (
              <div key={step.number} className="flex gap-3 rounded-2xl bg-surface p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-sm font-bold">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
                <Check className="ml-auto size-4 shrink-0 text-primary" />
              </div>
            ))}
          </div>
          <Link
            to="/criar"
            className="mt-4 flex w-full items-center justify-center rounded-full border border-primary/40 py-3 text-sm font-semibold text-primary"
          >
            Criar meu evento
          </Link>
        </section>
      </main>
    </Screen>
  );
}
