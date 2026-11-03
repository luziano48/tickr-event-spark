import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, X, CalendarDays, BriefcaseBusiness, ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { Dialog } from "@radix-ui/react-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Screen } from "@/components/tickr/Screen";
import { EventCard } from "@/components/tickr/EventCard";
import { TickrSpotlight } from "@/components/tickr/TickrSpotlight";
import { Button } from "@/components/ui/button";
import { eventCategories, useEventSearch } from "@/hooks/use-event-search";
import { suppliers } from "@/data/create-event";
import { matchesSearch } from "@/data/discovery";
import { ContentFeedback } from "@/components/tickr/ContentFeedback";

export const Route = createFileRoute("/explorar")({
  head: () => ({ meta: [
    { title: "Explorar eventos e fornecedores | Tickr" },
    { name: "description", content: "Encontre eventos e descubra fornecedores para as suas experiências na Tickr." },
    { property: "og:title", content: "Descubra a comunidade Tickr" },
    { property: "og:description", content: "Eventos e serviços num só ponto de encontro." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Explorar,
});
const sections = [{ id: "Tudo", icon: Search }, { id: "Eventos", icon: CalendarDays }, { id: "Fornecedores", icon: BriefcaseBusiness }];

function Explorar() {
  const { query, setQuery, category, setCategory, filteredEvents } = useEventSearch();
  const [section, setSection] = useState("Tudo");
  const [supplier, setSupplier] = useState(null);
  const services = suppliers.filter((s) => matchesSearch(query, s.name, s.service, s.neighborhood));
  const all = section === "Tudo";
  const noResults = section === "Eventos" ? !filteredEvents.length : section === "Fornecedores" ? !services.length : !filteredEvents.length && !services.length;
  return (
    <Screen>
      <header className="px-4 pt-6">
        <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase text-primary">O seu universo Tickr</p><h1 className="mt-1 text-2xl font-extrabold">Explorar</h1></div><span className="grid size-10 place-items-center rounded-full bg-success-soft text-primary"><Search className="size-5" /></span></div>
        <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-3 focus-within:border-primary">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input aria-label="Pesquisar no Explorar" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Eventos, serviços…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          {query && <Button aria-label="Limpar pesquisa" onClick={() => setQuery("")} className="size-6 text-muted-foreground"><X className="size-4" /></Button>}
        </div>
        <div role="tablist" aria-label="Descobrir" className="mt-4 grid grid-cols-3 border-b border-border">
          {sections.map(({ id, icon: Icon }) => <Button role="tab" aria-selected={section === id} key={id} onClick={() => setSection(id)} className={`min-w-0 flex-col gap-1 border-b-2 px-0 py-3 text-[10px] ${section === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}><Icon className="size-4" />{id}</Button>)}
        </div>
      </header>

      {all && !query && <TickrSpotlight />}
      <main className="space-y-7 px-4 pt-5">
        {(all || section === "Eventos") && (filteredEvents.length > 0 || section === "Eventos") && <section aria-label="Eventos">
          <SectionHeading title={query ? "Eventos encontrados" : "Eventos para viver"} count={filteredEvents.length} all={all} onClick={() => setSection("Eventos")} />
          {section === "Eventos" && <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">{eventCategories.map((option) => <Button key={option} aria-pressed={category === option} onClick={() => setCategory(option)} className={`shrink-0 rounded-full px-3 py-2 text-[11px] ${category === option ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"}`}>{option === "Todos" ? "Todas as categorias" : option.charAt(0) + option.slice(1).toLowerCase()}</Button>)}</div>}
          <div className="grid grid-cols-2 gap-3">{(all && !query ? filteredEvents.slice(0, 2) : filteredEvents).map((event) => <EventCard key={event.id} event={event} />)}</div>
        </section>}
        {(all || section === "Fornecedores") && services.length > 0 && <section aria-label="Fornecedores">
          <SectionHeading title="Quem faz acontecer" count={services.length} all={all} onClick={() => setSection("Fornecedores")} />
          <div className="space-y-3">{(all && !query ? services.slice(0, 2) : services).map((s) => <article key={s.name} className="flex gap-3 rounded-lg border border-border bg-card p-3">
            <img src={s.image} alt={s.service} loading="lazy" className="size-20 shrink-0 rounded-md object-cover" />
            <div className="min-w-0 flex-1"><h3 className="text-sm font-bold">{s.name}</h3><p className="mt-1 text-xs text-muted-foreground">{s.service}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="size-3" />{s.neighborhood}</p><Button onClick={() => setSupplier(s)} className="mt-2 text-xs text-primary">Ver fornecedor <ArrowRight className="size-3" /></Button></div>
          </article>)}</div>
        </section>}
        {noResults && <div className="py-12 text-center"><Search className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-4 text-base font-bold">Sem resultados por aqui</h2><p className="mt-2 text-sm text-muted-foreground">Experimente outro nome, local ou serviço.</p><Button onClick={() => { setQuery(""); setCategory("Todos"); }} className="mt-4 text-sm text-primary">Limpar filtros</Button></div>}
        {!all && !query && <div className="-mx-4"><TickrSpotlight /></div>}
      </main>
      <Dialog open={Boolean(supplier)} onOpenChange={(open) => { if (!open) setSupplier(null); }}>
        <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/40" /><DialogPrimitive.Content className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[90vh] max-w-sm -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-background shadow-xl focus:outline-none">
          {supplier && <><img src={supplier.image} alt={supplier.service} className="h-40 w-full object-cover" /><div className="p-5"><p className="text-[10px] font-bold uppercase text-primary">Fornecedor</p><DialogPrimitive.Title className="mt-1 text-xl font-bold">{supplier.name}</DialogPrimitive.Title><DialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">{supplier.service} · {supplier.neighborhood}</DialogPrimitive.Description><p className="mt-4 flex items-center gap-2 text-xs text-primary"><BriefcaseBusiness className="size-4" />{supplier.availability}</p><p className="mt-4 text-xs text-muted-foreground">Contacto direto ainda não disponibilizado.</p><Button asChild className="mt-4 w-full rounded-full bg-primary py-3 text-sm text-primary-foreground"><Link to="/mensagens"><MessageCircle className="size-4" />Abrir as minhas mensagens</Link></Button><ContentFeedback contentId={supplier.name.toLowerCase().replaceAll(" ", "-")} contentType="supplier" allowRatings={false} /></div></>}
          <DialogPrimitive.Close asChild><Button aria-label="Fechar fornecedor" className="absolute right-3 top-3 size-8 rounded-full bg-card"><X className="size-4" /></Button></DialogPrimitive.Close>
        </DialogPrimitive.Content></DialogPrimitive.Portal>
      </Dialog>
    </Screen>
  );
}
function SectionHeading({ title, count, all, onClick }) {
  return <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-base font-bold">{title}<span className="ml-2 text-xs font-normal text-muted-foreground">{count}</span></h2>{all && <Button onClick={onClick} aria-label={`Ver todos: ${title}`} className="shrink-0 text-[11px] text-primary">Ver todos <ArrowRight className="size-3" /></Button>}</div>;
}
