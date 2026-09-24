"use client";

import React from "react";
import { CalendarView } from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <CalendarView />
    </div>
  );
}
