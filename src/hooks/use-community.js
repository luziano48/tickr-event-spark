import { useCallback, useEffect, useState } from "react";
import {
  addComment,
  commentCount,
  commentsFor,
  deleteComment,
  editComment,
  emptyStore,
  readStore,
  removeReview,
  reportComment,
  reviewsFor,
  reviewsSummary,
  saveReview,
  writeStore,
} from "@/data/community";
import { hasMyPurchase } from "@/data/purchases";

const EVENT = "tickr-community";

export function notifyCommunityChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

function useCommunityStore() {
  const [store, setStore] = useState(emptyStore);
  useEffect(() => {
    setStore(readStore());
    const onChange = () => setStore(readStore());
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);
  const update = useCallback((mutate) => {
    const next = mutate(readStore());
    writeStore(next);
    setStore(next);
    notifyCommunityChange();
  }, []);
  return { store, update };
}

export function useComments(target) {
  const { store, update } = useCommunityStore();
  return {
    comments: commentsFor(store, target),
    count: commentCount(store, target),
    add: (text, parentId) => update((s) => addComment(s, target, text, parentId)),
    edit: (id, text) => update((s) => editComment(s, target, id, text)),
    remove: (id) => update((s) => deleteComment(s, target, id)),
    report: (id) => update((s) => reportComment(s, id)),
  };
}

export function useReviews(target, { requireTicket = null } = {}) {
  const { store, update } = useCommunityStore();
  const locked = requireTicket ? !hasMyPurchase(requireTicket) : false;
  return {
    reviews: reviewsFor(store, target),
    summary: reviewsSummary(store, target),
    myReview: store.reviews[target] || null,
    locked,
    save: (stars, text) => update((s) => saveReview(s, target, stars, text)),
    remove: () => update((s) => removeReview(s, target)),
  };
}
