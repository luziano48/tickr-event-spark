import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock3,
  LockKeyhole,
  Mail,
  MapPin,
  Ticket,
} from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { ticketAccessApi } from "@/lib/api/ticket-access";
import { VisitorBackButton } from "@/components/tickr/VisitorBackButton";

export const Route = createFileRoute("/ingressos")({
  head: () => ({
    meta: [
      { title: "Meu ingresso | Tickr" },
      {
        name: "description",
        content: "Recupera o teu ingresso com segurança e apresenta o QR Code na entrada.",
      },
    ],
  }),
  component: MyTicket,
});

function MyTicket() {
  const [step, setStep] = useState("request");
  const [challengeId, setChallengeId] = useState("");
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestCode(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await ticketAccessApi.request({
        accessCode: String(form.get("accessCode") || "").trim(),
        contact: String(form.get("contact") || "").trim(),
      });
      setChallengeId(result.challengeId);
      setMessage(result.message);
      setStep("verify");
    } catch (requestError) {
      setError(requestError.message || "Não foi possível iniciar a verificação.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await ticketAccessApi.verify({
        challengeId,
        code: String(form.get("code") || "").trim(),
      });
      setTicket(result);
      setStep("ticket");
    } catch {
      setError("Não encontrámos um ingresso com esses dados.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <main className="space-y-5 px-4 pb-8 pt-6">
        <VisitorBackButton
          fallbackTo="/"
          className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent"
        />

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-teal p-5 text-primary-foreground shadow-lg">
          <div className="absolute -right-8 -top-8 size-36 rounded-full border-[20px] border-white/10" />
          <div className="relative">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/15">
              <Ticket className="size-6" />
            </span>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
              A tua próxima experiência
            </p>
            <h1 className="mt-1 text-2xl font-extrabold">Meu ingresso</h1>
            <p className="mt-2 max-w-xs text-sm leading-5 text-white/85">
              Recupera o bilhete com o teu código e o contacto usado na compra.
            </p>
          </div>
        </section>

        {step === "request" ? (
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-soft text-primary">
                <LockKeyhole className="size-5" />
              </span>
              <div>
                <h2 className="font-bold">Confirma os teus dados</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  O código de segurança será enviado para o email associado ao ingresso.
                </p>
              </div>
            </div>
            <form onSubmit={requestCode} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">ID do ingresso</span>
                <input
                  name="accessCode"
                  autoComplete="off"
                  minLength={10}
                  maxLength={10}
                  pattern="[A-Za-z0-9]{10}"
                  placeholder="Ex.: 8K4M2Q7P1A"
                  required
                  className="min-h-12 w-full rounded-xl border border-input bg-background px-3 font-mono text-sm uppercase tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">
                  Email ou telefone da compra
                </span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    name="contact"
                    autoComplete="off"
                    placeholder="nome@email.com ou +244..."
                    required
                    className="min-h-12 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </span>
              </label>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="grad-primary flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {busy ? "A verificar…" : "Enviar código por email"}
                {!busy ? <ArrowRight className="size-4" /> : null}
              </button>
            </form>
            <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">
              O ID do ingresso é aleatório. O QR só aparece depois da confirmação por email.
            </p>
          </section>
        ) : null}

        {step === "verify" ? (
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-soft text-primary">
                <Mail className="size-5" />
              </span>
              <div>
                <h2 className="font-bold">Confirma o teu email</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{message}</p>
              </div>
            </div>
            <form onSubmit={verifyCode} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">Código de 6 dígitos</span>
                <input
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  required
                  className="min-h-14 w-full rounded-xl border border-input bg-background text-center font-mono text-2xl tracking-[0.5em] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="grad-primary flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {busy ? "A validar…" : "Ver meu ingresso"}
                {!busy ? <ArrowRight className="size-4" /> : null}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setError("");
                }}
                className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Voltar e rever os dados
              </button>
            </form>
          </section>
        ) : null}

        {step === "ticket" && ticket ? (
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="bg-surface p-5">
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                <BadgeCheck className="size-3.5" />
                {ticket.status === "used" ? "Já utilizado" : "Ingresso válido"}
              </span>
              <h2 className="mt-3 text-xl font-extrabold">{ticket.event.title}</h2>
              <p className="mt-1 text-sm font-semibold text-primary">{ticket.ticketName}</p>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  {new Date(ticket.event.startsAt).toLocaleString("pt-PT", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  {ticket.event.venue} · {ticket.event.city}
                </p>
                {ticket.checkedInAt ? (
                  <p className="flex items-center gap-2">
                    <Clock3 className="size-4 text-primary" />
                    Entrada validada às {new Date(ticket.checkedInAt).toLocaleTimeString("pt-PT")}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="p-5 text-center">
              <QRCodeSVG
                value={ticket.qrToken}
                size={224}
                level="H"
                includeMargin
                className="mx-auto max-w-full rounded-xl bg-white p-2"
                aria-label={`QR Code de entrada para ${ticket.event.title}`}
              />
              <p className="mt-2 font-mono text-xs font-bold tracking-widest">
                {ticket.accessCode}
              </p>
              <p className="mx-auto mt-3 max-w-xs text-[11px] leading-5 text-muted-foreground">
                Apresenta este QR na entrada. Não partilhes a imagem: contém a credencial de acesso.
              </p>
            </div>
          </section>
        ) : null}
      </main>
    </Screen>
  );
}
