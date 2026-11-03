import test from "node:test";
import assert from "node:assert/strict";
import {
  addComment,
  commentsFor,
  commentCount,
  deleteComment,
  editComment,
  emptyStore,
  MAX_TEXT,
  reportComment,
  reviewsFor,
  reviewsSummary,
  saveReview,
  seedComments,
} from "./community.js";

test("comentários: publica, responde e mostra autor e data", () => {
  let store = emptyStore();
  store = addComment(store, "evento:ninho-live", "Que espectáculo!");
  const [root] = commentsFor(store, "evento:ninho-live").filter(
    (comment) => comment.author === "Você",
  );
  assert.equal(root.author, "Você");
  assert.equal(root.parentId, null);
  assert.ok(root.date);

  store = addComment(store, "evento:ninho-live", "Concordo!", root.id);
  const reply = commentsFor(store, "evento:ninho-live").find(
    (comment) => comment.parentId === root.id,
  );
  assert.equal(reply.text, "Concordo!");
});

test("comentários: edita e apaga os próprios comentários, incluindo respostas", () => {
  let store = emptyStore();
  store = addComment(store, "evento:ninho-live", "Primeiro texto");
  const root = commentsFor(store, "evento:ninho-live").find((comment) => comment.author === "Você");
  store = addComment(store, "evento:ninho-live", "Resposta", root.id);
  store = editComment(store, "evento:ninho-live", root.id, "Texto corrigido");
  const edited = commentsFor(store, "evento:ninho-live").find((comment) => comment.id === root.id);
  assert.equal(edited.text, "Texto corrigido");
  assert.equal(edited.edited, true);

  store = deleteComment(store, "evento:ninho-live", root.id);
  assert.equal(
    commentsFor(store, "evento:ninho-live").some((comment) => comment.id === root.id),
    false,
  );
});

test("comentários: limita o texto ao máximo definido", () => {
  const store = addComment(emptyStore(), "evento:ninho-live", "a".repeat(MAX_TEXT + 50));
  const own = commentsFor(store, "evento:ninho-live").find((comment) => comment.author === "Você");
  assert.equal(own.text.length, MAX_TEXT);
});

test("comentários: denúncia esconde o comentário da listagem e da contagem", () => {
  let store = addComment(emptyStore(), "evento:ninho-live", "Spam");
  const own = commentsFor(store, "evento:ninho-live").find((comment) => comment.author === "Você");
  store = reportComment(store, own.id);
  assert.equal(
    commentsFor(store, "evento:ninho-live").find((comment) => comment.id === own.id).reported,
    true,
  );
  assert.equal(commentCount(store, "evento:ninho-live"), seedComments["evento:ninho-live"].length);
});

test("comentários: mantém sementes de demonstração em alvos sem comentários próprios", () => {
  const store = emptyStore();
  assert.ok(commentCount(store, "evento:ninho-live") > 0);
  assert.equal(commentCount(store, "conteudo:inexistente"), 0);
  assert.ok(seedComments["evento:ninho-live"].length > 0);
});

test("avaliações: submeter de novo atualiza a única avaliação do utilizador", () => {
  let store = emptyStore();
  store = saveReview(store, "evento:ninho-live", 5, "Adorei!");
  store = saveReview(store, "evento:ninho-live", 3, "Poderia melhorar");
  const list = reviewsFor(store, "evento:ninho-live");
  assert.equal(list.length, 1);
  assert.equal(list[0].stars, 3);
  assert.equal(list[0].text, "Poderia melhorar");
});

test("avaliações: calcula média e quantidade sem inventar avaliações", () => {
  const store = emptyStore();
  assert.deepEqual(reviewsSummary(store, "evento:ninho-live"), { average: 0, count: 0 });
  const reviewed = saveReview(store, "evento:ninho-live", 4, "Bom");
  assert.deepEqual(reviewsSummary(reviewed, "evento:ninho-live"), { average: 4, count: 1 });
});

test("avaliações: rejeita estrelas fora de 1 a 5", () => {
  const store = emptyStore();
  assert.equal(saveReview(store, "alvo", 0, ""), store);
  assert.equal(saveReview(store, "alvo", 6, ""), store);
  assert.equal(saveReview(store, "alvo", 2.5, ""), store);
  assert.equal(reviewsFor(saveReview(store, "alvo", 5, ""), "alvo").length, 1);
});

test("avaliações: ordenação por estrelas inclui a nota existente em primeiro lugar", () => {
  const store = saveReview(emptyStore(), "alvo", 2, "");
  assert.equal(reviewsFor(store, "alvo", "estrelas")[0].stars, 2);
});
