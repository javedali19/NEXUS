import React from "react";
import { cn } from "@/lib/utils";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  errorCode?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "An Unexpected System Error Occurred",
  message = "Failed to load resource data. Please verify network status or contact your platform administrator.",
  errorCode,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-10 text-center rounded-2xl glass-panel border border-rose-500/20 bg-rose-950/10",
        className
      )}
    >
      <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-lg mb-4">
        <AlertOctagon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">{message}</p>
      {errorCode && (
        <span className="mt-2 text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800">
          Error Code: {errorCode}
        </span>
      )}
      {onRetry && (
        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
};
