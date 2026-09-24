"use client";

import React, { useState } from "react";
import { useLinearStore } from "@/store/useLinearStore";
import { LinearSelect, SelectOption } from "@/components/ui/LinearSelect";
import { AVAILABLE_AI_MODELS, AIModelDefinition } from "@/lib/aiModels";
import { AgentDetailDrawer } from "@/components/settings/AgentDetailDrawer";
import {
  Sparkles,
  Key,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
  Send,
  Cpu,
  Bot,
  Check,
  Zap,
  Settings,
  Server,
  Sliders,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export const AISettingsView: React.FC = () => {
  const { preferences, updatePreferences, addToast } = useLinearStore();
  const { t } = useTranslation();

  const [selectedModel, setSelectedModel] = useState(
    preferences.aiModel || "gemini-flash-lite-latest"
  );
  const [drawerModel, setDrawerModel] = useState<AIModelDefinition | null>(null);

  // Multi-Provider API Keys state
  const apiKeys = preferences.apiKeys || {};
  const [keyState, setKeyState] = useState<{ [key: string]: string }>({
    gemini: apiKeys.gemini || preferences.geminiApiKey || "",
    claude: apiKeys.claude || "",
    openai: apiKeys.openai || "",
    deepseek: apiKeys.deepseek || "",
    mistral: apiKeys.mistral || "",
    llama: apiKeys.llama || "",
    grok: apiKeys.grok || "",
    perplexity: apiKeys.perplexity || "",
    ollama: apiKeys.ollama || "http://localhost:11434",
    openrouter: apiKeys.openrouter || "",
  });

  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  const activeModelDef =
    AVAILABLE_AI_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_AI_MODELS[0];

  const modelOptions: SelectOption[] = AVAILABLE_AI_MODELS.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.provider})`,
    icon: m.icon,
  }));

  const handleUpdateKey = (provider: string, val: string) => {
    setKeyState((prev) => ({ ...prev, [provider]: val }));
  };

  const handleSaveAllKeys = () => {
    updatePreferences({
      aiModel: selectedModel,
      geminiApiKey: keyState.gemini.trim(),
      apiKeys: keyState,
    });
    addToast({
      title: "Credenziali AI & Provider Salvati",
      description: `Chrono Agent è ora impostato su ${activeModelDef.name}`,
      type: "success",
    });
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <div className="flex-1 p-6 md:p-10 w-full max-w-6xl mx-auto flex flex-col gap-8 text-ink select-none pb-20">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>{t.aiSettings.providerTitle}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {t.aiSettings.title}
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
          {t.aiSettings.subtitle}
        </p>
      </div>

      {/* 1. Active Primary Model Hero */}
      <div className="p-6 rounded-[16px] bg-zinc-950 border border-white/10 flex flex-col gap-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-zinc-900 border border-white/10 flex items-center justify-center shadow-lg shrink-0">
              {activeModelDef.icon}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">
                  {activeModelDef.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-white text-[10px] font-mono font-semibold">
                  {activeModelDef.provider}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-semibold">
                  {activeModelDef.badge}
                </span>
              </div>
              <span className="text-xs text-zinc-400 mt-0.5">
                {activeModelDef.description}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerModel(activeModelDef)}
              className="px-3.5 py-2 rounded-[12px] bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-400" />
              <span>Personalizza Agente</span>
            </button>

            <LinearSelect
              options={modelOptions}
              value={selectedModel}
              onChange={setSelectedModel}
              align="right"
            />
          </div>
        </div>
      </div>

      {/* 2. Grid of Model Cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
            Modelli & Container Supportati ({AVAILABLE_AI_MODELS.length})
          </h2>
          <span className="text-[11px] text-zinc-500">
            Clicca su una card per selezionarla o personalizzarne prompt ed endpoint
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {AVAILABLE_AI_MODELS.map((m) => {
            const isSelected = selectedModel === m.id;
            const hasKey =
              Boolean(keyState[m.providerKey]) ||
              (m.providerKey === "gemini" && Boolean(keyState.gemini)) ||
              (m.providerKey === "ollama" && Boolean(keyState.ollama));
            const isCustomized = Boolean(preferences.agentConfigs?.[m.id]?.isCustom);

            return (
              <div
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={cn(
                  "p-4 rounded-[14px] border transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-md group relative",
                  isSelected
                    ? "bg-zinc-900/80 border-white/30 ring-1 ring-white/20"
                    : "bg-zinc-950 hover:bg-zinc-900/50 border-white/10 hover:border-white/20"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-[10px] bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                      {m.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs text-white truncate">
                        {m.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono truncate">
                        {m.provider} • {m.badge}
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full mt-1 shrink-0",
                        hasKey ? "bg-emerald-400" : "bg-zinc-700"
                      )}
                      title={hasKey ? "Chiave API / Host configurato" : "Chiave non inserita"}
                    />
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {preferences.agentConfigs?.[m.id]?.systemPrompt
                    ? `Personalizzato: "${preferences.agentConfigs[m.id].systemPrompt?.slice(0, 60)}..."`
                    : m.description}
                </p>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[10px]">
                  <span
                    className={cn(
                      "font-mono px-2 py-0.5 rounded-[6px]",
                      isCustomized
                        ? "bg-white/10 text-white border border-white/20"
                        : "text-zinc-500 bg-zinc-900"
                    )}
                  >
                    {isCustomized ? "Custom Prompt Attivo" : "Default Persona"}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDrawerModel(m);
                    }}
                    className="text-zinc-400 hover:text-white flex items-center gap-1 font-semibold hover:underline cursor-pointer group/btn"
                  >
                    <span>Dettagli</span>
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Multi-Provider API Key Management Hub */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-500">
          Gestione Chiavi API & Host Provider
        </h2>

        <div className="p-6 rounded-[16px] bg-zinc-950 border border-white/10 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Gemini */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-white flex items-center justify-between">
                <span>Google Gemini API Key</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-zinc-400 hover:text-white hover:underline flex items-center gap-1"
                >
                  <span>AI Studio</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showKeys.gemini ? "text" : "password"}
                  value={keyState.gemini}
                  onChange={(e) => handleUpdateKey("gemini", e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs font-mono rounded-[12px] px-3.5 py-2 pr-10 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("gemini")}
                  className="absolute right-2.5 text-zinc-500 hover:text-white"
                >
                  {showKeys.gemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Anthropic Claude */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-white flex items-center justify-between">
                <span>Anthropic Claude API Key</span>
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-zinc-400 hover:text-white hover:underline flex items-center gap-1"
                >
                  <span>Console Anthropic</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showKeys.claude ? "text" : "password"}
                  value={keyState.claude}
                  onChange={(e) => handleUpdateKey("claude", e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs font-mono rounded-[12px] px-3.5 py-2 pr-10 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("claude")}
                  className="absolute right-2.5 text-zinc-500 hover:text-white"
                >
                  {showKeys.claude ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* OpenAI */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-white flex items-center justify-between">
                <span>OpenAI API Key (ChatGPT)</span>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-zinc-400 hover:text-white hover:underline flex items-center gap-1"
                >
                  <span>OpenAI Platform</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showKeys.openai ? "text" : "password"}
                  value={keyState.openai}
                  onChange={(e) => handleUpdateKey("openai", e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs font-mono rounded-[12px] px-3.5 py-2 pr-10 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("openai")}
                  className="absolute right-2.5 text-zinc-500 hover:text-white"
                >
                  {showKeys.openai ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* DeepSeek */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-white flex items-center justify-between">
                <span>DeepSeek API Key</span>
                <a
                  href="https://platform.deepseek.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-zinc-400 hover:text-white hover:underline flex items-center gap-1"
                >
                  <span>DeepSeek Platform</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showKeys.deepseek ? "text" : "password"}
                  value={keyState.deepseek}
                  onChange={(e) => handleUpdateKey("deepseek", e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs font-mono rounded-[12px] px-3.5 py-2 pr-10 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("deepseek")}
                  className="absolute right-2.5 text-zinc-500 hover:text-white"
                >
                  {showKeys.deepseek ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Ollama Local / Docker Host */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-white flex items-center justify-between">
                <span>Ollama Docker / Local Host URL</span>
                <span className="text-[10px] text-zinc-500">Container Host</span>
              </label>
              <input
                type="text"
                value={keyState.ollama}
                onChange={(e) => handleUpdateKey("ollama", e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs font-mono rounded-[12px] px-3.5 py-2 focus:outline-none"
              />
            </div>

            {/* OpenRouter Universal Gateway */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-white flex items-center justify-between">
                <span>OpenRouter Universal Key (Opzionale)</span>
                <span className="text-[10px] text-zinc-500">Accesso a tutti i modelli</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showKeys.openrouter ? "text" : "password"}
                  value={keyState.openrouter}
                  onChange={(e) => handleUpdateKey("openrouter", e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full bg-zinc-900/60 border border-white/10 focus:border-white text-white text-xs font-mono rounded-[12px] px-3.5 py-2 pr-10 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey("openrouter")}
                  className="absolute right-2.5 text-zinc-500 hover:text-white"
                >
                  {showKeys.openrouter ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <p className="text-[11px] text-zinc-500">
              Le chiavi sono salvate localmente per abilitare l'orchestrazione continua.
            </p>

            <button
              type="button"
              onClick={handleSaveAllKeys}
              className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black text-xs rounded-[12px] font-semibold shadow-md transition-all cursor-pointer"
            >
              Salva Tutte le Credenziali
            </button>
          </div>
        </div>
      </div>

      {/* 4. Containerization & Self-Hosting Guide Card */}
      <div className="p-6 rounded-[16px] bg-zinc-950 border border-white/10 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-white font-semibold text-xs">
          <Server className="w-4 h-4 text-zinc-400" />
          <span>Containerizzazione Docker & Esecuzione Locale</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Puoi collegare qualsiasi container Docker locale (ad es. Ollama con <code>docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama</code> oppure un server vLLM). Imposta l'endpoint personalizzato nel pannello di dettaglio dell'agente per indirizzare le chiamate al tuo container.
        </p>
      </div>

      {/* Drawer */}
      <AgentDetailDrawer
        model={drawerModel}
        onClose={() => setDrawerModel(null)}
      />
    </div>
  );
};
