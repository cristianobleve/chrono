import React from "react";
import { MillenniumInstallerDialog } from "@/components/installer/MillenniumInstallerDialog";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Download Chrono v2.0.0 per Windows",
  description: "Scarica l'installer ufficiale o la versione portatile standalone di Chrono per Windows.",
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen w-full bg-[#08090b] text-white flex flex-col items-center justify-center p-4 relative selection:bg-white selection:text-black">
      {/* Subtle background ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Top back navigation */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-zinc-950/80 hover:bg-zinc-900 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Torna alla Home</span>
        </Link>
      </div>

      {/* Main Installer Window (Millennium Style) */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <MillenniumInstallerDialog />
      </div>
    </div>
  );
}
