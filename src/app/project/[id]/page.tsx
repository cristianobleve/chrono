import React from "react";
import { ProjectDetailView } from "@/components/projects/ProjectDetailView";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ProjectDetailView slug={id} />
    </div>
  );
}
