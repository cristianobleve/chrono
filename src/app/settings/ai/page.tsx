"use client";

import React from "react";
import { AISettingsView } from "@/components/settings/AISettingsView";

export default function AISettingsPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <AISettingsView />
    </div>
  );
}
