import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Camera,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Settings,
  Star,
  X,
  BadgeCheck,
  Instagram,
  Globe,
  Phone,
  Calendar,
} from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { Reviews } from "@/components/tickr/Reviews";
import { Comments } from "@/components/tickr/Comments";
import {
  draftEvents,
  organizerEvents,
  publishedEvents,
} from "@/data/profile";
import { pendingMessageCount } from "@/data/messages";
import { useOrganizerProfile } from "@/hooks/use-organizer-profile";
import { useReviews } from "@/hooks/use-community";

// Alvo dos comentários e avaliações do perfil do organizador.
const PROFILE_TARGET = "perfil:tickr-eventos";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil do organizador | Tickr" },
      {
        name: "description",
        content:
          "Veja o perfil do organizador Tickr: eventos publicados, rascunhos, avaliações e configurações.",
      },
      { property: "og:title", content: "Perfil do organizador | Tickr" },
      {
        property: "og:description",
        content: "Gerencie eventos, rascunhos e avaliações no perfil do organizador Tickr.",
      },
    ],
  }),
  component: Perfil,
});

const tabs = [
  { id: "eventos", label: "Meus eventos" },
  { id: "publicados", label: "Publicados" },
  { id: "rascunhos", label: "Rascunhos" },
];

const editFieldClass =
  "mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60";

function EventRow({ event, sold, status }) {
  return (
    <li>
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
}

function Perfil() {
  const photoInput = useRef(null);
  const [activeTab, setActiveTab] = useState("eventos");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    profile,
    editing,
    draft,
    setDraft,
    changePhoto,
    startEditing,
    saveProfile,
    cancelEditing,
    toggleSetting,
  } = useOrganizerProfile();
  // As avaliações do perfil são sempre de utilizadores reais: média e contagem.
  const { summary } = useReviews(PROFILE_TARGET);
  const next = publishedEvents[0]?.event;

  const tabCounts = {
    eventos: organizerEvents.length,
    publicados: publishedEvents.length,
    rascunhos: draftEvents.length,
  };

  return (
    <Screen>
      <header className="flex items-center justify-between px-4 pt-5 pb-4">
        <p className="text-sm font-bold">Perfil do organizador</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-label="Abrir configurações"
            className={`grid size-9 place-items-center rounded-full ${
              settingsOpen ? "bg-primary/15 text-primary" : "bg-surface-2"
            }`}
          >
            <Settings className="size-4" />
          </button>
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
        </div>
      </header>

      <main className="px-4">
        {/* CARTÃO DO PERFIL: foto, verificado, bio e estatísticas reais. */}
        <section aria-labelledby="profile-title" className="rounded-3xl bg-card p-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <button type="button" onClick={() => photoInput.current?.click()} aria-label="Alterar foto de perfil"
                className="group relative block size-24 overflow-hidden rounded-full ring-4 ring-primary/25">
                <img src={profile.photo} alt={`Foto de perfil de ${profile.name}`} className="size-full object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-foreground/35 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="size-5 text-background" />
                </span>
              </button>
              <span className="absolute right-0 bottom-0 grid size-7 place-items-center rounded-full grad-primary text-primary-foreground ring-2 ring-card">
                <Camera className="size-3.5" />
              </span>
              <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={(e) => changePhoto(e.target.files?.[0])} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 id="profile-title" className="flex items-center gap-1 text-lg font-extrabold">
                <span className="truncate">{profile.name}</span>
                <BadgeCheck className="size-5 shrink-0 fill-primary text-primary-foreground" />
              </h1>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                <BadgeCheck className="size-3" /> PERFIL VERIFICADO
              </span>
              <p className="mt-1 text-xs font-semibold text-primary">{profile.username}</p>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="size-3" /> {profile.location}</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Criando experiências inesquecíveis de música, cultura e festivais urbanos em Angola.
          </p>

          <div className="mt-4 grid grid-cols-3 divide-x divide-border text-center">
            <div><p className="text-lg font-extrabold">{organizerEvents.length}</p><p className="text-[10px] text-muted-foreground">Eventos</p></div>
            <div><p className="text-lg font-extrabold tabular-nums">{summary.count}</p><p className="text-[10px] text-muted-foreground">Avaliações</p></div>
            <div>
              <p className="flex items-center justify-center gap-1 text-lg font-extrabold tabular-nums">
                {summary.count
                  ? summary.average.toLocaleString("pt-PT", { minimumFractionDigits: 1 })
                  : "—"}{" "}
                <Star className="size-4 fill-primary text-primary" />
              </p>
              <p className="text-[10px] text-muted-foreground">Nota média</p>
            </div>
          </div>

          <div className="mt-4">
            <button type="button" onClick={startEditing}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-primary py-2.5 text-xs font-bold text-primary">
              <Pencil className="size-3.5" /> Editar perfil
            </button>
          </div>
        </section>

        {/* AVALIAÇÕES: estrelas e texto — só de utilizadores reais, nunca inventadas. */}
        <div className="mt-4">
          <Reviews target={PROFILE_TARGET} title="Avaliações do organizador" />
        </div>

        {/* COMENTÁRIOS: publicar, responder, editar, apagar e denunciar. */}
        <div className="mt-4">
          <Comments target={PROFILE_TARGET} title="Comentários no perfil" />
        </div>

        {next ? (
          <Link to="/evento/$id" params={{ id: next.id }} className="relative mt-4 block overflow-hidden rounded-3xl">
            <img src={next.image} alt={next.title} className="h-48 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/50 to-transparent p-4 text-background">
              <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">PRÓXIMO EVENTO</span>
              <p className="mt-3 max-w-[70%] text-lg font-extrabold">{next.title}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px]"><Calendar className="size-3" /> {next.date} · {next.time}</p>
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-bold text-primary-foreground">
                Comprar bilhete <ArrowRight className="size-3" />
              </span>
            </div>
          </Link>
        ) : null}

        {/* EDITAR PERFIL: painel inline com campos funcionais. */}
        {editing ? (
          <section aria-label="Editar perfil" className="mt-3 rounded-3xl bg-surface-2 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold">Editar perfil</p>
              <button
                type="button"
                onClick={cancelEditing}
                aria-label="Cancelar edição"
                className="grid size-7 place-items-center rounded-full bg-card"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <label className="block">
                <span className="text-[11px] font-bold">Nome</span>
                <input
                  type="text"
                  maxLength={60}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className={editFieldClass}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold">@username</span>
                <input
                  type="text"
                  maxLength={30}
                  value={draft.username}
                  onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                  className={editFieldClass}
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-bold">Localização</span>
                <input
                  type="text"
                  maxLength={60}
                  value={draft.location}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                  className={editFieldClass}
                />
              </label>
              <button
                type="button"
                onClick={saveProfile}
                className="grad-primary glow w-full rounded-full py-3 text-sm font-bold text-primary-foreground"
              >
                Guardar alterações
              </button>
            </div>
          </section>
        ) : null}

        {/* CONFIGURAÇÕES: interruptores persistidos localmente. */}
        {settingsOpen ? (
          <section aria-label="Configurações" className="mt-3 rounded-3xl bg-card p-4">
            <p className="text-xs font-bold">Configurações</p>
            <ul className="mt-3 space-y-3">
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs">
                  <Bell className="size-4 text-primary" /> Notificações de vendas
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={profile.notifications}
                  onClick={() => toggleSetting("notifications")}
                  className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                    profile.notifications ? "grad-primary" : "bg-surface-2"
                  }`}
                >
                  <span
                    className={`block size-5 rounded-full bg-card transition-transform ${
                      profile.notifications ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-xs">Perfil público</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={profile.publicProfile}
                  onClick={() => toggleSetting("publicProfile")}
                  className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                    profile.publicProfile ? "grad-primary" : "bg-surface-2"
                  }`}
                >
                  <span
                    className={`block size-5 rounded-full bg-card transition-transform ${
                      profile.publicProfile ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </li>
            </ul>
          </section>
        ) : null}

        {/* ABAS: Meus eventos, Publicados e Rascunhos. */}
        <nav
          aria-label="Secções do perfil"
          className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {tab.label} · {tabCounts[tab.id]}
            </button>
          ))}
        </nav>

        <section className="mt-4" aria-live="polite">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">
              {tabs.find((tab) => tab.id === activeTab)?.label}
            </h2>
            <Link to="/explorar" className="flex items-center gap-1 text-xs text-primary">
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </div>
          <ul className="space-y-3">
            {(activeTab === "eventos"
              ? organizerEvents
              : activeTab === "publicados"
                ? publishedEvents
                : draftEvents
            ).map(({ event, sold, status }) => (
              <EventRow key={event.id} event={event} sold={sold} status={status} />
            ))}
          </ul>
          {activeTab === "rascunhos" && draftEvents.length === 0 ? (
            <p className="rounded-2xl bg-surface-2 p-4 text-center text-xs text-muted-foreground">
              Sem rascunhos por agora.
            </p>
          ) : null}
        </section>

        <section className="mt-5 rounded-3xl bg-primary/10 p-4">
          <h2 className="text-sm font-bold">Contactos e parceiros</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
              { icon: Globe, label: "Website", href: "https://tickr.ao" },
              { icon: Phone, label: "WhatsApp", href: "https://wa.me/244923456789" },
            ].map(({ icon: Icon, label, href }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" className="rounded-2xl bg-card p-2">
                <span className="mx-auto grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"><Icon className="size-4" /></span>
                <p className="mt-1 text-[10px] font-bold">{label}</p>
              </a>
            ))}
          </div>
        </section>

        <Link
          to="/criar"
          className="grad-primary glow mt-5 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-bold text-primary-foreground"
        >
          <PlusCircle className="size-4" /> Criar novo evento
        </Link>

        <Link
          to="/scanner"
          className="mt-3 flex w-full items-center justify-center rounded-full border border-border py-3 text-sm font-semibold"
        >
          Validar entradas
        </Link>
      </main>
    </Screen>
  );
}
