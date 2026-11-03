import { useCallback, useEffect, useState } from "react";

const ACTOR_KEY = "tickr-event-star-actor-v1";
const STARS_KEY = "tickr-event-stars-v1";
const CHANGE_EVENT = "tickr:event-stars-changed";

function getActorId() {
  try {
    let actorId = window.localStorage.getItem(ACTOR_KEY);
    if (!actorId) {
      actorId = crypto.randomUUID();
      window.localStorage.setItem(ACTOR_KEY, actorId);
    }
    return actorId;
  } catch {
    return "local-visitor";
  }
}

function readStars() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STARS_KEY) || "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

export function eventStarCount(starsByEvent, eventId) {
  const voters = starsByEvent[eventId];
  return Array.isArray(voters) ? voters.length : 0;
}

export function actorStarredEvent(starsByEvent, eventId, actorId) {
  const voters = starsByEvent[eventId];
  return Boolean(actorId && Array.isArray(voters) && voters.includes(actorId));
}

export function toggleActorEventStar(starsByEvent, eventId, actorId) {
  if (!eventId || !actorId) return starsByEvent;
  const voters = Array.isArray(starsByEvent[eventId]) ? starsByEvent[eventId] : [];
  const nextVoters = voters.includes(actorId)
    ? voters.filter((id) => id !== actorId)
    : [...voters, actorId];
  return { ...starsByEvent, [eventId]: nextVoters };
}

export function useEventStars() {
  const [actorId, setActorId] = useState("");
  const [starsByEvent, setStarsByEvent] = useState({});

  useEffect(() => {
    const actor = getActorId();
    const refresh = () => {
      setActorId(actor);
      setStarsByEvent(readStars());
    };
    refresh();
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const toggleStar = useCallback(
    (eventId) => {
      if (!actorId || !eventId) return;
      const current = readStars();
      const next = toggleActorEventStar(current, eventId, actorId);
      try {
        window.localStorage.setItem(STARS_KEY, JSON.stringify(next));
      } catch {
        return;
      }
      setStarsByEvent(next);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [actorId],
  );

  const starCount = useCallback(
    (eventId) => {
      return eventStarCount(starsByEvent, eventId);
    },
    [starsByEvent],
  );

  const hasStarred = useCallback(
    (eventId) => {
      return actorStarredEvent(starsByEvent, eventId, actorId);
    },
    [actorId, starsByEvent],
  );

  return { starsByEvent, starCount, hasStarred, toggleStar };
}
