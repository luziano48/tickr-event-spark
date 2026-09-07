import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Screen } from "@/components/tickr/Screen";
import { EventCard } from "@/components/tickr/EventCard";
import { events } from "@/data/events";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Explorar eventos em Luanda | Tickr" },
      {
        name: "description",
        content: "Pesquise concertos, festivais e conferências por categoria na Tickr.",
      },
      { property: "og:title", content: "Explorar eventos em Luanda | Tickr" },
      {
        property: "og:description",
        content: "Pesquise concertos, festivais e conferências por categoria na Tickr.",
      },
    ],
  }),
  component: Explorar,
});

const categories = ["Todos", "MÚSICA", "CULTURA", "FESTIVAL", "NEGÓCIOS"];

function Explorar() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");

  const list = events.filter(
    (e) =>
      (cat === "Todos" || e.category === cat) &&
      e.title.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Screen>
      <header className="px-4 pt-6 pb-3">
        <h1 className="text-2xl font-extrabold">Explorar</h1>
        <div className="mt-4 flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-surface-2 px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Procurar eventos, artistas..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button className="grid size-12 place-items-center rounded-full bg-surface-2">
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap ${
                cat === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {c === "Todos" ? c : c.charAt(0) + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 px-4 pt-2">
        {list.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
      {list.length === 0 && (
        <p className="px-4 pt-10 text-center text-sm text-muted-foreground">
          Nenhum evento encontrado.
        </p>
      )}
    </Screen>
  );
}
