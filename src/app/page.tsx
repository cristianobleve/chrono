"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CheckSquare,
  Command,
  Database,
  FolderKanban,
  Shield,
  Terminal,
  Search,
} from "lucide-react";
import { MarketingChrome } from "@/components/marketing/MarketingChrome";
import {
  HeroMotion,
  FadeIn,
  MotionCard,
  AmbientColorGradients,
} from "@/components/marketing/HomeMotion";
import { useTranslation } from "@/i18n";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <MarketingChrome>
      {/* Ambient Color Gradients across the page */}
      <div className="relative">
        <AmbientColorGradients />

        {/* Hero Section */}
        <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28" aria-labelledby="hero-title">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <HeroMotion>
              <h1
                id="hero-title"
                className="text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] max-w-4xl mx-auto"
              >
                {t.home.heroTitle}
              </h1>

              <p className="mt-6 text-base sm:text-lg leading-relaxed text-zinc-400 max-w-2xl mx-auto">
                {t.home.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-xs sm:text-sm font-semibold text-black transition-colors hover:bg-zinc-200 shadow-[0_0_24px_rgba(255,255,255,0.15)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {t.home.heroCta} <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/product"
                  className="flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.02] px-6 text-xs sm:text-sm font-medium text-zinc-300 transition-colors hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {t.home.heroSecondaryCta}
                </Link>
              </div>

              <p className="mt-5 text-xs text-zinc-500">
                {t.home.heroSubtext}
              </p>
            </HeroMotion>
          </div>
        </section>

        {/* Feature Bento Grid (Rich UI Cards) */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="features-title">
          <FadeIn className="text-center max-w-3xl mx-auto mb-14">
            <h2 id="features-title" className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              {t.home.featuresTitle}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-400">
              {t.home.featuresSubtitle}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Issue & Backlog (Spans 2 cols on lg) */}
            <MotionCard delay={0.05} className="lg:col-span-2 relative rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
              {/* Top hairline gradient highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500/60 via-purple-500/50 to-pink-500/30" />

              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{t.home.cardBacklogTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-indigo-300">{t.home.cardBacklogAll}</span>
                    <span className="rounded-full bg-white/[0.03] px-2 py-0.5 text-zinc-500">{t.home.cardBacklogInProgress}</span>
                    <span className="rounded-full bg-white/[0.03] px-2 py-0.5 text-zinc-500">{t.home.cardBacklogDone}</span>
                  </div>
                </div>

                {/* Realistic Issue UI Rows */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#121418]/80 p-3 text-xs transition-colors hover:border-white/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-4 w-4 rounded border border-white/20 flex items-center justify-center text-[10px] text-emerald-400">
                        ✓
                      </span>
                      <span className="font-mono text-zinc-400 shrink-0">FIR-248</span>
                      <span className="text-zinc-200 font-medium truncate">{t.home.cardBacklogRow1Title}</span>
                      <span className="hidden sm:inline-block rounded bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300">{t.home.cardBacklogRow1Tag}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] text-red-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                        {t.home.cardBacklogRow1Priority}
                      </span>
                      <span className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 border border-white/10 flex items-center justify-center text-[10px] text-white font-medium">
                        CB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#121418]/80 p-3 text-xs transition-colors hover:border-white/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-4 w-4 rounded border border-white/20" />
                      <span className="font-mono text-zinc-400 shrink-0">FIR-249</span>
                      <span className="text-zinc-200 font-medium truncate">{t.home.cardBacklogRow2Title}</span>
                      <span className="hidden sm:inline-block rounded bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-[10px] text-purple-300">{t.home.cardBacklogRow2Tag}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        {t.home.cardBacklogRow2Priority}
                      </span>
                      <span className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border border-white/10 flex items-center justify-center text-[10px] text-white font-medium">
                        AI
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#121418]/80 p-3 text-xs transition-colors hover:border-white/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-4 w-4 rounded border border-white/20" />
                      <span className="font-mono text-zinc-400 shrink-0">FIR-251</span>
                      <span className="text-zinc-200 font-medium truncate">{t.home.cardBacklogRow3Title}</span>
                      <span className="hidden sm:inline-block rounded bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300">{t.home.cardBacklogRow3Tag}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 border border-zinc-500/20 px-2 py-0.5 text-[10px] text-zinc-400">
                        {t.home.cardBacklogRow3Priority}
                      </span>
                      <span className="h-6 w-6 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-[10px] text-zinc-300 font-medium">
                        MR
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <h3 className="text-lg font-medium text-white">{t.home.cardBacklogFooterTitle}</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {t.home.cardBacklogFooterDesc}
                </p>
              </div>
            </MotionCard>

            {/* Card 2: Milestone & Timeline */}
            <MotionCard delay={0.1} className="relative rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
              {/* Top hairline gradient */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/50 via-indigo-500/40 to-teal-500/30" />

              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{t.home.cardMilestoneTitle}</span>
                  </div>
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300">{t.home.cardMilestoneBadge}</span>
                </div>

                {/* Progress UI */}
                <div className="mt-5 rounded-lg border border-white/10 bg-[#121418]/80 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{t.home.cardMilestoneStatusLabel}</span>
                    <span className="font-mono text-white font-semibold">82%</span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full" style={{ width: "82%" }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{t.home.cardMilestoneClosed}</span>
                    <span>{t.home.cardMilestoneDue}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="text-emerald-400">✓</span>
                      <span>{t.home.cardMilestoneItem1}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="text-emerald-400">✓</span>
                      <span>{t.home.cardMilestoneItem2}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="text-blue-400">○</span>
                      <span>{t.home.cardMilestoneItem3}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <h3 className="text-lg font-medium text-white">{t.home.cardMilestoneFooterTitle}</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {t.home.cardMilestoneFooterDesc}
                </p>
              </div>
            </MotionCard>

            {/* Card 3: Keyboard Command Bar */}
            <MotionCard delay={0.15} className="relative rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
              {/* Top hairline gradient */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500/50 via-cyan-500/40 to-blue-500/30" />

              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Command className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{t.home.cardCommandTitle}</span>
                  </div>
                  <kbd className="rounded border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">⌘K</kbd>
                </div>

                {/* Command bar input mockup */}
                <div className="mt-5 rounded-lg border border-white/10 bg-[#121418]/80 p-3 text-xs">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-zinc-500">
                    <Search className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-zinc-400">{t.home.cardCommandSearchPlaceholder}</span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between p-1.5 rounded hover:bg-white/[0.04]">
                      <span className="text-zinc-300">{t.home.cardCommandAction1}</span>
                      <kbd className="font-mono text-zinc-400 bg-white/[0.05] border border-white/10 px-1.5 py-0.5 rounded">C</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded hover:bg-white/[0.04]">
                      <span className="text-zinc-300">{t.home.cardCommandAction2}</span>
                      <kbd className="font-mono text-zinc-400 bg-white/[0.05] border border-white/10 px-1.5 py-0.5 rounded">P</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded hover:bg-white/[0.04]">
                      <span className="text-zinc-300">{t.home.cardCommandAction3}</span>
                      <kbd className="font-mono text-zinc-400 bg-white/[0.05] border border-white/10 px-1.5 py-0.5 rounded">/</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <h3 className="text-lg font-medium text-white">{t.home.cardCommandFooterTitle}</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {t.home.cardCommandFooterDesc}
                </p>
              </div>
            </MotionCard>

            {/* Card 4: Agent & MCP Protocol (Spans 2 cols on lg) */}
            <MotionCard delay={0.2} className="lg:col-span-2 relative rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
              {/* Top hairline gradient */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/60 via-teal-500/40 to-cyan-500/30" />

              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{t.home.cardMcpTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                    <span className="text-[10px] text-emerald-400 font-mono">{t.home.cardMcpBadge}</span>
                  </div>
                </div>

                {/* Agent execution terminal mockup */}
                <div className="mt-5 rounded-lg border border-white/10 bg-[#121418]/80 p-4 font-mono text-xs">
                  <div className="text-zinc-500 mb-2">{t.home.cardMcpComment}</div>
                  <div className="text-zinc-300">
                    <span className="text-emerald-400">agent</span> &gt; chrono:create_issue --title=&quot;Configura webhook di notifica&quot; --priority=&quot;high&quot;
                  </div>
                  <div className="mt-2 text-zinc-400 pl-4 border-l border-emerald-500/40">
                    <span className="text-zinc-200">{t.home.cardMcpCreatedPrefix}</span> {t.home.cardMcpCreatedProject}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-1.5 text-[10px] text-zinc-400">
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-300">list_projects</span>
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-300">create_issue</span>
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-300">list_milestones</span>
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-300">get_workspace_summary</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <h3 className="text-lg font-medium text-white">{t.home.cardMcpFooterTitle}</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {t.home.cardMcpFooterDesc}
                </p>
              </div>
            </MotionCard>
          </div>
        </section>

        {/* 3-Step Process (Salix Numbered Step Cards) */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10" aria-labelledby="process-title">
          <FadeIn className="text-center max-w-3xl mx-auto mb-14">
            <h2 id="process-title" className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              {t.home.workflowTitle}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-400">
              {t.home.workflowSubtitle}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MotionCard delay={0.05} className="rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-7 flex flex-col justify-between shadow-xl">
              <div>
                <span className="font-mono text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{t.home.step1Num}</span>
                <h3 className="mt-6 text-xl font-medium text-white">{t.home.step1Title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                  {t.home.step1Desc}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[11px] text-zinc-500 font-mono">
                {t.home.step1Role}
              </div>
            </MotionCard>

            <MotionCard delay={0.1} className="rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-7 flex flex-col justify-between shadow-xl">
              <div>
                <span className="font-mono text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{t.home.step2Num}</span>
                <h3 className="mt-6 text-xl font-medium text-white">{t.home.step2Title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                  {t.home.step2Desc}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[11px] text-zinc-500 font-mono">
                {t.home.step2Sub}
              </div>
            </MotionCard>

            <MotionCard delay={0.15} className="rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-7 flex flex-col justify-between shadow-xl">
              <div>
                <span className="font-mono text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">{t.home.step3Num}</span>
                <h3 className="mt-6 text-xl font-medium text-white">{t.home.step3Title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                  {t.home.step3Desc}
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-[11px] text-zinc-500 font-mono">
                {t.home.step3Sub}
              </div>
            </MotionCard>
          </div>
        </section>

        {/* System Specifications Grid */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10" aria-labelledby="specs-title">
          <FadeIn className="text-center max-w-3xl mx-auto mb-14">
            <h2 id="specs-title" className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              {t.home.specsTitle}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-400">
              {t.home.specsSubtitle}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MotionCard delay={0.05} className="rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-8 shadow-xl">
              <Database className="h-5 w-5 text-indigo-400" />
              <h3 className="mt-5 text-lg font-medium text-white">{t.home.spec1Title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {t.home.spec1Desc}
              </p>
            </MotionCard>

            <MotionCard delay={0.1} className="rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-8 shadow-xl">
              <Shield className="h-5 w-5 text-purple-400" />
              <h3 className="mt-5 text-lg font-medium text-white">{t.home.spec2Title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {t.home.spec2Desc}
              </p>
            </MotionCard>

            <MotionCard delay={0.15} className="rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-8 shadow-xl">
              <Command className="h-5 w-5 text-cyan-400" />
              <h3 className="mt-5 text-lg font-medium text-white">{t.home.spec3Title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {t.home.spec3Desc}
              </p>
            </MotionCard>

            <MotionCard delay={0.2} className="rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-8 shadow-xl">
              <Terminal className="h-5 w-5 text-emerald-400" />
              <h3 className="mt-5 text-lg font-medium text-white">{t.home.spec4Title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {t.home.spec4Desc}
              </p>
            </MotionCard>
          </div>
        </section>

        {/* Interactive FAQ Accordion */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10" aria-labelledby="faq-title">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <h2 id="faq-title" className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              {t.home.faqTitle}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-400">
              {t.home.faqSubtitle}
            </p>
          </FadeIn>

          <div className="space-y-4">
            <details className="group rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-6 shadow-xl transition-colors hover:border-white/20">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                <span>{t.home.faq1Q}</span>
                <span className="text-xs text-zinc-500 font-mono transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 text-xs leading-relaxed text-zinc-400 border-t border-white/10 pt-4">
                {t.home.faq1A}
              </p>
            </details>

            <details className="group rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-6 shadow-xl transition-colors hover:border-white/20">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                <span>{t.home.faq2Q}</span>
                <span className="text-xs text-zinc-500 font-mono transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 text-xs leading-relaxed text-zinc-400 border-t border-white/10 pt-4">
                {t.home.faq2A}
              </p>
            </details>

            <details className="group rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-6 shadow-xl transition-colors hover:border-white/20">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                <span>{t.home.faq3Q}</span>
                <span className="text-xs text-zinc-500 font-mono transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 text-xs leading-relaxed text-zinc-400 border-t border-white/10 pt-4">
                {t.home.faq3A}
              </p>
            </details>

            <details className="group rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-6 shadow-xl transition-colors hover:border-white/20">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                <span>{t.home.faq4Q}</span>
                <span className="text-xs text-zinc-500 font-mono transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 text-xs leading-relaxed text-zinc-400 border-t border-white/10 pt-4">
                {t.home.faq4A}
              </p>
            </details>
          </div>
        </section>

        {/* Salix-inspired Framed Call to Action Card with Gradient Depth */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20" aria-labelledby="cta-title">
          <FadeIn>
            <div className="relative rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-[#11131a] via-[#0e1014] to-[#08090b] p-10 sm:p-16 text-center shadow-[0_0_50px_rgba(99,102,241,0.12)] overflow-hidden">
              {/* Subtle accent radial glow inside the card */}
              <div
                className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 opacity-40 blur-3xl"
                style={{
                  background: "radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, transparent 70%)",
                }}
              />

              <h2
                id="cta-title"
                className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight max-w-2xl mx-auto"
              >
                {t.home.ctaTitle}
              </h2>
              <p className="mt-5 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
                {t.home.ctaSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login"
                  className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-xs sm:text-sm font-semibold text-black transition-colors hover:bg-zinc-200 shadow-[0_0_24px_rgba(255,255,255,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {t.home.ctaButton} <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/method"
                  className="flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.02] px-6 text-xs sm:text-sm font-medium text-zinc-300 transition-colors hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {t.home.ctaSecondary}
                </Link>
              </div>
              <p className="mt-5 text-xs text-zinc-500">
                {t.home.ctaFootnote}
              </p>
            </div>
          </FadeIn>
        </section>
      </div>
    </MarketingChrome>
  );
}
