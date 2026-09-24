"use client";

import React, { useState } from "react";
import { Check, Copy, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLinearStore } from "@/store/useLinearStore";
import { DecryptedText } from "@/components/ui/react-bits/DecryptedText";

interface InternalIdBadgeProps {
  id: string; // e.g. "PRJ-1" or "FIR-4" or "USR-01"
  internalId?: string; // e.g. "prj_casd_98f" or "iss_49821"
  className?: string;
  size?: "xs" | "sm" | "md";
  showPrefixIcon?: boolean;
  copyable?: boolean;
}

export const InternalIdBadge: React.FC<InternalIdBadgeProps> = ({
  id,
  internalId,
  className,
  size = "xs",
  showPrefixIcon = true,
  copyable = true,
}) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useLinearStore();

  const handleCopy = (e: React.MouseEvent) => {
    if (!copyable) return;
    e.stopPropagation();
    e.preventDefault();

    const textToCopy = internalId ? `${id} (${internalId})` : id;
    navigator.clipboard.writeText(internalId || id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    addToast({
      title: "ID Copiato",
      description: `ID: ${textToCopy}`,
      type: "info",
    });
  };

  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1 h-5.5 rounded-[6px]",
    sm: "text-xs px-3 gap-1.5 h-7 rounded-[9px]",
    md: "text-xs px-3.5 gap-1.5 h-8 rounded-[10px]",
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={
        copyable
          ? `ID Interno: ${internalId || id} (Clicca per copiare)`
          : `ID: ${id}`
      }
      className={cn(
        "inline-flex items-center whitespace-nowrap shrink-0 font-sans font-semibold tracking-tight rounded-[6px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-all cursor-pointer select-none group",
        sizeClasses[size],
        copied && "border-semantic-success/60 text-semantic-success bg-semantic-success/10",
        className
      )}
    >
      {showPrefixIcon && !copied && (
        <Hash className="w-2.5 h-2.5 text-zinc-500 group-hover:text-white transition-colors" />
      )}
      {copied && <Check className="w-2.5 h-2.5 text-semantic-success stroke-[3]" />}
      <DecryptedText
        text={id}
        animateOn="hover"
        speed={30}
        maxIterations={8}
        className="font-sans font-semibold"
      />
      {internalId && (
        <span className="hidden group-hover:inline text-[8px] text-ink-tertiary truncate max-w-[80px]">
          ({internalId})
        </span>
      )}
      {copyable && (
        <Copy className="w-2.5 h-2.5 text-ink-tertiary opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
      )}
    </button>
  );
};
