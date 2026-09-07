import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Calendar, Clock, MoreHorizontal, QrCode } from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { Logo } from "@/components/tickr/Logo";
import { QrCode as QrPattern } from "@/components/tickr/QrCode";
import { getEvent } from "@/data/events";

export const Route = createFileRoute("/ingressos")({
  head: () => ({
    meta: [
      { title: "Meus ingressos | Tickr" },
      {
        name: "description",
        content: "Aceda aos seus ingressos com QR Code e apresente-os na entrada do evento.",
      },
      { property: "og:title", content: "Meus ingressos | Tickr" },
      {
        property: "og:description",
        content: "Aceda aos seus ingressos com QR Code na Tickr.",
      },
    ],
  }),
  component: Ingressos,
});

function Ingressos() {
  const event = getEvent("ninho-live")!;
  const code = "TKR-7F3A9B2C";

  return (
    <Screen>
      <header className="flex items-center justify-between px-4 pt-5 pb-4">
        <Logo className="text-2xl" />
        <MoreHorizontal className="size-5" />
      </header>

      <div className="px-4">
        <div className="overflow-hidden rounded-3xl bg-card">
          <div className="relative">
            <img
              src={event.image}
              alt={event.title}
              loading="lazy"
              className="h-36 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h1 className="text-lg font-bold">{event.title}</h1>
              <p className="text-xs text-muted-foreground">
                {event.venue} · {event.city}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 pb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" /> {event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" /> {event.time}
            </span>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 font-bold text-primary">
              VIP
            </span>
          </div>

          <div className="m-3 rounded-2xl bg-white p-5 text-center">
            <QrPattern value={code} className="mx-auto size-48" />
            <p className="mt-3 font-mono text-sm font-semibold text-neutral-800">{code}</p>
            <p className="mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <BadgeCheck className="size-4" /> Válido
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
              Apresente este QR Code na entrada do evento. O código é único e não pode ser
              reutilizado.
            </p>
          </div>
        </div>

        <Link
          to="/scanner"
          className="mt-4 flex items-center justify-center gap-2 rounded-full border border-primary/40 py-3 text-sm font-semibold text-primary"
        >
          <QrCode className="size-4" /> Modo organizador · validar entradas
        </Link>
      </div>
    </Screen>
  );
}
