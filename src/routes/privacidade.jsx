import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen } from "@/components/tickr/Screen";
export const Route = createFileRoute("/privacidade")({
  component: () => (
    <Screen nav={false}>
      <main className="space-y-5 px-5 py-8">
        <Link to="/" className="text-sm font-semibold text-primary">
          ← Voltar
        </Link>
        <p className="rounded-xl bg-warning-soft p-3 text-xs font-extrabold text-warning">
          PLACEHOLDER — REQUER REVISÃO LEGAL ANTES DA PUBLICAÇÃO
        </p>
        <h1 className="text-2xl font-extrabold">Política de privacidade</h1>
        <section>
          <h2 className="font-bold">Informação provisória</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Este documento não está juridicamente validado. A Tickr deve confirmar as categorias de
            dados recolhidos, finalidades, bases legais, retenção, destinatários, direitos dos
            titulares e contacto responsável antes da publicação.
          </p>
        </section>
        <section>
          <h2 className="font-bold">Dados e utilização</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            PLACEHOLDER: descrever práticas reais de tratamento de dados após confirmação da
            implementação.
          </p>
        </section>
      </main>
    </Screen>
  ),
});
