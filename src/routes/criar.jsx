import { useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { suppliers } from "@/data/create-event";
import { useCreateEvent, eventFormCategories, ageOptions } from "@/hooks/use-create-event";

export const Route = createFileRoute("/criar")({
  head: () => ({
    meta: [
      { title: "Criar experiência — Tickr" },
      {
        name: "description",
        content:
          "Crie o seu evento na Tickr em etapas simples: informações, data e local, ingressos, detalhes e revisão.",
      },
      { property: "og:title", content: "Criar experiência — Tickr" },
      {
        property: "og:description",
        content: "Publique o seu evento na Tickr e encontre fornecedores de confiança.",
      },
    ],
  }),
  component: CriarEvento,
});

const fieldClass =
  "mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60";

function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="text-xs font-bold">{label}</span>
      {children}
      {hint && !error ? (
        <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
      {error ? <span className="mt-1 block text-[11px] text-destructive">{error}</span> : null}
    </label>
  );
}

function CriarEvento() {
  const fileInput = useRef(null);
  const {
    form,
    setField,
    selectImage,
    addTicket,
    updateTicket,
    removeTicket,
    errors,
    status,
    step,
    stepIndex,
    steps,
    goNext,
    goBack,
    goToStep,
    submit,
    reset,
    totalCapacity,
  } = useCreateEvent();

  const sending = status === "sending";

  if (status === "done") {
    return (
      <Screen>
        <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="size-8" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Evento enviado!</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            “{form.title}” foi registado com {form.tickets.length} tipo(s) de ingresso e{" "}
            {totalCapacity} lugares. Vamos rever e avisamos pelo WhatsApp {form.whatsapp}.
          </p>
          <button
            type="button"
            onClick={reset}
            className="grad-primary glow mt-6 w-full rounded-full py-3 text-sm font-bold text-primary-foreground"
          >
            Criar outro evento
          </button>
          <Link to="/" className="mt-3 text-xs font-bold text-primary">
            Voltar ao início
          </Link>
        </main>
      </Screen>
    );
  }

  return (
    <Screen>
      <header className="flex items-center justify-between px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            aria-label="Voltar para início"
            className="grid size-9 place-items-center rounded-full bg-surface-2"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <p className="text-sm font-bold">Criar experiência</p>
        </div>
        <Bell className="size-5" />
      </header>

      <main>
        <section className="px-4" aria-labelledby="create-title">
          <p className="text-xs font-bold tracking-wider text-primary">NOVO EVENTO</p>
          <h1 id="create-title" className="mt-1 text-2xl font-extrabold">
            {step.label}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Etapa {stepIndex + 1} de {steps.length}
          </p>

          <ol className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            {steps.map((item, index) => {
              const active = index === stepIndex;
              const done = index < stepIndex;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => (index <= stepIndex ? goToStep(index) : goNext())}
                    className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : done
                          ? "bg-primary/15 text-primary"
                          : "bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="size-3" /> : null}
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-5 space-y-4">
            {step.id === "info" ? (
              <>
                <Field label="Nome do evento" error={errors.title}>
                  <input
                    type="text"
                    inputMode="text"
                    maxLength={80}
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    placeholder="Ex.: Festival Luanda Música"
                    className={fieldClass}
                  />
                </Field>

                <div>
                  <span className="text-xs font-bold">Imagem de capa</span>
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="mt-1 flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-3 text-left"
                  >
                    {form.imageUrl ? (
                      <img
                        src={form.imageUrl}
                        alt="Pré-visualização da capa"
                        className="size-16 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="grid size-16 place-items-center rounded-xl bg-primary/15 text-primary">
                        <ImageIcon className="size-5" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold">
                        {form.imageName || "Adicione uma imagem marcante"}
                      </span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        Toque para escolher do seu telemóvel
                      </span>
                    </span>
                  </button>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => selectImage(e.target.files?.[0])}
                  />
                </div>

                <div>
                  <span className="text-xs font-bold">Categoria</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {eventFormCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setField("category", category)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                          form.category === category
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface-2 text-muted-foreground"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  {errors.category ? (
                    <span className="mt-1 block text-[11px] text-destructive">
                      {errors.category}
                    </span>
                  ) : null}
                </div>

                <Field
                  label="Descrição"
                  error={errors.description}
                  hint={`${form.description.length}/600 caracteres`}
                >
                  <textarea
                    rows={4}
                    maxLength={600}
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Conte o que torna este evento especial"
                    className={fieldClass}
                  />
                </Field>
              </>
            ) : null}

            {step.id === "local" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Data" error={errors.date}>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setField("date", e.target.value)}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Horário" error={errors.time}>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setField("time", e.target.value)}
                      className={fieldClass}
                    />
                  </Field>
                </div>
                <Field label="Cidade" error={errors.city}>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    placeholder="Luanda"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Local / espaço" error={errors.venue}>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) => setField("venue", e.target.value)}
                    placeholder="Cine Atlântico"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Endereço (opcional)">
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    placeholder="Rua, bairro, referência"
                    className={fieldClass}
                  />
                </Field>
              </>
            ) : null}

            {step.id === "ingressos" ? (
              <>
                {errors.tickets ? (
                  <p className="text-[11px] text-destructive">{errors.tickets}</p>
                ) : null}
                <ul className="space-y-3">
                  {form.tickets.map((ticket, index) => (
                    <li key={ticket.id} className="rounded-2xl border border-border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-primary">Ingresso {index + 1}</p>
                        {form.tickets.length > 1 ? (
                          <button
                            type="button"
                            aria-label={`Remover ingresso ${index + 1}`}
                            onClick={() => removeTicket(ticket.id)}
                            className="grid size-8 place-items-center rounded-full bg-surface-2 text-muted-foreground"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-2 space-y-3">
                        <Field label="Tipo" error={errors[`ticket-${index}-name`]}>
                          <input
                            type="text"
                            value={ticket.name}
                            onChange={(e) => updateTicket(ticket.id, "name", e.target.value)}
                            placeholder="Normal, VIP, Estudante"
                            className={fieldClass}
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Preço (Kz)" error={errors[`ticket-${index}-price`]}>
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              value={ticket.price}
                              onChange={(e) => updateTicket(ticket.id, "price", e.target.value)}
                              placeholder="10000"
                              className={fieldClass}
                            />
                          </Field>
                          <Field label="Quantidade" error={errors[`ticket-${index}-quantity`]}>
                            <input
                              type="number"
                              inputMode="numeric"
                              min="1"
                              value={ticket.quantity}
                              onChange={(e) => updateTicket(ticket.id, "quantity", e.target.value)}
                              placeholder="100"
                              className={fieldClass}
                            />
                          </Field>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={addTicket}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-surface-2 py-3 text-xs font-bold text-primary"
                >
                  <Plus className="size-4" /> Adicionar tipo de ingresso
                </button>
                <p className="text-[11px] text-muted-foreground">
                  Capacidade total: {totalCapacity} lugares
                </p>
              </>
            ) : null}

            {step.id === "detalhes" ? (
              <>
                <div>
                  <span className="text-xs font-bold">Idade mínima</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ageOptions.map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setField("age", age)}
                        className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                          form.age === age
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface-2 text-muted-foreground"
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Regras do evento (opcional)">
                  <textarea
                    rows={3}
                    maxLength={400}
                    value={form.rules}
                    onChange={(e) => setField("rules", e.target.value)}
                    placeholder="Ex.: não é permitida a entrada com bebidas"
                    className={fieldClass}
                  />
                </Field>
                <Field label="Responsável pelo contacto" error={errors.contactName}>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setField("contactName", e.target.value)}
                    placeholder="Nome de quem responde"
                    className={fieldClass}
                  />
                </Field>
                <Field label="WhatsApp" error={errors.whatsapp}>
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={20}
                    value={form.whatsapp}
                    onChange={(e) => setField("whatsapp", e.target.value)}
                    placeholder="+244 900 000 000"
                    className={fieldClass}
                  />
                </Field>
              </>
            ) : null}

            {step.id === "revisar" ? (
              <div className="space-y-3">
                <article className="overflow-hidden rounded-2xl bg-card">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt={form.title}
                      className="h-40 w-full object-cover"
                    />
                  ) : null}
                  <div className="p-3">
                    <p className="text-[11px] font-bold tracking-wider text-primary">
                      {form.category}
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold">{form.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {form.date} · {form.time} · {form.venue}, {form.city}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {form.description}
                    </p>
                  </div>
                </article>

                <ul className="space-y-2">
                  {form.tickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="flex items-center justify-between rounded-2xl bg-surface-2 px-3 py-2 text-xs"
                    >
                      <span className="font-bold">{ticket.name}</span>
                      <span className="text-muted-foreground">
                        Kz {Number(ticket.price).toLocaleString("pt-AO")} · {ticket.quantity} un.
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-2xl bg-card p-3 text-xs text-muted-foreground">
                  <p>
                    <span className="font-bold text-foreground">Idade:</span> {form.age}
                  </p>
                  {form.rules ? (
                    <p className="mt-1">
                      <span className="font-bold text-foreground">Regras:</span> {form.rules}
                    </p>
                  ) : null}
                  <p className="mt-1">
                    <span className="font-bold text-foreground">Contacto:</span> {form.contactName}{" "}
                    · {form.whatsapp}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center gap-3">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={sending}
                className="rounded-full bg-surface-2 px-5 py-3 text-sm font-bold disabled:opacity-60"
              >
                Voltar
              </button>
            ) : null}
            {step.id === "revisar" ? (
              <button
                type="button"
                onClick={submit}
                disabled={sending}
                aria-busy={sending}
                className="grad-primary glow flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-primary-foreground disabled:opacity-70"
              >
                {sending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> A processar…
                  </>
                ) : (
                  <>
                    <Plus className="size-4" /> Criar evento
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="grad-primary glow flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-primary-foreground"
              >
                Continuar <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </section>

        <section className="mt-8 px-4" aria-labelledby="suppliers-title">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold tracking-wider text-primary">PARCEIROS TICKR</p>
              <h2 id="suppliers-title" className="mt-1 text-xl font-extrabold">
                Encontre fornecedores
              </h2>
            </div>
            <button
              type="button"
              aria-label="Pesquisar fornecedores"
              className="grid size-9 place-items-center rounded-full bg-surface-2"
            >
              <Search className="size-4" />
            </button>
          </div>

          <ul className="space-y-3">
            {suppliers.map((supplier) => (
              <li key={supplier.name}>
                <article className="flex items-center gap-3 rounded-2xl bg-card p-3">
                  <img
                    src={supplier.image}
                    alt={supplier.name}
                    loading="lazy"
                    className="size-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold">{supplier.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">{supplier.service}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {supplier.neighborhood} · {supplier.availability}
                    </p>
                  </div>
                  <a
                    href={`mailto:suporte@tickr.ao?subject=Contacto com ${supplier.name}`}
                    className="shrink-0 rounded-full bg-primary/15 px-3 py-2 text-[10px] font-bold text-primary"
                  >
                    {supplier.contact}
                  </a>
                </article>
              </li>
            ))}
          </ul>

          <Link
            to="/explorar"
            className="mt-4 flex items-center justify-center gap-1 text-xs font-bold text-primary"
          >
            Ver todos os fornecedores <ArrowRight className="size-3" />
          </Link>
        </section>
      </main>
    </Screen>
  );
}
