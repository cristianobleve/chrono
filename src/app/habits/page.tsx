"use client";

import React from "react";
import { HabitTrackerView } from "@/components/habits/HabitTrackerView";

export default function HabitsPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <HabitTrackerView />
    </div>
  );
}
