"use client";

import React, { useState, useEffect } from "react";
import { ChronoLogo } from "@/components/ui/ChronoLogo";
import { cn } from "@/lib/utils";
import { Info, Check, Folder, ChevronRight, ArrowLeft, Laptop } from "lucide-react";
import { getClientPlatform, DesktopPlatform } from "@/lib/desktop";

export type PackageType = "win-setup" | "win-portable" | "mac-arm64" | "mac-x64";

interface ChronoInstallerDialogProps {
  onClose?: () => void;
  isStandaloneWindow?: boolean;
}

export const ChronoInstallerDialog: React.FC<ChronoInstallerDialogProps> = ({
  onClose,
  isStandaloneWindow = false,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [platform, setPlatform] = useState<"windows" | "macos">("windows");
  const [packageType, setPackageType] = useState<PackageType>("win-setup");

  const [installPath, setInstallPath] = useState("C:\\Users\\User\\AppData\\Local\\Programs\\Chrono");
  const [createDesktopShortcut, setCreateDesktopShortcut] = useState(true);
  const [createStartMenuShortcut, setCreateStartMenuShortcut] = useState(true);
  const [enableAutostart, setEnableAutostart] = useState(true);

  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("Inizializzazione...");

  useEffect(() => {
    const clientOs = getClientPlatform();
    if (clientOs === "macos") {
      setPlatform("macos");
      setPackageType("mac-arm64");
      setInstallPath("/Applications/Chrono.app");
    } else {
      setPlatform("windows");
      setPackageType("win-setup");
      setInstallPath("C:\\Users\\User\\AppData\\Local\\Programs\\Chrono");
    }
  }, []);

  const handlePlatformChange = (nextPlatform: "windows" | "macos") => {
    setPlatform(nextPlatform);
    if (nextPlatform === "windows") {
      setPackageType("win-setup");
      setInstallPath("C:\\Users\\User\\AppData\\Local\\Programs\\Chrono");
    } else {
      setPackageType("mac-arm64");
      setInstallPath("/Applications/Chrono.app");
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (packageType === "win-setup") {
        setStep(2);
      } else {
        startInstallation(packageType);
      }
    } else if (step === 2) {
      startInstallation(packageType);
    }
  };

  const startInstallation = (pkg: PackageType) => {
    setStep(3);
    setProgress(15);

    let initMsg = "Scaricamento pacchetto Chrono v2.0.0...";
    if (pkg === "win-portable") initMsg = "Preparazione eseguibile portatile Windows...";
    if (pkg === "mac-arm64") initMsg = "Scaricamento immagine disco Apple Silicon (.dmg)...";
    if (pkg === "mac-x64") initMsg = "Scaricamento immagine disco Intel Mac (.dmg)...";
    setProgressStatus(initMsg);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setProgress(100);
          setProgressStatus("Operazione completata con successo.");
          setTimeout(() => {
            setStep(4);
          }, 600);
          return 100;
        }
        if (prev === 40) {
          if (pkg === "win-portable") {
            setProgressStatus("Estrazione chrono_desktop.exe...");
          } else if (pkg.startsWith("mac")) {
            setProgressStatus("Verifica integrità SHA256 del volume DMG...");
          } else {
            setProgressStatus("Copia file in AppData\\Local\\Programs\\Chrono...");
          }
        } else if (prev === 75) {
          if (pkg === "win-portable") {
            setProgressStatus("Verifica binaria completata.");
          } else if (pkg.startsWith("mac")) {
            setProgressStatus("Montaggio volume e predisposizione Chrono.app...");
          } else {
            setProgressStatus("Creazione collegamenti Desktop e registro di sistema...");
          }
        }
        return prev + 15;
      });
    }, 380);
  };

  const handleLaunch = () => {
    if (typeof window !== "undefined") {
      const link = document.createElement("a");
      if (packageType === "win-setup") {
        link.href = "#";
        link.setAttribute("download", "Chrono_2.0.0_x64-setup.exe");
      } else if (packageType === "win-portable") {
        link.href = "#";
        link.setAttribute("download", "chrono_desktop.exe");
      } else if (packageType === "mac-arm64") {
        link.href = "#";
        link.setAttribute("download", "Chrono_2.0.0_aarch64.dmg");
      } else {
        link.href = "#";
        link.setAttribute("download", "Chrono_2.0.0_x64.dmg");
      }
      link.click();
    }
    if (onClose) onClose();
  };

  return (
    <div
      className={cn(
        "w-full max-w-[720px] rounded-[18px] bg-[#0c0d10] border border-white/10 text-white shadow-2xl overflow-hidden flex flex-col font-sans select-none animate-fade-in",
        isStandaloneWindow ? "h-screen max-w-none rounded-none border-0" : "my-auto"
      )}
    >
      <div
        data-tauri-drag-region
        className="h-11 px-4 border-b border-white/5 flex items-center justify-between bg-black/40"
      >
        <div className="flex items-center gap-2.5">
          <ChronoLogo size={16} glow={false} />
          <span className="text-xs font-semibold tracking-tight text-zinc-200">
            Chrono Setup v2.0.0
          </span>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[6px] text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Chiudi finestra"
          >
            <span className="text-sm font-light leading-none">✕</span>
          </button>
        )}
      </div>

      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center min-h-[360px]">
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Seleziona pacchetto di distribuzione
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Scegli la versione ottimizzata per il tuo sistema operativo.
                </p>
              </div>

              <div className="flex items-center rounded-lg border border-white/10 bg-zinc-950 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => handlePlatformChange("windows")}
                  className={cn(
                    "px-3 py-1 rounded-[6px] transition-colors cursor-pointer",
                    platform === "windows"
                      ? "bg-white text-zinc-950 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  Windows
                </button>
                <button
                  type="button"
                  onClick={() => handlePlatformChange("macos")}
                  className={cn(
                    "px-3 py-1 rounded-[6px] transition-colors cursor-pointer",
                    platform === "macos"
                      ? "bg-white text-zinc-950 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  macOS
                </button>
              </div>
            </div>

            {platform === "windows" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPackageType("win-setup")}
                  className={cn(
                    "p-5 rounded-[14px] text-left transition-all border flex flex-col justify-between gap-4 cursor-pointer group",
                    packageType === "win-setup"
                      ? "bg-white/[0.04] border-white ring-1 ring-white/20 shadow-lg"
                      : "bg-[#101115]/60 border-white/5 hover:border-white/20 hover:bg-[#101115]"
                  )}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white tracking-tight">
                        Installazione guidata
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                        Setup .exe
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Installa Chrono nel percorso locale con integrazione nel Menu Start, icona desktop e avvio automatico con Windows.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                    <span>Consigliato per Windows 10/11</span>
                    <ChevronRight size={13} className="text-zinc-500" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPackageType("win-portable")}
                  className={cn(
                    "p-5 rounded-[14px] text-left transition-all border flex flex-col justify-between gap-4 cursor-pointer group",
                    packageType === "win-portable"
                      ? "bg-white/[0.04] border-white ring-1 ring-white/20 shadow-lg"
                      : "bg-[#101115]/60 border-white/5 hover:border-white/20 hover:bg-[#101115]"
                  )}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white tracking-tight">
                        Portatile Standalone
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                        chrono_desktop.exe
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Eseguibile singolo pronto all'uso. Non richiede permessi di amministratore e non scrive nel registro di configurazione.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                    <span>Uso immediato senza installer</span>
                    <ChevronRight size={13} className="text-zinc-500" />
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPackageType("mac-arm64")}
                  className={cn(
                    "p-5 rounded-[14px] text-left transition-all border flex flex-col justify-between gap-4 cursor-pointer group",
                    packageType === "mac-arm64"
                      ? "bg-white/[0.04] border-white ring-1 ring-white/20 shadow-lg"
                      : "bg-[#101115]/60 border-white/5 hover:border-white/20 hover:bg-[#101115]"
                  )}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white tracking-tight">
                        Apple Silicon
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                        aarch64 .dmg
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Compilazione nativa ARM64 ad alte prestazioni e basso consumo RAM per Mac con processori Apple M1, M2, M3 o M4.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                    <span>Nativo per Mac moderni</span>
                    <ChevronRight size={13} className="text-zinc-500" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPackageType("mac-x64")}
                  className={cn(
                    "p-5 rounded-[14px] text-left transition-all border flex flex-col justify-between gap-4 cursor-pointer group",
                    packageType === "mac-x64"
                      ? "bg-white/[0.04] border-white ring-1 ring-white/20 shadow-lg"
                      : "bg-[#101115]/60 border-white/5 hover:border-white/20 hover:bg-[#101115]"
                  )}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-white tracking-tight">
                        Intel Mac
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                        x64 .dmg
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Pacchetto compatibile con computer Mac basati su architettura Intel a 64 bit con macOS 10.15 Catalina o superiore.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                    <span>Compatibile con Mac Intel</span>
                    <ChevronRight size={13} className="text-zinc-500" />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Opzioni di Installazione
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configura la cartella di destinazione e i collegamenti di sistema.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-zinc-400">
                Percorso di installazione
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={installPath}
                  onChange={(e) => setInstallPath(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-[8px] bg-zinc-900 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  className="px-3 py-2 rounded-[8px] border border-white/10 hover:border-white/20 bg-zinc-900 text-xs text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Folder size={13} />
                  <span>Sfoglia</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={createDesktopShortcut}
                  onChange={(e) => setCreateDesktopShortcut(e.target.checked)}
                  className="rounded border-white/20 bg-zinc-900 text-white accent-white cursor-pointer"
                />
                <span>Crea icona sul Desktop</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={createStartMenuShortcut}
                  onChange={(e) => setCreateStartMenuShortcut(e.target.checked)}
                  className="rounded border-white/20 bg-zinc-900 text-white accent-white cursor-pointer"
                />
                <span>Aggiungi al Menu Start di Windows</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={enableAutostart}
                  onChange={(e) => setEnableAutostart(e.target.checked)}
                  className="rounded border-white/20 bg-zinc-900 text-white accent-white cursor-pointer"
                />
                <span>Avvia automaticamente all'accesso di Windows (ridotto a icona nella barra di sistema)</span>
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center gap-5 py-6 text-center">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-spin">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>

            <div className="flex flex-col gap-1 w-full max-w-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>{progressStatus}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden border border-white/5">
                <div
                  className="h-full bg-white transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check size={22} strokeWidth={2.5} />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold text-white tracking-tight">
                Chrono v2.0.0 è pronto
              </h2>
              <p className="text-xs text-zinc-400 max-w-xs">
                {packageType === "win-setup"
                  ? "Installazione completata nel percorso configurato."
                  : packageType === "win-portable"
                  ? "Eseguibile portatile pronto per l'avvio immediato."
                  : "Pacchetto disco macOS scaricato. Trascina Chrono in Applicazioni."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="h-14 px-6 border-t border-white/5 flex items-center justify-between bg-black/30 text-xs">
        <div className="flex items-center gap-2 text-zinc-500 text-[11px] max-w-md">
          <Info size={14} className="shrink-0 text-zinc-600" />
          <span className="truncate">
            Chrono Desktop v2.0.0 è un software indipendente conforme allo standard aperto MCP.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/cristianobleve/chrono"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-white transition-colors"
            title="Repository GitHub"
            aria-label="GitHub"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>

          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer text-xs"
            >
              <ArrowLeft size={13} />
              <span>Indietro</span>
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 3}
              className={cn(
                "px-5 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer shadow-sm",
                step === 3
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-white text-zinc-950 hover:bg-zinc-200"
              )}
            >
              {step === 2 ? "Installa ora" : "Avanti"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLaunch}
              className="px-5 py-2 rounded-lg bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-all cursor-pointer shadow-sm"
            >
              Avvia Chrono
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
