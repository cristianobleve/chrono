import Link from "next/link";
import { ArrowUpRight, Check, Database, Fingerprint, LockKeyhole, RefreshCw, ShieldCheck } from "lucide-react";
import { MarketingChrome } from "@/components/marketing/MarketingChrome";

const safeguards = [
  { icon: Fingerprint, title: "Accesso autenticato", text: "L'accesso a Chrono passa da Supabase Auth con email e password. Le sessioni restano separate dai dati del workspace." },
  { icon: Database, title: "Dati sincronizzati", text: "Il workspace mantiene una fonte dati condivisa per evitare copie divergenti tra le persone che lavorano sullo stesso progetto." },
  { icon: RefreshCw, title: "Aggiornamenti in tempo reale", text: "Quando un elemento cambia, il contesto può aggiornarsi per il team senza dover ricostruire manualmente lo stato." },
];

export default function SecurityPage() {
  return (
    <MarketingChrome>
      <section className="border-b border-white/10" aria-labelledby="security-hero-title"><div className="mx-auto max-w-6xl px-5 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-32 lg:px-10 lg:pt-40"><p className="text-sm text-zinc-500">Sicurezza e controllo</p><h1 id="security-hero-title" className="mt-8 max-w-5xl text-6xl font-semibold leading-[0.92] tracking-[-0.075em] text-white sm:text-8xl">Il lavoro resta nelle mani del tuo team.</h1><p className="mt-10 max-w-3xl text-xl leading-8 text-zinc-400 sm:text-2xl sm:leading-9">Chrono è costruito attorno a workspace separati, accessi autenticati e una sincronizzazione affidabile. La tecnologia deve rendere il lavoro più semplice da controllare, non aggiungere un altro punto cieco.</p></div></section>

      <section className="border-b border-white/10" aria-labelledby="safeguards-title"><div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:px-10"><h2 id="safeguards-title" className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.06em] text-white sm:text-6xl">Fondamenta semplici, verificabili.</h2><div className="mt-16 grid border-y border-white/10 md:grid-cols-3 md:divide-x md:divide-white/10">{safeguards.map((safeguard) => { const Icon = safeguard.icon; return <article key={safeguard.title} className="p-7 md:p-9"><Icon className="h-5 w-5 text-zinc-300" /><h3 className="mt-10 text-xl text-white">{safeguard.title}</h3><p className="mt-4 text-sm leading-6 text-zinc-500">{safeguard.text}</p></article>; })}</div></div></section>

      <section className="border-b border-white/10" aria-labelledby="security-practices-title"><div className="mx-auto grid max-w-6xl gap-16 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:px-10"><div><LockKeyhole className="h-6 w-6 text-zinc-300" /><h2 id="security-practices-title" className="mt-6 max-w-md text-4xl font-semibold leading-tight tracking-[-0.06em] text-white sm:text-5xl">Controlli comprensibili per chi usa il prodotto.</h2></div><div className="border-t border-white/10 pt-6"><p className="max-w-xl text-base leading-7 text-zinc-400">Non nascondiamo le parti importanti dietro un linguaggio tecnico. Questi sono i controlli che incidono sull&apos;uso quotidiano di Chrono.</p><ul className="mt-8 grid gap-4 text-sm text-zinc-300"><li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" /> Ogni workspace mantiene il proprio contesto e le proprie persone.</li><li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" /> Le credenziali amministrative restano lato server e non vengono esposte al client.</li><li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" /> Lo stato della connessione è visibile nelle impostazioni dell&apos;app.</li></ul></div></div></section>

      <section><div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32 lg:px-10"><ShieldCheck className="h-6 w-6 text-zinc-300" /><h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.06em] text-white sm:text-6xl">La trasparenza fa parte del prodotto.</h2><p className="mt-7 max-w-xl text-base leading-7 text-zinc-500">Per verificare lo stato della sincronizzazione puoi consultare direttamente la sezione database dell&apos;app.</p><Link href="/settings/database" className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-200">Apri stato del sistema <ArrowUpRight className="h-4 w-4" /></Link></div></section>
    </MarketingChrome>
  );
}
