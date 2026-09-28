import React from "react";
import { cn } from "@/lib/utils";

export type StatusType = "operational" | "degraded" | "outbox_syncing" | "offline" | "protected";

export interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label, className }) => {
  const configs: Record<StatusType, { color: string; text: string; defaultLabel: string; pulse: boolean }> = {
    operational: {
      color: "bg-emerald-500",
      text: "text-emerald-400",
      defaultLabel: "Operational",
      pulse: true,
    },
    degraded: {
      color: "bg-amber-500",
      text: "text-amber-400",
      defaultLabel: "Degraded",
      pulse: true,
    },
    outbox_syncing: {
      color: "bg-indigo-500",
      text: "text-indigo-400",
      defaultLabel: "Outbox Syncing",
      pulse: true,
    },
    offline: {
      color: "bg-rose-500",
      text: "text-rose-400",
      defaultLabel: "Offline",
      pulse: false,
    },
    protected: {
      color: "bg-sky-500",
      text: "text-sky-400",
      defaultLabel: "Protected (Cloud Armor)",
      pulse: false,
    },
  };

  const config = configs[status];

  return (
    <div className={cn("inline-flex items-center gap-2 font-mono text-xs", className)}>
      <span className="relative flex h-2.5 w-2.5">
        {config.pulse && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              config.color
            )}
          />
        )}
        <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", config.color)} />
      </span>
      <span className={cn("font-medium", config.text)}>{label || config.defaultLabel}</span>
    </div>
  );
};
