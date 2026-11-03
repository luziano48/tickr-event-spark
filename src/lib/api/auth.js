import { request } from "@/lib/api/client";

// Backend contract: session cookies are HttpOnly/Secure/SameSite; passwords never return to the client.
export const authApi = {
  session: () => request("/auth/session"),
  signIn: (credentials) => request("/auth/login", { method: "POST", body: credentials }),
  signUp: (account) => request("/auth/register", { method: "POST", body: account }),
  signOut: () => request("/auth/logout", { method: "POST" }),
  recoverPassword: (email) =>
    request("/auth/password/recovery", { method: "POST", body: { email } }),
  updatePassword: (password) => request("/auth/password", { method: "PUT", body: { password } }),
};
