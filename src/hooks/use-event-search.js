import { useState } from "react";
import { events } from "@/data/events";

export const eventCategories = ["Todos", "MÚSICA", "CULTURA", "FESTIVAL", "NEGÓCIOS"];

export function useEventSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  const filteredEvents = events.filter((event) => {
    const matchesCategory = category === "Todos" || event.category === category;
    const matchesQuery = event.title.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return {
    query,
    setQuery,
    category,
    setCategory,
    filteredEvents,
  };
}
