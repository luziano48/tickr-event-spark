import test from "node:test";
import assert from "node:assert/strict";
import { discoverEvents, matchesSearch } from "./discovery.js";

test("Tickr official profile never appears in event discovery", () => {
  const rows = [{ id: "festival-luanda", title: "Tickr" }, { id: "official", kind: "official" }, { id: "ninho-live", title: "Ninho Live" }];
  assert.deepEqual(discoverEvents(rows).map((item) => item.id), ["ninho-live"]);
});
test("Discovery searches event location and selected category together", () => {
  const rows = [{ id: "a", title: "Semba", city: "Luanda", category: "CULTURA" }, { id: "b", city: "Luanda", category: "MÚSICA" }];
  assert.deepEqual(discoverEvents(rows, "luanda", "CULTURA").map((item) => item.id), ["a"]);
});
test("People and suppliers search matches accented names and services", () => {
  assert.equal(matchesSearch("fotografa", "Ana Souza", "Fotógrafa"), true);
  assert.equal(matchesSearch("decoradora", "DJ Kapiro", "DJ e animação musical"), false);
});
