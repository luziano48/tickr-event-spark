import { request } from "@/lib/api/client";

// Persist only after the backend endpoint is implemented. Theme can remain a client display preference.
export const preferencesApi = {
  get: () => request("/account/preferences"),
  update: (preferences) => request("/account/preferences", { method: "PUT", body: preferences }),
};
