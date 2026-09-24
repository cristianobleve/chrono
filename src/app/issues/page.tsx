"use client";

import React from "react";
import { IssuesHubView } from "@/components/issues/IssuesHubView";

export default function IssuesPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <IssuesHubView />
    </div>
  );
}
