import React from "react";
import { MillenniumInstallerDialog } from "@/components/installer/MillenniumInstallerDialog";

export const metadata = {
  title: "Chrono Setup",
};

export default function InstallerPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0c0d10] text-white flex flex-col">
      <MillenniumInstallerDialog isStandaloneWindow={true} />
    </div>
  );
}
