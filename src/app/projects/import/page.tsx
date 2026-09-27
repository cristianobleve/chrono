"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UploadCloud,
  FileCode,
  Sparkles,
  Calendar,
  Check,
  Copy,
  Trash2,
  FileText,
  Loader2,
  ChevronRight,
  Clock,
  Layers,
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
import { ProjectIconBadge } from "@/components/ui/ProjectIconBadge";
import { cn } from "@/lib/utils";

const blankTemplateMarkdown = `# Nome del Nuovo Progetto

> Breve riassunto degli obiettivi principali del progetto in una o due frasi.

## Metadata
- **Status**: Planned
- **Priority**: High
- **Target Date**: 2026-11-30
- **Icon**: cube
- **Icon Color**: #5e6ad2
- **Icon Bg**: #121419
- **Cover**: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80

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
  const [activeTemplate, setActiveTemplate] = useState<"bulk" | "single" | "blank">("bulk");
  const [parsedList, setParsedList] = useState<ParsedProjectImport[]>(() =>
    parseBulkProjectsMarkdown(sampleBulkProjectsMarkdown)
  );
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

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

  // Synchronized scrolling between gutter and textarea
  const handleEditorScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

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
        importBulkProjectsFromMarkdown(parsedList);
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

  const lines = markdown.split("\n");
  const lineCount = lines.length;
  const charCount = markdown.length;

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#08090a] text-zinc-100 select-none">
      {/* 1. Ultra-clean Top Bar */}
      <header className="h-11 px-4 border-b border-white/5 bg-[#090a0d] flex items-center justify-between shrink-0 gap-3">
        {/* Left: Navigation and File Tag */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors group shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-medium">Progetti</span>
          </Link>
          <span className="text-zinc-700 text-xs">/</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] bg-zinc-900/80 border border-white/5 text-[11px] text-zinc-300 font-mono shrink-0">
            <FileCode className="w-3 h-3 text-zinc-400" />
            <span>specification.md</span>
          </div>

          {/* Template Switcher Pills */}
          <div className="hidden sm:flex items-center gap-1 ml-2 p-0.5 rounded-[6px] bg-zinc-900/50 border border-white/5">
            <button
              type="button"
              onClick={() => {
                setActiveTemplate("bulk");
                setMarkdown(sampleBulkProjectsMarkdown);
                setSelectedIdx(0);
              }}
              className={cn(
                "px-2 py-0.5 text-[11px] rounded-[4px] transition-colors",
                activeTemplate === "bulk"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Multi-progetto
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTemplate("single");
                setMarkdown(sampleProjectMarkdown);
                setSelectedIdx(0);
              }}
              className={cn(
                "px-2 py-0.5 text-[11px] rounded-[4px] transition-colors",
                activeTemplate === "single"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Singolo
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTemplate("blank");
                setMarkdown(blankTemplateMarkdown);
                setSelectedIdx(0);
              }}
              className={cn(
                "px-2 py-0.5 text-[11px] rounded-[4px] transition-colors",
                activeTemplate === "blank"
                  ? "bg-zinc-800 text-white font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              Vuoto
            </button>
          </div>
        </div>

        {/* Right: Quick Tools */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <span className="text-[11px] font-mono text-zinc-500 hidden md:inline">
            {lineCount} righe · {charCount} caratteri
          </span>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-[6px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3 h-3 text-zinc-400" />
            <span className="hidden sm:inline">Carica .md</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 rounded-[6px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copiato</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-zinc-400" />
                <span className="hidden sm:inline">Copia</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMarkdown("");
              setParsedList([]);
            }}
            title="Svuota editor"
            className="p-1 rounded-[6px] hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Claude Artifact Split View */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Pane: Clean Markdown Editor */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-[#090a0d] border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden"
        >
          {/* Drop Overlay */}
          {dragActive && (
            <div className="absolute inset-0 bg-blue-950/80 border-2 border-dashed border-blue-500 z-30 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
              <UploadCloud className="w-10 h-10 text-blue-400 mb-2 animate-bounce" />
              <p className="text-sm font-medium text-white">Rilascia il file Markdown qui</p>
            </div>
          )}

          {/* Editor Header Tab */}
          <div className="h-8 px-3 border-b border-white/5 bg-[#0a0b0f] flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
            <span className="font-mono text-zinc-400">editor</span>
            <span className="text-[10px] text-zinc-500">Formato GitHub Markdown supportato</span>
          </div>

          {/* Code Area with Line Numbers Gutter */}
          <div className="flex-1 flex overflow-hidden relative">
            <div
              ref={gutterRef}
              className="w-10 py-3 pr-2 select-none text-right font-mono text-[12px] leading-6 text-zinc-600 border-r border-white/5 bg-[#08090b] overflow-hidden"
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              onScroll={handleEditorScroll}
              placeholder="Incolla qui la specifica del progetto in formato Markdown..."
              className="flex-1 w-full h-full p-3 bg-transparent text-zinc-200 font-mono text-[13px] leading-6 resize-none focus:outline-none selection:bg-white/20 whitespace-pre overflow-auto"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Pane: Live Visual Artifact Result */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-[#08090a] relative overflow-hidden">
          {/* Artifact Preview Header */}
          <div className="h-8 px-4 border-b border-white/5 bg-[#0a0b0f] flex items-center justify-between text-[11px] shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-400">risultato</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400 font-medium">
                {parsedList.length} {parsedList.length === 1 ? "progetto" : "progetti"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
              <span>{totalMilestones} milestone</span>
              <span>{totalIssues} issue</span>
            </div>
          </div>

          {/* Multi-Project Switcher Tabs (if isBulk) */}
          {isBulk && (
            <div className="px-4 py-2 border-b border-white/5 bg-[#090a0d] flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
              {parsedList.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all shrink-0 cursor-pointer border",
                    selectedIdx === idx
                      ? "bg-zinc-800 text-white border-white/10 shadow-sm"
                      : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-white/5"
                  )}
                >
                  <ProjectIconBadge
                    icon={p.icon}
                    iconBg={p.iconBg}
                    iconColor={p.iconColor}
                    name={p.name}
                    size="xs"
                  />
                  <span className="truncate max-w-[140px]">{p.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Rendered Preview Scroll Area */}
          <div className="flex-1 overflow-y-auto relative pb-28">
            {currentProject ? (
              <div className="w-full flex flex-col">
                {/* 1. Hero Cover Banner */}
                <div className="w-full h-44 md:h-52 relative overflow-hidden bg-zinc-950 border-b border-white/5 shrink-0">
                  {currentProject.coverUrl ? (
                    <img
                      src={currentProject.coverUrl}
                      alt="Project Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : currentProject.coverGradient ? (
                    <div
                      className="w-full h-full"
                      style={{ background: currentProject.coverGradient }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900" />
                  )}
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090a] via-[#08090a]/50 to-transparent pointer-events-none" />
                </div>

                {/* 2. Project Header & Identity Deck */}
                <div className="px-6 md:px-8 -mt-9 relative z-10 flex flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <ProjectIconBadge
                      icon={currentProject.icon}
                      iconBg={currentProject.iconBg}
                      iconColor={currentProject.iconColor}
                      name={currentProject.name}
                      size="xl"
                      className="shadow-xl ring-2 ring-black shrink-0"
                    />
                    <div className="flex-1 pt-2 min-w-0">
                      <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight break-words">
                        {currentProject.name || "Nuovo Progetto"}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {/* Status Chip */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-xs text-zinc-300">
                          <StatusIcon
                            status={
                              currentProject.status === "In Progress"
                                ? "in_progress"
                                : currentProject.status === "Completed"
                                ? "done"
                                : "todo"
                            }
                            className="w-3.5 h-3.5"
                          />
                          <span>{currentProject.status}</span>
                        </div>

                        {/* Priority Chip */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-xs text-zinc-300">
                          <PriorityIcon
                            priority={currentProject.priority}
                            className="w-3.5 h-3.5"
                          />
                          <span className="capitalize">{currentProject.priority}</span>
                        </div>

                        {/* Target Date Chip */}
                        {currentProject.targetDate && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-xs text-zinc-300">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{currentProject.targetDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Block */}
                  {currentProject.summary && (
                    <div className="p-3.5 rounded-[8px] bg-zinc-900/60 border border-white/5 text-sm text-zinc-300 leading-relaxed">
                      {currentProject.summary}
                    </div>
                  )}

                  {/* Description */}
                  {currentProject.description && (
                    <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
                      {currentProject.description}
                    </div>
                  )}

                  {/* 3. Milestones Roadmap */}
                  {currentProject.milestones && currentProject.milestones.length > 0 && (
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xs font-semibold text-zinc-200">
                          Milestone e Roadmap ({currentProject.milestones.length})
                        </h2>
                      </div>
                      <div className="space-y-1.5">
                        {currentProject.milestones.map((ms, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-[8px] bg-zinc-900/40 border border-white/5 text-xs text-zinc-300"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={cn(
                                  "w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0",
                                  ms.completed
                                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                    : "border-white/20 text-transparent"
                                )}
                              >
                                {ms.completed && <Check className="w-3 h-3" />}
                              </div>
                              <span
                                className={cn(
                                  "truncate",
                                  ms.completed && "line-through text-zinc-500"
                                )}
                              >
                                {ms.name}
                              </span>
                            </div>
                            {ms.targetDate && (
                              <div className="flex items-center gap-1 text-[11px] text-zinc-500 shrink-0 font-mono ml-2">
                                <Clock className="w-3 h-3 text-zinc-600" />
                                <span>{ms.targetDate}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Issues & Tasks */}
                  {currentProject.issues && currentProject.issues.length > 0 && (
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xs font-semibold text-zinc-200">
                          Attività e Issue ({currentProject.issues.length})
                        </h2>
                      </div>
                      <div className="space-y-1.5">
                        {currentProject.issues.map((iss, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-[8px] bg-zinc-900/40 border border-white/5 text-xs text-zinc-300"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <StatusIcon status={iss.status} className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{iss.title}</span>
                              {iss.labels && iss.labels.length > 0 && (
                                <div className="hidden sm:flex items-center gap-1 ml-1 shrink-0">
                                  {iss.labels.map((lbl, lIdx) => (
                                    <span
                                      key={lIdx}
                                      className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-400"
                                    >
                                      {lbl}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {iss.estimate && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">
                                  {iss.estimate} pt
                                </span>
                              )}
                              <PriorityIcon priority={iss.priority} className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                <FileText className="w-12 h-12 mb-3 stroke-[1.2] text-zinc-600" />
                <p className="text-sm font-medium text-zinc-400">Nessun progetto rilevato</p>
                <p className="text-xs mt-1 max-w-sm">
                  Scrivi o incolla una specifica in formato Markdown nell&apos;editor per visualizzare
                  l&apos;anteprima istantanea.
                </p>
              </div>
            )}
          </div>

          {/* 3. Floating Import CTA Docked Over Preview */}
          <div className="absolute bottom-6 right-6 z-30 pointer-events-auto">
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting || parsedList.length === 0}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs shadow-2xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-white/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Importazione in corso...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>
                    Importa {parsedList.length > 1 ? `${parsedList.length} progetti` : "progetto"} nel workspace
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-black" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
