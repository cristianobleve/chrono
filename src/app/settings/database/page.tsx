"use client";

import React, { useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import {
  Database,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Key,
  Server,
  Lock,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  Code2,
  Copy,
  Check,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/react-bits/SpotlightCard";
import { ShinyText } from "@/components/ui/react-bits/ShinyText";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export default function SettingsDatabasePage() {
  const {
    projects,
    issues,
    habits,
    tags,
    workspaces,
    accounts,
    supabaseStatus,
    syncWithSupabase,
    pushToSupabase,
    pullFromSupabase,
    addToast,
  } = useLinearStore();
  const { t } = useTranslation();

  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleTestDatabase = async () => {
    setIsSyncing(true);
    await syncWithSupabase();
    setIsSyncing(false);
  };

  const handlePushAll = async () => {
    setIsSyncing(true);
    await pushToSupabase();
    setIsSyncing(false);
  };

  const handlePullAll = async () => {
    setIsSyncing(true);
    await pullFromSupabase();
    setIsSyncing(false);
  };

  const handleCopySchema = () => {
    const schemaSql = `-- Chrono Supabase Migration Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Tables: workspaces, accounts, projects, issues, habits, tags, project_folders...
-- (Schema completo disponibile in /supabase/schema.sql)`;
    navigator.clipboard.writeText(schemaSql);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
    addToast({
      title: "Schema SQL Copiato",
      description: "Puoi incollarlo nel SQL Editor di Supabase.",
      type: "info",
    });
  };

  return (
    <div className="flex-1 p-6 md:p-10 w-full max-w-5xl flex flex-col gap-8 text-ink select-none pb-24">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {t.databaseSettings.title}
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          {t.databaseSettings.subtitle}
        </p>
      </div>

      {/* Database Connection Card */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
          Supabase PostgreSQL
        </h2>
        <div className="p-6 rounded-[16px] bg-zinc-950 border border-white/10 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[14px] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Supabase PostgreSQL 15.6</span>
                <span
                  className="text-xs text-zinc-400 font-mono mt-0.5"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  db.bicoxqwmpznpjjgwmrgw.supabase.co:5432
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t.databaseSettings.statusConnected}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5 text-xs">
            <div className="p-3 rounded-[12px] bg-zinc-900/60 border border-white/5 flex flex-col gap-1">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold">Workspaces</span>
              <span className="font-semibold text-white font-mono">{workspaces.length} Attivi</span>
            </div>
            <div className="p-3 rounded-[12px] bg-zinc-900/60 border border-white/5 flex flex-col gap-1">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold">Accounts</span>
              <span className="font-semibold text-white font-mono">{accounts.length} Profili</span>
            </div>
            <div className="p-3 rounded-[12px] bg-zinc-900/60 border border-white/5 flex flex-col gap-1">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold">Progetti</span>
              <span className="font-semibold text-white font-mono">{projects.length} Progetti</span>
            </div>
            <div className="p-3 rounded-[12px] bg-zinc-900/60 border border-white/5 flex flex-col gap-1">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold">Issues</span>
              <span className="font-semibold text-white font-mono">{issues.length} Issues</span>
            </div>
          </div>

          {/* Sync Operations Toolbar */}
          <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePushAll}
                disabled={isSyncing}
                className="px-3.5 py-1.5 rounded-[10px] bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-all flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Invia Stato Locale a Supabase</span>
              </button>

              <button
                type="button"
                onClick={handlePullAll}
                disabled={isSyncing}
                className="px-3.5 py-1.5 rounded-[10px] bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-zinc-400" />
                <span>Scarica dal Cloud</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleTestDatabase}
              disabled={isSyncing}
              className="px-4 py-1.5 rounded-[10px] bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
              <span>{isSyncing ? "Verifica in corso..." : "Test Connessione"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Endpoints & Schema Access */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
          Configurazione Supabase & Schema SQL
        </h2>
        <div className="p-6 rounded-[16px] bg-zinc-950 border border-white/10 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-zinc-400">Supabase Project URL</span>
              <div className="p-3 rounded-[10px] bg-zinc-900/60 border border-white/5 font-mono text-xs text-white truncate">
                https://bicoxqwmpznpjjgwmrgw.supabase.co
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-zinc-400">Database Connection String</span>
              <div className="p-3 rounded-[10px] bg-zinc-900/60 border border-white/5 font-mono text-xs text-zinc-400 truncate">
                postgresql://postgres:••••••••@db.bicoxqwmpznpjjgwmrgw.supabase.co:5432/postgres
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:text-primary-hover hover:underline flex items-center gap-1 font-medium"
            >
              <span>Apri Dashboard Supabase Cloud</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="/supabase/schema.sql"
              target="_blank"
              className="px-3.5 py-1.5 rounded-[10px] bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-primary" />
              <span>Visualizza Schema SQL Completo</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
