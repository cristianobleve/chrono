"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getLocalAvatar } from "@/lib/storage";

export interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  alt?: string;
}

const sizeClasses: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "w-4 h-4 text-[8px] rounded-[4px]",
  sm: "w-6 h-6 text-[10px] rounded-[5px]",
  md: "w-8 h-8 text-xs rounded-[6px]",
  lg: "w-10 h-10 text-sm rounded-[8px]",
  xl: "w-14 h-14 text-lg rounded-[10px]",
  "2xl": "w-20 h-20 md:w-24 md:h-24 text-2xl md:text-3xl rounded-[18px]",
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = "md",
  className,
  alt,
}) => {
  const [imgError, setImgError] = useState(false);
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    setImgError(false);
    if (!avatarUrl?.startsWith("local-avatar:")) {
      setResolvedAvatarUrl(null);
      return;
    }
    const accountId = avatarUrl.replace("local-avatar:", "");

    // Try immediate synchronous cache from localStorage first
    try {
      const cached = localStorage.getItem(`chrono_avatar_${accountId}`);
      if (cached) {
        setResolvedAvatarUrl(cached);
        return;
      }
    } catch {}

    let cancelled = false;
    void getLocalAvatar(accountId)
      .then((dataUrl) => {
        if (!cancelled) setResolvedAvatarUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setResolvedAvatarUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [avatarUrl]);

  const initials = useMemo(() => {
    if (!name || !name.trim()) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.trim().substring(0, 2).toUpperCase();
  }, [name]);

  const imageSource = avatarUrl?.startsWith("local-avatar:") ? resolvedAvatarUrl : avatarUrl;
  const hasImage = Boolean(imageSource && !imgError);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center select-none overflow-hidden shrink-0 border border-white/10 bg-zinc-850 font-medium text-zinc-200 tracking-tight",
        sizeClasses[size],
        className
      )}
      title={name || undefined}
    >
      {hasImage ? (
        <img
          src={imageSource!}
          alt={alt || name || "Avatar utente"}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center block"
        />
      ) : (
        <span className="leading-none select-none">{size === "xs" ? initials.charAt(0) : initials}</span>
      )}
    </div>
  );
};
