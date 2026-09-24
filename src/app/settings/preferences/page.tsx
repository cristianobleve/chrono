"use client";

import React from "react";
import { PreferencesView } from "@/components/settings/PreferencesView";

export default function PreferencesPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <PreferencesView />
    </div>
  );
}
