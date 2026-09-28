"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

export interface DropdownAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  shortcut?: string;
}

export interface DropdownProps {
  trigger?: React.ReactNode;
  actions: DropdownAction[];
  align?: "left" | "right";
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  actions,
  align = "right",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-48 rounded-xl glass-panel border border-slate-700 bg-slate-900/95 py-1.5 shadow-2xl",
            "animate-in fade-in zoom-in-95 duration-150",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-3.5 py-2 text-xs transition-colors",
                action.variant === "destructive"
                  ? "text-rose-400 hover:bg-rose-500/10"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2">
                {action.icon && <span className="h-3.5 w-3.5">{action.icon}</span>}
                <span>{action.label}</span>
              </div>
              {action.shortcut && (
                <span className="text-[10px] text-slate-500 font-mono">{action.shortcut}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
