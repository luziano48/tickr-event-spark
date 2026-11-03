import { useState } from "react";
import { CornerDownRight, Flag, MessageCircle, Pencil, Send, Trash2, X } from "lucide-react";
import { MAX_TEXT, SELF_AUTHOR, formatDate } from "@/data/community";
import { useComments } from "@/hooks/use-community";

// Fio de comentários reutilizável: publicar, responder, editar, apagar e denunciar.
export function Comments({
  target,
  title = "Comentários",
  placeholder = "Escreva um comentário…",
}) {
  const { comments, count, add, edit, remove, report } = useComments(target);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const roots = comments.filter((c) => !c.parentId);
  const repliesOf = (id) => comments.filter((c) => c.parentId === id);
  const sendReply = () => {
    if (!draft.trim()) return;
    add(draft, replyTo);
    setDraft("");
    setReplyTo(null);
  };

  return (
    <section aria-label={title} className="rounded-3xl bg-card p-4">
      <header className="flex items-center gap-2">
        <MessageCircle className="size-4 text-primary" />
        <h2 className="text-sm font-bold">{title}</h2>
        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
          {count}
        </span>
      </header>

      <ul className="mt-4 space-y-4">
        {roots.map((comment) => (
          <li key={comment.id}>
            {comment.reported ? (
              <p className="flex items-center gap-2 rounded-2xl bg-surface-2 px-3 py-2.5 text-[11px] text-muted-foreground">
                <Flag className="size-3.5 shrink-0 text-warning" />
                Comentário denunciado · em análise pela moderação
              </p>
            ) : (
              <>
                <CommentBody
                  comment={comment}
                  onReply={() => {
                    setReplyTo(comment.id);
                    setDraft("");
                  }}
                  onEditSave={(id, text) => edit(id, text)}
                  onDelete={() => {
                    if (window.confirm("Apagar o seu comentário?")) remove(comment.id);
                  }}
                  onReport={() => {
                    if (window.confirm("Denunciar este comentário para a moderação?"))
                      report(comment.id);
                  }}
                />
                {repliesOf(comment.id).length > 0 && (
                  <ul className="mt-3 space-y-3 border-l-2 border-border pl-3">
                    {repliesOf(comment.id).map((reply) =>
                      reply.reported ? (
                        <li key={reply.id} className="text-[10px] text-muted-foreground">
                          Comentário denunciado · em análise
                        </li>
                      ) : (
                        <li key={reply.id}>
                          <CommentBody
                            comment={reply}
                            compact
                            onEditSave={(id, text) => edit(id, text)}
                            onDelete={() => {
                              if (window.confirm("Apagar o seu comentário?")) remove(reply.id);
                            }}
                            onReport={() => {
                              if (window.confirm("Denunciar este comentário para a moderação?"))
                                report(reply.id);
                            }}
                          />
                        </li>
                      ),
                    )}
                  </ul>
                )}
                {replyTo === comment.id && (
                  <div className="mt-3 flex items-start gap-2">
                    <CornerDownRight className="mt-2.5 size-3.5 shrink-0 text-muted-foreground" />
                    <textarea
                      aria-label={`Responder a ${comment.author}`}
                      rows={2}
                      maxLength={MAX_TEXT}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={`Responder a ${comment.author}…`}
                      className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
                    />
                    <button
                      type="button"
                      onClick={sendReply}
                      aria-label="Publicar resposta"
                      className="grad-primary mt-1 grid size-9 shrink-0 place-items-center rounded-full text-primary-foreground"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
        {count === 0 && (
          <li className="rounded-2xl bg-surface-2 p-3 text-center text-[11px] text-muted-foreground">
            Seja o primeiro a comentar.
          </li>
        )}
      </ul>

      <div className="mt-4 flex items-start gap-2">
        <textarea
          aria-label={replyTo ? "Escrever resposta" : "Escrever comentário"}
          rows={2}
          maxLength={MAX_TEXT}
          value={replyTo ? "" : draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={replyTo ? "Escreva a resposta acima…" : placeholder}
          className="w-full flex-1 resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
        />
        <button
          type="button"
          onClick={() => {
            if (!replyTo && draft.trim()) {
              add(draft);
              setDraft("");
            }
          }}
          disabled={Boolean(replyTo) || !draft.trim()}
          aria-label="Publicar comentário"
          className="grad-primary glow mt-1 grid size-9 shrink-0 place-items-center rounded-full text-primary-foreground disabled:opacity-40"
        >
          <Send className="size-4" />
        </button>
      </div>
    </section>
  );
}

function CommentBody({ comment, compact = false, onReply, onEditSave, onDelete, onReport }) {
  const own = comment.author === SELF_AUTHOR;
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.text);
  return (
    <article
      className={compact ? "rounded-xl bg-surface-2/60 p-2.5" : "rounded-2xl bg-surface-2/60 p-3"}
    >
      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success-soft text-[10px] font-bold text-primary">
          {comment.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-xs font-bold">
            {comment.author}
            {own && (
              <span className="rounded-full bg-primary/15 px-1.5 py-px text-[9px] font-bold text-primary">
                VOCÊ
              </span>
            )}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {formatDate(comment.date)}
            {comment.edited ? " · editado" : ""}
          </p>
        </div>
      </div>
      {editing ? (
        <EditComposer
          value={text}
          onChange={setText}
          onSave={() => {
            onEditSave?.(comment.id, text);
            setEditing(false);
          }}
          onCancel={() => {
            setText(comment.text);
            setEditing(false);
          }}
        />
      ) : (
        <>
          {comment.text && (
            <p className="mt-2 text-xs leading-relaxed text-foreground/90">{comment.text}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-[10px] font-bold">
            {onReply && !replying && (
              <button
                type="button"
                onClick={() => {
                  onReply();
                  setReplying(true);
                }}
                className="text-primary"
              >
                Responder
              </button>
            )}
            {own && onEditSave && !comment.edited && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-muted-foreground"
              >
                Editar
              </button>
            )}
            {own && onDelete && (
              <button type="button" onClick={onDelete} className="text-destructive">
                Apagar
              </button>
            )}
            {!own && onReport && (
              <button
                type="button"
                onClick={onReport}
                aria-label="Denunciar comentário"
                className="ml-auto flex items-center gap-1 text-muted-foreground"
              >
                <Flag className="size-3" /> Denunciar
              </button>
            )}
          </div>
        </>
      )}
    </article>
  );
}

// Composer de edição inline partilhado (exportado para uso interno).
export function EditComposer({ value, onChange, onSave, onCancel }) {
  return (
    <div className="mt-2">
      <textarea
        aria-label="Editar comentário"
        rows={2}
        maxLength={MAX_TEXT}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary/60"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className="grad-primary rounded-full px-3 py-1.5 text-[11px] font-bold text-primary-foreground"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancelar edição"
          className="grid size-7 place-items-center rounded-full bg-card text-muted-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export { Pencil, Pencil as EditIcon };
