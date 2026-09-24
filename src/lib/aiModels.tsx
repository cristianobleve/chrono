"use client";

import React from "react";
import {
  GeminiIcon,
  OpenAIIcon,
  ClaudeIcon,
  DeepSeekIcon,
  MistralIcon,
  MetaLlamaIcon,
  GrokIcon,
  PerplexityIcon,
  OllamaIcon,
  QwenIcon,
} from "@/components/ui/AiBrandIcons";

export interface AIModelDefinition {
  id: string;
  name: string;
  provider: "Google" | "Anthropic" | "OpenAI" | "DeepSeek" | "Mistral" | "Meta" | "xAI" | "Perplexity" | "Ollama" | "Alibaba";
  providerKey: "gemini" | "claude" | "openai" | "deepseek" | "mistral" | "llama" | "grok" | "perplexity" | "ollama" | "qwen";
  icon: React.ReactNode;
  badge: string;
  description: string;
  recommended?: boolean;
}

export const AVAILABLE_AI_MODELS: AIModelDefinition[] = [
  // 1. Google Gemini (LobeHub Gemini Mono)
  {
    id: "gemini-flash-lite-latest",
    name: "Gemini 2.5 Flash Lite",
    provider: "Google",
    providerKey: "gemini",
    icon: <GeminiIcon className="w-4 h-4" />,
    badge: "Ultra Fast",
    description: "Modello ad altissima velocità e precisione per compiti quotidiani",
    recommended: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    providerKey: "gemini",
    icon: <GeminiIcon className="w-4 h-4" />,
    badge: "2M Context",
    description: "Finestra di contesto enorme per codebase complessi",
  },

  // 2. Anthropic Claude (LobeHub Claude Mono)
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    providerKey: "claude",
    icon: <ClaudeIcon className="w-4 h-4" />,
    badge: "Hybrid Reasoning",
    description: "Ragionamento profondo e capacità di coding allo stato dell'arte",
    recommended: true,
  },
  {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    providerKey: "claude",
    icon: <ClaudeIcon className="w-4 h-4" />,
    badge: "Fast & Precise",
    description: "Risposte immediate e sintetiche a basso consumo di token",
  },
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    providerKey: "claude",
    icon: <ClaudeIcon className="w-4 h-4" />,
    badge: "Deep Analysis",
    description: "Analisi architetturali complesse e refactoring",
  },

  // 3. OpenAI (LobeHub OpenAI Mono)
  {
    id: "gpt-4o",
    name: "GPT-4o Omnimodal",
    provider: "OpenAI",
    providerKey: "openai",
    icon: <OpenAIIcon className="w-4 h-4" />,
    badge: "Flagship",
    description: "Modello di punta OpenAI con eccellente comprensione logica",
    recommended: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    providerKey: "openai",
    icon: <OpenAIIcon className="w-4 h-4" />,
    badge: "Lightweight",
    description: "Compatto e reattivo per micro-task e issue routing",
  },
  {
    id: "o3-mini",
    name: "OpenAI o3-mini",
    provider: "OpenAI",
    providerKey: "openai",
    icon: <OpenAIIcon className="w-4 h-4" />,
    badge: "Reasoning",
    description: "Catena di pensiero avanzata per algoritmi e logica",
  },

  // 4. DeepSeek (LobeHub DeepSeek Mono)
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    providerKey: "deepseek",
    icon: <DeepSeekIcon className="w-4 h-4" />,
    badge: "Open Reasoning",
    description: "Modello di ragionamento aperto con catena di pensiero trasparente",
    recommended: true,
  },
  {
    id: "deepseek-v3",
    name: "DeepSeek V3 (MoE)",
    provider: "DeepSeek",
    providerKey: "deepseek",
    icon: <DeepSeekIcon className="w-4 h-4" />,
    badge: "MoE Coding",
    description: "Architettura Mixture-of-Experts ad altissima efficienza",
  },

  // 5. Mistral AI (LobeHub Mistral Mono)
  {
    id: "codestral-2501",
    name: "Codestral 25.01",
    provider: "Mistral",
    providerKey: "mistral",
    icon: <MistralIcon className="w-4 h-4" />,
    badge: "Code Specialist",
    description: "Modello specializzato nella generazione di codice e diagrammi",
  },
  {
    id: "mistral-large-2411",
    name: "Mistral Large 2",
    provider: "Mistral",
    providerKey: "mistral",
    icon: <MistralIcon className="w-4 h-4" />,
    badge: "European LLM",
    description: "Modello multilingue per decisioni complesse",
  },

  // 6. Meta Llama (LobeHub Meta Mono)
  {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B",
    provider: "Meta",
    providerKey: "llama",
    icon: <MetaLlamaIcon className="w-4 h-4" />,
    badge: "Open Weights",
    description: "L'architettura open source più diffusa e affidabile",
  },

  // 7. xAI Grok (LobeHub Grok Mono)
  {
    id: "grok-2",
    name: "xAI Grok 2",
    provider: "xAI",
    providerKey: "grok",
    icon: <GrokIcon className="w-4 h-4" />,
    badge: "Real-Time",
    description: "Intelligenza non filtrata con forte comprensione tecnica",
  },

  // 8. Perplexity AI (LobeHub Perplexity Mono)
  {
    id: "sonar-reasoning-pro",
    name: "Perplexity Sonar Pro",
    provider: "Perplexity",
    providerKey: "perplexity",
    icon: <PerplexityIcon className="w-4 h-4" />,
    badge: "Live Search",
    description: "Ricerca web in tempo reale e sintesi con citazioni",
  },

  // 9. Ollama (LobeHub Ollama Mono)
  {
    id: "ollama-local",
    name: "Ollama Local Engine",
    provider: "Ollama",
    providerKey: "ollama",
    icon: <OllamaIcon className="w-4 h-4" />,
    badge: "Self-Hosted",
    description: "Modelli eseguiti localmente sulla tua GPU/CPU via localhost:11434",
  },

  // 10. Qwen (LobeHub Qwen Mono)
  {
    id: "qwen-2.5-max",
    name: "Qwen 2.5 Max",
    provider: "Alibaba",
    providerKey: "qwen",
    icon: <QwenIcon className="w-4 h-4" />,
    badge: "SOTA Open",
    description: "Capacità eccezionali di coding e matematica multilingua",
  },
];
