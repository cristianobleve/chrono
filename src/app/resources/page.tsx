import Link from "next/link";
import { ArrowUpRight, BookOpen, ExternalLink, LifeBuoy, Settings2 } from "lucide-react";
import { MarketingChrome } from "@/components/marketing/MarketingChrome";

const resources = [
  { icon: BookOpen, title: "Centro del prodotto", text: "Esplora le aree di Chrono direttamente nell'app e parti dal workspace che ti interessa.", href: "/projects", label: "Apri Chrono" },
  { icon: Settings2, title: "Preferenze", text: "Configura il comportamento dell'app, la home predefinita e le impostazioni personali.", href: "/settings/preferences", label: "Apri preferenze" },
  { icon: LifeBuoy, title: "Stato del sistema", text: "Controlla la connessione a Supabase e lo stato della sincronizzazione del workspace.", href: "/settings/database", label: "Controlla lo stato" },
];

export default function ResourcesPage() {
  return (
    <MarketingChrome>
      <section className="border-b border-white/10" aria-labelledby="resources-hero-title"><div className="mx-auto max-w-6xl px-5 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-32 lg:px-10 lg:pt-40"><p className="text-sm text-zinc-500">Risorse</p><h1 id="resources-hero-title" className="mt-8 max-w-5xl text-6xl font-semibold leading-[0.92] tracking-[-0.075em] text-white sm:text-8xl">Tutto quello che serve per iniziare bene.</h1><p className="mt-10 max-w-3xl text-xl leading-8 text-zinc-400 sm:text-2xl sm:leading-9">Le risorse di Chrono sono organizzate attorno all&apos;uso reale del prodotto. Parti dal workspace, regola le preferenze e controlla la sincronizzazione quando ti serve.</p></div></section>

      <section className="border-b border-white/10" aria-labelledby="resources-list-title"><div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:px-10"><h2 id="resources-list-title" className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.06em] text-white sm:text-6xl">Un punto di partenza per ogni esigenza.</h2><div className="mt-16 grid border-y border-white/10 md:grid-cols-3 md:divide-x md:divide-white/10">{resources.map((resource) => { const Icon = resource.icon; return <article key={resource.title} className="p-7 md:p-9"><Icon className="h-5 w-5 text-zinc-300" /><h3 className="mt-10 text-xl text-white">{resource.title}</h3><p className="mt-4 text-sm leading-6 text-zinc-500">{resource.text}</p><Link href={resource.href} className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm text-zinc-300 hover:text-white">{resource.label} <ArrowUpRight className="h-4 w-4" /></Link></article>; })}</div></div></section>

      <section className="border-b border-white/10" aria-labelledby="resources-note-title"><div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:px-10"><div className="max-w-3xl border-l border-white/20 pl-6 sm:pl-10"><ExternalLink className="h-5 w-5 text-zinc-300" /><h2 id="resources-note-title" className="mt-8 text-3xl font-semibold leading-tight tracking-[-0.05em] text-white sm:text-5xl">Il prodotto è il posto migliore per imparare Chrono.</h2><p className="mt-6 max-w-xl text-base leading-7 text-zinc-500">Le pagine pubbliche spiegano il sistema. L&apos;app contiene il contesto del tuo team e gli strumenti per usarlo.</p><Link href="/login" className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-200">Accedi a Chrono <ArrowUpRight className="h-4 w-4" /></Link></div></div></section>

      <section><div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:px-10"><h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.06em] text-white sm:text-6xl">Hai già un workspace?</h2><p className="mt-6 max-w-xl text-base leading-7 text-zinc-500">Accedi con le tue credenziali e riprendi dal punto in cui hai lasciato il lavoro.</p><Link href="/login" className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-200">Accedi <ArrowUpRight className="h-4 w-4" /></Link></div></section>
    </MarketingChrome>
  );
}
