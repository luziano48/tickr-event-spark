import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Bell, Plus, Search } from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { eventBasics, suppliers } from "@/data/create-event";

export const Route = createFileRoute("/criar")({
  head: () => ({
    meta: [
      { title: "Tickr" },
      {
        name: "description",
        content: "Prepare o seu evento e encontre fornecedores na Tickr.",
      },
    ],
  }),
  component: CriarEvento,
});

function CriarEvento() {
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
          <div className="mb-4">
            <p className="text-xs font-bold tracking-wider text-primary">NOVO EVENTO</p>
            <h1 id="create-title" className="mt-1 text-2xl font-extrabold">
              Comece pelo essencial
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Preencha os dados principais e encontre os parceiros certos para realizar o seu
              evento.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {eventBasics.map(({ icon: Icon, label, value }) => (
              <button
                key={label}
                type="button"
                className="group rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-surface-2"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-4" />
                </span>
                <p className="mt-3 text-xs font-bold">{label}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{value}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="grad-primary glow mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-primary-foreground"
          >
            <Plus className="size-4" /> Criar evento
          </button>
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
