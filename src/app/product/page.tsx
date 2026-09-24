import Link from "next/link";
import { ArrowUpRight, CalendarDays, FolderKanban, ListChecks, Sparkles } from "lucide-react";
import { MarketingChrome } from "@/components/marketing/MarketingChrome";

export default function ProductPage() {
  return (
    <MarketingChrome>
      <section className="border-b border-white/10" aria-labelledby="product-hero-title">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-32 lg:px-10 lg:pt-40">
          <p className="text-sm text-zinc-500">Il prodotto</p>
          <h1 id="product-hero-title" className="mt-8 max-w-5xl text-6xl font-semibold leading-[0.92] tracking-[-0.075em] text-white sm:text-8xl">Tutto il lavoro del team, connesso.</h1>
          <p className="mt-10 max-w-3xl text-xl leading-8 text-zinc-400 sm:text-2xl sm:leading-9">Chrono offre un posto comune per pianificare il lavoro, seguire l'avanzamento, gestire le attività e mantenere il contesto vicino alle decisioni. Ogni area è utile da sola. Insieme formano un sistema che il team può usare ogni giorno.</p>
        </div>
      </section>

      <section className="border-b border-white/10" aria-labelledby="product-capabilities-title">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
          <h2 id="product-capabilities-title" className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.06em] text-white sm:text-6xl">Dai forma al lavoro prima che diventi urgenza.</h2>
          <div className="mt-20 grid border-y border-white/10 md:grid-cols-2">
            <article id="projects" className="scroll-mt-24 border-b border-white/10 p-7 md:border-r md:p-10"><FolderKanban className="h-6 w-6 text-zinc-300" /><h3 className="mt-12 text-2xl font-medium text-white">Progetti</h3><p className="mt-5 max-w-md text-base leading-7 text-zinc-500">Definisci l'obiettivo, assegna un responsabile e raccogli milestone, aggiornamenti e attività in un contesto che tutti possono consultare.</p><ul className="mt-8 grid gap-3 text-sm text-zinc-300"><li>Stato e priorità condivisi</li><li>Milestone con date e responsabili</li><li>Aggiornamenti collegati al progetto</li></ul></article>
            <article id="issues" className="scroll-mt-24 border-b border-white/10 p-7 md:border-b-0 md:p-10"><ListChecks className="h-6 w-6 text-zinc-300" /><h3 className="mt-12 text-2xl font-medium text-white">Issue e backlog</h3><p className="mt-5 max-w-md text-base leading-7 text-zinc-500">Trasforma richieste e problemi in attività assegnabili. Il backlog resta ordinato per stato, priorità, team e progetto, senza perdere il motivo per cui il lavoro esiste.</p><ul className="mt-8 grid gap-3 text-sm text-zinc-300"><li>Stati e priorità personalizzabili</li><li>Assegnatari, scadenze e ricorrenze</li><li>Tag, filtri e viste personali</li></ul></article>
            <article id="timeline" className="scroll-mt-24 border-b border-white/10 p-7 md:border-r md:border-b-0 md:p-10"><CalendarDays className="h-6 w-6 text-zinc-300" /><h3 className="mt-12 text-2xl font-medium text-white">Timeline</h3><p className="mt-5 max-w-md text-base leading-7 text-zinc-500">Rendi leggibili date, dipendenze e carico di lavoro. La timeline permette di vedere il percorso completo senza trasformare ogni progetto in una riunione.</p><ul className="mt-8 grid gap-3 text-sm text-zinc-300"><li>Scadenze e date obiettivo</li><li>Milestone in sequenza</li><li>Vista temporale del lavoro attivo</li></ul></article>
            <article id="agent" className="scroll-mt-24 p-7 md:p-10"><Sparkles className="h-6 w-6 text-zinc-300" /><h3 className="mt-12 text-2xl font-medium text-white">Chrono Agent</h3><p className="mt-5 max-w-md text-base leading-7 text-zinc-500">L'agente lavora sul contesto del workspace per aiutare a scomporre richieste, trovare informazioni e preparare il prossimo passo.</p><ul className="mt-8 grid gap-3 text-sm text-zinc-300"><li>Domande sul lavoro esistente</li><li>Supporto alla pianificazione</li><li>Creazione guidata di attività</li></ul></article>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10" aria-labelledby="product-cta-title"><div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:px-10"><h2 id="product-cta-title" className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.06em] text-white sm:text-6xl">Il contesto non dovrebbe vivere in cinque strumenti diversi.</h2><Link href="/login" className="mt-10 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-200">Apri Chrono <ArrowUpRight className="h-4 w-4" /></Link></div></section>
    </MarketingChrome>
  );
}
