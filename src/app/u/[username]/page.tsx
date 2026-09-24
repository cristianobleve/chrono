import React from "react";
import { ProfileDetailView } from "@/components/profiles/ProfileDetailView";

interface ProfileUserPageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfileUserPage({ params }: ProfileUserPageProps) {
  const { username } = await params;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ProfileDetailView userId={username} />
    </div>
  );
}
