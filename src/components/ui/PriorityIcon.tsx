import React from "react";
import { Priority } from "@/types";
import { AlertTriangle, MoreH } from "reicon-react";
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
          icon: <AlertTriangle size={14} className={cn("text-[#ef4444] shrink-0", className)} />,
          label: "Urgent",
          color: "text-[#ef4444]",
        };
      case "high":
        return {
          icon: (
            <svg className={cn("w-3.5 h-3.5 text-[#f97316] shrink-0", className)} viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="10" width="2.5" height="4" rx="1" />
              <rect x="6.75" y="6.5" width="2.5" height="7.5" rx="1" />
              <rect x="11.5" y="3" width="2.5" height="11" rx="1" />
            </svg>
          ),
          label: "High",
          color: "text-[#f97316]",
        };
      case "medium":
        return {
          icon: (
            <svg className={cn("w-3.5 h-3.5 text-[#eab308] shrink-0", className)} viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="10" width="2.5" height="4" rx="1" />
              <rect x="6.75" y="6.5" width="2.5" height="7.5" rx="1" />
              <rect x="11.5" y="3" width="2.5" height="11" rx="1" opacity="0.25" />
            </svg>
          ),
          label: "Medium",
          color: "text-[#eab308]",
        };
      case "low":
        return {
          icon: (
            <svg className={cn("w-3.5 h-3.5 text-[#38bdf8] shrink-0", className)} viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="10" width="2.5" height="4" rx="1" />
              <rect x="6.75" y="6.5" width="2.5" height="7.5" rx="1" opacity="0.25" />
              <rect x="11.5" y="3" width="2.5" height="11" rx="1" opacity="0.25" />
            </svg>
          ),
          label: "Low",
          color: "text-[#38bdf8]",
        };
      case "none":
      default:
        return {
          icon: <MoreH size={14} className={cn("text-zinc-500 shrink-0", className)} />,
          label: "No priority",
          color: "text-zinc-500",
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
