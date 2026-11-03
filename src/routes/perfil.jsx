import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Bell,
  Calendar,
  Camera,
  ImagePlus,
  Send,
  Trash2,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Megaphone,
  MessageSquare,
  Pencil,
  Phone,
  PlusCircle,
  Star,
  X,
} from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { AccountMenu } from "@/components/tickr/AccountMenu";
import { EventStarButton } from "@/components/tickr/EventStarButton";
import { Reviews } from "@/components/tickr/Reviews";
import { Comments } from "@/components/tickr/Comments";
import { publishedEvents } from "@/data/profile";
import { pendingMessageCount } from "@/data/messages";
import { useOrganizerProfile } from "@/hooks/use-organizer-profile";
import { useEventStars } from "@/hooks/use-event-stars";
import { useReviews } from "@/hooks/use-community";

const PROFILE_TARGET = "perfil:tickr-eventos";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil do organizador | Tickr" },
      { name: "description", content: "Novidades, eventos e informações do organizador Tickr." },
      { property: "og:title", content: "Perfil do organizador | Tickr" },
      {
        property: "og:description",
        content: "Acompanhe as novidades e experiências do organizador Tickr.",
      },
    ],
  }),
  component: Perfil,
});

const tabs = [
  { id: "novidades", label: "Novidades", icon: Megaphone },
  { id: "contactos", label: "Contactos", icon: AtSign },
  { id: "opinioes", label: "Opiniões", icon: MessageSquare },
];
const editFieldClass =
  "mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60";
const POSTS_KEY = "tickr-organizer-posts-v1";
const contactFields = [
  { key: "email", label: "Email", type: "email", icon: Mail, placeholder: "nome@exemplo.com" },
  {
    key: "instagram",
    label: "Instagram",
    type: "text",
    icon: Instagram,
    placeholder: "@utilizador ou ligação",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    type: "text",
    icon: Linkedin,
    placeholder: "Perfil ou ligação LinkedIn",
  },
  {
    key: "website",
    label: "Website",
    type: "url",
    icon: Globe,
    placeholder: "https://oseusite.ao",
  },
  { key: "whatsapp", label: "WhatsApp", type: "tel", icon: Phone, placeholder: "+244 9xx xxx xxx" },
];

function socialUrl(value, domain) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${domain}/${value.replace(/^@/, "")}`;
}

function getProfileContacts(profile) {
  return [
    profile.email && {
      icon: Mail,
      label: "Email",
      value: profile.email,
      href: `mailto:${profile.email}`,
    },
    profile.instagram && {
      icon: Instagram,
      label: "Instagram",
      value: profile.instagram,
      href: socialUrl(profile.instagram, "instagram.com"),
    },
    profile.linkedin && {
      icon: Linkedin,
      label: "LinkedIn",
      value: profile.linkedin,
      href: socialUrl(profile.linkedin, "linkedin.com/in"),
    },
    profile.website && {
      icon: Globe,
      label: "Website",
      value: profile.website,
      href: /^https?:\/\//i.test(profile.website) ? profile.website : `https://${profile.website}`,
    },
    profile.whatsapp && {
      icon: Phone,
      label: "WhatsApp",
      value: profile.whatsapp,
      href: `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`,
    },
  ].filter(Boolean);
}

function Perfil() {
  const photoInput = useRef(null);
  const [activeTab, setActiveTab] = useState("novidades");
  const [editSection, setEditSection] = useState("perfil");
  const [posts, setPosts] = useState([]);
  const [postDraft, setPostDraft] = useState("");
  const {
    profile,
    editing,
    draft,
    setDraft,
    changeDraftPhoto,
    startEditing,
    saveProfile,
    cancelEditing,
    toggleSetting,
  } = useOrganizerProfile();
  const { starCount } = useEventStars();
  const totalEventStars = publishedEvents.reduce((sum, { event }) => sum + starCount(event.id), 0);
  const reviewSummary = useReviews(PROFILE_TARGET).summary;

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(POSTS_KEY) || "[]");
      if (Array.isArray(stored)) setPosts(stored);
    } catch {
      setPosts([]);
    }
  }, []);
  const savePosts = (next) => {
    setPosts(next);
    try {
      window.localStorage.setItem(POSTS_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };
  const publishPost = (event) => {
    event.preventDefault();
    const text = postDraft.trim();
    if (text.length < 2 || text.length > 1000) return;
    savePosts([{ id: crypto.randomUUID(), text, createdAt: new Date().toISOString() }, ...posts]);
    setPostDraft("");
  };

  return (
    <Screen>
      <header className="flex items-center justify-between px-4 py-5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-primary">
          Perfil do organizador
        </span>
        <div className="flex items-center gap-2">
          <AccountMenu profile={profile} toggleSetting={toggleSetting} />
          <Link
            to="/mensagens"
            aria-label={`Abrir notificações, ${pendingMessageCount} pendentes`}
            className="relative grid size-9 place-items-center rounded-full bg-surface-2 text-primary"
          >
            <Bell className="size-4" />
            {pendingMessageCount > 0 && (
              <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {pendingMessageCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <button
        type="button"
        onClick={startEditing}
        aria-label="Editar perfil e foto de fundo"
        className="group relative block aspect-[2/1] w-full overflow-hidden text-left"
      >
        <img
          src={profile.photo}
          alt={`Foto de perfil de ${profile.name}`}
          className="absolute inset-0 size-full object-cover"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/15 to-transparent" />
        <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-card/90 text-primary">
          <Camera className="size-4" />
        </span>
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-background">
          <span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-background/80">
              Organizador
            </span>
            <span className="mt-1 block text-3xl font-extrabold">{profile.name}</span>
          </span>
          <span className="rounded-full bg-background/20 px-3 py-1.5 text-[10px] font-semibold opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            Alterar foto
          </span>
        </span>
      </button>

      <main>
        <section
          aria-label="Informações do perfil"
          className="border-b border-border px-5 pb-5 pt-5"
        >
          <p className="text-xs font-semibold text-primary">{profile.username} · Angola</p>
          <p className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="size-3" />
            {profile.location}
          </p>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Star className={`size-3.5 ${totalEventStars ? "fill-primary text-primary" : ""}`} />
            {totalEventStars} {totalEventStars === 1 ? "estrela" : "estrelas"} nos eventos
          </p>
          <h1 className="mt-4 text-xl font-bold">Criamos experiências para viver.</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
          <div className="mt-4 grid grid-cols-2 divide-x divide-border text-center">
            <div>
              <p className="text-lg font-extrabold">{publishedEvents.length}</p>
              <p className="text-[10px] text-muted-foreground">Eventos</p>
            </div>
            <div>
              <p className="text-lg font-extrabold tabular-nums">
                {reviewSummary.count
                  ? reviewSummary.average.toLocaleString("pt-PT", { minimumFractionDigits: 1 })
                  : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">Avaliações</p>
            </div>
          </div>
          <button
            type="button"
            onClick={startEditing}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-primary py-3 text-sm font-bold text-primary"
          >
            <Pencil className="size-4" />
            Personalizar perfil
          </button>
        </section>

        {editing &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/45 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={cancelEditing}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-profile-title"
                onClick={(event) => event.stopPropagation()}
                className="max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border border-border bg-background shadow-2xl animate-in slide-in-from-bottom duration-300"
              >
                <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border" />
                <header className="flex items-start justify-between px-5 pb-4 pt-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      O seu espaço
                    </p>
                    <h2 id="edit-profile-title" className="mt-1 text-2xl font-extrabold">
                      Personalizar perfil
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Deixe a sua presença com a sua cara.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    aria-label="Fechar edição"
                    className="grid size-9 place-items-center rounded-full bg-surface-2"
                  >
                    <X className="size-4" />
                  </button>
                </header>
                <div className="px-5">
                  <button
                    type="button"
                    onClick={() => photoInput.current?.click()}
                    className="group relative block h-36 w-full overflow-hidden rounded-2xl bg-surface-2 text-left"
                  >
                    <img
                      src={draft.photo || profile.photo}
                      alt="Pré-visualização da capa"
                      className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-foreground/75 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-lg font-extrabold text-background">
                      {draft.name || "O seu nome"}
                    </span>
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-3 py-2 text-[10px] font-bold text-primary">
                      <ImagePlus className="size-3.5" />
                      Mudar capa
                    </span>
                  </button>
                  <input
                    ref={photoInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => changeDraftPhoto(event.target.files?.[0])}
                  />
                </div>
                <div
                  role="tablist"
                  aria-label="Dados a editar"
                  className="mx-5 mt-5 grid grid-cols-2 rounded-full bg-surface-2 p-1"
                >
                  {[
                    { id: "perfil", label: "Perfil" },
                    { id: "contactos", label: "Contactos" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={editSection === tab.id}
                      onClick={() => setEditSection(tab.id)}
                      className={`rounded-full py-2.5 text-xs font-bold transition-colors ${editSection === tab.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-4 px-5 py-5">
                  {editSection === "perfil" ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block text-[11px] font-bold">
                          Nome
                          <input
                            value={draft.name}
                            maxLength={60}
                            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                            placeholder="Nome do perfil"
                            className={editFieldClass}
                          />
                        </label>
                        <label className="block text-[11px] font-bold">
                          Utilizador
                          <input
                            value={draft.username}
                            maxLength={30}
                            onChange={(event) =>
                              setDraft({ ...draft, username: event.target.value })
                            }
                            placeholder="@utilizador"
                            className={editFieldClass}
                          />
                        </label>
                      </div>
                      <label className="block text-[11px] font-bold">
                        Localização
                        <input
                          value={draft.location}
                          maxLength={60}
                          onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                          placeholder="Cidade, país"
                          className={editFieldClass}
                        />
                      </label>
                      <label className="block text-[11px] font-bold">
                        Sobre o organizador
                        <textarea
                          value={draft.bio || ""}
                          maxLength={240}
                          rows={4}
                          onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
                          placeholder="Conte um pouco sobre o que faz…"
                          className={`${editFieldClass} resize-y`}
                        />
                        <span className="mt-1 block text-right text-[10px] font-normal text-muted-foreground">
                          {(draft.bio || "").length}/240
                        </span>
                      </label>
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-sm font-bold">Canais de contacto</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Escolha os contactos que quer mostrar publicamente.
                        </p>
                      </div>
                      {contactFields.map(({ key, label, type, icon: Icon, placeholder }) => (
                        <label
                          key={key}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2"
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-bold text-muted-foreground">
                              {label}
                            </span>
                            <input
                              type={type}
                              value={draft[key] || ""}
                              maxLength={160}
                              placeholder={placeholder}
                              onChange={(event) =>
                                setDraft({ ...draft, [key]: event.target.value })
                              }
                              className="mt-0.5 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
                            />
                          </span>
                        </label>
                      ))}
                    </>
                  )}
                </div>
                <footer className="sticky bottom-0 flex gap-3 border-t border-border bg-background/95 px-5 py-4 backdrop-blur">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex-1 rounded-full border border-border py-3 text-sm font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={saveProfile}
                    className="grad-primary glow flex-1 rounded-full py-3 text-sm font-bold text-primary-foreground"
                  >
                    Guardar perfil
                  </button>
                </footer>
              </section>
            </div>,
            document.body,
          )}

        <div
          role="tablist"
          aria-label="Secções do perfil"
          className="mx-4 mt-2 grid grid-cols-3 border-b border-border"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setActiveTab(id)}
              className={`flex min-w-0 items-center justify-center gap-1 border-b-2 px-1 py-4 text-center text-[10px] font-semibold leading-tight ${activeTab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="px-4 py-5" aria-live="polite">
          {activeTab === "novidades" && (
            <section aria-label="Novidades e eventos" className="space-y-4">
              <form onSubmit={publishPost} className="rounded-2xl bg-card p-3">
                <label htmlFor="organizer-post" className="text-xs font-bold">
                  Partilhar uma novidade
                </label>
                <textarea
                  id="organizer-post"
                  rows={3}
                  maxLength={1000}
                  value={postDraft}
                  onChange={(event) => setPostDraft(event.target.value)}
                  placeholder="O que há de novo?"
                  className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary/60"
                />
                <button
                  type="submit"
                  disabled={postDraft.trim().length < 2}
                  className="grad-primary mt-2 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-50"
                >
                  <Send className="size-3.5" />
                  Publicar
                </button>
              </form>
              {posts.length > 0 && (
                <ul className="space-y-3">
                  {posts.map((post) => (
                    <li key={post.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="grid size-8 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                            {profile.name.slice(0, 1)}
                          </span>
                          <span className="text-xs font-bold">{profile.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <time className="text-[10px] text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString("pt-PT")}
                          </time>
                          <button
                            type="button"
                            aria-label="Eliminar publicação"
                            onClick={() => savePosts(posts.filter((item) => item.id !== post.id))}
                            className="grid size-8 place-items-center rounded-full bg-surface-2 text-muted-foreground"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                        {post.text}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {publishedEvents.length === 0 ? (
                <p className="rounded-2xl bg-surface-2 p-4 text-center text-xs text-muted-foreground">
                  Ainda não há eventos publicados.
                </p>
              ) : (
                <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3">
                  {publishedEvents.map(({ event }) => (
                    <li
                      key={event.id}
                      className="w-[82%] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                    >
                      <Link to="/evento/$id" params={{ id: event.id }} className="block">
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            loading="lazy"
                            className="size-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          <span className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/10" />
                          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                            {event.category}
                          </span>
                          <span className="absolute bottom-3 left-4 right-4 text-xl font-extrabold leading-tight text-background">
                            {event.title}
                          </span>
                          <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-background/90 text-primary">
                            <ArrowUpRight className="size-4" />
                          </span>
                        </div>
                        <div className="space-y-3 p-4">
                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="size-4 text-primary" />
                            {event.date} · {event.time || "Horário a confirmar"}
                          </p>
                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="size-4 text-primary" />
                            {[event.venue, event.city].filter(Boolean).join(" · ")}
                          </p>
                          <div className="flex items-center justify-between border-t border-border pt-3">
                            <span className="text-sm font-extrabold text-primary">
                              {event.price}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                              Ver evento <ArrowRight className="size-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
                        <span className="text-[11px] text-muted-foreground">
                          Estrelas da comunidade
                        </span>
                        <EventStarButton eventId={event.id} className="bg-surface-2" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeTab === "contactos" && (
            <section aria-label="Contactos do organizador">
              <p className="text-[10px] font-bold uppercase text-primary">Fale connosco</p>
              <h2 className="mt-1 text-xl font-bold">Contactos do organizador</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Redes sociais, email e outros canais públicos do organizador.
              </p>
              {getProfileContacts(profile).length ? (
                <ul className="mt-5 space-y-3">
                  {getProfileContacts(profile).map(({ icon: Icon, label, value, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target={label === "Email" ? undefined : "_blank"}
                        rel={label === "Email" ? undefined : "noreferrer"}
                        className="flex items-center gap-3 rounded-2xl bg-card p-4"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                          <Icon className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                            {label}
                          </span>
                          <span className="mt-0.5 block truncate text-sm font-semibold">
                            {value}
                          </span>
                        </span>
                        <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-5 rounded-2xl bg-surface-2 p-5 text-center">
                  <p className="text-sm font-semibold">Ainda não há contactos públicos.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Adicione email, WhatsApp, redes sociais e website ao perfil.
                  </p>
                  <button
                    type="button"
                    onClick={startEditing}
                    className="mt-4 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"
                  >
                    <Pencil className="mr-1 inline size-3.5" />
                    Adicionar contactos
                  </button>
                </div>
              )}
            </section>
          )}

          {activeTab === "opinioes" && (
            <section aria-label="Avaliações e comentários">
              <p className="text-[10px] font-bold uppercase text-primary">A comunidade Tickr</p>
              <h2 className="mt-1 text-xl font-bold">O que estão dizendo</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Avaliações com estrelas e comentários sobre este organizador.
              </p>
              <div className="mt-4 space-y-4">
                <Reviews target={PROFILE_TARGET} title="Avaliações do organizador" />
                <Comments target={PROFILE_TARGET} title="Comentários no perfil" />
              </div>
            </section>
          )}
        </div>
      </main>
    </Screen>
  );
}
