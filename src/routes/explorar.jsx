import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { EventCard } from "@/components/tickr/EventCard";
import { eventCategories, useEventSearch } from "@/hooks/use-event-search";
export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Tickr" },
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
function Explorar() {
  const { query, setQuery, category, setCategory, filteredEvents } = useEventSearch();
  return (
    <Screen>
      <header className="px-4 pt-6 pb-3">
        <h1 className="text-2xl font-extrabold">Explorar</h1>
        <div className="mt-4 flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-surface-2 px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Procurar eventos, artistas..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button className="grid size-12 place-items-center rounded-full bg-surface-2">
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {eventCategories.map((categoryOption) => (
            <button
              key={categoryOption}
              onClick={() => setCategory(categoryOption)}
              className={`rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap ${
                category === categoryOption
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {categoryOption === "Todos"
                ? categoryOption
                : categoryOption.charAt(0) + categoryOption.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 px-4 pt-2">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      {filteredEvents.length === 0 && (
        <p className="px-4 pt-10 text-center text-sm text-muted-foreground">
          Nenhum evento encontrado.
        </p>
      )}
    </Screen>
  );
}
