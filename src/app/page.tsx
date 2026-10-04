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
} from "@/components/marketing/HomeMotion";
import { AtmosphericClouds } from "@/components/ui/AtmosphericClouds";
import { ChronoDialBackground } from "@/components/ui/ChronoDialBackground";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isDesktopApp } from "@/lib/desktop";
import { useTranslation } from "@/i18n";
import { useLinearStore } from "@/store/useLinearStore";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { issues, projects, currentUser, team } = useLinearStore();

  useEffect(() => {
    if (isDesktopApp()) {
      router.replace("/issues");
    }
  }, [router]);

  const teamPrefix = team?.key || "COR";
  const userInitials = currentUser?.name
    ? currentUser.name.trim().slice(0, 2).toUpperCase()
    : "CR";

  const previewIssues = issues.length >= 3
    ? issues.slice(0, 3).map((iss, idx) => ({
        id: iss.id,
        identifier: iss.identifier || `${teamPrefix}-${100 + idx + 1}`,
        title: iss.title,
        tag: iss.labels?.[0] || (idx === 0 ? "Backend" : idx === 1 ? "MCP" : "Frontend"),
        priority: iss.priority === "urgent" ? t.home.cardBacklogRow1Priority : iss.priority === "high" ? t.home.cardBacklogRow2Priority : t.home.cardBacklogRow3Priority,
        badgeBg: iss.priority === "urgent" ? "bg-red-500/10 border-red-500/20 text-red-400" : iss.priority === "high" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
        dotColor: iss.priority === "urgent" ? "bg-red-400" : iss.priority === "high" ? "bg-amber-400" : "bg-zinc-400",
        initials: idx === 0 ? userInitials : idx === 1 ? "AI" : "TM",
        isDone: iss.status === "done",
      }))
    : [
        {
          id: "preview-1",
          identifier: `${teamPrefix}-101`,
          title: t.home.cardBacklogRow1Title,
          tag: t.home.cardBacklogRow1Tag,
          priority: t.home.cardBacklogRow1Priority,
          badgeBg: "bg-red-500/10 border-red-500/20 text-red-400",
          dotColor: "bg-red-400",
          initials: userInitials,
          isDone: true,
        },
        {
          id: "preview-2",
          identifier: `${teamPrefix}-102`,
          title: t.home.cardBacklogRow2Title,
          tag: t.home.cardBacklogRow2Tag,
          priority: t.home.cardBacklogRow2Priority,
          badgeBg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          dotColor: "bg-amber-400",
          initials: "AI",
          isDone: false,
        },
        {
          id: "preview-3",
          identifier: `${teamPrefix}-103`,
          title: t.home.cardBacklogRow3Title,
          tag: t.home.cardBacklogRow3Tag,
          priority: t.home.cardBacklogRow3Priority,
          badgeBg: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
          dotColor: "bg-zinc-400",
          initials: "TM",
          isDone: false,
        },
      ];

  return (
    <MarketingChrome floatingHeader>
      <div className="relative w-full">
        <section
          className="p-[5px] w-full"
          aria-labelledby="hero-title"
        >
          <div className="relative w-full h-[calc(100vh-10px)] min-h-[660px] max-h-[1150px] rounded-[22px] sm:rounded-[26px] border border-white/10 bg-[#07080a] overflow-hidden flex flex-col items-center justify-center shadow-[0_0_60px_rgba(0,0,0,0.9)]">
            <AtmosphericClouds className="absolute inset-0 z-0" speed={0.7} cloudCount={5} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(7,8,11,0.55)_0%,rgba(7,8,11,0.22)_45%,rgba(7,8,11,0.88)_100%)] pointer-events-none z-[1]" />

            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto">
              <HeroMotion className="flex flex-col items-center">
                <h1
                  id="hero-title"
                  className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-semibold tracking-[-0.025em] text-white leading-[1.12] max-w-3xl"
                >
                  {t.home.heroTitle}
                </h1>

                <p className="mt-5 text-sm sm:text-base leading-relaxed text-zinc-400 max-w-lg font-normal">
                  {t.home.heroSubtitle}
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/login"
                    className="flex h-10 items-center gap-2 rounded-full bg-white px-6 text-xs sm:text-sm font-semibold text-black transition-colors hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t.home.heroCta}
                  </Link>
                  <Link
                    href="/download"
                    className="flex h-10 items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-5 text-xs sm:text-sm font-medium text-zinc-200 transition-colors hover:border-white/40 hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Scarica Desktop v2.0.0
                  </Link>
                  <Link
                    href="/product"
                    className="flex h-10 items-center gap-2 rounded-full border border-transparent px-4 text-xs sm:text-sm font-medium text-zinc-400 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t.home.heroSecondaryCta}
                  </Link>
                </div>

                <p className="mt-4 text-xs text-zinc-500 font-normal">
                  {t.home.heroSubtext}
                </p>
              </HeroMotion>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24" aria-labelledby="features-title">
          <FadeIn className="text-center max-w-3xl mx-auto mb-16">
            <h2 id="features-title" className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {t.home.featuresTitle}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-400">
              {t.home.featuresSubtitle}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MotionCard delay={0.05} className="lg:col-span-2 relative rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-zinc-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{t.home.cardBacklogTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <span className="rounded-full bg-white/[0.08] border border-white/10 px-2 py-0.5 text-zinc-200">{t.home.cardBacklogAll}</span>
                    <span className="rounded-full bg-white/[0.03] px-2 py-0.5 text-zinc-400">{t.home.cardBacklogInProgress}</span>
                    <span className="rounded-full bg-white/[0.03] px-2 py-0.5 text-zinc-400">{t.home.cardBacklogDone}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  {previewIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-[#121418]/80 p-3 text-xs transition-colors hover:border-white/20"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center text-[10px]",
                            issue.isDone
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                              : "border-white/20"
                          )}
                        >
                          {issue.isDone ? "✓" : ""}
                        </span>
                        <span className="font-mono text-zinc-400 shrink-0">{issue.identifier}</span>
                        <span className="text-zinc-200 font-medium truncate">{issue.title}</span>
                        <span className="hidden sm:inline-block rounded bg-white/[0.06] border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300">
                          {issue.tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border", issue.badgeBg)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", issue.dotColor)} />
                          {issue.priority}
                        </span>
                        <span className="h-6 w-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] text-white font-medium">
                          {issue.initials}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <h3 className="font-heading text-lg font-medium text-white">{t.home.cardBacklogFooterTitle}</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {t.home.cardBacklogFooterDesc}
                </p>
              </div>
            </MotionCard>

            <MotionCard delay={0.1} className="relative rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-zinc-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      {projects.length > 0 ? projects[0].name : t.home.cardMilestoneTitle}
                    </span>
                  </div>
                  <span className="rounded-full bg-white/[0.08] border border-white/10 px-2 py-0.5 text-[10px] text-zinc-200">
                    {projects.length > 0 ? `${projects.length} ${t.projects.title}` : t.home.cardMilestoneBadge}
                  </span>
                </div>

                <div className="mt-5 rounded-lg border border-white/10 bg-[#121418]/80 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{t.home.cardMilestoneStatusLabel}</span>
                    <span className="font-mono text-white font-semibold">82%</span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: "82%" }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{t.home.cardMilestoneClosed}</span>
                    <span>{t.home.cardMilestoneDue}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs">
                    {projects.length > 0 && projects[0].milestones && projects[0].milestones.length > 0 ? (
                      projects[0].milestones.slice(0, 3).map((m, idx) => (
                        <div key={m.id || idx} className="flex items-center gap-2 text-zinc-300">
                          <span className={m.completed ? "text-emerald-400" : "text-zinc-500"}>
                            {m.completed ? "✓" : "○"}
                          </span>
                          <span className="truncate">{m.name}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-zinc-300">
                          <span className="text-emerald-400">✓</span>
                          <span>{t.home.cardMilestoneItem1}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300">
                          <span className="text-emerald-400">✓</span>
                          <span>{t.home.cardMilestoneItem2}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <span className="text-zinc-500">○</span>
                          <span>{t.home.cardMilestoneItem3}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <h3 className="font-heading text-lg font-medium text-white">{t.home.cardMilestoneFooterTitle}</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {t.home.cardMilestoneFooterDesc}
                </p>
              </div>
            </MotionCard>

            <MotionCard delay={0.15} className="relative rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Command className="h-4 w-4 text-zinc-300" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{t.home.cardCommandTitle}</span>
                  </div>
                  <kbd className="rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-zinc-200">⌘K</kbd>
                </div>

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
                <h3 className="font-heading text-lg font-medium text-white">{t.home.cardCommandFooterTitle}</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {t.home.cardCommandFooterDesc}
                </p>
              </div>
            </MotionCard>

            <MotionCard delay={0.2} className="lg:col-span-2 relative rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">{t.home.cardMcpTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-mono">{t.home.cardMcpBadge}</span>
                  </div>
                </div>

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
                <h3 className="font-heading text-lg font-medium text-white">{t.home.cardMcpFooterTitle}</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  {t.home.cardMcpFooterDesc}
                </p>
              </div>
            </MotionCard>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10" aria-labelledby="process-title">
          <FadeIn className="text-center max-w-3xl mx-auto mb-14">
            <h2 id="process-title" className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {t.home.workflowTitle}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-400">
              {t.home.workflowSubtitle}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MotionCard delay={0.05} className="rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-7 flex flex-col justify-between shadow-xl">
              <div>
                <span className="font-mono text-2xl font-bold text-zinc-400">{t.home.step1Num}</span>
                <h3 className="font-heading mt-6 text-xl font-medium text-white">{t.home.step1Title}</h3>
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
                <span className="font-mono text-2xl font-bold text-zinc-400">{t.home.step2Num}</span>
                <h3 className="font-heading mt-6 text-xl font-medium text-white">{t.home.step2Title}</h3>
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
                <span className="font-mono text-2xl font-bold text-zinc-400">{t.home.step3Num}</span>
                <h3 className="font-heading mt-6 text-xl font-medium text-white">{t.home.step3Title}</h3>
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

        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10" aria-labelledby="specs-title">
          <FadeIn className="text-center max-w-3xl mx-auto mb-14">
            <h2 id="specs-title" className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {t.home.specsTitle}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-400">
              {t.home.specsSubtitle}
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MotionCard delay={0.05} className="rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-8 shadow-xl">
              <Database className="h-5 w-5 text-zinc-300" />
              <h3 className="font-heading mt-5 text-lg font-medium text-white">{t.home.spec1Title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {t.home.spec1Desc}
              </p>
            </MotionCard>

            <MotionCard delay={0.1} className="rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-8 shadow-xl">
              <Shield className="h-5 w-5 text-zinc-300" />
              <h3 className="font-heading mt-5 text-lg font-medium text-white">{t.home.spec2Title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {t.home.spec2Desc}
              </p>
            </MotionCard>

            <MotionCard delay={0.15} className="rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-8 shadow-xl">
              <Command className="h-5 w-5 text-zinc-300" />
              <h3 className="font-heading mt-5 text-lg font-medium text-white">{t.home.spec3Title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {t.home.spec3Desc}
              </p>
            </MotionCard>

            <MotionCard delay={0.2} className="rounded-2xl border border-white/10 bg-[#0e1014]/90 backdrop-blur-md p-8 shadow-xl">
              <Terminal className="h-5 w-5 text-emerald-400" />
              <h3 className="font-heading mt-5 text-lg font-medium text-white">{t.home.spec4Title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {t.home.spec4Desc}
              </p>
            </MotionCard>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10" aria-labelledby="faq-title">
          <FadeIn className="text-center max-w-2xl mx-auto mb-14">
            <h2 id="faq-title" className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-white">
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

        <section className="p-[5px] w-full" aria-labelledby="cta-title">
          <div className="relative w-full rounded-[22px] sm:rounded-[26px] border border-white/10 overflow-hidden bg-[#07080b] py-16 sm:py-20 md:py-24 px-4 sm:px-8 flex items-center justify-center">
            <ChronoDialBackground />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,8,11,0.60)_0%,rgba(7,8,11,0.30)_50%,rgba(7,8,11,0.92)_100%)] pointer-events-none z-[1]" />

            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-3xl mx-auto">
              <FadeIn className="flex flex-col items-center">
                <h2
                  id="cta-title"
                  className="font-heading text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-white leading-tight max-w-2xl"
                >
                  {t.home.ctaTitle}
                </h2>
                <p className="mt-4 text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed font-normal">
                  {t.home.ctaSubtitle}
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/login"
                    className="flex h-10 items-center gap-2 rounded-full bg-white px-6 text-xs sm:text-sm font-semibold text-black transition-colors hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t.home.ctaButton} <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/method"
                    className="flex h-10 items-center gap-2 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-5 text-xs sm:text-sm font-medium text-zinc-300 transition-colors hover:border-white/40 hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t.home.ctaSecondary}
                  </Link>
                </div>
                <p className="mt-4 text-xs text-zinc-500 font-normal">
                  {t.home.ctaFootnote}
                </p>
              </FadeIn>
            </div>
          </div>
        </section>
      </div>
    </MarketingChrome>
  );
}
