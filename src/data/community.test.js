import { describe, expect, it } from "vitest";
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
} from "./community";

describe("comentários da comunidade", () => {
  it("publica, responde e mostra autor e data", () => {
    let store = emptyStore();
    store = addComment(store, "evento:ninho-live", "Que espectáculo!");
    const [root] = commentsFor(store, "evento:ninho-live");
    expect(root.author).toBe("Você");
    expect(root.parentId).toBeNull();
    expect(root.date).toBeTruthy();

    store = addComment(store, "evento:ninho-live", "Concordo!", root.id);
    const thread = commentsFor(store, "evento:ninho-live");
    const reply = thread.find((c) => c.parentId === root.id);
    expect(reply.text).toBe("Concordo!");
  });

  it("edita e apaga os próprios comentários, incluindo respostas", () => {
    let store = emptyStore();
    store = addComment(store, "evento:ninho-live", "Primeiro texto");
    store = addComment(
      store,
      "evento:ninho-live",
      "Resposta",
      commentsFor(store, "evento:ninho-live")[0].id,
    );
    const [root] = commentsFor(store, "evento:ninho-live");
    store = editComment(store, "evento:ninho-live", root.id, "Texto corrigido");
    expect(commentsFor(store, "evento:ninho-live")[0].text).toBe("Texto corrigido");
    expect(commentsFor(store, "evento:ninho-live")[0].edited).toBe(true);

    store = deleteComment(store, "evento:ninho-live", root.id);
    expect(commentsFor(store, "evento:ninho-live")).toHaveLength(0);
  });

  it("limita o texto ao máximo definido", () => {
    let store = emptyStore();
    store = addComment(store, "evento:ninho-live", "a".repeat(MAX_TEXT + 50));
    expect(commentsFor(store, "evento:ninho-live")[0].text).toHaveLength(MAX_TEXT);
  });

  it("denúncia esconde o comentário da listagem e da contagem", () => {
    let store = emptyStore();
    store = addComment(store, "evento:ninho-live", "Spam");
    const [root] = commentsFor(store, "evento:ninho-live");
    store = reportComment(store, root.id);
    expect(commentsFor(store, "evento:ninho-live")[0].reported).toBe(true);
    expect(commentCount(store, "evento:ninho-live")).toBe(0);
  });

  it("mantém os sementes de demonstração em alvos sem comentários próprios", () => {
    const store = emptyStore();
    expect(commentCount(store, "evento:ninho-live")).toBeGreaterThan(0);
    expect(commentCount(store, "conteudo:inexistente")).toBe(0);
    expect(seedComments["evento:ninho-live"].length).toBeGreaterThan(0);
  });
});

describe("avaliações por estrelas", () => {
  it("uma avaliação por utilizador: submeter de novo edita, não duplica", () => {
    let store = emptyStore();
    store = saveReview(store, "evento:ninho-live", 5, "Adorei!");
    store = saveReview(store, "evento:ninho-live", 3, "Poderia melhorar");
    const list = reviewsFor(store, "evento:ninho-live");
    expect(list).toHaveLength(1);
    expect(list[0].stars).toBe(3);
    expect(list[0].text).toBe("Poderia melhorar");
  });

  it("calcula média e quantidade a partir de avaliações reais", () => {
    const store = emptyStore();
    expect(reviewsSummary(store, "evento:ninho-live")).toEqual({ average: 0, count: 0 });
    const com = saveReview(store, "evento:ninho-live", 4, "Bom");
    expect(reviewsSummary(com, "evento:ninho-live")).toEqual({ average: 4, count: 1 });
  });

  it("rejeita estrelas fora de 1 a 5", () => {
    const store = emptyStore();
    expect(saveReview(store, "alvo", 0, "")).toBe(store);
    expect(saveReview(store, "alvo", 6, "")).toBe(store);
    expect(saveReview(store, "alvo", 2.5, "")).toBe(store);
    expect(reviewsFor(saveReview(store, "alvo", 5, ""), "alvo")).toHaveLength(1);
  });

  it("ordenar por estrelas coloca a classificação mais alta primeiro", () => {
    let store = emptyStore();
    store = saveReview(store, "alvo", 2, "");
    expect(reviewsFor(store, "alvo", "estrelas")[0].stars).toBe(2);
  });
});
