import { useCallback, useEffect, useState } from "react";
import { authApi } from "@/lib/api/auth";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ status: "loading", user: null, error: null });
  const setUser = useCallback(
    (nextUser) =>
      setSession((current) => {
        const user = typeof nextUser === "function" ? nextUser(current.user) : nextUser;
        return { status: user ? "authenticated" : "anonymous", user, error: null };
      }),
    [],
  );

  useEffect(() => {
    let active = true;
    authApi
      .session()
      .then(({ user }) => {
        if (active) setSession({ status: user ? "authenticated" : "anonymous", user, error: null });
      })
      .catch((error) => {
        if (active) setSession({ status: "error", user: null, error });
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...session,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
