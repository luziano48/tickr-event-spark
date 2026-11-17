import { redirect } from "@tanstack/react-router";
import { authApi } from "@/lib/api/auth";

export async function requireAuthenticated() {
  try {
    const { user } = await authApi.session();
    if (user) return;
  } catch (error) {
    if (!(error instanceof Error) || !error.message.startsWith("Supabase não está configurado.")) {
      throw error;
    }
  }
  throw redirect({ href: "/login?required=1" });
}
