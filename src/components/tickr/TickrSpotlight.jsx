import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import cover from "@/assets/tick perfil.PNG";

export function TickrSpotlight() {
  return (
    <section aria-label="Destaque oficial da Tickr" className="mx-4 my-5 overflow-hidden rounded-lg border border-border bg-card">
      <Link to="/tickr" className="block transition-opacity hover:opacity-90">
        <div className="relative">
          <img src={cover} alt="Identidade Tickr e experiências em Angola" className="aspect-[2.5/1] w-full object-cover" />
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-card/95 px-2 py-1 text-[10px] font-bold text-primary"><BadgeCheck className="size-3" /> TICKR OFICIAL</span>
        </div>
        <div className="flex items-center justify-between gap-3 p-4">
          <div><p className="text-[10px] font-semibold uppercase text-muted-foreground">O ponto de encontro da comunidade</p><h2 className="mt-1 text-base font-bold">Mais do que um ingresso.</h2><p className="mt-1 text-xs text-muted-foreground">Novidades, anúncios e o seu próximo passo.</p></div>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-success-soft text-primary"><ArrowUpRight className="size-4" /></span>
        </div>
      </Link>
    </section>
  );
}
