"use client";

import React, { useState, useEffect } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import {
  X,
  UploadCloud,
  FileCode,
  Sparkles,
  Layers,
  Calendar,
  Download,
  ArrowRight,
  Edit3,
  Box,
  Split,
  Check,
} from "lucide-react";
import {
  parseBulkProjectsMarkdown,
  ParsedProjectImport,
} from "@/lib/markdownProjectParser";
import {
  sampleProjectMarkdown,
  sampleBulkProjectsMarkdown,
} from "@/lib/projectTemplateExample";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { PriorityIcon } from "@/components/ui/PriorityIcon";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export const ImportProjectModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    activeModal,
    setActiveModal,
    importProjectFromMarkdown,
    importBulkProjectsFromMarkdown,
  } = useLinearStore();
  const router = useRouter();

  const [markdown, setMarkdown] = useState<string>(sampleBulkProjectsMarkdown);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("preview");
  const [parsedList, setParsedList] = useState<ParsedProjectImport[]>(() =>
    parseBulkProjectsMarkdown(sampleBulkProjectsMarkdown)
  );
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    try {
      const results = parseBulkProjectsMarkdown(markdown);
      setParsedList(results);
      if (selectedIdx >= results.length) {
        setSelectedIdx(0);
      }
    } catch (e) {
      console.error("Failed to parse bulk markdown", e);
    }
  }, [markdown, selectedIdx]);

  if (activeModal !== "import_project") return null;

  const isBulk = parsedList.length > 1;
  const currentProject = parsedList[selectedIdx] || parsedList[0];

  const totalMilestones = parsedList.reduce((acc, p) => acc + (p.milestones?.length || 0), 0);
  const totalIssues = parsedList.reduce((acc, p) => acc + (p.issues?.length || 0), 0);

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setMarkdown(content);
        setActiveTab("preview");
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

  const handleDownloadTemplate = (bulk: boolean = true) => {
    const content = bulk ? sampleBulkProjectsMarkdown : sampleProjectMarkdown;
    const filename = bulk ? "chrono-bulk-projects-template.md" : "chrono-project-template.md";
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExecuteImport = () => {
    if (!parsedList || parsedList.length === 0) return;

    if (parsedList.length === 1) {
      const newProject = importProjectFromMarkdown(parsedList[0]);
      setActiveModal(null);
      router.push(`/project/${newProject.slug}`);
    } else {
      importBulkProjectsFromMarkdown(parsedList);
      setActiveModal(null);
      router.push(`/projects`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[4px] p-4 animate-fade-in select-none"
      onClick={() => setActiveModal(null)}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-white">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight font-heading">
                {t.modals.importProjectsTitle}
              </h2>
              <p className="text-[11px] text-zinc-400">
                {t.modals.importProjectsSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Chiudi modale"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Tabs (Matching reference layout) */}
        <div className="flex items-center gap-8 border-b border-white/10 px-6 pt-3 shrink-0 bg-zinc-950">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={cn(
              "flex items-center gap-2 pb-3 text-xs font-medium transition-all relative cursor-pointer",
              activeTab === "editor"
                ? "text-white font-semibold"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <span
              className={cn(
                "w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono transition-colors",
                activeTab === "editor"
                  ? "bg-white text-zinc-950 font-bold"
                  : "bg-zinc-900 text-zinc-400 border border-white/10"
              )}
            >
              1
            </span>
            <span>{t.modals.tabFileSource}</span>
            {activeTab === "editor" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={cn(
              "flex items-center gap-2 pb-3 text-xs font-medium transition-all relative cursor-pointer",
              activeTab === "preview"
                ? "text-white font-semibold"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <span
              className={cn(
                "w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono transition-colors",
                activeTab === "preview"
                  ? "bg-white text-zinc-950 font-bold"
                  : "bg-zinc-900 text-zinc-400 border border-white/10"
              )}
            >
              2
            </span>
            <span>
              {t.modals.tabSummary} ({parsedList.length} Progett{parsedList.length === 1 ? "o" : "i"})
            </span>
            {activeTab === "preview" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {activeTab === "editor" ? (
            /* STEP 1: File & Source Input */
            <div className="flex flex-col gap-4">
              {/* Drag and drop upload zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById("md-file-input")?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2",
                  dragActive
                    ? "border-white/40 bg-white/5"
                    : "border-white/10 hover:border-white/20 bg-zinc-900/40 hover:bg-zinc-900/70"
                )}
              >
                <input
                  id="md-file-input"
                  type="file"
                  accept=".md,.markdown,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
                  <FileCode className="w-5 h-5" />
                </div>
                <span className="font-semibold text-xs text-white">
                  {t.modals.dragDropText}
                </span>
                <span className="text-[11px] text-zinc-500">
                  {t.modals.sepNote}
                </span>
              </div>

              {/* Template quick loader bar */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-400 font-medium">Modelli precompilati:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMarkdown(sampleBulkProjectsMarkdown);
                      setActiveTab("preview");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    Carica Esempio Bulk (__sep)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMarkdown(sampleProjectMarkdown);
                      setActiveTab("preview");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    Carica Esempio Singolo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadTemplate(true)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Scarica template .md"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Markdown Editor */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Contenuto Markdown sorgente</span>
                  <span className="font-mono">{markdown.split("\n").length} righe</span>
                </div>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="# Progetto 1...&#10;&#10;__sep&#10;&#10;# Progetto 2..."
                  style={{ fontFamily: "'DM Mono', monospace" }}
                  className="w-full h-48 p-3.5 rounded-xl bg-zinc-900/60 border border-white/10 focus:border-white/25 text-white text-xs leading-relaxed resize-none focus:outline-none select-text font-mono tracking-tight"
                />
              </div>

              {/* Step 1 CTA */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className="h-9 px-4 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Prosegui al riepilogo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Clean Structured Summary (Directly inspired by reference) */
            <div className="flex flex-col gap-5">
              {/* Section Header */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-white font-heading font-bold text-sm">
                  <Box className="w-4 h-4 text-zinc-400" />
                  <span>Informazioni Progetti Rilevati</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Riepilogo essenziale dei progetti e delle attività rilevate nel file.
                </p>
              </div>

              {/* [ PROGETTI TROVATI ] Selector Ribbon if multiple */}
              {isBulk && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    Progetti Trovati ({parsedList.length})
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {parsedList.map((p, idx) => {
                      const isSel = idx === selectedIdx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedIdx(idx)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 font-medium",
                            isSel
                              ? "bg-white text-zinc-950 font-semibold shadow-sm"
                              : "bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-white/10"
                          )}
                        >
                          <span className={cn("font-mono text-[10px]", isSel ? "text-zinc-600 font-bold" : "text-zinc-500")}>
                            .{idx + 1}
                          </span>
                          <span className="truncate max-w-[150px]">{p.name}</span>
                          <span className={cn("text-[10px]", isSel ? "text-zinc-600" : "text-zinc-500")}>
                            ({p.issues.length})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Project Summary Card (Clean, minimal, 1 box) */}
              {currentProject && (
                <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-500">
                          {isBulk ? `PROGETTO ${selectedIdx + 1} DI ${parsedList.length}` : "PROGETTO RILEVATO"}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-white/10 text-white border border-white/20 text-[10px] font-medium">
                          {currentProject.status}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-white/10 text-[10px] uppercase font-mono">
                          {currentProject.priority}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-tight font-heading truncate">
                        {currentProject.name}
                      </h3>
                    </div>

                    {currentProject.targetDate && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-[11px] text-zinc-300 shrink-0">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        <span>Scadenza: {currentProject.targetDate}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {currentProject.summary || currentProject.description || "Nessuna descrizione specificata."}
                  </p>
                </div>
              )}

              {/* [ MILESTONES RILEVATE ] Minimal horizontal list */}
              {currentProject && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Milestone Rilevate ({currentProject.milestones.length})
                    </span>
                  </div>

                  {currentProject.milestones.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {currentProject.milestones.map((ms, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/60 border border-white/5 text-xs text-zinc-300"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                          <span className="font-medium text-white">{ms.name}</span>
                          {ms.targetDate && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              ({ms.targetDate})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500 italic">
                      Nessuna milestone specificata nel file.
                    </span>
                  )}
                </div>
              )}

              {/* Horizontal Divider */}
              <div className="border-t border-white/10" />

              {/* [ ISSUE E TASK COLLEGATE ] Compact High-Density List */}
              {currentProject && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Issue e Task Collegate da Creare ({currentProject.issues.length})
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Assegnate a {currentProject.name}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                    {currentProject.issues.map((iss, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <StatusIcon status={iss.status} />
                          <span className="text-white font-medium truncate">
                            {iss.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {iss.labels && iss.labels.length > 0 && (
                            <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-white/5">
                              {iss.labels[0]}
                            </span>
                          )}
                          <PriorityIcon priority={iss.priority} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer (Matching reference bottom actions) */}
        <div className="px-6 py-3.5 border-t border-white/5 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-400">
            {activeTab === "preview" ? (
              <span>
                Totale: <strong className="text-white">{parsedList.length} Progett{parsedList.length === 1 ? "o" : "i"}</strong> •{" "}
                <strong className="text-white">{totalMilestones} Milestone</strong> •{" "}
                <strong className="text-white">{totalIssues} Task</strong>
              </span>
            ) : (
              <span className="text-zinc-500">File Markdown caricato</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>

            <button
              type="button"
              onClick={handleExecuteImport}
              className="h-9 px-4 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>
                Importa {parsedList.length === 1 ? "il Progetto" : `tutti i ${parsedList.length} Progetti`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
