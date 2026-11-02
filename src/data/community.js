// Motor da comunidade Tickr: comentários e avaliações por conteúdo.
// Tudo é guardado no aparelho (localStorage) — os comentários sementes são
// conteúdo de demonstração e as avaliações NUNCA são inventadas.

export const SELF_AUTHOR = "Você";
export const MAX_TEXT = 500;

const STORAGE_KEY = "tickr-community-v1";

const EMPTY_STORE = { comments: {}, reviews: {}, reported: {} };

export function emptyStore() {
  return { comments: {}, reviews: {}, reported: {} };
}

export function readStore() {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    return {
      comments: parsed.comments || {},
      reviews: parsed.reviews || {},
      reported: parsed.reported || {},
    };
  } catch {
    return emptyStore();
  }
}

export function writeStore(store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* armazenamento indisponível */
  }
}

function initialsOf(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || "T") + (parts[1]?.[0] || "")).toUpperCase();
}

// ----- Comentários -----

export function addComment(store, target, text, parentId = null, author = SELF_AUTHOR) {
  const clean = String(text).trim().slice(0, MAX_TEXT);
  if (!clean) return store;
  const list = store.comments[target] || [];
  const comment = {
    id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    author,
    initials: initialsOf(author),
    date: new Date().toISOString(),
    text: clean,
    parentId: parentId || null,
  };
  return { ...store, comments: { ...store.comments, [target]: [...list, comment] } };
}

export function editComment(store, target, id, text) {
  const clean = String(text).trim().slice(0, MAX_TEXT);
  if (!clean) return store;
  const list = (store.comments[target] || []).map((c) =>
    c.id === id ? { ...c, text: clean, edited: true } : c,
  );
  return { ...store, comments: { ...store.comments, [target]: list } };
}

export function deleteComment(store, target, id) {
  const list = (store.comments[target] || []).filter(
    (c) => c.id !== id && c.parentId !== id,
  );
  return { ...store, comments: { ...store.comments, [target]: list } };
}

export function reportComment(store, id) {
  return { ...store, reported: { ...store.reported, [id]: true } };
}

// Junta os comentários guardados no aparelho com os sementes de demonstração.
export function commentsFor(store, target) {
  const seeds = (seedComments[target] || []).map((c) => ({ ...c }));
  const own = (store.comments[target] || []).map((c) => ({ ...c }));
  const all = [...own, ...seeds].sort((a, b) => a.date.localeCompare(b.date));
  return all.map((c) => ({ ...c, reported: Boolean(store.reported[c.id]) }));
}

export function commentCount(store, target) {
  return commentsFor(store, target).filter((c) => !c.reported).length;
}

// ----- Avaliações -----

// Uma avaliação por utilizador para o mesmo conteúdo: submeter de novo edita a existente.
export function saveReview(store, target, stars, text) {
  const n = Number(stars);
  if (!Number.isInteger(n) || n < 1 || n > 5) return store;
  const review = {
    stars: n,
    text: String(text || "").trim().slice(0, MAX_TEXT),
    author: SELF_AUTHOR,
    initials: initialsOf(SELF_AUTHOR),
    date: store.reviews[target]?.date || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { ...store, reviews: { ...store.reviews, [target]: review } };
}

export function removeReview(store, target) {
  const reviews = { ...store.reviews };
  delete reviews[target];
  return { ...store, reviews };
}

export function reviewsFor(store, target, sortBy = "recentes") {
  const mine = store.reviews[target] ? [{ ...store.reviews[target], reported: false }] : [];
  if (sortBy === "estrelas") return [...mine].sort((a, b) => b.stars - a.stars);
  return mine;
}

export function reviewsSummary(store, target) {
  const list = reviewsFor(store, target);
  if (!list.length) return { average: 0, count: 0 };
  const sum = list.reduce((acc, r) => acc + r.stars, 0);
  return { average: Math.round((sum / list.length) * 10) / 10, count: list.length };
}

// ----- Datas -----

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days} dia${days > 1 ? "s" : ""}`;
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

// ----- Sementes de demonstração (comentários apenas; avaliações nunca) -----

export const seedComments = {
  "evento:ninho-live": [
    {
      id: "seed-ninho-1",
      author: "Marta Caculo",
      initials: "MC",
      date: "2026-10-30T14:20:00.000Z",
      text: "Já garanti o meu ingresso! Alguém sabe se há transporte do centro?",
      parentId: null,
    },
    {
      id: "seed-ninho-1r",
      author: "Tickr Eventos",
      initials: "TE",
      date: "2026-10-30T15:02:00.000Z",
      text: "Olá Marta! Para já o transporte não está incluído, mas pode confirmar diretamente com o organizador por WhatsApp.",
      parentId: "seed-ninho-1",
    },
    {
      id: "seed-ninho-2",
      author: "Pedro N'Gola",
      initials: "PN",
      date: "2026-10-29T19:05:00.000Z",
      text: "A edição passada foi incrível. Recomendo chegar cedo para pegar bons lugares.",
      parentId: null,
    },
  ],
  "evento:semba-raizes": [
    {
      id: "seed-semba-1",
      author: "Ana Souza",
      initials: "AS",
      date: "2026-10-27T10:40:00.000Z",
      text: "Adorei a ideia de juntar mestres e novas vozes no mesmo palco. Vou com a família toda.",
      parentId: null,
    },
  ],
  "evento:afro-beats-night": [
    {
      id: "seed-afro-1",
      author: "Rafael Costa",
      initials: "RC",
      date: "2026-10-31T22:12:00.000Z",
      text: "Os DJs residentes são um espetáculo à parte. Entrada a partir de que idade?",
      parentId: null,
    },
  ],
  "evento:tech-summit": [
    {
      id: "seed-tech-1",
      author: "Telma Sousa",
      initials: "TS",
      date: "2026-10-28T08:15:00.000Z",
      text: "Vou levar a equipa toda. Os workshops do último dia valiam o bilhete sozinhos.",
      parentId: null,
    },
  ],
  "tickr:COMUNIDADE": [
    {
      id: "seed-tickr-1",
      author: "Marta Caculo",
      initials: "MC",
      date: "2026-10-29T12:00:00.000Z",
      text: "Adorei o Explorar! Já encontrei duas fornecedoras para o meu casamento.",
      parentId: null,
    },
  ],
  "tickr:PARA ORGANIZADORES": [
    {
      id: "seed-tickr-2",
      author: "Pedro N'Gola",
      initials: "PN",
      date: "2026-10-30T09:30:00.000Z",
      text: "Criei o meu primeiro evento em 10 minutos. As etapas são muito claras.",
      parentId: null,
    },
  ],
  "fornecedor:Telma Sousa": [
    {
      id: "seed-forn-1",
      author: "Marta Caculo",
      initials: "MC",
      date: "2026-10-26T17:45:00.000Z",
      text: "Trabalhou na decoração do nosso evento em Talatona. Ficou lindo!",
      parentId: null,
    },
  ],
};
