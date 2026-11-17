import { createServerClient } from "@supabase/ssr";
import { deleteCookie, getCookies, getRequestUrl, setCookie } from "@tanstack/react-start/server";

export function createSupabaseServerClient() {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const configuredUrl = import.meta.env.VITE_SUPABASE_URL;
  const url = isValidSupabaseUrl(configuredUrl)
    ? configuredUrl
    : projectId
      ? `https://${projectId}.supabase.co`
      : configuredUrl;
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

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

function isValidSupabaseUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}
