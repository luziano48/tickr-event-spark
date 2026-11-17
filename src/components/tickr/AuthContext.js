import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

export function useAuthSession() {
  const session = useContext(AuthContext);
  if (!session) throw new Error("useAuthSession deve ser usado dentro de AuthProvider.");
  return session;
}
