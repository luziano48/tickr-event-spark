import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Megaphone, BookOpen, LifeBuoy, CalendarPlus, Ticket, QrCode } from "lucide-react";
import { Screen } from "@/components/tickr/Screen";
import { Button } from "@/components/ui/button";
import cover from "@/assets/tick perfil.PNG";
import { eventSteps } from "@/data/tickr-profile";

export const Route = createFileRoute("/tickr")({
  head: () => ({ meta: [
    { title: "Tickr Oficial — Novidades e guias da comunidade" },
    { name: "description", content: "O espaço oficial e verificado da Tickr: anúncios, novidades e passos para criar as suas experiências." },
    { property: "og:title", content: "Tickr Oficial — O ponto de encontro da comunidade" },
    { property: "og:description", content: "Conheça a Tickr, acompanhe os anúncios e descubra como organizar o seu evento." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: TickrOfficial,
});
const tabs = [{ name: "Novidades", icon: Megaphone }, { name: "Como funciona", icon: BookOpen }, { name: "Ajuda", icon: LifeBuoy }];
const updates = [
  { tag: "COMUNIDADE", title: "As melhores experiências começam com uma conexão.", text: "Conheça pessoas e encontre serviços para dar vida ao seu próximo evento no Explorar.", to: "/explorar", action: "Descobrir a comunidade", icon: Megaphone, tone: "bg-info-soft text-info" },
  { tag: "PARA ORGANIZADORES", title: "A sua ideia merece sair do papel.", text: "Reúna os detalhes, escolha a imagem e prepare os seus ingressos num só lugar.", to: "/criar", action: "Criar uma experiência", icon: CalendarPlus, tone: "bg-success-soft text-primary" },
];
function TickrOfficial() {
  const [tab, setTab] = useState("Novidades");
  return <Screen>
    <header className="flex items-center justify-between px-4 py-5"><Button asChild className="size-9 rounded-full bg-surface-2"><Link to="/explorar" aria-label="Voltar ao Explorar"><ArrowLeft className="size-4" /></Link></Button><span className="flex items-center gap-1 text-[11px] font-bold text-primary"><BadgeCheck className="size-4" /> PERFIL OFICIAL</span></header>
    <img src={cover} alt="Tickr, eventos e comunidade em Angola" className="aspect-[2/1] w-full object-cover" />
    <main>
      <section className="border-b border-border px-5 pb-5 pt-5"><div className="flex items-center gap-2"><h1 className="text-3xl font-extrabold">Tickr</h1><BadgeCheck className="size-6 text-primary" /><span className="ml-auto rounded-full bg-success-soft px-3 py-1 text-[10px] font-bold text-primary">VERIFICADO</span></div><p className="mt-1 text-xs text-muted-foreground">@tickr · Angola</p><h2 className="mt-4 text-xl font-bold">Onde as experiências se encontram.</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Eventos, pessoas e ideias que nos aproximam. Este é o espaço oficial de novidades e guias da Tickr.</p><Button asChild className="mt-5 w-full rounded-full bg-primary py-3 text-sm text-primary-foreground"><Link to="/criar">Criar o meu evento <ArrowRight className="size-4" /></Link></Button></section>
      <div role="tablist" aria-label="Conteúdos oficiais" className="mx-4 grid grid-cols-3 border-b border-border">{tabs.map(({ name, icon: Icon }) => <Button key={name} role="tab" aria-selected={tab === name} onClick={() => setTab(name)} className={`gap-1 border-b-2 px-0 py-4 text-[11px] ${tab === name ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}><Icon className="size-3.5" />{name}</Button>)}</div>
      <div className="px-4 py-5">
        {tab === "Novidades" && <section aria-label="Anúncios oficiais" className="space-y-4"><div><p className="text-[10px] font-bold uppercase text-primary">Direto da Tickr</p><h2 className="mt-1 text-lg font-bold">O que está a acontecer</h2></div>{updates.map((post) => <article key={post.tag} className="rounded-lg border border-border bg-card p-4"><div className="flex items-center gap-2"><span className={`grid size-8 place-items-center rounded-full ${post.tone}`}><post.icon className="size-4" /></span><span className="text-[10px] font-bold text-muted-foreground">{post.tag}</span></div><h3 className="mt-4 text-lg font-bold leading-snug">{post.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.text}</p><Button asChild className="mt-4 text-xs text-primary"><Link to={post.to}>{post.action}<ArrowRight className="size-3.5" /></Link></Button></article>)}</section>}
        {tab === "Como funciona" && <section aria-label="Como funciona a Tickr"><p className="text-[10px] font-bold uppercase text-primary">Da ideia à experiência</p><h2 className="mt-1 text-xl font-bold">O seu próximo passo</h2><ol className="mt-5 space-y-0">{eventSteps.map((step, i) => { const Icon = [CalendarPlus, Ticket, QrCode][i]; return <li key={step.number} className="relative flex gap-4 pb-7"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-success-soft text-primary"><Icon className="size-5" /></span><div><p className="text-[10px] font-bold text-primary">PASSO {step.number}</p><h3 className="mt-1 text-sm font-bold">{step.title}</h3><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.text}</p></div></li>; })}</ol><Button asChild className="w-full rounded-full bg-primary py-3 text-sm text-primary-foreground"><Link to="/criar">Começar agora <ArrowRight className="size-4" /></Link></Button></section>}
        {tab === "Ajuda" && <section aria-label="Ajuda Tickr"><h2 className="text-xl font-bold">Vamos simplificar.</h2><div className="mt-4 divide-y divide-border">{[{ q: "Como criar um evento?", a: "Abra Criar e preencha as etapas de informações, data e local, ingressos e detalhes. Reveja os dados antes de concluir." }, { q: "Onde encontro os meus ingressos?", a: "A página Meus ingressos reúne os seus bilhetes e o respetivo QR Code." }, { q: "Como encontro fornecedores e conexões?", a: "No Explorar, selecione Conexões ou Fornecedores e pesquise por nome ou serviço." }].map((faq) => <details key={faq.q} className="py-4"><summary className="cursor-pointer text-sm font-semibold">{faq.q}</summary><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{faq.a}</p></details>)}</div><Button asChild className="mt-5 w-full rounded-full bg-surface-2 py-3 text-sm text-primary"><Link to="/ingressos"><Ticket className="size-4" />Meus ingressos</Link></Button></section>}
      </div>
    </main>
  </Screen>;
}
