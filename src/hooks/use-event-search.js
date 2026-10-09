import { useEffect, useState } from "react";
import { loadCreatedEvents } from "@/data/created-events";
import { discoverEvents } from "@/data/discovery";
import { events } from "@/data/events";

export const eventCategories = ["Todos", "MÚSICA", "CULTURA", "FESTIVAL", "NEGÓCIOS"];

export function useEventSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  const [created, setCreated] = useState([]);
  useEffect(() => setCreated(loadCreatedEvents()), []);

  const filteredEvents = discoverEvents([...created, ...events], query, category);

  return {
    query,
    setQuery,
    category,
    setCategory,
    filteredEvents,
  };
}
