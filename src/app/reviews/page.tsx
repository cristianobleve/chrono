"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { GitPullRequest } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function ReviewsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-canvas select-none">
      <Header title={t.reviews.title} />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">
        <div className="w-12 h-12 rounded-full bg-surface-1 border border-hairline flex items-center justify-center text-ink-subtle mb-3">
          <GitPullRequest className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-sm font-semibold text-ink mb-1">{t.reviews.empty}</h2>
        <p className="text-xs text-ink-subtle leading-relaxed">
          {t.reviews.connectRepo}
        </p>
      </div>
    </div>
  );
}
