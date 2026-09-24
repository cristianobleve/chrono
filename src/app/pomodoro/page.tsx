import React from "react";
import { PomodoroView } from "@/components/pomodoro/PomodoroView";

export default function PomodoroPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      <PomodoroView />
    </div>
  );
}
