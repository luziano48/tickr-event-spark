import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/tickr/Screen";
export const Route = createFileRoute("/termos")({
  component: () => <Legal title="Termos e condições" />,
});
function Legal({ title }) {
  return (
    <Screen nav={false}>
      <main className="space-y-5 px-5 py-8">
        <Link to="/" className="text-sm font-semibold text-primary">
          ← Voltar
        </Link>
        <p className="rounded-xl bg-warning-soft p-3 text-xs font-extrabold text-warning">
          PLACEHOLDER — REQUER REVISÃO LEGAL ANTES DA PUBLICAÇÃO
        </p>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <section>
          <h2 className="font-bold">Âmbito</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Este texto é provisório e não constitui aconselhamento jurídico. As condições de
            utilização da Tickr devem ser elaboradas e revistas por assessoria jurídica antes da
            publicação.
          </p>
        </section>
        <section>
          <h2 className="font-bold">Utilização da plataforma</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            PLACEHOLDER: definir responsabilidades dos utilizadores, organizadores, prestadores e
            plataforma.
          </p>
        </section>
      </main>
    </Screen>
  );
}
