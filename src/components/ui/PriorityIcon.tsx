import React from "react";
import { Priority } from "@/types";
import { AlertCircle, SignalHigh, SignalMedium, SignalLow, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityIconProps {
  priority: Priority;
  className?: string;
  showLabel?: boolean;
}

export const PriorityIcon: React.FC<PriorityIconProps> = ({
  priority,
  className,
  showLabel = false,
}) => {
  const getIconAndLabel = () => {
    switch (priority) {
      case "urgent":
        return {
          icon: <AlertCircle className={cn("w-3.5 h-3.5 text-priority-urgent", className)} />,
          label: "Urgent",
          color: "text-priority-urgent",
        };
      case "high":
        return {
          icon: <SignalHigh className={cn("w-3.5 h-3.5 text-priority-high", className)} />,
          label: "High",
          color: "text-priority-high",
        };
      case "medium":
        return {
          icon: <SignalMedium className={cn("w-3.5 h-3.5 text-priority-medium", className)} />,
          label: "Medium",
          color: "text-priority-medium",
        };
      case "low":
        return {
          icon: <SignalLow className={cn("w-3.5 h-3.5 text-priority-low", className)} />,
          label: "Low",
          color: "text-priority-low",
        };
      case "none":
      default:
        return {
          icon: <MoreHorizontal className={cn("w-3.5 h-3.5 text-ink-subtle", className)} />,
          label: "No priority",
          color: "text-ink-subtle",
        };
    }
  };

  const { icon, label, color } = getIconAndLabel();

  if (showLabel) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs">
        {icon}
        <span className={cn("font-normal", color)}>{label}</span>
      </div>
    );
  }

  return icon;
};
