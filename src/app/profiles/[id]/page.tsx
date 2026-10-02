import React from "react";
import { ProfileDetailView } from "@/components/profiles/ProfileDetailView";

export function generateStaticParams() {
  return [{ id: "default" }];
}

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ProfileDetailView userId={id} />
    </div>
  );
}
