import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Pencil, ShieldCheck, Sparkles, Star, Trash2 } from "lucide-react";
import { MAX_TEXT, SELF_AUTHOR, formatDate } from "@/data/community";
import { useReviews } from "@/hooks/use-community";

// Avaliações por estrelas com texto: média, quantidade, ordenação e uma
// avaliação por utilizador. Em eventos, só participantes com ingresso avaliam.
export function Reviews({
  target,
  title = "Avaliações",
  requireTicket = null,
  buyTo = null,
  tone = "bg-card",
}) {
  const { reviews, summary, myReview, locked, save, remove } = useReviews(target, {
    requireTicket,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("recentes");

  const openForm = (review) => {
    setFormOpen(true);
    setStars(review ? review.stars : 0);
    setText(review ? review.text : "");
    setError("");
  };
  const closeForm = () => setFormOpen(false);

  const submit = () => {
    if (!stars) {
      setError("Escolha de 1 a 5 estrelas.");
      return;
    }
    save(stars, text);
    closeForm();
  };

  return (
    <section aria-label={title} className={`rounded-3xl ${tone} p-4`}>
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Star className="size-4 text-primary" />
          <h2 className="text-sm font-bold">{title}</h2>
        </div>
        {summary.count > 1 && (
          <div className="flex gap-1">
            {[
              ["recentes", "Recentes"],
              ["estrelas", "Melhor nota"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSortBy(id)}
                aria-pressed={sortBy === id}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${sortBy === id ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {locked ? (
        <div className="mt-4 rounded-2xl bg-surface-2 p-4 text-center">
          <ShieldCheck className="mx-auto size-6 text-primary" />
          <p className="mt-2 text-xs font-bold">Avaliação de participantes</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Só quem já tem ingresso válido pode avaliar este evento. Assim as notas refletem quem
            viveu a experiência.
          </p>
          {buyTo && (
            <Link
              to="/evento/$id"
              params={{ id: buyTo }}
              className="grad-primary glow mt-3 inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              Comprar ingresso <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      ) : (
        <>
          {myReview ? (
            <div className="mt-4 rounded-2xl bg-primary/10 p-3">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-bold">
                  <Sparkles className="size-3.5 text-primary" /> A sua avaliação
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openForm(myReview)}
                    aria-label="Editar a minha avaliação"
                    className="grid size-7 place-items-center rounded-full bg-card text-primary"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Remover a sua avaliação?")) remove();
                    }}
                    aria-label="Remover a minha avaliação"
                    className="grid size-7 place-items-center rounded-full bg-card text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Stars value={myReview.stars} />
                <span className="text-sm font-extrabold text-primary">{myReview.stars},0</span>
              </div>
              {myReview.text && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {myReview.text}
                </p>
              )}
              <p className="mt-1 text-[10px] text-muted-foreground">
                {formatDate(myReview.date)}
                {myReview.updatedAt && myReview.updatedAt !== myReview.date
                  ? ` · editada em ${formatDate(myReview.updatedAt)}`
                  : ""}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openForm(null)}
              className="mt-4 w-full rounded-2xl border border-dashed border-primary/40 p-4 text-center transition-colors hover:bg-primary/5"
            >
              <Star className="mx-auto size-5 text-primary" />
              <p className="mt-2 text-xs font-bold">Partilhe a sua experiência</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Dê estrelas e escreva o que achou.
              </p>
            </button>
          )}

          {summary.count > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-surface-2 px-3 py-2.5">
              <span className="text-lg font-extrabold tabular-nums">
                {summary.average.toLocaleString("pt-PT", { minimumFractionDigits: 1 })}
              </span>
              <Stars value={Math.round(summary.average)} />
              <span className="ml-auto text-[10px] text-muted-foreground">
                {summary.count} avaliação{summary.count > 1 ? "ões" : ""}
              </span>
            </div>
          )}

          <ul className="mt-4 space-y-3">
            {reviews.map((review) => (
              <li
                key={`${review.author}-${review.date}`}
                className="rounded-2xl bg-surface-2/60 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-info-soft text-[10px] font-bold text-info">
                    {review.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-xs font-bold">
                      {review.author}
                      {review.author === SELF_AUTHOR && (
                        <span className="rounded-full bg-primary/15 px-1.5 py-px text-[9px] font-bold text-primary">
                          VOCÊ
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(review.date)}</p>
                  </div>
                  <Stars value={review.stars} />
                </div>
                {review.text && (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {review.text}
                  </p>
                )}
              </li>
            ))}
            {reviews.length === 0 && (
              <li className="rounded-2xl bg-surface-2 p-3 text-center text-[11px] text-muted-foreground">
                Ainda sem avaliações. As notas aqui são sempre de avaliações reais.
              </li>
            )}
          </ul>

          {formOpen && (
            <div className="mt-4 rounded-2xl bg-surface-2 p-3">
              <p className="text-xs font-bold">
                {myReview ? "Editar a sua avaliação" : "Nova avaliação"}
              </p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Dar ${n} estrela${n > 1 ? "s" : ""}`}
                    onClick={() => {
                      setStars(n);
                      setError("");
                    }}
                    className="transition-transform active:scale-75"
                  >
                    <Star
                      className={`size-7 ${n <= stars ? "fill-primary text-primary" : "text-border"}`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                aria-label="O que considerou positivo ou negativo"
                rows={3}
                maxLength={MAX_TEXT}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="O que foi positivo? E o que pode melhorar? (opcional)"
                className="mt-3 w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
              />
              {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={submit}
                  className="grad-primary glow flex-1 rounded-full py-2.5 text-xs font-bold text-primary-foreground"
                >
                  {myReview ? "Atualizar avaliação" : "Publicar avaliação"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full bg-card px-4 py-2.5 text-xs font-bold text-muted-foreground"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function Stars({ value, className = "size-3.5" }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Avaliação ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${className} ${star <= Math.round(value) ? "fill-primary text-primary" : "text-border"}`}
        />
      ))}
    </span>
  );
}
