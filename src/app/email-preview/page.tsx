"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Monitor,
  Mobile,
  Copy,
  Check,
  Code,
  ArrowRight,
  Sparkles,
  ShieldTick,
  Rocket,
  Send,
} from "reicon-react";
import { cn } from "@/lib/utils";

type EmailType = "invite" | "recovery" | "welcome";
type ViewportMode = "desktop" | "mobile" | "full";
type TabMode = "visual" | "html" | "text";

interface EmailPayload {
  subject: string;
  text: string;
  html: string;
}

export default function EmailPreviewPage() {
  const [selectedType, setSelectedType] = useState<EmailType>("invite");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [tab, setTab] = useState<TabMode>("visual");
  const [emailData, setEmailData] = useState<EmailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [testEmail, setTestEmail] = useState("blevecristiano2018@gmail.com");
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    fetch(`/api/email-preview?type=${selectedType}&format=json`)
      .then((res) => res.json())
      .then((data: EmailPayload) => {
        if (!isCancelled) {
          setEmailData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("Error loading email preview:", err);
          setLoading(false);
        }
      });
    return () => {
      isCancelled = true;
    };
  }, [selectedType]);

  const handleCopy = (text: string, key: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleSendTestEmail = async (mode: "current" | "all") => {
    if (!testEmail || isSending) return;
    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/email-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail.trim(),
          type: mode === "all" ? "all" : selectedType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSendResult(`Inviata con successo a ${testEmail}`);
      } else {
        setSendResult(data.error || "Errore durante l'invio");
      }
    } catch (err: any) {
      setSendResult(err?.message || "Errore di connessione");
    } finally {
      setIsSending(false);
      setTimeout(() => {
        setSendResult(null);
      }, 5000);
    }
  };

  const templates: { id: EmailType; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "invite", label: "Workspace Invite (Hooray!)", icon: Rocket },
    { id: "recovery", label: "Password Recovery", icon: ShieldTick },
    { id: "welcome", label: "Welcome Account", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-[#27272a] bg-[#121316] px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <span>Settings</span>
            <span className="text-zinc-600">/</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white tracking-tight">
              Email Templates
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
              Söhne & Reicon
            </span>
          </div>
        </div>

        {/* Template Selector */}
        <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
          {templates.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = selectedType === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => setSelectedType(tpl.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                  isSelected
                    ? "bg-white text-[#09090b] shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                )}
              >
                <Icon size={14} className={isSelected ? "text-[#09090b]" : "text-zinc-400"} />
                <span>{tpl.label}</span>
              </button>
            );
          })}
        </div>

        {/* Test Send Input & Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Indirizzo test..."
              className="bg-transparent text-xs text-white placeholder:text-zinc-500 outline-none w-48 font-mono"
            />
            <button
              onClick={() => void handleSendTestEmail("current")}
              disabled={isSending || !testEmail}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send size={12} />
              <span>{isSending ? "Invio..." : "Invia"}</span>
            </button>
          </div>

          {/* Viewport Controls */}
          <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
            <button
              onClick={() => setViewport("desktop")}
              title="Desktop viewport (560px)"
              className={cn(
                "p-1.5 rounded text-xs transition-colors cursor-pointer",
                viewport === "desktop" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              )}
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              title="Mobile viewport (375px)"
              className={cn(
                "p-1.5 rounded text-xs transition-colors cursor-pointer",
                viewport === "mobile" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              )}
            >
              <Mobile size={15} />
            </button>
          </div>

          {/* Format Tabs */}
          <div className="flex items-center gap-1 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
            <button
              onClick={() => setTab("visual")}
              className={cn(
                "px-2.5 py-1 text-xs rounded transition-colors cursor-pointer",
                tab === "visual" ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white"
              )}
            >
              Visual
            </button>
            <button
              onClick={() => setTab("html")}
              className={cn(
                "px-2.5 py-1 text-xs rounded transition-colors cursor-pointer",
                tab === "html" ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white"
              )}
            >
              HTML
            </button>
            <button
              onClick={() => setTab("text")}
              className={cn(
                "px-2.5 py-1 text-xs rounded transition-colors cursor-pointer",
                tab === "text" ? "bg-zinc-800 text-white font-medium" : "text-zinc-400 hover:text-white"
              )}
            >
              Plain Text
            </button>
          </div>

          <a
            href={`/api/email-preview?type=${selectedType}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] bg-[#18181b] text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <span>Raw Link</span>
            <ArrowRight size={13} />
          </a>
        </div>
      </header>

      {/* Subject and Status Bar */}
      <section className="bg-[#121316] border-b border-[#27272a] px-6 py-2.5 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="font-semibold text-zinc-300 shrink-0">Subject:</span>
          <span className="text-zinc-100 font-medium truncate">
            {emailData?.subject || "Loading..."}
          </span>
          {sendResult && (
            <span className="text-emerald-400 text-xs font-medium ml-2">
              {sendResult}
            </span>
          )}
        </div>
        {emailData && (
          <button
            onClick={() => handleCopy(emailData.subject, "subject")}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0 ml-4"
          >
            {copiedKey === "subject" ? <Check size={13} /> : <Copy size={13} />}
            <span>{copiedKey === "subject" ? "Copied" : "Copy Subject"}</span>
          </button>
        )}
      </section>

      {/* Main Preview Container */}
      <main className="flex-1 flex flex-col items-center justify-start p-6 bg-[#09090b] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-sm text-zinc-500">
            Rendering email template...
          </div>
        ) : !emailData ? (
          <div className="flex items-center justify-center h-64 text-sm text-red-400">
            Failed to load email preview.
          </div>
        ) : tab === "visual" ? (
          <div
            className={cn(
              "transition-all duration-200 border border-[#27272a] rounded-xl overflow-hidden shadow-2xl bg-[#09090b]",
              viewport === "desktop" && "w-full max-w-[620px]",
              viewport === "mobile" && "w-full max-w-[390px]",
              viewport === "full" && "w-full"
            )}
            style={{ minHeight: "680px" }}
          >
            <iframe
              src={`/api/email-preview?type=${selectedType}`}
              title="Email Preview"
              className="w-full h-[760px] border-0 bg-[#09090b]"
            />
          </div>
        ) : tab === "html" ? (
          <div className="w-full max-w-4xl relative">
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={() => handleCopy(emailData.html, "html")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-zinc-700 transition-colors cursor-pointer"
              >
                {copiedKey === "html" ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedKey === "html" ? "Copied HTML" : "Copy HTML"}</span>
              </button>
            </div>
            <pre className="p-6 rounded-xl border border-[#27272a] bg-[#121316] font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed max-h-[760px] select-all">
              {emailData.html}
            </pre>
          </div>
        ) : (
          <div className="w-full max-w-2xl relative">
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={() => handleCopy(emailData.text, "text")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs text-white border border-zinc-700 transition-colors cursor-pointer"
              >
                {copiedKey === "text" ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedKey === "text" ? "Copied Text" : "Copy Text"}</span>
              </button>
            </div>
            <pre className="p-6 rounded-xl border border-[#27272a] bg-[#121316] font-mono text-xs text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[760px] select-all">
              {emailData.text}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
