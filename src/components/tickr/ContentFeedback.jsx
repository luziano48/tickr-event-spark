import { useEffect, useMemo, useState } from "react";
import { Flag, MessageCircle, Pencil, Send, Star, Trash2, X } from "lucide-react";

const ACTOR_KEY = "tickr-feedback-actor-v1";
const FEEDBACK_KEY = "tickr-event-feedback-v1";
const COOLDOWN_MS = 8000;

function getActorId() {
  try {
    let id = window.localStorage.getItem(ACTOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(ACTOR_KEY, id);
    }
    return id;
  } catch {
    return "visitante-local";
  }
}

function loadStore() {
  try {
    const value = JSON.parse(window.localStorage.getItem(FEEDBACK_KEY) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function RatingStars({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} ${star === 1 ? "estrela" : "estrelas"}`}
          onClick={() => onChange(star)}
        >
          <Star
            className={`size-6 ${star <= value ? "fill-primary text-primary" : "text-border"}`}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ContentFeedback({
  contentId,
  contentType = "event",
  allowRatings = true,
  allowComments = true,
}) {
  const ratingTarget = contentType === "profile" ? "perfil" : "evento";
  const storeKey = `${contentType}:${contentId}`;
  const [actorId] = useState(() =>
    typeof window === "undefined" ? "visitante-local" : getActorId(),
  );
  const [feedback, setFeedback] = useState({ comments: [], ratings: [] });
  const [comment, setComment] = useState("");
  const [ratingText, setRatingText] = useState("");
  const [ratingValue, setRatingValue] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [sort, setSort] = useState("recentes");
  const [notice, setNotice] = useState("");
  const [lastPostAt, setLastPostAt] = useState(0);

  useEffect(() => {
    const store = loadStore();
    setFeedback(store[storeKey] || { comments: [], ratings: [] });
  }, [storeKey]);

  const save = (next) => {
    setFeedback(next);
    try {
      const store = loadStore();
      window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify({ ...store, [storeKey]: next }));
    } catch {
      setNotice("Não foi possível guardar neste dispositivo.");
    }
  };

  const canPost = () => {
    if (Date.now() - lastPostAt < COOLDOWN_MS) {
      setNotice("Aguarde alguns segundos antes de publicar novamente.");
      return false;
    }
    return true;
  };

  const submitComment = (event) => {
    event.preventDefault();
    const text = comment.trim();
    if (text.length < 2 || text.length > 1000 || !canPost()) return;
    const now = new Date().toISOString();
    const entry = {
      id: crypto.randomUUID(),
      parentId: replyTo,
      authorId: actorId,
      author: "Utilizador",
      text,
      createdAt: now,
      updatedAt: now,
      reports: [],
    };
    save({ ...feedback, comments: [...feedback.comments, entry] });
    setComment("");
    setReplyTo(null);
    setLastPostAt(Date.now());
    setNotice("Comentário publicado.");
  };

  const submitRating = (event) => {
    event.preventDefault();
    const text = ratingText.trim();
    if (!ratingValue) {
      setNotice("Escolha uma classificação de 1 a 5 estrelas.");
      return;
    }
    if (text.length < 3 || text.length > 1000) {
      setNotice("Descreva a sua experiência (3 a 1000 caracteres).");
      return;
    }
    if (!canPost()) return;
    const now = new Date().toISOString();
    const existing = feedback.ratings.find((item) => item.authorId === actorId);
    const entry = {
      id: existing?.id || crypto.randomUUID(),
      authorId: actorId,
      author: "Utilizador",
      rating: ratingValue,
      text,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      reports: existing?.reports || [],
    };
    save({
      ...feedback,
      ratings: existing
        ? feedback.ratings.map((item) => (item.id === existing.id ? entry : item))
        : [...feedback.ratings, entry],
    });
    setRatingText("");
    setLastPostAt(Date.now());
    setNotice(existing ? "A sua avaliação foi atualizada." : "Avaliação publicada.");
  };

  const removeComment = (id) => {
    const removed = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const item of feedback.comments)
        if (removed.has(item.parentId) && !removed.has(item.id)) {
          removed.add(item.id);
          changed = true;
        }
    }
    save({ ...feedback, comments: feedback.comments.filter((item) => !removed.has(item.id)) });
  };

  const report = (kind, id, entry) => {
    if (entry.reports.includes(actorId)) {
      setNotice("Já denunciou este conteúdo.");
      return;
    }
    const updated = { ...entry, reports: [...entry.reports, actorId] };
    save({ ...feedback, [kind]: feedback[kind].map((item) => (item.id === id ? updated : item)) });
    setNotice("Denúncia registada neste dispositivo.");
  };

  const average = feedback.ratings.length
    ? feedback.ratings.reduce((sum, item) => sum + item.rating, 0) / feedback.ratings.length
    : null;
  const ownRating = feedback.ratings.find((item) => item.authorId === actorId);
  const sortedRatings = useMemo(
    () =>
      [...feedback.ratings].sort((a, b) =>
        sort === "recentes"
          ? b.createdAt.localeCompare(a.createdAt)
          : b.rating - a.rating || b.createdAt.localeCompare(a.createdAt),
      ),
    [feedback.ratings, sort],
  );
  const comments = feedback.comments.filter((item) => !item.parentId);

  return (
    <section
      className="mt-8 space-y-7"
      aria-label={
        allowRatings && allowComments
          ? "Comentários e avaliações"
          : allowRatings
            ? "Avaliações"
            : "Comentários"
      }
    >
      {allowRatings && (
        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Avaliações do {ratingTarget}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {contentType === "profile"
                  ? "Deixe uma classificação e explique a sua opinião."
                  : "A classificação inclui o seu comentário sobre a experiência."}
              </p>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-1 text-xl font-extrabold">
                {average === null ? "—" : average.toFixed(1)}
                <Star
                  className={`size-4 ${average === null ? "text-muted-foreground" : "fill-primary text-primary"}`}
                />
              </p>
              <p className="text-[10px] text-muted-foreground">
                {feedback.ratings.length}{" "}
                {feedback.ratings.length === 1 ? "avaliação" : "avaliações"}
              </p>
            </div>
          </div>
          <form onSubmit={submitRating} className="mt-4 rounded-2xl bg-card p-4">
            <p className="text-sm font-semibold">
              {ownRating
                ? "Atualize a sua avaliação"
                : contentType === "profile"
                  ? "O que acha deste perfil?"
                  : "Como foi a sua experiência?"}
            </p>
            <div className="mt-3">
              <RatingStars
                value={ratingValue || ownRating?.rating || 0}
                onChange={setRatingValue}
                label={`Classificação do ${ratingTarget}`}
              />
            </div>
            <textarea
              value={ratingText}
              onChange={(e) => setRatingText(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder={
                ownRating
                  ? "Escreva a avaliação atualizada…"
                  : contentType === "profile"
                    ? "Escreva o que aprecia ou o que pode melhorar…"
                    : "Conte o que correu bem ou poderia melhorar…"
              }
              className="mt-3 w-full resize-y rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary/60"
            />
            <button
              type="submit"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"
            >
              <Star className="size-4" />
              {ownRating
                ? "Atualizar avaliação"
                : contentType === "profile"
                  ? "Avaliar perfil"
                  : "Publicar avaliação"}
            </button>
          </form>
          <label className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
            Ordenar
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-border bg-card px-2 py-1.5 text-foreground"
            >
              <option value="recentes">Mais recentes</option>
              <option value="classificacao">Classificação</option>
            </select>
          </label>
          {sortedRatings.length ? (
            <ul className="mt-3 space-y-3">
              {sortedRatings.map((item) => (
                <li key={item.id} className="rounded-2xl bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold">
                      {item.author}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {formatDate(item.createdAt)}
                      </span>
                    </p>
                    <span className="flex items-center gap-1 text-xs font-bold">
                      {item.rating}
                      <Star className="size-3.5 fill-primary text-primary" />
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  <div className="mt-3 flex gap-3">
                    {item.authorId === actorId && (
                      <button
                        type="button"
                        onClick={() => {
                          setRatingValue(item.rating);
                          setRatingText(item.text);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-primary"
                      >
                        <Pencil className="size-3" />
                        Editar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => report("ratings", item.id, item)}
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
                    >
                      <Flag className="size-3" />
                      Denunciar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl bg-surface-2 p-4 text-center text-xs text-muted-foreground">
              Ainda não há avaliações para este {ratingTarget}.
            </p>
          )}
        </section>
      )}

      {allowComments && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MessageCircle className="size-5 text-primary" />
            Comentários{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {feedback.comments.length}
            </span>
          </h2>
          <form onSubmit={submitComment} className="mt-3 rounded-2xl bg-card p-3">
            {replyTo && (
              <p className="mb-2 flex items-center justify-between text-xs text-primary">
                A responder a um comentário{" "}
                <button
                  type="button"
                  aria-label="Cancelar resposta"
                  onClick={() => setReplyTo(null)}
                >
                  <X className="size-4" />
                </button>
              </p>
            )}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="Partilhe a sua opinião…"
              className="w-full resize-y bg-transparent p-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                <Send className="size-3.5" />
                Publicar
              </button>
            </div>
          </form>
          {comments.length ? (
            <ul className="mt-3 space-y-3">
              {comments.map((item) => (
                <CommentThread
                  key={item.id}
                  item={item}
                  all={feedback.comments}
                  actorId={actorId}
                  editing={editing}
                  setEditing={setEditing}
                  setReplyTo={setReplyTo}
                  onDelete={removeComment}
                  onReport={(entry) => report("comments", entry.id, entry)}
                  onSave={(id, text) =>
                    save({
                      ...feedback,
                      comments: feedback.comments.map((commentItem) =>
                        commentItem.id === id
                          ? {
                              ...commentItem,
                              text: text.trim(),
                              updatedAt: new Date().toISOString(),
                            }
                          : commentItem,
                      ),
                    })
                  }
                />
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl bg-surface-2 p-4 text-center text-xs text-muted-foreground">
              Seja o primeiro a comentar.
            </p>
          )}
        </section>
      )}
      {notice && (
        <p role="status" className="text-xs text-muted-foreground">
          {notice}
        </p>
      )}
    </section>
  );
}

function CommentThread({
  item,
  all,
  actorId,
  editing,
  setEditing,
  setReplyTo,
  onDelete,
  onReport,
  onSave,
  depth = 0,
}) {
  const [draft, setDraft] = useState(item.text);
  const replies = all.filter((entry) => entry.parentId === item.id);
  return (
    <li className={`rounded-2xl bg-card p-3 ${depth ? "ml-4 border-l-2 border-primary/20" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold">
          {item.author}{" "}
          <span className="font-normal text-muted-foreground">
            · {formatDate(item.createdAt)}
            {item.updatedAt !== item.createdAt ? " · editado" : ""}
          </span>
        </p>
      </div>
      {editing === item.id ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={1000}
            className="mt-2 w-full rounded-xl border border-border bg-background p-2 text-sm"
          />
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => {
                if (draft.trim().length >= 2) onSave(item.id, draft);
                setEditing(null);
              }}
              className="text-xs font-bold text-primary"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="text-xs text-muted-foreground"
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {item.text}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-3">
        {depth < 2 && (
          <button
            type="button"
            onClick={() => setReplyTo(item.id)}
            className="text-[11px] text-primary"
          >
            Responder
          </button>
        )}
        {item.authorId === actorId && (
          <>
            <button
              type="button"
              onClick={() => {
                setDraft(item.text);
                setEditing(item.id);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
            >
              <Pencil className="size-3" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="inline-flex items-center gap-1 text-[11px] text-destructive"
            >
              <Trash2 className="size-3" />
              Eliminar
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => onReport(item)}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
        >
          <Flag className="size-3" />
          Denunciar
        </button>
      </div>
      {replies.length > 0 && (
        <ul className="mt-3 space-y-2">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              item={reply}
              all={all}
              actorId={actorId}
              editing={editing}
              setEditing={setEditing}
              setReplyTo={setReplyTo}
              onDelete={onDelete}
              onReport={onReport}
              onSave={onSave}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
