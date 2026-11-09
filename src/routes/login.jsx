import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Logo } from "@/components/tickr/Logo";
import { Button } from "@/components/ui/button";
import festivalImage from "@/assets/festival.jpg";
import { authApi } from "@/lib/api/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta | Tickr" },
      {
        name: "description",
        content: "Acede à Tickr para descobrir eventos ou gerir o teu negócio de eventos em Angola.",
      },
      { property: "og:title", content: "Entrar ou criar conta | Tickr" },
      {
        property: "og:description",
        content: "Acede à Tickr para descobrir eventos ou gerir o teu negócio de eventos em Angola.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Auth,
});

const roles = [
  {
    id: "organizer",
    title: "Organizo eventos",
    text: "Cria eventos, vende bilhetes e gere a tua equipa.",
    Icon: CalendarDays,
  },
  {
    id: "service_provider",
    title: "Ofereço serviços",
    text: "Apresenta os teus serviços e recebe pedidos de organizadores.",
    Icon: BriefcaseBusiness,
  },
];

function Auth() {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("organizer");
  const navigate = useNavigate();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const code = search.get("code");
    if (!code) return;

    let active = true;
    authApi
      .exchangeCode(code)
      .then(() => {
        if (!active) return;
        window.history.replaceState({}, "", window.location.pathname);
        if (search.get("flow") === "recovery") {
          setMode("update");
          setNote("Define uma nova palavra-passe para a tua conta.");
        } else {
          navigate({ to: "/" });
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Não foi possível validar o link.");
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setNote("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNote("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    if (mode !== "update" && !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Introduz um email válido.");
      return;
    }
    if (mode !== "recover" && !password) {
      setError("Introduz a tua palavra-passe.");
      return;
    }
    if ((mode === "update" || mode === "register") && password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        await authApi.signIn({ email, password });
      } else if (mode === "register") {
        const name = String(form.get("name") || "").trim();
        if (!name) throw Error("Introduz o teu nome.");
        if (password !== form.get("confirm")) throw Error("As palavras-passe não correspondem.");
        const result = await authApi.signUp({
          name,
          email,
          password,
          businessProfile: selectedRole,
        });
        if (result.needsEmailConfirmation) {
          setNote("Confirma o teu email para concluir a criação da conta.");
          return;
        }
      } else if (mode === "recover") {
        const result = await authApi.recoverPassword(email);
        setNote(result?.message || "Se a conta existir, receberás instruções de recuperação.");
        return;
      } else {
        if (password !== form.get("confirm")) throw Error("As palavras-passe não correspondem.");
        await authApi.updatePassword(password);
      }
      navigate({ to: "/" });
    } catch (err) {
      setError(err.message || "Não foi possível concluir. Tenta novamente.");
    } finally {
      setBusy(false);
    }
  }

  const heading =
    mode === "update"
      ? "Nova palavra-passe"
      : mode === "register"
        ? "Cria a tua conta"
        : mode === "recover"
          ? "Recupera o acesso"
          : "Entra na tua conta";

  return (
    <main className="auth-shell min-h-screen px-4 py-4 sm:px-8 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100svh-2rem)] max-w-6xl overflow-hidden rounded-md border border-auth-border bg-auth-panel shadow-2xl sm:min-h-[min(820px,calc(100svh-4rem))] sm:grid-cols-2">
        <section className="relative flex min-h-52 flex-col justify-between overflow-hidden p-5 sm:min-h-[680px] sm:p-8">
          <img
            src={festivalImage}
            alt="Concerto ao vivo com público e luzes de palco"
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-auth-bg via-auth-bg/55 to-auth-bg/20" />
          <Link
            to="/"
            aria-label="Tickr, página inicial"
            className="relative z-10 inline-flex w-fit rounded-sm bg-card px-2 py-1 shadow-md"
          >
            <Logo className="h-9 w-auto sm:h-11" />
          </Link>
          <div className="relative z-10 mt-10 max-w-md pb-1 sm:mt-auto sm:pb-4">
            <p className="mb-3 text-xs font-bold uppercase text-auth-accent">
              Eventos e serviços em Angola
            </p>
            <h1 className="font-display text-3xl font-bold leading-tight text-auth-foreground sm:text-4xl">
              A tua próxima grande experiência começa aqui.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-auth-muted">
              Descobre eventos, encontra parceiros e faz parte da comunidade Tickr.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-7 sm:px-10 sm:py-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <p className="text-sm font-semibold text-auth-accent">Bem-vindo à Tickr</p>
              <h2 className="mt-2 text-2xl font-bold text-auth-foreground">{heading}</h2>
              <p className="mt-2 text-sm leading-6 text-auth-muted">
                {mode === "register"
                  ? "Escolhe como vais usar a plataforma e começa a tua jornada."
                  : mode === "recover"
                    ? "Vamos enviar instruções para o email associado à tua conta."
                    : mode === "update"
                      ? "Escolhe uma palavra-passe nova para continuares."
                      : "Acede aos teus eventos, bilhetes e ferramentas de gestão."}
              </p>
            </div>

            {mode !== "update" && (
              <div className="mb-6 grid grid-cols-3 border-b border-auth-border" role="tablist" aria-label="Acesso à conta">
                {[
                  ["login", "Entrar"],
                  ["register", "Criar conta"],
                  ["recover", "Recuperar"],
                ].map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={mode === value}
                    onClick={() => changeMode(value)}
                    className={`min-h-11 rounded-none border-b-2 px-2 text-sm ${mode === value ? "border-auth-accent text-auth-accent" : "border-transparent text-auth-muted hover:text-auth-foreground"}`}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}

            {mode === "register" && (
              <div className="mb-5 grid gap-2 sm:grid-cols-2">
                {roles.map(({ id, title, text, Icon }) => (
                  <Button
                    key={id}
                    type="button"
                    aria-pressed={selectedRole === id}
                    onClick={() => setSelectedRole(id)}
                    className={`min-h-28 flex-col items-start justify-start gap-2 rounded-sm border p-3 text-left ${selectedRole === id ? "border-auth-accent bg-auth-accent/10 text-auth-foreground" : "border-auth-border bg-auth-panel text-auth-muted hover:border-auth-muted"}`}
                  >
                    <span className="flex items-center gap-2 text-sm font-bold">
                      <Icon className="size-4 text-auth-accent" /> {title}
                    </span>
                    <span className="text-xs leading-5">{text}</span>
                  </Button>
                ))}
              </div>
            )}

            <form onSubmit={submit} className="space-y-3.5">
              {mode === "register" && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-auth-muted">Nome</span>
                  <span className="relative block">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-auth-muted" />
                    <input
                      name="name"
                      placeholder="O teu nome completo"
                      autoComplete="name"
                      className="auth-input pl-10"
                      required
                    />
                  </span>
                </label>
              )}

              {mode !== "update" && (
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-auth-muted">Email</span>
                  <span className="relative block">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-auth-muted" />
                    <input
                      name="email"
                      type="email"
                      placeholder="nome@email.com"
                      autoComplete="email"
                      className="auth-input pl-10"
                      required
                    />
                  </span>
                </label>
              )}

              {mode !== "recover" && (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-auth-muted">
                      {mode === "update" ? "Nova palavra-passe" : "Palavra-passe"}
                    </span>
                    <span className="relative block">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-auth-muted" />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Pelo menos 8 caracteres"
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        className="auth-input pl-10 pr-11"
                        required
                      />
                      <Button
                        type="button"
                        aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                        onClick={() => setShowPassword((visible) => !visible)}
                        className="absolute right-1 top-1/2 size-9 -translate-y-1/2 rounded-sm text-auth-muted hover:text-auth-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </span>
                  </label>

                  {(mode === "register" || mode === "update") && (
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-auth-muted">
                        Confirmar palavra-passe
                      </span>
                      <span className="relative block">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-auth-muted" />
                        <input
                          name="confirm"
                          type={showPassword ? "text" : "password"}
                          placeholder="Repete a palavra-passe"
                          autoComplete="new-password"
                          className="auth-input pl-10"
                          required
                        />
                      </span>
                    </label>
                  )}
                </>
              )}

              <Button
                type="submit"
                disabled={busy}
                className="grad-primary glow mt-2 min-h-12 w-full rounded-sm text-sm font-bold text-primary-foreground disabled:cursor-not-allowed"
              >
                {busy ? "A processar…" : mode === "login" ? "Entrar" : mode === "register" ? "Criar conta" : mode === "update" ? "Actualizar palavra-passe" : "Enviar instruções"}
                {!busy && <ArrowRight className="size-4" />}
              </Button>

              {error && <p role="alert" className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              {note && <p role="status" className="rounded-sm border border-auth-accent/30 bg-auth-accent/10 px-3 py-2 text-sm text-auth-accent">{note}</p>}
            </form>

            <p className="mt-5 text-center text-xs text-auth-muted">
              Ao continuar, estás a aceder à tua conta Tickr com segurança.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}