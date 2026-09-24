import React from "react";
import { ProfileDetailView } from "@/components/profiles/ProfileDetailView";

export default function ProfilesIndexPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ProfileDetailView userId="me" />
    </div>
  );
}
