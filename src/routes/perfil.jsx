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
} from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import {
  draftEvents,
  organizerEvents,
  organizerProfile,
  organizerReviews,
  profileStats,
  publishedEvents,
} from "@/data/profile";
import { pendingMessageCount } from "@/data/messages";
import { useOrganizerProfile } from "@/hooks/use-organizer-profile";

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
  { id: "avaliacoes", label: "Avaliações" },
];

const editFieldClass =
  "mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60";

function Stars({ value, className = "size-3.5" }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Avaliação ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${className} ${
            star <= Math.round(value) ? "fill-primary text-primary" : "text-border"
          }`}
        />
      ))}
    </span>
  );
}

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

  const tabCounts = {
    eventos: organizerEvents.length,
    publicados: publishedEvents.length,
    rascunhos: draftEvents.length,
    avaliacoes: organizerReviews.length,
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
        {/* CARTÃO DO PERFIL: foto editável, nome, username, localização e avaliação. */}
        <section aria-labelledby="profile-title" className="rounded-3xl bg-card p-4 text-center">
          <div className="relative mx-auto w-fit">
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              aria-label="Alterar foto de perfil"
              className="group relative block size-24 overflow-hidden rounded-full ring-4 ring-primary/20"
            >
              <img
                src={profile.photo}
                alt={`Foto de perfil de ${profile.name}`}
                className="size-full object-cover"
              />
              <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-5 text-white" />
              </span>
            </button>
            <span className="absolute right-0 bottom-0 grid size-7 place-items-center rounded-full grad-primary text-primary-foreground ring-2 ring-card">
              <Camera className="size-3.5" />
            </span>
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => changePhoto(e.target.files?.[0])}
            />
          </div>

          <h1 id="profile-title" className="mt-3 text-lg font-extrabold">
            {profile.name}
          </h1>
          <p className="text-xs font-semibold text-primary">{profile.username}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="size-3" /> {profile.location}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Stars value={organizerProfile.rating} />
            <span className="text-[11px] font-bold">{organizerProfile.rating.toFixed(1)}</span>
            <span className="text-[11px] text-muted-foreground">
              ({organizerProfile.reviewCount} avaliações)
            </span>
          </div>

          <button
            type="button"
            onClick={startEditing}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-xs font-bold"
          >
            <Pencil className="size-3.5" /> Editar perfil
          </button>
        </section>

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

        {/* ESTATÍSTICAS */}
        <div className="mt-4 grid grid-cols-3 gap-2">
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

        {/* ABAS: Meus eventos, Publicados, Rascunhos e Avaliações. */}
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
          {activeTab !== "avaliacoes" ? (
            <>
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
            </>
          ) : (
            <ul className="space-y-3">
              {organizerReviews.map((review) => (
                <li key={review.id} className="rounded-2xl bg-card p-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {review.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold">{review.author}</p>
                      <p className="text-[10px] text-muted-foreground">{review.date}</p>
                    </div>
                    <Stars value={review.rating} className="size-3" />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {review.text}
                  </p>
                </li>
              ))}
            </ul>
          )}
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
