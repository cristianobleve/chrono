"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  toneClassName?: string;
  description?: string;
}

export interface LinearSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  align?: "left" | "right" | "auto";
  searchable?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
}

interface DropdownPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  minWidth?: number;
  maxHeight?: number;
  placement: "top" | "bottom";
}

export const LinearSelect: React.FC<LinearSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  triggerClassName,
  dropdownClassName,
  align = "auto",
  searchable,
  size = "md",
  disabled = false,
  fullWidth = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<DropdownPosition>({ placement: "bottom" });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const isSearchable = searchable ?? options.length >= 8;

  const filteredOptions = isSearchable && searchTerm.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    } else if (isSearchable) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, isSearchable]);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Estimate menu dimensions
    const estimatedMenuHeight = Math.min((filteredOptions.length + (isSearchable ? 1 : 0)) * 36 + 24, 280);
    const menuWidth = menuRef.current?.offsetWidth || Math.max(triggerRect.width, 210);

    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // Determine vertical placement: Flip to TOP if space below is too small (< 220px) AND space above is greater
    const shouldOpenTop = spaceBelow < Math.min(estimatedMenuHeight, 220) && spaceAbove > spaceBelow;

    let computedTop: number | undefined;
    let computedBottom: number | undefined;
    let computedMaxHeight: number = 280;

    if (shouldOpenTop) {
      computedBottom = viewportHeight - triggerRect.top + 6;
      computedMaxHeight = Math.max(spaceAbove - 16, 120);
    } else {
      computedTop = triggerRect.bottom + 6;
      computedMaxHeight = Math.max(spaceBelow - 16, 120);
    }

    // Determine horizontal alignment & prevent screen overflow
    let computedLeft: number | undefined;
    let computedRight: number | undefined;

    if (align === "right") {
      computedRight = viewportWidth - triggerRect.right;
    } else if (align === "left") {
      computedLeft = triggerRect.left;
    } else {
      // Auto alignment: Align left unless it overflows right edge
      if (triggerRect.left + menuWidth > viewportWidth - 16) {
        computedRight = Math.max(viewportWidth - triggerRect.right, 8);
      } else {
        computedLeft = Math.max(triggerRect.left, 8);
      }
    }

    setPosition({
      top: computedTop,
      bottom: computedBottom,
      left: computedLeft,
      right: computedRight,
      minWidth: Math.max(triggerRect.width, 200),
      maxHeight: computedMaxHeight,
      placement: shouldOpenTop ? "top" : "bottom",
    });
  }, [filteredOptions.length, isSearchable, align]);

  // Recalculate position on open & on window resize / scroll
  useLayoutEffect(() => {
    if (isOpen) {
      calculatePosition();

      const handleScrollOrResize = () => {
        calculatePosition();
      };

      window.addEventListener("resize", handleScrollOrResize);
      window.addEventListener("scroll", handleScrollOrResize, true);

      return () => {
        window.removeEventListener("resize", handleScrollOrResize);
        window.removeEventListener("scroll", handleScrollOrResize, true);
      };
    }
  }, [isOpen, calculatePosition]);

  // Close on click outside or escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const dropdownMenu = isOpen && mounted && typeof document !== "undefined" ? (
    createPortal(
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: position.top !== undefined ? `${position.top}px` : undefined,
          bottom: position.bottom !== undefined ? `${position.bottom}px` : undefined,
          left: position.left !== undefined ? `${position.left}px` : undefined,
          right: position.right !== undefined ? `${position.right}px` : undefined,
          minWidth: position.minWidth ? `${position.minWidth}px` : undefined,
          maxHeight: position.maxHeight ? `${position.maxHeight}px` : undefined,
          zIndex: 99999,
        }}
        className={cn(
          "bg-[#18191c] border border-white/10 rounded-xl shadow-2xl shadow-black/90 p-1 flex flex-col gap-0.5 select-none overflow-hidden backdrop-blur-md",
          position.placement === "top" ? "origin-bottom animate-slide-down" : "origin-top animate-slide-up",
          dropdownClassName
        )}
      >
        {/* Search Bar inside selector */}
        {isSearchable && (
          <div className="px-1.5 pt-1 pb-1.5 border-b border-white/5 sticky top-0 bg-[#18191c] z-10">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/10 focus-within:border-white/20">
              <Search className="w-3 h-3 text-zinc-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca opzione..."
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-transparent text-white text-xs placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Options list */}
        <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[220px] p-0.5">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-3 text-center text-xs text-zinc-500 italic">
              Nessun risultato
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors text-xs cursor-pointer shrink-0",
                    isSelected
                      ? "bg-white/[0.08] text-white font-medium"
                      : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2 truncate max-w-[240px]">
                    {option.icon && <span className="shrink-0 flex items-center">{option.icon}</span>}
                    <div className="flex flex-col truncate">
                      <span className={cn("truncate", option.toneClassName)}>{option.label}</span>
                      {option.description && (
                        <span className="text-[10px] text-zinc-500 truncate">{option.description}</span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-zinc-200 shrink-0 stroke-[2.5] ml-2" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>,
      document.body
    )
  ) : null;

  const sizeClasses = {
    sm: "h-7 px-2.5 py-1 text-xs rounded-md",
    md: "h-8 px-3 py-1.5 text-xs rounded-lg",
    lg: "h-9 px-3.5 py-2 text-xs rounded-lg",
  };

  return (
    <div className={cn("relative inline-block text-xs select-none", fullWidth && "w-full", className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={cn(
          "w-full bg-[#18191d] hover:bg-[#202227] border border-white/10 hover:border-white/20 text-white font-medium flex items-center justify-between gap-2.5 transition-colors cursor-pointer focus:outline-none shadow-sm",
          sizeClasses[size],
          isOpen && "bg-[#202227] border-white/30 shadow-md ring-1 ring-white/10",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2 truncate min-w-0 flex-1">
          {selectedOption?.icon && <span className="shrink-0 flex items-center">{selectedOption.icon}</span>}
          <span className={cn("truncate", selectedOption?.toneClassName || "text-white")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200",
            isOpen && (position.placement === "top" ? "-rotate-180 text-white" : "rotate-180 text-white")
          )}
        />
      </button>

      {dropdownMenu}
    </div>
  );
};

export const ChronoSelect = LinearSelect;

