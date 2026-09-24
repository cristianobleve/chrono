"use client";

import React from "react";
import { EisenhowerMatrixView } from "@/components/eisenhower/EisenhowerMatrixView";

export default function EisenhowerPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <EisenhowerMatrixView />
    </div>
  );
}
