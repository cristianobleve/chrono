"use client";

import React, { useState, useEffect } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { AIModelDefinition } from "@/lib/aiModels";
import { AgentCustomConfig } from "@/types";
import {
  X,
  Sparkles,
  Key,
  Server,
  Sliders,
  Play,
  CheckCircle2,
  Terminal,
  Layers,
  Cpu,
  Bot,
  Flame,
  Shield,
  HelpCircle,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentDetailDrawerProps {
  model: AIModelDefinition | null;
  onClose: () => void;
}

export const AgentDetailDrawer: React.FC<AgentDetailDrawerProps> = ({ model, onClose }) => {
  const { preferences, updatePreferences, addToast } = useLinearStore();

  const [customName, setCustomName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [reasoningEffort, setReasoningEffort] = useState<"low" | "medium" | "high">("medium");
  const [enabledSkills, setEnabledSkills] = useState<string[]>([
    "create_issue",
    "create_project",
    "sprint_planning",
  ]);

  // Test prompt in drawer
  const [testPrompt, setTestPrompt] = useState("Chi sei e quali sono le tue competenze in questo workspace?");
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    if (!model) return;

    const existing = preferences.agentConfigs?.[model.id];
    const globalKey = preferences.apiKeys?.[model.providerKey] || preferences.geminiApiKey || "";

    setCustomName(existing?.customName || model.name);
    setSystemPrompt(
      existing?.systemPrompt ||
        `Sei ${model.name}, un senior technical project lead & architect integrato in Chrono. Sei esperto in architettura cloud, Supabase e project management agile.`
    );
    setTemperature(existing?.temperature ?? 0.7);
    setMaxTokens(existing?.maxTokens ?? 2048);
    setBaseUrl(
      existing?.baseUrl ||
        (model.providerKey === "ollama" ? "http://localhost:11434" : "")
    );
    setApiKey(existing?.apiKey || globalKey);
    setReasoningEffort(existing?.reasoningEffort || "medium");
    setEnabledSkills(existing?.enabledSkills || ["create_issue", "create_project", "sprint_planning"]);
    setTestResponse(null);
    setLatencyMs(null);
  }, [model, preferences]);

  if (!model) return null;

  const handleSave = () => {
    const newConfig: AgentCustomConfig = {
      modelId: model.id,
      customName,
      systemPrompt,
      temperature,
      maxTokens,
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      reasoningEffort,
      enabledSkills,
      isCustom: true,
    };

    const updatedConfigs = {
      ...(preferences.agentConfigs || {}),
      [model.id]: newConfig,
    };

    // Also update provider global key if provided
    const updatedApiKeys = {
      ...(preferences.apiKeys || {}),
      [model.providerKey]: apiKey.trim(),
    };

    updatePreferences({
      agentConfigs: updatedConfigs,
      apiKeys: updatedApiKeys,
    });

    addToast({
      title: `Configurazione ${model.name} salvata`,
      description: "Parametri di containerizzazione e prompt attivi",
      type: "success",
    });
    onClose();
  };

  const handleRunTest = async () => {
    if (!testPrompt.trim() || isTesting) return;
    setIsTesting(true);
    setTestResponse(null);
    const start = performance.now();

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: testPrompt,
          model: model.id,
          apiKey: apiKey.trim(),
          baseUrl: baseUrl.trim(),
          systemPrompt,
          temperature,
          workspaceContext: {},
        }),
      });

      const data = await res.json();
      const end = performance.now();
      setLatencyMs(Math.round(end - start));

      if (res.ok) {
        setTestResponse(data.text || "Risposta ricevuta con successo.");
      } else {
        setTestResponse(`Errore: ${data.error || "Impossibile completare la richiesta."}`);
      }
    } catch (e: any) {
      setTestResponse(`Eccezione di rete: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const allSkills = [
    { id: "create_issue", label: "Crea Issue & Task", desc: "Genera automaticamente card task su Supabase" },
    { id: "create_project", label: "Inizializza Progetti", desc: "Pianifica milestone e roadmap" },
    { id: "sprint_planning", label: "Sprint Breakdown", desc: "Decomposizione e criteri di accettazione" },
    { id: "code_review", label: "Analisi Codice & Architettura", desc: "Schemi SQL e diagrammi logici" },
  ];

  const toggleSkill = (skillId: string) => {
    if (enabledSkills.includes(skillId)) {
      setEnabledSkills(enabledSkills.filter((s) => s !== skillId));
    } else {
      setEnabledSkills([...enabledSkills, skillId]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-zinc-950 border-l border-white/10 h-full shadow-2xl flex flex-col overflow-hidden text-xs text-ink animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-zinc-950">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[12px] bg-zinc-900 border border-white/10 flex items-center justify-center shadow-md">
              {model.icon}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">
                  {model.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-semibold">
                  {model.badge}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">
                Provider: <strong className="text-white">{model.provider}</strong> • ID: <code className="font-mono text-zinc-300">{model.id}</code>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[10px] text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 flex flex-col gap-6">
          {/* 1. Identity & Name */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-white">Nome Agente Personalizzato</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="es. Chrono Lead Architect"
              className="w-full bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs rounded-[12px] px-3.5 py-2.5 focus:outline-none transition-colors"
            />
          </div>

          {/* 2. Containerization & Endpoint URL (Docker / LocalAI / vLLM / Proxy) */}
          <div className="p-5 rounded-[14px] bg-zinc-900/60 border border-white/5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Server className="w-4 h-4 text-zinc-400" />
                <span>Endpoint / Base URL per Containerizzazione (Docker)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Opzionale
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Se esegui questo modello in locale o in un container Docker (es. <code>http://localhost:11434</code> per Ollama o <code>http://vllm:8000/v1</code>), inserisci qui l'endpoint personalizzato.
            </p>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:11434 o http://proxy.internal:8000/v1"
              className="w-full bg-zinc-900 border border-white/10 focus:border-white text-white text-xs font-mono rounded-[12px] px-3.5 py-2.5 focus:outline-none transition-colors"
            />
          </div>

          {/* 3. Dedicated API Key Override */}
          <div className="p-5 rounded-[14px] bg-zinc-900/60 border border-white/5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Key className="w-4 h-4 text-amber-400" />
                <span>API Key Dedicata (Opzionale)</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400">
              Sovrascrivi la chiave globale per questo agente specifico.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Lascia vuoto per usare la chiave di sistema..."
              className="w-full bg-zinc-900 border border-white/10 focus:border-white text-white text-xs font-mono rounded-[12px] px-3.5 py-2.5 focus:outline-none transition-colors"
            />
          </div>

          {/* 4. System Prompt & Persona */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-white flex items-center justify-between">
              <span>System Prompt & Istruzioni Persona</span>
              <span className="text-[10px] text-zinc-500">Markdown & Regole di Risposta</span>
            </label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Definisci come l'agente deve comportarsi, il tono e le regole aziendali..."
              className="w-full bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs leading-relaxed rounded-[12px] p-3.5 focus:outline-none resize-none transition-colors"
            />
          </div>

          {/* 5. Hyperparameters (Temperature, Max Tokens, Reasoning Effort) */}
          <div className="p-5 rounded-[14px] bg-zinc-900/60 border border-white/5 flex flex-col gap-4">
            <span className="font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-zinc-400" />
              <span>Parametri di Generazione</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Temperature */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Temperature</span>
                  <span className="font-mono text-white font-semibold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              {/* Max Tokens */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">Max Output Tokens</span>
                  <span className="font-mono text-white font-semibold">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="512"
                  max="8192"
                  step="256"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>
            </div>

            {/* Reasoning Effort (For models like o3-mini or DeepSeek R1) */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
              <span className="text-[11px] text-zinc-400">Sforzo di Ragionamento (Reasoning Effort)</span>
              <div className="flex items-center gap-2">
                {(["low", "medium", "high"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setReasoningEffort(lvl)}
                    className={cn(
                      "flex-1 py-1.5 rounded-[9px] border text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer",
                      reasoningEffort === lvl
                        ? "bg-white text-black border-white shadow-sm"
                        : "bg-zinc-900 text-zinc-400 border-white/5 hover:text-white"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Capabilities & Enabled Skills */}
          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white">Competenze & Skill Abilitate</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allSkills.map((sk) => {
                const isEnabled = enabledSkills.includes(sk.id);
                return (
                  <div
                    key={sk.id}
                    onClick={() => toggleSkill(sk.id)}
                    className={cn(
                      "p-3 rounded-[12px] border transition-all cursor-pointer flex items-start gap-2.5 select-none",
                      isEnabled
                        ? "bg-zinc-900 border-white/30 ring-1 ring-white/20"
                        : "bg-zinc-950 border-white/10 opacity-60 hover:opacity-90"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-[5px] border flex items-center justify-center mt-0.5 shrink-0 transition-colors",
                        isEnabled ? "bg-white border-white text-zinc-950" : "border-zinc-700"
                      )}
                    >
                      {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white text-xs">{sk.label}</span>
                      <span className="text-[10px] text-zinc-400 leading-tight mt-0.5">{sk.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7. Live Sandbox Prompt Tester */}
          <div className="p-5 rounded-[14px] bg-zinc-900/60 border border-white/5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Test Sandbox in Tempo Reale</span>
              </span>
              {latencyMs && (
                <span className="text-[10px] font-mono text-emerald-400">
                  Latenza: {latencyMs}ms
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Invia un prompt di test rapido..."
                className="flex-1 bg-zinc-900 border border-white/10 focus:border-white text-white text-xs rounded-[10px] px-3.5 py-2 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-[10px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isTesting ? "Test..." : "Esegui"}</span>
              </button>
            </div>

            {testResponse && (
              <div className="p-3.5 rounded-[10px] bg-zinc-950 border border-white/10 font-mono text-[11px] text-white leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                {testResponse}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-950 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[12px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-[12px] bg-white hover:bg-neutral-200 text-black font-semibold shadow-md transition-all cursor-pointer"
          >
            Salva Parametri Agente
          </button>
        </div>
      </div>
    </div>
  );
};
