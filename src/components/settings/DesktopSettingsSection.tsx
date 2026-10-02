"use client";

import React, { useEffect, useState } from "react";
import {
  isDesktopApp,
  isAutostartEnabled,
  setAutostartEnabled,
  sendDesktopNotification,
  checkDesktopUpdate,
  downloadAndInstallDesktopUpdate,
  DesktopUpdateInfo,
} from "@/lib/desktop";
import { cn } from "@/lib/utils";
import { Monitor, Bell, RefreshCw, CheckCircle2 } from "lucide-react";

export const DesktopSettingsSection: React.FC = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [autostart, setAutostart] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<DesktopUpdateInfo | null>(null);
  const [updateStatusText, setUpdateStatusText] = useState<string | null>(null);
  const [installingUpdate, setInstallingUpdate] = useState(false);

  useEffect(() => {
    const desktopDetected = isDesktopApp();
    setIsDesktop(desktopDetected);

    if (desktopDetected) {
      isAutostartEnabled().then(setAutostart);
    }
  }, []);

  const handleToggleAutostart = async () => {
    const nextState = !autostart;
    const result = await setAutostartEnabled(nextState);
    setAutostart(result);
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateStatusText(null);
    try {
      const info = await checkDesktopUpdate();
      setUpdateInfo(info);
      if (!info.available) {
        setUpdateStatusText("L'applicazione e aggiornata all'ultima versione disponibile.");
      }
    } catch {
      setUpdateStatusText("Impossibile verificare gli aggiornamenti al momento.");
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleInstallUpdate = async () => {
    setInstallingUpdate(true);
    try {
      await downloadAndInstallDesktopUpdate();
    } catch {
      setUpdateStatusText("Errore durante l'installazione dell'aggiornamento.");
      setInstallingUpdate(false);
    }
  };

  const handleTestNotification = async () => {
    await sendDesktopNotification(
      "Chrono Desktop",
      "Le notifiche di sistema sono configurate correttamente."
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Monitor className="w-3.5 h-3.5 text-zinc-400" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Applicazione Desktop Windows
        </h2>
      </div>

      <div className="p-6 rounded-[16px] bg-zinc-950 border border-white/10 flex flex-col gap-5 text-xs">
        {isDesktop ? (
          <>
            {/* Autostart */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-white">Avvio con Windows</span>
                <span className="text-[11px] text-zinc-400">
                  Avvia Chrono automaticamente all'accesso a Windows.
                </span>
              </div>

              <button
                onClick={handleToggleAutostart}
                type="button"
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer",
                  autostart ? "bg-white" : "bg-zinc-900 border border-white/10"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full transition-transform duration-200 shadow-md",
                    autostart ? "translate-x-5 bg-zinc-950" : "translate-x-0 bg-white"
                  )}
                />
              </button>
            </div>

            <div className="h-px bg-white/5" />

            {/* Tray and Background Execution */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-white">Area di notifica (System Tray)</span>
                <span className="text-[11px] text-zinc-400">
                  La chiusura della finestra riduce Chrono ad icona nella barra di sistema.
                </span>
              </div>

              <button
                onClick={handleTestNotification}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
              >
                <Bell className="w-3 h-3 text-zinc-400" />
                <span>Test notifica</span>
              </button>
            </div>

            <div className="h-px bg-white/5" />

            {/* Auto-updater */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-white">Aggiornamenti automatici</span>
                  <span className="text-[11px] text-zinc-400">
                    Verifica la presenza di nuove release senza riscaricare l'installer.
                  </span>
                </div>

                <button
                  onClick={handleCheckUpdate}
                  disabled={checkingUpdate || installingUpdate}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={cn("w-3 h-3 text-zinc-400", checkingUpdate && "animate-spin")} />
                  <span>{checkingUpdate ? "Controllo in corso..." : "Verifica aggiornamenti"}</span>
                </button>
              </div>

              {updateInfo?.available && (
                <div className="p-3 rounded-lg border border-white/10 bg-zinc-900/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-zinc-200 font-medium">
                      Nuova versione disponibile: {updateInfo.version}
                    </span>
                  </div>

                  <button
                    onClick={handleInstallUpdate}
                    disabled={installingUpdate}
                    type="button"
                    className="px-3 py-1.5 rounded-md bg-white text-zinc-950 font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {installingUpdate ? "Installazione in corso..." : "Installa e riavvia"}
                  </button>
                </div>
              )}

              {updateStatusText && !updateInfo?.available && (
                <span className="text-[11px] text-zinc-400">
                  {updateStatusText}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-white">Accesso da browser rilevato</span>
              <span className="text-[11px] text-zinc-400">
                La versione desktop standalone include avvio automatico, tray icon, basso consumo di RAM e modalita offline senza server esterni.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
