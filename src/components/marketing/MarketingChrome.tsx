"use client";

import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { ChronoLogo, ChronoWordmark } from "@/components/ui/ChronoLogo";
import { useTranslation, SupportedLanguage } from "@/i18n";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";

interface MarketingChromeProps {
  children: React.ReactNode;
  floatingHeader?: boolean;
}

export function MarketingChrome({ children, floatingHeader = false }: MarketingChromeProps) {
  const { t, lang, setLanguage, languages } = useTranslation();

  const productLinks = [
    { href: "/product#projects", label: t.projects.title },
    { href: "/product#issues", label: t.issues.title },
    { href: "/product#timeline", label: t.nav.timeline },
    { href: "/product#agent", label: t.nav.agent },
  ];

  const languageOptions: SelectOption[] = languages.map((l) => ({
    value: l.code,
    label: l.nativeName,
  }));

  return (
    <main className="min-h-screen bg-[#08090b] text-zinc-100 flex flex-col justify-between">
      {/* Salix-inspired floating pill header */}
      <div
        className={
          floatingHeader
            ? "fixed top-5 left-1/2 -translate-x-1/2 z-50 mx-auto w-full max-w-5xl px-4 sm:px-6 pointer-events-none"
            : "sticky top-4 z-40 mx-auto w-full max-w-5xl px-4 sm:px-6"
        }
      >
        <header
          className={`flex h-14 items-center justify-between rounded-full border border-white/10 bg-[#101216]/85 backdrop-blur-md px-5 shadow-2xl ${
            floatingHeader ? "pointer-events-auto" : ""
          }`}
        >
          <Link href="/" aria-label="Chrono home" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04]">
              <ChronoLogo size={16} />
            </span>
            <ChronoWordmark logoSize={14} />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigazione principale">
            <details className="relative group">
              <summary className="flex h-9 cursor-pointer list-none items-center gap-1 rounded-full px-3 text-xs font-medium text-zinc-400 transition-colors hover:text-white">
                {t.nav.product} <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
              </summary>
              <div className="absolute left-0 top-11 w-52 rounded-xl border border-white/15 bg-[#101216] p-2 shadow-2xl">
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>
            <Link
              href="/method"
              className="flex h-9 items-center rounded-full px-3 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {t.nav.method}
            </Link>
            <Link
              href="/security"
              className="flex h-9 items-center rounded-full px-3 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {t.nav.security}
            </Link>
            <Link
              href="/resources"
              className="flex h-9 items-center rounded-full px-3 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {t.nav.resources}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-300 transition-colors hover:text-white px-2 py-1"
            >
              {t.nav.login}
            </Link>
            <Link
              href="/login"
              className="flex h-8 items-center rounded-full bg-white px-4 text-xs font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              {t.nav.getStarted}
            </Link>

            <details className="relative md:hidden">
              <summary
                className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:text-white"
                aria-label="Apri menu"
              >
                <Menu className="h-4 w-4" />
              </summary>
              <div className="absolute right-0 top-11 w-56 rounded-xl border border-white/15 bg-[#101216] p-3 shadow-2xl">
                <Link href="/product" className="block border-b border-white/10 px-3 py-2.5 text-xs text-zinc-200">
                  {t.nav.product}
                </Link>
                <Link href="/method" className="block border-b border-white/10 px-3 py-2.5 text-xs text-zinc-300">
                  {t.nav.method}
                </Link>
                <Link href="/security" className="block border-b border-white/10 px-3 py-2.5 text-xs text-zinc-300">
                  {t.nav.security}
                </Link>
                <Link href="/resources" className="block px-3 py-2.5 text-xs text-zinc-300">
                  {t.nav.resources}
                </Link>
              </div>
            </details>
          </div>
        </header>
      </div>

      <div className="flex-1 w-full">
        {children}
      </div>

      <footer className="border-t border-white/10 bg-[#0b0d10] mt-24">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="grid gap-12 border-b border-white/10 pb-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" aria-label="Chrono home">
                <ChronoWordmark logoSize={18} />
              </Link>
              <p className="mt-6 max-w-xs text-sm leading-6 text-zinc-500">
                {t.footer.tagline}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">{t.footer.productHeading}</h2>
              <div className="mt-5 grid gap-3 text-sm text-zinc-500">
                <Link href="/product#projects" className="hover:text-white transition-colors">{t.projects.title}</Link>
                <Link href="/product#issues" className="hover:text-white transition-colors">{t.issues.title}</Link>
                <Link href="/product#timeline" className="hover:text-white transition-colors">{t.nav.timeline}</Link>
                <Link href="/product#agent" className="hover:text-white transition-colors">{t.nav.agent}</Link>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">{t.footer.companyHeading}</h2>
              <div className="mt-5 grid gap-3 text-sm text-zinc-500">
                <Link href="/method" className="hover:text-white transition-colors">{t.nav.method}</Link>
                <Link href="/security" className="hover:text-white transition-colors">{t.nav.security}</Link>
                <Link href="/login" className="hover:text-white transition-colors">{t.nav.login}</Link>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">{t.footer.resourcesHeading}</h2>
              <div className="mt-5 grid gap-3 text-sm text-zinc-500">
                <Link href="/resources" className="hover:text-white transition-colors">{t.nav.resources}</Link>
                <Link href="/projects" className="hover:text-white transition-colors">{t.footer.openApp}</Link>
                <Link href="/settings/database" className="hover:text-white transition-colors">{t.footer.systemStatus}</Link>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 pt-7 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <span>{t.footer.copyright}</span>
            <div className="flex items-center gap-5">
              <span>{t.footer.privacy}</span>
              <span>{t.footer.terms}</span>
              <LinearSelect
                options={languageOptions}
                value={lang}
                onChange={(val) => setLanguage(val as SupportedLanguage)}
                searchable={false}
                align="right"
                triggerClassName="bg-transparent border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white px-2.5 py-1 text-[11px] rounded-[6px]"
              />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
