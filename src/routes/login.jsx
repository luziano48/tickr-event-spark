import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, BriefcaseBusiness } from "lucide-react";
import { authApi } from "@/lib/api/auth";
export const Route = createFileRoute("/login")({ component: Auth });
const roles = [
  {
    id: "organizer",
    title: "Organizo eventos",
    text: "Cria e gere eventos, vende bilhetes, organiza a tua equipa e valida entradas através de QR Code.",
    Icon: CalendarDays,
  },
  {
    id: "service_provider",
    title: "Ofereço serviços",
    text: "Mostra o teu trabalho em som, catering, segurança, decoração ou fotografia e recebe pedidos de organizadores de eventos.",
    Icon: BriefcaseBusiness,
  },
];
function Auth() {
  const [mode, setMode] = useState("login"),
    [error, setError] = useState(""),
    [note, setNote] = useState(""),
    [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("organizer");
  async function submit(e) {
    e.preventDefault();
    setError("");
    setNote("");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Introduz um email válido.");
      return;
    }
    if (mode !== "recover" && !password) {
      setError("Introduz a tua palavra-passe.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") await authApi.signIn({ email, password });
      else if (mode === "register") {
        const name = String(f.get("name") || "").trim();
        if (!name) throw Error("Introduz o teu nome.");
        if (password.length < 8) throw Error("A palavra-passe deve ter pelo menos 8 caracteres.");
        if (password !== f.get("confirm")) throw Error("As palavras-passe não correspondem.");
        await authApi.signUp({ name, email, password, businessProfile: selectedRole });
      } else {
        const result = await authApi.recoverPassword(email);
        setNote(result?.message || "Se a conta existir, receberás instruções de recuperação.");
        return;
      }
      navigate({ to: "/" });
    } catch (err) {
      setError(err.message || "Não foi possível concluir. Tenta novamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#0f0f0f] px-4 py-8 text-white sm:grid sm:grid-cols-2 sm:items-center sm:gap-12 sm:px-12">
      <section className="mx-auto max-w-lg sm:mx-0">
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          tickr<span className="text-[#75efbd]">.</span>
        </Link>
        <p className="mt-12 text-xs font-bold uppercase tracking-[.2em] text-[#75efbd]">
          Eventos e serviços em Angola
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight">
          A tua próxima grande experiência começa aqui.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
          Entra na Tickr para descobrir eventos ou gerir a tua actividade comercial.
        </p>
      </section>
      <section className="mx-auto mt-10 w-full max-w-lg rounded-3xl border border-white/10 bg-[#171717] p-5 sm:mt-0 sm:p-7">
        <h2 className="text-xl font-bold">Escolhe o teu perfil</h2>
        <div className="mt-4 grid gap-3">
          {roles.map(({ id, title, text, Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setSelectedRole(id)}
              aria-pressed={selectedRole === id}
              className={`relative rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[#75efbd] ${selectedRole === id ? "border-[#75efbd] bg-[#75efbd]/10" : "border-white/15 hover:border-white/40"}`}
            >
              <span className="flex items-center gap-2 font-bold">
                <Icon className="size-5 text-[#75efbd]" />
                {title}
              </span>
              <span className="mt-3 block border-t border-dashed border-white/25 pt-3 text-xs leading-5 text-white/70">
                {text}
              </span>
              {selectedRole === id && (
                <span className="absolute right-3 top-4 text-xs text-[#75efbd]">
                  ✓ Seleccionado
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-5 flex gap-4 text-sm">
          <button
            onClick={() => setMode("login")}
            className={mode === "login" ? "text-[#75efbd]" : "text-white/60"}
          >
            Entrar
          </button>
          <button
            onClick={() => setMode("register")}
            className={mode === "register" ? "text-[#75efbd]" : "text-white/60"}
          >
            Criar conta
          </button>
          <button
            onClick={() => setMode("recover")}
            className={mode === "recover" ? "text-[#75efbd]" : "text-white/60"}
          >
            Recuperar
          </button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-3">
          {mode === "register" && (
            <input name="name" placeholder="Nome" autoComplete="name" className="auth-input" />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="auth-input"
            required
          />
          {mode !== "recover" && (
            <>
              <input
                name="password"
                type="password"
                placeholder="Palavra-passe"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="auth-input"
                required
              />
              {mode === "register" && (
                <input
                  name="confirm"
                  type="password"
                  placeholder="Confirmar palavra-passe"
                  className="auth-input"
                  required
                />
              )}
            </>
          )}
          <button
            disabled={busy}
            className="w-full rounded-xl bg-[#75efbd] py-3 font-bold text-[#10241b] disabled:opacity-60"
          >
            {busy
              ? "A processar…"
              : mode === "login"
                ? "Entrar"
                : mode === "register"
                  ? "Criar conta"
                  : "Enviar pedido"}
          </button>
          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}
          {note && (
            <p role="status" className="text-sm text-[#75efbd]">
              {note}
            </p>
          )}
        </form>
        <p className="mt-4 text-[11px] text-white/45">
          A autenticação e recuperação dependem do backend, ainda não ligado.
        </p>
      </section>
      <style>{`.auth-input{width:100%;border-radius:.75rem;border:1px solid #ffffff30;background:#101010;padding:.8rem .9rem;color:white;outline:none}.auth-input:focus{border-color:#75efbd;box-shadow:0 0 0 2px #75efbd55} @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}`}</style>
    </main>
  );
}
