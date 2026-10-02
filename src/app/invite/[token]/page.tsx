import React from "react";
import { WorkspaceInviteClient } from "@/components/invites/WorkspaceInviteClient";

export function generateStaticParams() {
  return [{ token: "preview" }];
}

interface WorkspaceInvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function WorkspaceInvitePage({ params }: WorkspaceInvitePageProps) {
  const { token } = await params;
  return <WorkspaceInviteClient token={token} />;
}