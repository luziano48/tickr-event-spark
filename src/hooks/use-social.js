import { useEffect, useState } from "react";

const KEY = "tickr-social";
export const suggestedPeople = [
  { id: "p1", name: "Marta Caculo", role: "Produtora", initials: "MC", mutual: 12 },
  { id: "p2", name: "Pedro N'Gola", role: "DJ", initials: "PN", mutual: 8 },
  { id: "p3", name: "Ana Souza", role: "Fotógrafa", initials: "AS", mutual: 5 },
  { id: "p4", name: "Rafael Costa", role: "Som & Luz", initials: "RC", mutual: 3 },
];

const BASE = { connections: 1280, ratingSum: 4.8 * 126, ratingCount: 126 };
const initial = { connected: false, myStars: 0, people: {} };

export function useSocial() {
  const [state, setState] = useState(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {}
  }, []);
  const save = (next) => {
    setState(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };
  const peopleConnected = Object.values(state.people).filter(Boolean).length;
  const connections = BASE.connections + (state.connected ? 1 : 0) + peopleConnected;
  const count = BASE.ratingCount + (state.myStars ? 1 : 0);
  const rating = (BASE.ratingSum + state.myStars) / count;
  return {
    ...state,
    connections,
    rating,
    ratingCount: count,
    toggleConnect: () => save({ ...state, connected: !state.connected }),
    rate: (n) => save({ ...state, myStars: state.myStars === n ? 0 : n }),
    togglePerson: (id) => save({ ...state, people: { ...state.people, [id]: !state.people[id] } }),
  };
}
