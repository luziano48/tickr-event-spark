import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { preferencesApi } from "@/lib/api/preferences";
export const Route = createFileRoute("/definicoes")({ component: Settings });
function Settings() {
  const [theme, setTheme] = useState(
    () => typeof localStorage !== "undefined" && localStorage.getItem("tickr-theme") === "dark",
  );
  const [notice] = useState(false);
  function updateTheme(value) {
    setTheme(value);
    localStorage.setItem("tickr-theme", value ? "dark" : "light");
  }
  async function updateNotice(value) {
    try {
      await preferencesApi.update({ notifications: value });
    } catch (error) {
      window.alert(error.message);
    }
  }
  return (
    <Screen nav={false}>
      <header className="flex items-center gap-3 px-4 py-5">
        <Link
          to="/"
          aria-label="Voltar"
          className="grid size-10 place-items-center rounded-full bg-surface"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-bold">Definições</h1>
      </header>
      <main className="space-y-4 px-4 pb-10">
        <section className="rounded-2xl bg-card p-4">
          <h2 className="font-bold">Idioma</h2>
          <select
            aria-label="Idioma"
            className="mt-3 w-full rounded-xl border border-border bg-background p-3"
          >
            <option value="pt">Português (idioma disponível)</option>
          </select>
          <p className="mt-2 text-xs text-muted-foreground">
            A aplicação ainda não tem sistema de traduções.
          </p>
        </section>
        <section className="rounded-2xl bg-card p-4">
          <h2 className="font-bold">Notificações</h2>
          <label className="mt-3 flex items-center justify-between gap-4 text-sm">
            <span>Preferência visual de notificações</span>
            <input
              type="checkbox"
              checked={notice}
              onChange={(e) => updateNotice(e.target.checked)}
              className="size-5 accent-primary"
            />
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            As preferências de notificações dependem do backend, ainda não ligado. Não há envio
            activo por email, SMS ou push.
          </p>
        </section>
        <section className="rounded-2xl bg-card p-4">
          <h2 className="font-bold">Tema</h2>
          <label className="mt-3 flex items-center justify-between gap-4 text-sm">
            <span>Tema escuro (resto da aplicação permanece claro nesta versão)</span>
            <input
              type="checkbox"
              checked={theme}
              onChange={(e) => updateTheme(e.target.checked)}
              className="size-5 accent-primary"
            />
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            A preferência fica guardada localmente; a interface ainda não fornece tokens escuros
            completos.
          </p>
        </section>
        <section className="rounded-2xl bg-card p-4">
          <h2 className="font-bold">Palavra-passe</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A alteração de palavra-passe não está disponível no mock local. A recuperação também
            requer backend e não envia email.
          </p>
          <Link
            to="/login"
            className="mt-3 inline-block rounded-full border border-border px-4 py-2 text-sm font-bold"
          >
            Abrir fluxo de recuperação
          </Link>
        </section>
      </main>
    </Screen>
  );
}
