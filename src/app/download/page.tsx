import React from "react";
import { ChronoInstallerDialog } from "@/components/installer/ChronoInstallerDialog";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Download Chrono Desktop v2.0.0",
  description: "Scarica l'installer ufficiale o la versione portatile di Chrono per Windows e macOS.",
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen w-full bg-[#08090b] text-white flex flex-col items-center justify-center p-4 relative selection:bg-white selection:text-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-zinc-950/80 hover:bg-zinc-900 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Torna alla Home</span>
        </Link>
      </div>

      <div className="relative z-10 w-full flex items-center justify-center">
        <ChronoInstallerDialog />
      </div>
    </div>
  );
}
