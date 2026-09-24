"use client";

import React from "react";
import { TickTickInboxView } from "@/components/inbox/TickTickInboxView";

export default function InboxPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <TickTickInboxView />
    </div>
  );
}
