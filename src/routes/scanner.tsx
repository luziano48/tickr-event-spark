import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, RotateCw, Settings, X } from "lucide-react";
import { useState } from "react";
import { Screen } from "@/components/tickr/Screen";
import { Logo } from "@/components/tickr/Logo";
import { QrCode } from "@/components/tickr/QrCode";
import festival from "@/assets/festival.jpg";

export const Route = createFileRoute("/scanner")({
  head: () => ({
    meta: [
      { title: "Validar entradas | Tickr" },
      {
        name: "description",
        content: "Leia o QR Code do ingresso e valide a entrada dos participantes.",
      },
      { property: "og:title", content: "Validar entradas | Tickr" },
      {
        property: "og:description",
        content: "Leia o QR Code do ingresso e valide a entrada na Tickr.",
      },
    ],
  }),
  component: Scanner,
});

function Scanner() {
  const [validated, setValidated] = useState(true);

  return (
    <Screen nav={false}>
      <div className="relative min-h-screen">
        <img
          src={festival}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-background/70" />

        <div className="relative flex min-h-screen flex-col px-4 pt-5 pb-8">
          <header className="flex items-center justify-between">
            <Logo className="text-2xl" />
            <div className="flex items-center gap-3">
              <Settings className="size-5" />
              <Link to="/perfil" aria-label="Fechar">
                <X className="size-5" />
              </Link>
            </div>
          </header>

          <div className="mt-12 flex flex-col items-center">
            <div className="relative grid size-64 place-items-center">
              {["top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl",
                "top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl",
                "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl",
                "bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl",
              ].map((c) => (
                <span key={c} className={`absolute size-16 border-primary ${c}`} />
              ))}
              <QrCode value="TKR-7F3A9B2C" className="size-36 rounded-lg" />
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Aponte a câmera para o QR Code
              <br />
              do ingresso
            </p>
          </div>

          <div className="mt-auto">
            {validated ? (
              <div className="rounded-3xl border border-primary/40 bg-card/80 p-6 text-center backdrop-blur">
                <CheckCircle2 className="mx-auto size-10 text-primary" />
                <p className="mt-3 text-lg font-extrabold text-primary">Entrada validada!</p>
                <p className="text-xs text-muted-foreground">Bem-vindo ao evento!</p>
                <button
                  onClick={() => setValidated(false)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-primary/50 py-3 text-sm font-semibold text-primary"
                >
                  <RotateCw className="size-4" /> Escanear novamente
                </button>
              </div>
            ) : (
              <button
                onClick={() => setValidated(true)}
                className="grad-primary glow flex w-full items-center justify-center rounded-full py-4 text-sm font-bold text-primary-foreground"
              >
                Ler ingresso
              </button>
            )}
          </div>
        </div>
      </div>
    </Screen>
  );
}
