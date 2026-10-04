"use client";

import React from "react";
import { InboxView } from "@/components/inbox/InboxView";

export default function InboxPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <InboxView />
    </div>
  );
}
