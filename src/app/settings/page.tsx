"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings/general");
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center p-12 text-ink-subtle text-xs">
      Reindirizzamento alle impostazioni...
    </div>
  );
}
