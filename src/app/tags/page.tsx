"use client";

import React from "react";
import { TagsManagerView } from "@/components/tags/TagsManagerView";

export default function TagsPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <TagsManagerView />
    </div>
  );
}
