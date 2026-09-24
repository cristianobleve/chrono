"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { useLinearStore } from "@/store/useLinearStore";

import { useTranslation } from "@/i18n";

export const TwingateFooter: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <footer className="w-full bg-[#09090b] border-t border-white/5 py-3.5 px-4 sm:px-6 md:px-10 select-none shrink-0 text-xs text-zinc-500 mt-auto">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Left: Operational Status */}
          <Link
            href="/settings/database"
            className="flex items-center gap-2 hover:text-white transition-colors group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-zinc-400 group-hover:text-white text-xs">
              {t.nav.allSystemsOperational}
            </span>
            <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Right: Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-zinc-500">
            <Link href="/pomodoro" className="hover:text-white transition-colors">
              {t.nav.pomodoro}
            </Link>
            <Link href="/agent" className="hover:text-white transition-colors">
              Chrono Agent
            </Link>
            <Link href="/projects" className="hover:text-white transition-colors">
              {t.projects.title}
            </Link>
            <Link href="/settings/preferences" className="hover:text-white transition-colors">
              {t.preferences.title}
            </Link>
            <span>{t.footer.copyright}</span>
          </div>
        </div>
      </footer>
    </>
  );
};
