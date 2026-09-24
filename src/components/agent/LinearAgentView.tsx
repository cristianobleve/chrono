"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import {
  Sparkles,
  ArrowUp,
  Mic,
  Paperclip,
  CheckCircle2,
  Box,
  Plus,
  Zap,
  History,
  Trash2,
  Copy,
  Check,
  Cpu,
  Layers,
  ChevronRight,
  MessageSquare,
  Wand2,
  X,
  Bot,
  Flame,
  Terminal,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCheck,
  ArrowRight,
} from "lucide-react";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { AVAILABLE_AI_MODELS, AIModelDefinition } from "@/lib/aiModels";
import { AgentMessageSkeleton } from "@/components/ui/Skeleton";
import { ChatMessage, PromptTemplate } from "@/types";
import { parseBulkProjectsMarkdown } from "@/lib/markdownProjectParser";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export const LinearAgentView: React.FC = () => {
  const { t } = useTranslation();
  const {
    chatSessions,
    activeSessionId,
    createChatSession,
    switchChatSession,
    deleteChatSession,
    addMessageToActiveSession,
    clearActiveSessionMessages,
    createIssue,
    updateIssue,
    bulkUpdateIssues,
    createProject,
    updateProject,
    bulkUpdateProjects,
    deleteProject,
    importBulkProjectsFromMarkdown,
    projects,
    issues,
    team,
    currentUser,
    preferences,
    updatePreferences,
    addToast,
  } = useLinearStore();

  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession =
    chatSessions.find((s) => s.id === activeSessionId) ||
    chatSessions[0] || {
      id: "session-default",
      title: t.agentView.defaultSessionTitle,
      messages: [],
    };

  const messages = currentSession.messages || [];

  const selectedModelId = preferences.aiModel || "gemini-flash-lite-latest";
  const activeModelDef =
    AVAILABLE_AI_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_AI_MODELS[0];

  const modelOptions: SelectOption[] = AVAILABLE_AI_MODELS.map((m) => ({
    value: m.id,
    label: m.name,
    icon: m.icon,
  }));

  const promptTemplates = [
    {
      id: "tpl-breakdown",
      label: t.agentView.tplBreakdownLabel,
      description: t.agentView.tplBreakdownDesc,
      prompt: t.agentView.tplBreakdownPrompt,
    },
    {
      id: "tpl-project",
      label: t.agentView.tplProjectLabel,
      description: t.agentView.tplProjectDesc,
      prompt: t.agentView.tplProjectPrompt,
    },
    {
      id: "tpl-summary",
      label: t.agentView.tplSummaryLabel,
      description: t.agentView.tplSummaryDesc,
      prompt: t.agentView.tplSummaryPrompt,
    },
    {
      id: "tpl-plan",
      label: t.agentView.tplPlanLabel,
      description: t.agentView.tplPlanDesc,
      prompt: t.agentView.tplPlanPrompt,
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSelectModel = (modelId: string) => {
    updatePreferences({ aiModel: modelId });
    const targetModel = AVAILABLE_AI_MODELS.find((m) => m.id === modelId);
    addToast({
      title: "Modello AI Modificato",
      description: `Ora stai usando ${targetModel?.name || modelId} (${targetModel?.provider})`,
      type: "info",
    });
  };

  const handleSend = async (customPrompt?: string) => {
    const promptText = customPrompt || input;
    if (!promptText.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: promptText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    addMessageToActiveSession(userMsg);
    setInput("");
    setIsThinking(true);

    try {
      const activeCustomConfig = preferences.agentConfigs?.[selectedModelId];
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText.trim(),
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          apiKey: activeCustomConfig?.apiKey || preferences.apiKeys?.[activeModelDef.providerKey] || preferences.geminiApiKey || "",
          baseUrl: activeCustomConfig?.baseUrl || "",
          systemPrompt: activeCustomConfig?.systemPrompt || "",
          temperature: activeCustomConfig?.temperature || 0.7,
          model: selectedModelId,
          workspaceContext: {
            team,
            projects,
            issues,
            currentUser,
          },
        }),
      });

      const data = await res.json();
      let actionResult = data.actionResult;

      if (
        actionResult?.type === "projects_updated" ||
        actionResult?.type === "issues_updated" ||
        actionResult?.type === "project_deleted"
      ) {
        const isBulk = actionResult.type !== "project_deleted" && actionResult.data?.filter === "all";
        const actionLabel = actionResult.type === "project_deleted"
          ? "eliminare il progetto"
          : isBulk
          ? "aggiornare tutte le risorse selezionate"
          : "aggiornare la risorsa selezionata";

        if (!window.confirm(`Confermi di voler ${actionLabel}?`)) {
          actionResult = {
            type: "action_cancelled",
            data: { reason: "User declined confirmation", requestedAction: actionResult.type },
          };
          addToast({ title: "Azione annullata", description: "Nessuna modifica è stata applicata.", type: "info" });
        }
      }

      // Real-time Action Execution in Store
      if (actionResult?.type === "action_cancelled") {
        // Keep the assistant response in the conversation without executing the request.
      } else if (actionResult?.type === "projects_updated") {
        const targetFilter =
          actionResult.data.targetId ||
          (actionResult.data.filter === "single" ? actionResult.data.targetId : actionResult.data.filter) ||
          "all";
        const newStatus = actionResult.data.status || "Planned";
        const excludeList = actionResult.data.excludeIds || actionResult.data.exclude;
        const count = bulkUpdateProjects(
          targetFilter,
          {
            status: newStatus,
            ...(actionResult.data.priority ? { priority: actionResult.data.priority } : {}),
          },
          { exclude: excludeList }
        );
        addToast({
          title: "Progetti aggiornati",
          description: `${count || projects.length} progetti impostati come ${newStatus}${
            excludeList ? ` (esclusi ${Array.isArray(excludeList) ? excludeList.join(", ") : excludeList})` : ""
          }`,
          type: "success",
        });
      } else if (actionResult?.type === "issues_updated") {
        const targetFilter =
          actionResult.data.targetId ||
          (actionResult.data.filter === "single" ? actionResult.data.targetId : actionResult.data.filter) ||
          "all";
        const newStatus = actionResult.data.status || "done";
        const excludeList = actionResult.data.excludeIds || actionResult.data.exclude;
        const count = bulkUpdateIssues(
          targetFilter,
          {
            status: newStatus,
            ...(actionResult.data.priority ? { priority: actionResult.data.priority } : {}),
          },
          { exclude: excludeList }
        );
        addToast({
          title: "Issue aggiornate",
          description: `${count || issues.length} task impostate come ${newStatus}`,
          type: "success",
        });
      } else if (actionResult?.type === "issue_created" && actionResult.data?.title) {
        const created = createIssue({
          title: actionResult.data.title,
          description: actionResult.data.description || `Created via Chrono Agent: "${promptText}"`,
          priority: actionResult.data.priority || "high",
          status: actionResult.data.status || "todo",
        });
        actionResult.data = created;
      } else if (actionResult?.type === "project_created" && actionResult.data?.name) {
        const created = createProject({
          name: actionResult.data.name,
          summary: actionResult.data.summary || "Generated by Chrono Agent",
          description: actionResult.data.description || "Created via conversational assistant.",
          status: actionResult.data.status || "Planned",
          priority: actionResult.data.priority || "high",
        });
        actionResult.data = created;
      } else if (actionResult?.type === "project_deleted" && actionResult.data?.targetId) {
        deleteProject(actionResult.data.targetId);
        addToast({ title: "Progetto eliminato", type: "info" });
      } else if (actionResult?.type === "bulk_projects_imported" && actionResult.data?.markdown) {
        const parsed = parseBulkProjectsMarkdown(actionResult.data.markdown);
        const created = importBulkProjectsFromMarkdown(parsed);
        actionResult.data = { count: created.length, projects: created };
      }

      const agentMsg: ChatMessage = {
        id: "msg-agent-" + Date.now(),
        sender: "agent",
        text: data.text || "Ho eseguito l'azione richiesta.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionResult,
      };

      addMessageToActiveSession(agentMsg);
    } catch (error: any) {
      console.error("Agent error:", error);
      const fallbackMsg: ChatMessage = {
        id: "msg-agent-" + Date.now(),
        sender: "agent",
        text: "Si è verificato un temporaneo timeout di rete. Riprova tra poco.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      addMessageToActiveSession(fallbackMsg);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast({
      title: t.agentView.copyMessage,
      type: "info",
    });
  };

  const handleApplyTemplate = (tpl: any) => {
    if (tpl.prompt.endsWith(": ")) {
      setInput(tpl.prompt);
    } else {
      handleSend(tpl.prompt);
    }
  };

  return (
    <div className="flex-1 flex h-full max-h-full min-h-0 bg-[#09090b] overflow-hidden select-none text-ink">
      {/* 1. Left Session Sidebar */}
      {showSidebar && (
        <aside className="w-64 border-r border-white/5 bg-[#09090b] flex flex-col shrink-0 text-xs z-20 h-full max-h-full min-h-0">
          {/* Sidebar Top: Header with New Chat Button */}
          <div className="h-12 px-3.5 border-b border-white/5 flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold text-zinc-300">
              {t.agentView.sessions}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const newId = createChatSession(t.agentView.newConversation);
                  switchChatSession(newId);
                  addToast({ title: t.agentView.newSessionStarted, type: "info" });
                }}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                title={t.agentView.newSession}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.agentView.newBadge}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSidebar(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                title={t.agentView.hideSessions}
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sessions List - Independent Vertical Scroll */}
          <div className="flex-1 overflow-y-auto min-h-0 p-2 flex flex-col gap-1">
            {chatSessions.map((session) => {
              const isActive = session.id === activeSessionId;

              return (
                <div
                  key={session.id}
                  onClick={() => switchChatSession(session.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between group",
                    isActive
                      ? "bg-zinc-900/70 border-white/10 text-white shadow-sm"
                      : "bg-transparent hover:bg-zinc-900/40 border-transparent text-zinc-400 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-white" : "text-zinc-500")} />
                    <span className="text-xs font-medium truncate max-w-[150px]">
                      {session.title}
                    </span>
                  </div>

                  {chatSessions.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 rounded transition-opacity cursor-pointer shrink-0"
                      title={t.agentView.deleteSession}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* 2. Main Chat Thread & Cockpit Area */}
      <div className="flex-1 flex flex-col h-full max-h-full min-h-0 overflow-hidden relative bg-[#09090b]">
        {/* Sleek Subheader Bar (Docked Top) */}
        <div className="h-12 px-4 sm:px-6 border-b border-white/5 bg-[#09090b] flex items-center justify-between text-xs shrink-0 z-10">
          <div className="flex items-center gap-3">
            {!showSidebar && (
              <button
                type="button"
                onClick={() => setShowSidebar(true)}
                className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={t.agentView.showSessions}
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            <span className="font-semibold text-white text-xs md:text-sm">
              {currentSession.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                clearActiveSessionMessages();
                addToast({ title: t.agentView.messagesCleared, type: "info" });
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/90 border border-white/10 text-zinc-400 hover:text-white transition-colors text-xs cursor-pointer"
            >
              {t.agentView.clearMessages}
            </button>
          </div>
        </div>

        {/* 3. Chat Messages Timeline (Independent Scroll Container) */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 md:px-10 py-6 flex flex-col items-center bg-[#09090b]">
          {messages.length === 0 ? (
            /* Empty State Hero */
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl my-auto py-8">
              <div className="w-12 h-12 rounded-xl bg-zinc-900/70 border border-white/10 flex items-center justify-center text-zinc-300 mb-4 shadow-lg">
                <Sparkles className="w-5 h-5 text-zinc-300" />
              </div>

              <h1 className="text-xl font-bold font-heading text-white tracking-tight mb-1">
                {t.agentView.heroTitle}
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6 max-w-md">
                {t.agentView.heroSubtitle}
              </p>

              {/* 4 Simple Action Cards */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {promptTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="p-4 rounded-xl bg-zinc-900/50 hover:bg-zinc-900/80 border border-white/10 hover:border-white/20 flex flex-col gap-1 group cursor-pointer transition-all shadow-sm"
                  >
                    <span className="font-semibold text-xs text-zinc-200 group-hover:text-white transition-colors">
                      {tpl.label}
                    </span>
                    <span className="text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors line-clamp-2">
                      {tpl.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Message Flow */
            <div className="w-full max-w-4xl flex flex-col gap-6 py-2 pb-6">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-4 text-xs leading-relaxed max-w-[92%]",
                    m.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm",
                      m.sender === "user"
                        ? "bg-white text-black"
                        : "bg-zinc-900 text-zinc-300 border border-white/10"
                    )}
                  >
                    {m.sender === "user" ? "CB" : <div className="w-4 h-4">{activeModelDef.icon}</div>}
                  </div>

                  <div className="flex flex-col gap-1.5 max-w-full">
                    {/* Message Bubble */}
                    <div
                      className={cn(
                        "p-4 shadow-sm transition-all group relative rounded-xl border border-white/10",
                        m.sender === "user"
                          ? "bg-zinc-900/80 text-white"
                          : "bg-zinc-900/40 text-zinc-200"
                      )}
                    >
                      {/* Rendered Markdown */}
                      <MarkdownContent content={m.text} />

                      {/* Bulk Projects Updated Feedback Card */}
                      {m.actionResult?.type === "projects_updated" && (
                        <div className="mt-3.5 p-3 rounded-lg bg-zinc-900/70 border border-white/10 flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <CheckCheck className="w-4 h-4 text-zinc-300 shrink-0" />
                            <span className="text-white font-medium">
                              Stato Progetti aggiornato a <strong>{m.actionResult.data?.status || "Completed"}</strong>
                            </span>
                          </div>
                          <Link
                            href="/projects"
                            className="text-zinc-300 hover:text-white font-medium text-xs shrink-0 flex items-center gap-1 underline underline-offset-2 transition-colors"
                          >
                            <span>{t.agentView.viewInProjects}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}

                      {/* Bulk Issues Updated Feedback Card */}
                      {m.actionResult?.type === "issues_updated" && (
                        <div className="mt-3.5 p-3 rounded-lg bg-zinc-900/70 border border-white/10 flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <CheckCheck className="w-4 h-4 text-zinc-300 shrink-0" />
                            <span className="text-white font-medium">
                              Stato Task aggiornato a <strong>{m.actionResult.data?.status || "done"}</strong>
                            </span>
                          </div>
                          <Link
                            href="/issues"
                            className="text-zinc-300 hover:text-white font-medium text-xs shrink-0 flex items-center gap-1 underline underline-offset-2 transition-colors"
                          >
                            <span>{t.agentView.viewInIssues}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}

                      {/* Single Issue Created Feedback Card */}
                      {m.actionResult?.type === "issue_created" && m.actionResult.data && (
                        <div className="mt-3.5 p-3 rounded-lg bg-zinc-900/70 border border-white/10 flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" />
                            <span
                              className="font-mono text-zinc-400 text-[11px] shrink-0"
                              style={{ fontFamily: "'DM Mono', monospace" }}
                            >
                              {m.actionResult.data.identifier}
                            </span>
                            <span className="text-white font-medium truncate">
                              {m.actionResult.data.title}
                            </span>
                          </div>
                          <Link
                            href="/issues"
                            className="text-zinc-300 hover:text-white font-medium text-xs shrink-0 flex items-center gap-1 underline underline-offset-2 transition-colors"
                          >
                            <span>{t.agentView.viewInIssues}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}

                      {/* Single Project Created Feedback Card */}
                      {m.actionResult?.type === "project_created" && m.actionResult.data && (
                        <div className="mt-3.5 p-3 rounded-lg bg-zinc-900/70 border border-white/10 flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Box className="w-4 h-4 text-zinc-300 shrink-0" />
                            <span className="text-white font-medium truncate">
                              {m.actionResult.data.name}
                            </span>
                          </div>
                          <Link
                            href={`/project/${m.actionResult.data.slug}`}
                            className="text-zinc-300 hover:text-white font-medium text-xs shrink-0 flex items-center gap-1 underline underline-offset-2 transition-colors"
                          >
                            <span>{t.agentView.openProject}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}

                      {/* Bulk Projects Imported Feedback Card */}
                      {m.actionResult?.type === "bulk_projects_imported" && m.actionResult.data && (
                        <div className="mt-3.5 p-3 rounded-lg bg-zinc-900/70 border border-white/10 flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Layers className="w-4 h-4 text-zinc-300 shrink-0" />
                            <span className="text-white font-medium">
                              <strong>{m.actionResult.data.count} Progetti</strong> importati con successo da file Markdown
                            </span>
                          </div>
                          <Link
                            href="/projects"
                            className="text-zinc-300 hover:text-white font-medium text-xs shrink-0 flex items-center gap-1 underline underline-offset-2 transition-colors"
                          >
                            <span>{t.agentView.seeAll}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}

                      {/* Copy Action Button */}
                      <button
                        onClick={() => handleCopyText(m.id, m.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs flex items-center gap-1 border border-white/10 cursor-pointer"
                        title={t.agentView.copyMessage}
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-zinc-200" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Timestamp */}
                    <span
                      className={cn(
                        "text-[10px] text-zinc-500 px-1 font-mono",
                        m.sender === "user" ? "text-right" : "text-left"
                      )}
                      style={{ fontFamily: "'DM Mono', monospace" }}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="w-full max-w-4xl py-2">
                  <AgentMessageSkeleton />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 4. Bottom Stationary Prompt Input Deck (Firmly Docked, Zero Scroll Movement) */}
        <div className="w-full shrink-0 z-20 pb-5 px-4 sm:px-6 md:px-10 bg-[#09090b]/95 backdrop-blur-md pt-3 border-t border-white/5 flex flex-col items-center gap-2.5">
          {/* Quick Action Chips directly above input */}
          <div className="w-full max-w-4xl flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none">
            {promptTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/90 border border-white/10 text-xs text-zinc-300 hover:text-white transition-colors shrink-0 shadow-sm cursor-pointer font-sans"
              >
                <span>{tpl.label}</span>
              </button>
            ))}
          </div>

          {/* Prompt Input Box */}
          <div className="w-full max-w-4xl rounded-xl bg-zinc-900/60 border border-white/10 p-3.5 flex flex-col gap-3 shadow-lg">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t.agentView.sendPlaceholder}
              rows={2}
              className="w-full bg-transparent text-white placeholder:text-zinc-500 resize-none focus:outline-none text-xs leading-relaxed font-sans select-text"
            />

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
              {/* Single Model Switcher (No Duplicates) */}
              <div className="flex items-center gap-2 select-none">
                <LinearSelect
                  options={modelOptions}
                  value={selectedModelId}
                  onChange={handleSelectModel}
                  triggerClassName="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border-white/10 text-xs text-zinc-300"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 select-none">
                <button
                  type="button"
                  title={t.agentView.voiceInput}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title={t.agentView.attachFile}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isThinking}
                  className={cn(
                    "p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-sm",
                    input.trim()
                      ? "bg-white hover:bg-neutral-200 text-black"
                      : "bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed"
                  )}
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChronoAgentView = LinearAgentView;

