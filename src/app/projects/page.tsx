"use client";

import React from "react";
import { ProjectsListView } from "@/components/projects/ProjectsListView";

export default function ProjectsPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ProjectsListView />
    </div>
  );
}
