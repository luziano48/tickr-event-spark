import { createServerClient } from "@supabase/ssr";
import { deleteCookie, getCookies, getRequestUrl, setCookie } from "@tanstack/react-start/server";

export function createSupabaseServerClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase não está configurado. Define VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.",
    );
  }

  const secure = getRequestUrl().protocol === "https:";
  const cookieDefaults = { httpOnly: true, secure, sameSite: "lax", path: "/" };

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOptions = { ...options, ...cookieDefaults };
          if (value) setCookie(name, value, cookieOptions);
          else deleteCookie(name, cookieOptions);
        });
      },
    },
  });
}
