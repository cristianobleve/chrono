"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UploadCloud,
  FileCode,
  Sparkles,
  Layers,
  Calendar,
  Check,
  Copy,
  Trash2,
  FileText,
  AlertCircle,
  Plus,
  Loader2,
  ChevronRight,
  Clock,
  Tag,
} from "lucide-react";
import {
  parseBulkProjectsMarkdown,
  ParsedProjectImport,
} from "@/lib/markdownProjectParser";
import {
  sampleProjectMarkdown,
  sampleBulkProjectsMarkdown,
} from "@/lib/projectTemplateExample";
import { useLinearStore } from "@/store/useLinearStore";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { cn } from "@/lib/utils";

const blankTemplateMarkdown = `# Nome del Nuovo Progetto

> Breve riassunto degli obiettivi principali del progetto in una o due frasi.

## Metadata
- **Status**: Planned
- **Priority**: High
- **Target Date**: 2026-11-30

## Description
Descrizione dettagliata dell'iniziativa, contesto strategico, requisiti tecnici e criteri di accettazione.

## Milestones
- [ ] Fase 1: Setup iniziale e architettura (Target: 2026-10-15)
- [ ] Fase 2: Sviluppo funzionalità core (Target: 2026-11-15)
- [ ] Fase 3: Testing e rilascio in produzione (Target: 2026-11-30)

## Issues
### Setup iniziale ambiente e configurazioni
- **Status**: Todo
- **Priority**: High
- **Estimate**: 3
- **Labels**: Setup, Core
Configurazione iniziale del repository, variabili d'ambiente e dipendenze del progetto.

### Implementazione logica principale
- **Status**: Backlog
- **Priority**: Urgent
- **Estimate**: 5
- **Labels**: Backend, API
Sviluppo dei componenti chiave e integrazione con il database.
`;

export default function ImportProjectsPage() {
  const router = useRouter();
  const {
    currentWorkspaceId,
    workspace,
    workspaces,
    importProjectFromMarkdown,
    importBulkProjectsFromMarkdown,
    addToast,
  } = useLinearStore();

  const [markdown, setMarkdown] = useState<string>(sampleBulkProjectsMarkdown);
  const [parsedList, setParsedList] = useState<ParsedProjectImport[]>(() =>
    parseBulkProjectsMarkdown(sampleBulkProjectsMarkdown)
  );
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Real-time parsing on markdown change
  useEffect(() => {
    try {
      const results = parseBulkProjectsMarkdown(markdown);
      setParsedList(results);
      if (selectedIdx >= results.length) {
        setSelectedIdx(0);
      }
    } catch (err) {
      console.error("Errore durante il parsing del markdown:", err);
    }
  }, [markdown, selectedIdx]);

  const activeWorkspaceName =
    workspace?.name ||
    workspaces.find((w) => w.id === currentWorkspaceId)?.name ||
    "Workspace";

  const totalMilestones = parsedList.reduce(
    (acc, p) => acc + (p.milestones?.length || 0),
    0
  );
  const totalIssues = parsedList.reduce(
    (acc, p) => acc + (p.issues?.length || 0),
    0
  );
  const currentProject = parsedList[selectedIdx] || parsedList[0];
  const isBulk = parsedList.length > 1;

  // File upload handling
  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setMarkdown(content);
        setSelectedIdx(0);
        addToast({
          title: "File caricato",
          description: file.name,
          type: "info",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleCopy = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleImport = async () => {
    if (!parsedList || parsedList.length === 0) {
      addToast({
        title: "Nessun progetto rilevato",
        description: "Inserisci una specifica Markdown valida prima di importare.",
        type: "error",
      });
      return;
    }

    try {
      setIsImporting(true);

      if (parsedList.length === 1) {
        const created = importProjectFromMarkdown(parsedList[0]);
        setTimeout(() => {
          setIsImporting(false);
          router.push(`/project/${created.slug}`);
        }, 350);
      } else {
        const createdBulk = importBulkProjectsFromMarkdown(parsedList);
        setTimeout(() => {
          setIsImporting(false);
          router.push("/projects");
        }, 350);
      }
    } catch (err: any) {
      console.error("Errore durante l'importazione:", err);
      setIsImporting(false);
      addToast({
        title: "Errore durante l'importazione",
        description: err?.message || "Si è verificato un errore imprevisto.",
        type: "error",
      });
    }
  };

  const lineCount = markdown ? markdown.split("\n").length : 0;
  const charCount = markdown ? markdown.length : 0;

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#08090a] text-zinc-100 select-none">
      {/* 1. Header Toolbar */}
      <header className="h-13 px-4 md:px-6 border-b border-white/5 bg-[#090a0d] flex items-center justify-between shrink-0 gap-4">
        {/* Left: Breadcrumbs & Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors group shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium">Progetti</span>
          </Link>
          <span className="text-zinc-600 text-xs">/</span>
          <span className="text-xs font-semibold text-white truncate">
            Importa da Markdown
          </span>

          {parsedList.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-[11px] text-zinc-300 font-mono shrink-0">
              <Layers className="w-3 h-3 text-zinc-400" />
              <span>
                {parsedList.length} {parsedList.length === 1 ? "progetto" : "progetti"}
              </span>
              <span className="text-zinc-600">·</span>
              <span>{totalMilestones} milestone</span>
              <span className="text-zinc-600">·</span>
              <span>{totalIssues} issue</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/projects"
            className="px-3 py-1.5 rounded-[8px] bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 text-xs font-medium transition-colors"
          >
            Annulla
          </Link>

          <button
            onClick={handleImport}
            disabled={isImporting || parsedList.length === 0}
            className={cn(
              "px-3.5 py-1.5 rounded-[8px] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm",
              parsedList.length > 0 && !isImporting
                ? "bg-white hover:bg-zinc-200 text-zinc-950"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
            )}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Importazione in corso...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                <span>
                  {parsedList.length > 1
                    ? `Importa ${parsedList.length} progetti`
                    : "Importa nel workspace"}
                </span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. Main Two-Column Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full overflow-hidden">
        {/* =========================================================================
            LEFT COLUMN: Markdown Source Editor
           ========================================================================= */}
        <div className="flex-1 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#090a0d]">
          {/* Editor Header Bar */}
          <div className="h-10 px-4 border-b border-white/5 bg-[#0a0c10] flex items-center justify-between shrink-0 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <FileCode className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-semibold text-xs text-zinc-200">Sorgente Markdown</span>
            </div>

            {/* Quick Template Switcher & Actions */}
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown,.txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <button
                onClick={() => setMarkdown(sampleProjectMarkdown)}
                className="px-2 py-1 rounded-[6px] text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Carica esempio di progetto singolo"
              >
                Singolo
              </button>

              <button
                onClick={() => setMarkdown(sampleBulkProjectsMarkdown)}
                className="px-2 py-1 rounded-[6px] text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Carica esempio multi-progetto con marcatore __sep"
              >
                Multi-Progetto
              </button>

              <button
                onClick={() => setMarkdown(blankTemplateMarkdown)}
                className="px-2 py-1 rounded-[6px] text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Carica struttura scheletro vuota"
              >
                Vuoto
              </button>

              <span className="w-px h-3.5 bg-white/10 mx-1" />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-[6px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Carica file Markdown dal computer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleCopy}
                className="p-1.5 rounded-[6px] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Copia negli appunti"
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => setMarkdown("")}
                className="p-1.5 rounded-[6px] text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Svuota editor"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Editor Area with Drag and Drop */}
          <div
            className="flex-1 relative min-h-0 flex flex-col overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {dragActive && (
              <div className="absolute inset-0 z-20 bg-zinc-950/80 backdrop-blur-sm border-2 border-dashed border-white/30 flex flex-col items-center justify-center gap-2 p-6 text-center animate-fade-in pointer-events-none">
                <UploadCloud className="w-10 h-10 text-white" />
                <span className="text-sm font-semibold text-white">
                  Rilascia qui il file Markdown per caricarlo
                </span>
                <span className="text-xs text-zinc-400">
                  Formati supportati: .md, .markdown, .txt
                </span>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Incolla qui la specifica Markdown del tuo progetto o della roadmap..."
              spellCheck={false}
              className="flex-1 w-full p-4 md:p-5 bg-transparent text-zinc-200 font-mono text-[12.5px] leading-relaxed resize-none focus:outline-none placeholder:text-zinc-600 overflow-y-auto"
            />
          </div>

          {/* Editor Status Footer */}
          <div className="h-7 px-4 border-t border-white/5 bg-[#0a0c10] flex items-center justify-between text-[10px] text-zinc-500 font-mono shrink-0">
            <div className="flex items-center gap-3">
              <span>{lineCount} righe</span>
              <span>·</span>
              <span>{charCount} caratteri</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span>Workspace destinazione:</span>
              <span className="font-semibold text-zinc-300">{activeWorkspaceName}</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Real-Time Structured Linear Preview
           ========================================================================= */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#08090a] overflow-hidden">
          {/* Preview Header Bar */}
          <div className="h-10 px-4 border-b border-white/5 bg-[#0a0c10] flex items-center justify-between shrink-0 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-semibold text-xs text-zinc-200">Anteprima Strutturata</span>
            </div>

            {/* If Multi-Project: Navigation Tabs */}
            {parsedList.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto max-w-sm py-1">
                {parsedList.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIdx(idx)}
                    className={cn(
                      "px-2.5 py-1 rounded-[6px] text-[11px] font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                      selectedIdx === idx
                        ? "bg-zinc-800 text-white shadow-sm border border-white/10"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    )}
                  >
                    <span>{idx + 1}.</span>
                    <span className="max-w-[120px] truncate">{p.name || "Senza titolo"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preview Scrollable Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-5">
            {!currentProject || !currentProject.name ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-[12px] text-zinc-500 gap-3">
                <FileText className="w-8 h-8 text-zinc-600" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-300">
                    Nessuna specifica valida rilevata
                  </p>
                  <p className="text-[11px] text-zinc-500 max-w-xs">
                    Incolla una specifica Markdown nell'editor a sinistra o clicca su uno dei template rapidi.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* 1. Project Master Card */}
                <div className="rounded-[12px] bg-[#0c0d10] border border-white/5 p-5 flex flex-col gap-3.5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[8px] bg-zinc-800 border border-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {currentProject.name.charAt(0).toUpperCase() || "P"}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white tracking-tight leading-snug">
                          {currentProject.name}
                        </h2>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          ID assegnato all'importazione
                        </span>
                      </div>
                    </div>

                    {/* Metadata Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-[6px] bg-zinc-900 border border-white/5 text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
                        <StatusIcon status={currentProject.status} />
                        <span>{currentProject.status}</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-[6px] bg-zinc-900 border border-white/5 text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
                        <PriorityIcon priority={currentProject.priority} />
                        <span className="capitalize">{currentProject.priority}</span>
                      </span>

                      {currentProject.targetDate && (
                        <span className="px-2.5 py-1 rounded-[6px] bg-zinc-900 border border-white/5 text-[11px] font-medium text-zinc-300 flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>{currentProject.targetDate}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary & Description */}
                  {currentProject.summary && (
                    <div className="p-3 rounded-[8px] bg-zinc-900/60 border border-white/5 text-xs text-zinc-300 leading-relaxed italic border-l-2 border-l-white/20">
                      {currentProject.summary}
                    </div>
                  )}

                  {currentProject.description && (
                    <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line border-t border-white/5 pt-3">
                      {currentProject.description}
                    </div>
                  )}
                </div>

                {/* 2. Milestones Card */}
                <div className="rounded-[12px] bg-[#0c0d10] border border-white/5 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">
                      Milestone di Progetto ({currentProject.milestones?.length || 0})
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">Fasi sequenziali</span>
                  </div>

                  {(!currentProject.milestones || currentProject.milestones.length === 0) ? (
                    <div className="py-4 text-center text-xs text-zinc-500">
                      Nessuna milestone definita in questa sezione.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentProject.milestones.map((ms, msIdx) => (
                        <div
                          key={msIdx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-[8px] bg-zinc-900/40 border border-white/5 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={cn(
                                "w-4 h-4 rounded-full flex items-center justify-center shrink-0 border text-[10px]",
                                ms.completed
                                  ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-400"
                                  : "border-white/20 text-zinc-500"
                              )}
                            >
                              {ms.completed && <Check className="w-2.5 h-2.5" />}
                            </span>
                            <span className="font-medium text-zinc-200 truncate">
                              {ms.name}
                            </span>
                          </div>

                          {ms.targetDate && (
                            <span className="px-2 py-0.5 rounded-[6px] bg-zinc-900 border border-white/5 text-[10px] text-zinc-400 font-mono shrink-0 flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-zinc-500" />
                              <span>{ms.targetDate}</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Issues Card */}
                <div className="rounded-[12px] bg-[#0c0d10] border border-white/5 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">
                      Task & Issue Collegate ({currentProject.issues?.length || 0})
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">Backlog generato</span>
                  </div>

                  {(!currentProject.issues || currentProject.issues.length === 0) ? (
                    <div className="py-4 text-center text-xs text-zinc-500">
                      Nessuna issue definita per questo progetto.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentProject.issues.map((iss, issIdx) => (
                        <div
                          key={issIdx}
                          className="p-3 rounded-[8px] bg-zinc-900/40 border border-white/5 flex flex-col gap-2 hover:bg-zinc-900/60 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <StatusIcon status={iss.status} />
                              <span className="font-medium text-xs text-zinc-200 truncate">
                                {iss.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <PriorityIcon priority={iss.priority} />
                              {iss.estimate !== null && iss.estimate !== undefined && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-white/5">
                                  {iss.estimate} pt
                                </span>
                              )}
                            </div>
                          </div>

                          {iss.description && (
                            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed pl-5">
                              {iss.description}
                            </p>
                          )}

                          {iss.labels && iss.labels.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap pl-5 pt-1">
                              {iss.labels.map((lbl, lIdx) => (
                                <span
                                  key={lIdx}
                                  className="px-1.5 py-0.5 rounded bg-zinc-800/80 border border-white/5 text-[10px] text-zinc-400 flex items-center gap-1"
                                >
                                  <Tag className="w-2.5 h-2.5 text-zinc-500" />
                                  <span>{lbl}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
